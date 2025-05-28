import { authorize } from 'react-native-app-auth';
import { MMKV } from 'react-native-mmkv';
import Toast from 'src/components/Toast';
import { RealmSchema } from 'src/storage/enum';
import Config from 'src/utils/config';
import Relay from '../relay';
import {
  Asset,
  IssuerVerificationMethod,
} from 'src/models/interfaces/RGBWallet';
import dbManager from 'src/storage/realm/dbManager';

const config = {
  issuer: 'https://twitter.com',
  clientId: Config.TWITTER_CLIENT_ID,
  redirectUrl: 'tribe://callback',
  scopes: ['tweet.read', 'users.read', 'offline.access'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
    tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
    revocationEndpoint: 'https://api.twitter.com/2/oauth2/revoke',
  },
};
const TWITTER_API_BASE = 'https://api.twitter.com/2';
const storage = new MMKV();

export const getXProfile = async (accessToken: string) => {
  try {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching X profile: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const loginWithTwitter = async (): Promise<{
  id: string;
  name: string;
  username: string;
}> => {
  try {
    const result = await authorize(config);
    if (result.accessToken) {
      storage.set('accessToken', result.accessToken);
      const profile = await getXProfile(result.accessToken);
      return {
        id: profile.data.id,
        name: profile.data.name,
        username: profile.data.username,
      };
    }
    throw new Error('No access token received');
  } catch (error) {
    throw error;
  }
};

export const verifyTweetById = async (
  tweetId: string,
  assetId: string,
  schema: RealmSchema,
  asset: Asset,
): Promise<{ success: boolean; tweet?: any; reason?: string }> => {
  try {
    const accessToken = storage.getString('accessToken');
    const response = await fetch(`${TWITTER_API_BASE}/tweets/${tweetId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 429) {
      const resetAfter = response.headers.get('x-rate-limit-reset');
      const now = Math.floor(Date.now() / 1000);
      const waitTime = resetAfter ? Number(resetAfter) - now : null;
      if (waitTime && waitTime > 0) {
        Toast(
          `You’ve reached the tweet fetch limit. Try again in ${waitTime}s (around ${new Date(
            Number(resetAfter) * 1000,
          ).toLocaleTimeString()}).`,
          true,
        );
      }

      return null;
    }

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      if (errorJson?.title === 'UsageCapExceeded') {
        return {
          success: false,
          reason: 'Twitter API usage cap exceeded. Please try again later.',
        };
      }
      const message =
        errorJson?.title ||
        errorJson?.detail ||
        `HTTP error ${response.status}`;
      return { success: false, reason: message };
    }

    const data = await response.json();
    const tweet = data?.data;

    if (!tweet) {
      return { success: false, reason: 'Tweet not found' };
    }

    if (tweet.text.includes(assetId)) {
      const response = await Relay.verifyIssuer('appID', asset.assetId, {
        type: IssuerVerificationMethod.TWITTER_POST,
        link: tweetId,
        id: asset?.issuer?.verifiedBy?.find(
          v => v.type === IssuerVerificationMethod.TWITTER,
        )?.id,
        name: asset?.issuer?.verifiedBy?.find(
          v => v.type === IssuerVerificationMethod.TWITTER,
        )?.name,
        username: asset?.issuer?.verifiedBy?.find(
          v => v.type === IssuerVerificationMethod.TWITTER,
        )?.username,
      });
      if (response.status) {
        const existingAsset = await dbManager.getObjectByPrimaryId(
          schema,
          'assetId',
          asset.assetId,
        );

        const existingVerifiedBy = existingAsset?.issuer?.verifiedBy || [];
        const twitterEntry = asset?.issuer?.verifiedBy?.find(
          v => v.type === IssuerVerificationMethod.TWITTER,
        );

        if (!twitterEntry) return;
        let updatedVerifiedBy: typeof existingVerifiedBy;
        const twitterPostIndex = existingVerifiedBy.findIndex(
          v => v.type === IssuerVerificationMethod.TWITTER_POST,
        );

        if (twitterPostIndex !== -1) {
          updatedVerifiedBy = [...existingVerifiedBy];
          updatedVerifiedBy[twitterPostIndex] = {
            ...updatedVerifiedBy[twitterPostIndex],
            link: tweetId,
          };
        } else {
          updatedVerifiedBy = [
            ...existingVerifiedBy,
            {
              type: IssuerVerificationMethod.TWITTER_POST,
              link: tweetId,
              id: twitterEntry.id,
              name: twitterEntry.name,
              username: twitterEntry.username,
            },
          ];
        }

        await dbManager.updateObjectByPrimaryId(
          schema,
          'assetId',
          asset.assetId,
          {
            issuer: {
              verified: true,
              verifiedBy: updatedVerifiedBy,
            },
          },
        );
      }
      return { success: true, tweet };
    } else {
      return { success: false, reason: 'Asset ID not found in tweet text' };
    }
  } catch (error: any) {
    console.error('Twitter API error:', error.message || error);
    return { success: false, reason: 'Network or fetch error' };
  }
};

export const getUserTweetByAssetId = async (
  userId: string,
  accessToken: string,
  assetId: string,
): Promise<any | null> => {
  try {
    const response = await fetch(
      `${TWITTER_API_BASE}/users/${userId}/tweets?max_results=10`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.status === 429) {
      const resetAfter = response.headers.get('x-rate-limit-reset');
      const now = Math.floor(Date.now() / 1000);
      const waitTime = resetAfter ? Number(resetAfter) - now : null;
      if (waitTime && waitTime > 0) {
        Toast(
          `You’ve reached the tweet fetch limit. Try again in ${waitTime}s (around ${new Date(
            Number(resetAfter) * 1000,
          ).toLocaleTimeString()}).`,
          true,
        );
      }

      return null;
    }

    if (!response.ok) {
      console.error(`Twitter API error: ${response.status}`);
      return null;
    }

    const json = await response.json();
    const tweets = json?.data || [];

    const matchingTweet = tweets.find(tweet => tweet.text.includes(assetId));
    return matchingTweet || null;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return null;
  }
};

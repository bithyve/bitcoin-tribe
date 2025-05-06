import { authorize } from 'react-native-app-auth';
import { MMKV } from 'react-native-mmkv';
import Config from 'src/utils/config';

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
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

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

    const json = await response.json();
    const tweets = json?.data || [];

    const matchingTweet = tweets.find(tweet => tweet.text.includes(assetId));

    if (matchingTweet) {
      return matchingTweet;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return null;
  }
};

export const getUserTweetByAssetIdWithRetry = async (
  userId: string,
  accessToken: string,
  assetId: string,
  retries = 10,
  delayMs = 5000,
): Promise<any | null> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const tweet = await getUserTweetByAssetId(userId, accessToken, assetId);
    if (tweet) return tweet;
    if (attempt < retries) {
      await delay(delayMs);
    }
  }
  return null;
};

// export const findTweetWithAssetID = (
//   tweets: any[],
//   assetID: string,
// ): string | null => {
//   const tweet = tweets.find(t => t.text.includes(assetID));
//   return tweet ? tweet.id : null;
// };

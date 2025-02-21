import { authorize } from 'react-native-app-auth';
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
            const profile = await getXProfile(result.accessToken);
            return profile.data;
        }
        throw new Error('No access token received');
    } catch (error) {
        throw error;
    }
};

import { Orbis1SDK } from 'orbis1-sdk-rn';
import config from 'src/utils/config';
import { Keys, Storage } from 'src/storage';

/** Lazy-initialized Orbis1 SDK instance with watchtower feature. */
let orbis1WatchTowerSDK: Orbis1SDK | null = null;

async function getOrbis1WatchTowerSDK(): Promise<Orbis1SDK> {
  if (orbis1WatchTowerSDK) return orbis1WatchTowerSDK;
  const apiKey = config.ORBIS1_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error(
      'Watch Tower requires ORBIS1_API_KEY. Set it in your environment config.'
    );
  }
  orbis1WatchTowerSDK = await Orbis1SDK.create({
    apiKey: apiKey.trim(),
    features: ['watchtower'],
  });
  const fcmToken = Storage.get(Keys.FCM_TOKEN);
  if (fcmToken) orbis1WatchTowerSDK.watchTower().setFcmToken(fcmToken as string);
  return orbis1WatchTowerSDK;
}

/**
 * Update FCM token on the Orbis1 Watch Tower SDK. Call when the token is refreshed
 * (e.g. after syncFcmToken). No-op if the SDK is not initialized yet.
 */
export const setWatchTowerFcmToken = (
  token: string | null | undefined
): void => {
  if (!orbis1WatchTowerSDK) return;
  orbis1WatchTowerSDK.watchTower().setFcmToken(token);
};

/**
 * Add an invoice to the Orbis1 Watch Tower via orbis1-sdk-rn.
 * Uses the SDK's watchtower feature (no direct API calls).
 */
export const addToWatchTower = async (invoice: string) => {
  try {
    const sdk = await getOrbis1WatchTowerSDK();
    const data = await sdk.watchTower().addToWatchTower(invoice);
    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error calling watch tower:', message);
    throw error;
  }
};

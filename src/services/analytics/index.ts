import analytics from '@react-native-firebase/analytics';
export const logCustomEvent = async (eventName = '', payload = {}) => {
  try {
    await analytics().logEvent(eventName, payload);
  } catch (error) {
    console.log('🚀 App Analytics Error:', error);
  }
};

export const events = {
  CREATED_INVOICE: 'created_invoice',
  CREATED_NIA: 'created_nia',
  CREATE_CFA: 'create_cfa',
  CREATE_UDA: 'create_uda',
  REGISTERED_ASSET: 'registered_asset',
  CREATED_COLLECTION: 'created_collection',
  COLLECTION_MINTED: 'collection_minted',
  CREATE_GROUP: 'create_group',
  JOIN_GROUP: 'join_group',
  CREATE_DM: 'create_dm',
  JOIN_DM: 'join_dm',
  SEND_ASSET: 'send_asset',
  CREATE_NEW_APP: 'create_new_app',
  APP_RECOVERED: 'app_recovered',
  DOMAIN_VERIFIED:'domain_verified',
  TWITTER_VERIFIED:'twitter_verified'
};

import config from 'src/utils/config';

const envValue = config?.ENVIRONMENT ?? 'production';
const finalURL = `https://www.bitcointribe.app/${envValue.toLowerCase()}/ramp/`;

export const fetchRampReservation = ({ receiveAddress }) => {
  try {
    console.log('receiveAddress', receiveAddress);
    const url = `${config.RAMP_BASE_URL}?\
hostAppName=${'Bitcoin Tribe'}&\
userAddress=${receiveAddress}&\
hostLogoUrl=${'https://static.wixstatic.com/media/6aee8c_164a4e8d6d7246468071075485eb1259~mv2.png/v1/fill/w_328,h_144,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/keeper%20logo.png'}&\
swapAsset=BTC&\
hostApiKey=${config.RAMP_REFERRAL_CODE}&\
finalUrl=${finalURL}
`;
    return url;
  } catch (error) {
    console.log('error generating Ramp link ', error);
    return {
      error,
    };
  }
};

import { ObjectSchema } from 'realm';
import { RealmSchema } from '../../enum';

export const NodeInfoSchema: ObjectSchema = {
  name: RealmSchema.NodeInfo,
  properties: {
    channel_asset_max_amount: 'int',
    channel_asset_min_amount: 'int',
    channel_capacity_max_sat: 'int',
    channel_capacity_min_sat: 'int',
    local_balance_msat: 'int',
    max_media_upload_size_mb: 'int',
    num_channels: 'int',
    num_peers: 'int',
    num_usable_channels: 'int',
    onchain_pubkey: 'string',
    pubkey: 'string',
    rgb_htlc_min_msat: 'int',
  },
  primaryKey: 'pubkey',
};

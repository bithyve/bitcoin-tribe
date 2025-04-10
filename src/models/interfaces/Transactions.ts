export interface NodeOnchainTransaction {
  transaction_type: string;
  txid: string;
  received: number;
  sent: number;
  fee: number;
  confirmation_time: {
    height: number;
    timestamp: number;
  };
}
export interface LNPayments {
  amt_msat: number;
  asset_amount: number;
  asset_id: string;
  payment_hash: string;
  inbound: boolean;
  status: string;
  created_at: number;
  updated_at: number;
  payee_pubkey: string;
}

import { snakeCaseToCamelCase } from 'src/utils/snakeCaseToCamelCase';

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}

export class RLNNodeApiServices {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json', // default to JSON if not specified
      ...(this.config.apiKey && {
        Authorization: `${this.config.apiKey}`,
      }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(`Request failed: ${errorData.error}`);
      // }
      return response.json();
    } catch (error) {
      console.error(`Error: ${endpoint} failed `, error);
      throw error;
    }
  }

  public static async checkNodeConnection(
    baseUrl: string,
    auth = '',
  ): Promise<{}> {
    const response = await fetch(`${baseUrl}/nodeinfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth,
      },
    });
    return snakeCaseToCamelCase(await response.json());
  }

  public async getBtcBalance(body: { skip_sync: boolean }): Promise<{
    vanilla: { settled: number; future: number; spendable: number };
    colored: { settled: number; future: number; spendable: number };
  }> {
    return this.request('/btcbalance', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async getAddress(body: {}): Promise<{
    address: string;
  }> {
    return this.request('/address', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async listTransactions(body: { skip_sync: boolean }): Promise<{}> {
    return this.request('/listtransactions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async sendBTCTransaction(body: {
    amount: number;
    address: string;
    fee_rate: any;
    skip_sync: boolean;
  }): Promise<{}> {
    return this.request('/sendbtc', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async estimateFee(body: { blocks: number }): Promise<{}> {
    return this.request('/estimatefee', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async listUnspents(body: { skip_sync: boolean }): Promise<{}> {
    return this.request('/listunspents', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async createutxos(body: {
    up_to: boolean;
    num: number;
    size: number;
    fee_rate: number;
    skip_sync: boolean;
  }): Promise<{}> {
    return this.request('/createutxos', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async issueassetnia(body: {
    amounts: number[];
    ticker: string;
    name: string;
    precision: number;
  }): Promise<{}> {
    return this.request('/issueassetnia', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async rgbinvoice(body: {
    min_confirmations: number;
    // asset_id?: string;
    duration_seconds: number;
  }): Promise<{}> {
    return this.request('/rgbinvoice', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async assetmetadata(body: { asset_id: string }): Promise<{}> {
    return this.request('/assetmetadata', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async postassetmedia(body: { filePath: string }): Promise<{}> {
    const formData = new FormData();
    formData.append('file', {
      uri: body.filePath,
      name: 'image.jpg',
      type: 'image/jpeg',
    });
    return this.request('/postassetmedia', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  public async issueassetcfa(body: {
    amounts: number[];
    name: string;
    details: string;
    precision: number;
    file_digest: string;
  }): Promise<{}> {
    return this.request('/issueassetcfa', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async nodeinfo(): Promise<{
    pubkey: string;
    num_channels: number;
    num_usable_channels: number;
    local_balance_msat: number;
    num_peers: number;
    onchain_pubkey: string;
    max_media_upload_size_mb: number;
    rgb_htlc_min_msat: number;
    rgb_channel_capacity_min_sat: number;
    channel_capacity_min_sat: number;
    channel_capacity_max_sat: number;
    channel_asset_min_amount: number;
    channel_asset_max_amount: number;
  }> {
    const response = await this.request('/nodeinfo', {
      method: 'GET',
    });

    return response;
  }

  public async sendasset(body: {
    asset_id: string;
    amount: number;
    recipient_id: string;
    donation: boolean;
    fee_rate: number;
    min_confirmations: number;
    transport_endpoints: string[];
    skip_sync: false;
  }): Promise<{ txid: string }> {
    return this.request('/sendasset', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async getassetmedia(body: {
    digest: string;
  }): Promise<{ bytes_hex: string }> {
    return this.request('/getassetmedia', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async refreshtransfers(body: { skip_sync: boolean }): Promise<{}> {
    return this.request('/refreshtransfers', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  public async listassets(body: {
    filter_asset_schemas: string[];
  }): Promise<{ bytes_hex: string }> {
    return this.request('/listassets', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async listtransfers(body: {
    asset_id: string;
  }): Promise<{ bytes_hex: string }> {
    return this.request('/listtransfers', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async sync(): Promise<{ bytes_hex: string }> {
    return this.request('/sync', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  public async getNode(id: string): Promise<{ bytes_hex: string }> {
    return this.request(`/api/nodes/${id}`, {
      method: 'GET',
    });
  }

  public async listchannels(): Promise<{}> {
    return this.request('/listchannels', {
      method: 'GET',
    });
  }

  public async closechannel(body: {
    channel_id: string;
    peer_pubkey: number;
    force: boolean;
  }): Promise<{}> {
    return this.request('/closechannel', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async openchannel(body: {
    peer_pubkey_and_opt_addr: string;
    capacity_sat: number;
    push_msat: number;
    asset_amount: number;
    asset_id: string;
    public: boolean;
    with_anchors: boolean;
    fee_base_msat: number;
    fee_proportional_millionths: number;
    temporary_channel_id?: string;
  }): Promise<{ temporary_channel_id: string }> {
    return this.request('/openchannel', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async lninvoice(body: {
    amt_msat: number;
    expiry_sec: number;
    asset_id?: string;
    asset_amount?: number;
  }): Promise<{ invoice: string }> {
    return this.request('/lninvoice', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async decodelninvoice(body: { invoice: string }): Promise<{}> {
    return this.request('/decodelninvoice', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async sendPayment(body: { invoice: string }): Promise<{}> {
    return this.request('/sendpayment', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async listpayments(): Promise<{}> {
    return this.request('/listpayments', {
      method: 'GET',
    });
  }

  public async init(body: { password: string }): Promise<{ mnemonic: string }> {
    return this.request('/init', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async assetbalance(body: { asset_id: string }): Promise<{
    future: number;
    settled: number;
    spendable: number;
    offchain_inbound: number;
    offchain_outbound: number;
  }> {
    return this.request('/assetbalance', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async unlockNode(id: string): Promise<{}> {
    return this.request(`/unlock/${id}`, {
      method: 'POST',
    });
  }

  public async unlock(
    password: string,
    authToken: string,
  ): Promise<{ invoice: string }> {
    return this.request('/unlock', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: password,
        bitcoind_rpc_username: 'user',
        bitcoind_rpc_password: 'password',
        bitcoind_rpc_host: 'regtest-bitcoind.rgbtools.org',
        bitcoind_rpc_port: 80,
        indexer_url: 'electrum.rgbtools.org:50041',
        proxy_endpoint: 'rpcs://proxy.iriswallet.com/0.2/json-rpc',
        announce_addresses: ['pub.addr.example.com:9735'],
        announce_alias: 'nodeAlias',
      }),
    });
  }
}

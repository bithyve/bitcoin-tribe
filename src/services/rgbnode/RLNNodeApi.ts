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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Request failed: ${errorData.message}`);
      }
      return response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
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
    asset_id: string;
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
    return this.request('/nodeinfo', {
      method: 'GET',
    });
  }

  public async sendasset(body: {
    asset_id: string;
    amount: number;
    recipient_id: string;
    donation: boolean;
    fee_rate: number;
    min_confirmations: number;
    transport_endpoints: string[];
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
    const formData = new FormData();
    formData.append('skip_sync', body.skip_sync);
    return this.request('/refreshtransfers', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
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
}
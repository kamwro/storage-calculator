import { Injectable } from '@nestjs/common';

export interface NormalizeResultItemTypeInput {
  name: string;
  unitWeightKg: number;
  unitVolumeM3: number;
  lengthM?: number;
  widthM?: number;
  heightM?: number;
}

export interface NormalizeResultItemInput {
  itemTypeName: string;
  quantity: number;
}

export interface NormalizeResult {
  itemTypes: NormalizeResultItemTypeInput[];
  items: NormalizeResultItemInput[];
}

@Injectable()
export class CargoClient {
  private readonly hasApiKey: boolean = !!process.env.CARGO_API_KEY;
  private readonly hasApiToken: boolean = !!process.env.CARGO_API_TOKEN;

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    const apiKey = process.env.CARGO_API_KEY;
    const apiToken = process.env.CARGO_API_TOKEN;
    if (apiKey) headers['X-CARGO-API-KEY'] = apiKey;
    if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
    return headers;
  }

  async health(): Promise<{ ok: boolean } | null> {
    const base = process.env.CARGO_URL ?? '';
    try {
      const res = await fetch(`${base}/health`, {
        method: 'GET',
        headers: this.buildHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => ({ ok: true }));
      return data ?? { ok: true };
    } catch {
      return null;
    }
  }

  async normalize(source: string, payload: unknown): Promise<NormalizeResult> {
    const query = `mutation ($source: String!, $payload: JSON!) { normalize(source: $source, payload: $payload) { itemTypes { name unitWeightKg unitVolumeM3 lengthM widthM heightM } items { itemTypeName quantity } } }`;
    const variables = { source, payload };
    const body = { query, variables };
    const base = process.env.CARGO_URL ?? '';
    const res = await fetch(`${base}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.buildHeaders() },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Cargo request failed: ${res.status} ${res.statusText} ${text}`.trim());
    }
    const data = await res.json();
    if (data?.errors) {
      const message = data.errors?.[0]?.message ?? 'Cargo error';
      throw new Error(message);
    }
    return data?.data?.normalize as NormalizeResult;
  }
}

import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import type { ICargoClient, NormalizeResult } from '../../core/ports/cargo.client.port';

@Injectable()
export class CargoClient implements ICargoClient {
  private readonly hasApiKey: boolean = !!process.env.CARGO_API_KEY;

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
    if (!base) throw new Error('CARGO_URL is not configured');
    if (!this.hasApiKey) throw new Error('CARGO_API_KEY is not configured');
    try {
      const res = await fetch(`${base}/health`, {
        method: 'GET',
        headers: this.buildHeaders(),
      });
      if (res.status !== HttpStatus.OK) return null;
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
    if (!base) {
      throw new BadRequestException('CARGO_URL is not configured');
    }
    if (!this.hasApiKey) {
      throw new BadRequestException('CARGO_API_KEY is not configured');
    }
    const res = await fetch(`${base}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.buildHeaders() },
      body: JSON.stringify(body),
    });
    if (res.status !== HttpStatus.OK) {
      const text = await res.text().catch(() => '');
      throw new BadRequestException(`Cargo request failed: ${res.status} ${res.statusText} ${text}`.trim());
    }
    const data = await res.json();
    if (data?.errors) {
      const message = data.errors?.[0]?.message ?? 'Cargo error';
      throw new BadRequestException(message);
    }
    return data?.data?.normalize as NormalizeResult;
  }
}

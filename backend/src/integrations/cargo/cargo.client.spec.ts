import { CargoClient } from './cargo.client';

describe('CargoClient', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    (global.fetch as any) = undefined;
    jest.clearAllMocks();
  });

  test('normalize success returns parsed data and sends headers', async () => {
    process.env.CARGO_URL = 'http://cargo';
    process.env.CARGO_API_KEY = 'k';
    delete process.env.CARGO_API_TOKEN;

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { normalize: { itemTypes: [], items: [] } } }),
    });
    (global as any).fetch = mockFetch;

    const client = new CargoClient();
    const res = await client.normalize('src', { a: 1 });
    expect(res).toEqual({ itemTypes: [], items: [] });
    expect(mockFetch).toHaveBeenCalledWith(
      'http://cargo/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-CARGO-API-KEY': 'k', 'Content-Type': 'application/json' }),
      }),
    );
  });

  test('normalize includes bearer when CARGO_API_TOKEN set', async () => {
    process.env.CARGO_URL = 'http://cargo';
    process.env.CARGO_API_KEY = 'k';
    process.env.CARGO_API_TOKEN = 'tkn';

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { normalize: { itemTypes: [], items: [] } } }),
    });
    (global as any).fetch = mockFetch;

    const client = new CargoClient();
    await client.normalize('src', {});
    const [_url, init] = mockFetch.mock.calls[0];
    expect((init.headers as any)['Authorization']).toBe('Bearer tkn');
  });

  test('normalize throws on non-200', async () => {
    process.env.CARGO_URL = 'http://cargo';
    process.env.CARGO_API_KEY = 'k';

    const mockFetch = jest.fn().mockResolvedValue({ ok: false, status: 500, statusText: 'ERR', text: async () => 'boom' });
    (global as any).fetch = mockFetch;

    const client = new CargoClient();
    await expect(client.normalize('src', {})).rejects.toThrow(/Cargo request failed: 500/);
  });

  test('normalize throws on GraphQL errors', async () => {
    process.env.CARGO_URL = 'http://cargo';
    process.env.CARGO_API_KEY = 'k';

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ errors: [{ message: 'bad' }] }),
    });
    (global as any).fetch = mockFetch;

    const client = new CargoClient();
    await expect(client.normalize('src', {})).rejects.toThrow(/bad/);
  });

  test('health returns null on failure and object on success', async () => {
    process.env.CARGO_URL = 'http://cargo';
    process.env.CARGO_API_KEY = 'k';

    const mockFetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) })
      .mockResolvedValueOnce({ ok: false, status: 500, statusText: 'ERR', text: async () => '' });
    (global as any).fetch = mockFetch;

    const client = new CargoClient();
    await expect(client.health()).resolves.toEqual({ ok: true });
    await expect(client.health()).resolves.toBeNull();
  });
});

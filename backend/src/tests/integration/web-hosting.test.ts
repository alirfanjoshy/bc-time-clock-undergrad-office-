import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { createApp } from '../../app.js';

const directory = mkdtempSync(path.join(tmpdir(), 'bc-web-hosting-'));
mkdirSync(path.join(directory, 'assets'));
writeFileSync(path.join(directory, 'index.html'), '<!doctype html><title>BC Time Clock</title>');
writeFileSync(path.join(directory, 'manifest.webmanifest'), '{"name":"BC Time Clock"}');
writeFileSync(path.join(directory, 'assets/app.js'), 'window.appLoaded = true;');
afterAll(() => rmSync(directory, { recursive: true, force: true }));

describe('combined web and API hosting', () => {
  const app = createApp({ webDistPath: directory });

  it('serves the website and installation manifest with revalidation', async () => {
    const page = await request(app).get('/');
    expect(page.status).toBe(200);
    expect(page.text).toContain('BC Time Clock');
    expect(page.headers['cache-control']).toBe('no-cache');
    expect(page.headers['content-security-policy']).toContain("frame-src 'self' https://www.google.com");
    const manifest = await request(app).get('/manifest.webmanifest');
    expect(manifest.status).toBe(200);
    expect(manifest.headers['content-type']).toContain('application/manifest+json');
    expect((await request(app).get('/assets/app.js')).status).toBe(200);
  });

  it('keeps API health, authorization, and unknown endpoints separate from static files', async () => {
    expect((await request(app).get('/health')).body.data.status).toBe('ok');
    expect((await request(app).get('/api/admin/users')).status).toBe(401);
    const missing = await request(app).get('/api/missing');
    expect(missing.status).toBe(404);
    expect(missing.headers['content-type']).toContain('application/json');
    expect((await request(app).get('/.env')).status).toBe(404);
    expect((await request(app).get('/assets/missing.js')).status).toBe(404);
  });

  it('fails startup when a configured web build is missing', () => {
    expect(() => createApp({ webDistPath: path.join(directory, 'missing') })).toThrow('WEB_DIST_PATH');
  });
});

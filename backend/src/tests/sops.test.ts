import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('Module C: SOP Management & Digital Signoffs', () => {
  let token: string;
  let orgId: string;
  let createdSopId: string;

  beforeAll(async () => {
    // Register test admin user
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `sop-admin-${Date.now()}@asyncflow.io`,
        password: 'Password123!',
        firstName: 'SOP',
        lastName: 'Admin',
        organizationName: 'Policy Global',
      });

    token = userRes.body.data.tokens.accessToken;
    orgId = userRes.body.data.organization.id;
  });

  it('POST /api/v1/sops should create a new SOP with initial version', async () => {
    const res = await request(app)
      .post('/api/v1/sops')
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        title: 'Core Asynchronous Communication Protocol',
        summary: 'Essential guidelines for written communication and response SLAs.',
        category: 'COMMUNICATION',
        priority: 'HIGH',
        content: '## 1. Objective\nAlways provide complete context in initial messages.\n\n## 2. Response SLA\nWithin 4 hours.',
        checklist: [
          { id: '1', text: 'Read and understood 4-hour SLA.', required: true },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Core Asynchronous Communication Protocol');
    expect(res.body.data.currentVersionNumber).toBe(1);

    createdSopId = res.body.data.id;
  });

  it('GET /api/v1/sops should list organization SOPs', async () => {
    const res = await request(app)
      .get('/api/v1/sops')
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/sops/:id should fetch SOP details with version and checklist', async () => {
    const res = await request(app)
      .get(`/api/v1/sops/${createdSopId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdSopId);
    expect(res.body.data.currentVersion).toBeDefined();
  });

  it('POST /api/v1/sops/:id/acknowledge should record digital compliance signoff', async () => {
    const res = await request(app)
      .post(`/api/v1/sops/${createdSopId}/acknowledge`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sopId).toBe(createdSopId);
  });

  it('POST /api/v1/sops/:id/comments should add an asynchronous discussion comment', async () => {
    const res = await request(app)
      .post(`/api/v1/sops/${createdSopId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        content: 'This SLA provides excellent protection for deep focus blocks.',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toContain('deep focus blocks');
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('Multi-Tenant Isolation & Security Tests', () => {
  let userAToken: string;
  let orgAId: string;
  let userBToken: string;
  let orgBId: string;
  let orgASopId: string;

  beforeAll(async () => {
    // 1. Create Organization A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `tenant-a-${Date.now()}@alpha.com`,
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Alpha',
        organizationName: 'Alpha Corp',
      });
    userAToken = resA.body.data.tokens.accessToken;
    orgAId = resA.body.data.organization.id;

    // 2. Create Organization B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `tenant-b-${Date.now()}@beta.com`,
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'Beta',
        organizationName: 'Beta Corp',
      });
    userBToken = resB.body.data.tokens.accessToken;
    orgBId = resB.body.data.organization.id;

    // 3. User A creates a confidential SOP in Organization A
    const sopRes = await request(app)
      .post('/api/v1/sops')
      .set('Authorization', `Bearer ${userAToken}`)
      .set('x-organization-id', orgAId)
      .send({
        title: 'Alpha Corp Confidential Strategy',
        summary: 'Secret internal proprietary strategy document.',
        category: 'POLICY',
        priority: 'HIGH',
        content: 'Confidential trade secrets of Alpha Corp.',
      });
    orgASopId = sopRes.body.data.id;
  });

  it('User B in Org B CANNOT read Org A SOP (404/403 Isolated)', async () => {
    // User B attempts to access Org A SOP passing Org B context
    const res = await request(app)
      .get(`/api/v1/sops/${orgASopId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-organization-id', orgBId);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('User B CANNOT forge x-organization-id header to masquerade as Org A (403 Forbidden)', async () => {
    // User B tries spoofing x-organization-id as Org A
    const res = await request(app)
      .get(`/api/v1/sops/${orgASopId}`)
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-organization-id', orgAId);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('do not belong to this organization');
  });

  it('User B listing SOPs only sees Org B SOPs, never Org A SOPs', async () => {
    const res = await request(app)
      .get('/api/v1/sops')
      .set('Authorization', `Bearer ${userBToken}`)
      .set('x-organization-id', orgBId);

    expect(res.status).toBe(200);
    const sops = res.body.data;
    const foundAlphaSop = sops.find((s: any) => s.id === orgASopId);
    expect(foundAlphaSop).toBeUndefined();
  });
});

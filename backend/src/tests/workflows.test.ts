import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('Module D: Workflow & Stage-Gated Pipeline APIs', () => {
  let token: string;
  let orgId: string;
  let workflowId: string;
  let stage1Id: string;
  let stage2Id: string;
  let taskId: string;

  beforeAll(async () => {
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `wf-admin-${Date.now()}@asyncflow.io`,
        password: 'Password123!',
        firstName: 'Workflow',
        lastName: 'Manager',
        organizationName: 'Pipeline Systems',
      });

    token = userRes.body.data.tokens.accessToken;
    orgId = userRes.body.data.organization.id;
  });

  it('POST /api/v1/workflows should create workflow with default 4 stages', async () => {
    const res = await request(app)
      .post('/api/v1/workflows')
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        title: 'New Hire Engineering Onboarding (First 30 Days)',
        description: 'Guided checklist ensuring production deployments in first week.',
        category: 'ONBOARDING',
        priority: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stages.length).toBe(4);

    workflowId = res.body.data.id;
    stage1Id = res.body.data.stages[0].id;
    stage2Id = res.body.data.stages[1].id;
  });

  it('POST /api/v1/workflows/:id/tasks should create a task in a stage', async () => {
    const res = await request(app)
      .post(`/api/v1/workflows/${workflowId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        stageId: stage1Id,
        title: 'Setup hardware security key and clone repos',
        description: 'Configure YubiKey and SSH keys.',
        priority: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Setup hardware security key and clone repos');

    taskId = res.body.data.id;
  });

  it('PATCH /api/v1/workflows/tasks/:taskId/stage should move task to next stage', async () => {
    const res = await request(app)
      .patch(`/api/v1/workflows/tasks/${taskId}/stage`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        stageId: stage2Id,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stageId).toBe(stage2Id);
  });

  it('GET /api/v1/workflows/:id should return complete Kanban board with stages and tasks', async () => {
    const res = await request(app)
      .get(`/api/v1/workflows/${workflowId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stages.length).toBe(4);
  });
});

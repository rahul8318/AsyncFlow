import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

describe('Modules E & F: Training LMS & Server-Graded Assessment Engine', () => {
  let token: string;
  let orgId: string;
  let programId: string;
  let moduleId: string;
  let lessonId: string;
  let quizId: string;
  let questionId: string;
  let correctOptionId: string;
  let wrongOptionId: string;

  beforeAll(async () => {
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `lms-admin-${Date.now()}@asyncflow.io`,
        password: 'Password123!',
        firstName: 'LMS',
        lastName: 'Director',
        organizationName: 'Learning Corp',
      });

    token = userRes.body.data.tokens.accessToken;
    orgId = userRes.body.data.organization.id;
  });

  it('POST /api/v1/training should create a new training program', async () => {
    const res = await request(app)
      .post('/api/v1/training')
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        title: 'Asynchronous Work 101',
        description: 'Comprehensive curriculum on written communication hygiene and response SLAs.',
        category: 'ASYNC_COMMUNICATION',
        estimatedHours: 1.5,
        passingScore: 80,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    programId = res.body.data.id;
  });

  it('POST /api/v1/training/:id/modules should add a module to program', async () => {
    const res = await request(app)
      .post(`/api/v1/training/${programId}/modules`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        title: 'Module 1: Principles of Asynchrony',
        order: 1,
      });

    expect(res.status).toBe(201);
    moduleId = res.body.data.id;
  });

  it('POST /api/v1/training/modules/:moduleId/lessons should add a lesson', async () => {
    const res = await request(app)
      .post(`/api/v1/training/modules/${moduleId}/lessons`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        title: '1.1 Deep Focus and Context Switching Costs',
        content: 'Interrupting knowledge workers costs an average of 23 minutes to resume focus.',
        durationMinutes: 10,
        order: 1,
      });

    expect(res.status).toBe(201);
    lessonId = res.body.data.id;
  });

  it('POST /api/v1/training/:id/quiz should create an assessment quiz', async () => {
    const res = await request(app)
      .post(`/api/v1/training/${programId}/quiz`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        title: 'Async Work Certification Exam',
        timeLimitMinutes: 10,
        passingScore: 80,
        maxAttempts: 3,
        questions: [
          {
            questionText: 'What is the recommended SLA for non-urgent internal messages?',
            explanation: 'Under our SOP #1, standard response time is 4-8 working hours.',
            points: 100,
            order: 1,
            options: [
              { optionText: 'Immediately within 2 minutes', isCorrect: false, order: 1 },
              { optionText: '4 to 8 working hours', isCorrect: true, order: 2 },
            ],
          },
        ],
      });

    expect(res.status).toBe(201);
    quizId = res.body.data.id;
    questionId = res.body.data.questions[0].id;
    correctOptionId = res.body.data.questions[0].options.find((o: any) => o.isCorrect).id;
    wrongOptionId = res.body.data.questions[0].options.find((o: any) => !o.isCorrect).id;
  });

  it('GET /api/v1/training/quizzes/:quizId should NEVER leak isCorrect to student', async () => {
    const res = await request(app)
      .get(`/api/v1/training/quizzes/${quizId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId);

    expect(res.status).toBe(200);
    const options = res.body.data.questions[0].options;
    for (const opt of options) {
      expect(opt.isCorrect).toBeUndefined();
    }
  });

  it('POST /api/v1/training/:id/lessons/:lessonId/complete should log lesson progress', async () => {
    const res = await request(app)
      .post(`/api/v1/training/${programId}/lessons/${lessonId}/complete`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.enrollment.progressPercent).toBe(100);
  });

  it('POST /api/v1/training/quizzes/:quizId/submit should grade server-side and issue certificate upon passing', async () => {
    const res = await request(app)
      .post(`/api/v1/training/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-organization-id', orgId)
      .send({
        answers: [
          { questionId, selectedOptionId: correctOptionId },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isPassed).toBe(true);
    expect(res.body.data.scorePercent).toBe(100);
    expect(res.body.data.questionReview[0].isCorrect).toBe(true);
  });
});

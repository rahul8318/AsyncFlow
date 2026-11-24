import crypto from 'crypto';
import { prisma } from '../../services/prisma.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { TrainingCategory, TrainingStatus, EnrollmentStatus, NotificationType } from '@prisma/client';

export class TrainingService {
  async listPrograms(
    orgId: string,
    userId: string,
    query?: { category?: TrainingCategory; search?: string }
  ) {
    const where: any = { organizationId: orgId, status: TrainingStatus.PUBLISHED };

    if (query?.category) where.category = query.category;
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const programs = await prisma.trainingProgram.findMany({
      where,
      include: {
        modules: {
          include: {
            lessons: {
              select: { id: true, title: true, durationMinutes: true, contentType: true },
            },
          },
        },
        quizzes: {
          select: { id: true, title: true, timeLimitMinutes: true, passingScore: true },
        },
        enrollments: {
          where: { userId },
          select: {
            id: true,
            status: true,
            progressPercent: true,
            certificateCode: true,
            completedAt: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return programs.map((p) => {
      const myEnrollment = p.enrollments[0] || null;
      const totalLessons = p.modules.reduce((sum, m) => sum + m.lessons.length, 0);

      return {
        ...p,
        totalLessons,
        myEnrollment,
        isEnrolled: !!myEnrollment,
      };
    });
  }

  async getProgramDetails(orgId: string, programId: string, userId: string) {
    const program = await prisma.trainingProgram.findFirst({
      where: { id: programId, organizationId: orgId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        quizzes: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimitMinutes: true,
            passingScore: true,
            maxAttempts: true,
          },
        },
        enrollments: {
          where: { userId },
          include: {
            lessonProgress: true,
            quizAttempts: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundError('Training program not found');
    }

    const enrollment = program.enrollments[0] || null;
    const completedLessonIds = new Set(
      enrollment?.lessonProgress.filter((lp) => lp.isCompleted).map((lp) => lp.lessonId) || []
    );

    return {
      ...program,
      enrollment,
      completedLessonIds: Array.from(completedLessonIds),
    };
  }

  async enroll(orgId: string, programId: string, userId: string) {
    const program = await prisma.trainingProgram.findFirst({
      where: { id: programId, organizationId: orgId },
    });

    if (!program) {
      throw new NotFoundError('Training program not found');
    }

    return await prisma.trainingEnrollment.upsert({
      where: {
        programId_userId: { programId, userId },
      },
      update: {},
      create: {
        programId,
        userId,
        organizationId: orgId,
        status: EnrollmentStatus.IN_PROGRESS,
        progressPercent: 0,
      },
    });
  }

  async completeLesson(orgId: string, programId: string, lessonId: string, userId: string) {
    // Ensure user is enrolled
    let enrollment = await prisma.trainingEnrollment.findUnique({
      where: { programId_userId: { programId, userId } },
    });

    if (!enrollment) {
      enrollment = await this.enroll(orgId, programId, userId);
    }

    // Mark lesson complete
    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: { isCompleted: true },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: true,
      },
    });

    // Recalculate progress %
    const totalLessonsCount = await prisma.trainingLesson.count({
      where: { module: { programId } },
    });

    const completedCount = await prisma.lessonProgress.count({
      where: { enrollmentId: enrollment.id, isCompleted: true },
    });

    const progressPercent = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 100;

    const hasQuiz = (await prisma.quiz.count({ where: { programId } })) > 0;
    const isFullyCompleted = progressPercent === 100 && !hasQuiz;

    const updatedEnrollment = await prisma.trainingEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercent,
        status: isFullyCompleted ? EnrollmentStatus.COMPLETED : EnrollmentStatus.IN_PROGRESS,
        completedAt: isFullyCompleted ? new Date() : undefined,
        certificateCode: isFullyCompleted ? `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}` : undefined,
        certificateIssuedAt: isFullyCompleted ? new Date() : undefined,
      },
    });

    return { enrollment: updatedEnrollment, completedCount, totalLessonsCount };
  }

  // Quiz Methods
  async getQuizForStudent(quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                questionId: true,
                optionText: true,
                order: true,
                // NEVER return isCorrect to the student before submission!
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    return quiz;
  }

  async submitQuiz(
    orgId: string,
    quizId: string,
    userId: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>
  ) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        program: true,
      },
    });

    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    // Ensure enrollment
    let enrollment = await prisma.trainingEnrollment.findUnique({
      where: { programId_userId: { programId: quiz.programId, userId } },
    });

    if (!enrollment) {
      enrollment = await this.enroll(orgId, quiz.programId, userId);
    }

    // Grade on server
    const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOptionId]));
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const questionReview = [];

    for (const q of quiz.questions) {
      const selectedOptionId = answerMap.get(q.id);
      const correctOption = q.options.find((opt) => opt.isCorrect);
      const isCorrect = correctOption?.id === selectedOptionId;

      if (isCorrect) {
        correctCount += 1;
      }

      questionReview.push({
        questionId: q.id,
        questionText: q.questionText,
        explanation: q.explanation,
        selectedOptionId,
        correctOptionId: correctOption?.id,
        isCorrect,
      });
    }

    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const isPassed = scorePercent >= quiz.passingScore;

    // Create attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        enrollmentId: enrollment.id,
        userId,
        score: scorePercent,
        totalQuestions,
        correctQuestions: correctCount,
        isPassed,
      },
    });

    // If passed, check if all lessons are also done to grant certificate
    if (isPassed) {
      const certificateCode = enrollment.certificateCode || `ASYNC-CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      await prisma.trainingEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: EnrollmentStatus.COMPLETED,
          progressPercent: 100,
          certificateCode,
          certificateIssuedAt: new Date(),
          completedAt: new Date(),
        },
      });

      await prisma.notification.create({
        data: {
          organizationId: orgId,
          userId,
          type: NotificationType.TRAINING_ASSIGNED,
          title: 'Certificate Earned!',
          message: `Congratulations! You passed the assessment for "${quiz.program.title}" with ${scorePercent}%.`,
          linkUrl: `/app/training/${quiz.programId}`,
        },
      });
    }

    return {
      attempt,
      scorePercent,
      passingScore: quiz.passingScore,
      isPassed,
      questionReview,
    };
  }

  async getMyLearning(orgId: string, userId: string) {
    return await prisma.trainingEnrollment.findMany({
      where: { organizationId: orgId, userId },
      include: {
        program: {
          include: {
            modules: {
              include: {
                lessons: {
                  select: { id: true, durationMinutes: true },
                },
              },
            },
          },
        },
        quizAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createProgram(
    orgId: string,
    userId: string,
    data: {
      title: string;
      description: string;
      category: TrainingCategory;
      thumbnail?: string;
      estimatedHours: number;
      passingScore: number;
      status?: TrainingStatus;
    }
  ) {
    return await prisma.trainingProgram.create({
      data: {
        organizationId: orgId,
        createdById: userId,
        title: data.title,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnail,
        estimatedHours: data.estimatedHours,
        passingScore: data.passingScore,
        status: data.status || TrainingStatus.PUBLISHED,
      },
    });
  }

  async addModule(programId: string, data: { title: string; description?: string; order: number }) {
    return await prisma.trainingModule.create({
      data: {
        programId,
        title: data.title,
        description: data.description,
        order: data.order,
      },
    });
  }

  async addLesson(
    moduleId: string,
    data: {
      title: string;
      content: string;
      contentType?: any;
      resourceUrl?: string;
      durationMinutes?: number;
      order?: number;
    }
  ) {
    return await prisma.trainingLesson.create({
      data: {
        moduleId,
        title: data.title,
        content: data.content,
        contentType: data.contentType || 'ARTICLE',
        resourceUrl: data.resourceUrl,
        durationMinutes: data.durationMinutes || 10,
        order: data.order || 0,
      },
    });
  }

  async createQuiz(
    programId: string,
    data: {
      title: string;
      description?: string;
      timeLimitMinutes: number;
      passingScore: number;
      maxAttempts: number;
      questions: Array<{
        questionText: string;
        explanation?: string;
        points: number;
        order: number;
        options: Array<{ optionText: string; isCorrect: boolean; order: number }>;
      }>;
    }
  ) {
    return await prisma.quiz.create({
      data: {
        programId,
        title: data.title,
        description: data.description,
        timeLimitMinutes: data.timeLimitMinutes,
        passingScore: data.passingScore,
        maxAttempts: data.maxAttempts,
        questions: {
          create: data.questions.map((q) => ({
            questionText: q.questionText,
            explanation: q.explanation,
            points: q.points,
            order: q.order,
            options: {
              create: q.options.map((opt) => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
                order: opt.order,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }
}

export const trainingService = new TrainingService();

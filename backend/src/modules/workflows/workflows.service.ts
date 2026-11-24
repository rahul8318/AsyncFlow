import { prisma } from '../../services/prisma.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { emitToOrg, emitToUser } from '../../services/socket.js';
import { WorkflowCategory, Priority, WorkflowStatus, ApprovalStatus, NotificationType } from '@prisma/client';

export class WorkflowService {
  async listWorkflows(
    orgId: string,
    query?: { category?: WorkflowCategory; status?: WorkflowStatus; search?: string }
  ) {
    const where: any = { organizationId: orgId };

    if (query?.category) where.category = query.category;
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.title = { contains: query.search, mode: 'insensitive' };
    }

    return await prisma.workflow.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        stages: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { tasks: true },
            },
          },
        },
        _count: {
          select: { tasks: true, comments: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getWorkflowBoard(orgId: string, workflowId: string) {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, organizationId: orgId },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        stages: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
              include: {
                assignee: {
                  select: { id: true, firstName: true, lastName: true, avatarUrl: true },
                },
                reporter: {
                  select: { id: true, firstName: true, lastName: true },
                },
                approvals: {
                  include: {
                    approver: {
                      select: { id: true, firstName: true, lastName: true },
                    },
                  },
                },
                _count: {
                  select: { comments: true },
                },
              },
            },
          },
        },
        comments: {
          where: { taskId: null },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }

    return workflow;
  }

  async createWorkflow(
    orgId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      category?: WorkflowCategory;
      priority?: Priority;
      dueDate?: string;
      stages?: Array<{ name: string; order: number; color?: string; isCompletedStage?: boolean }>;
    }
  ) {
    const defaultStages = [
      { name: 'To Do', order: 1, color: '#94a3b8', isCompletedStage: false },
      { name: 'In Progress', order: 2, color: '#3b82f6', isCompletedStage: false },
      { name: 'In Review', order: 3, color: '#eab308', isCompletedStage: false },
      { name: 'Completed', order: 4, color: '#22c55e', isCompletedStage: true },
    ];

    const stagesToCreate = data.stages && data.stages.length > 0 ? data.stages : defaultStages;

    return await prisma.workflow.create({
      data: {
        organizationId: orgId,
        title: data.title,
        description: data.description,
        category: data.category || WorkflowCategory.CUSTOM,
        priority: data.priority || Priority.MEDIUM,
        createdById: userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        stages: {
          create: stagesToCreate.map((s) => ({
            name: s.name,
            order: s.order,
            color: s.color || '#64748b',
            isCompletedStage: s.isCompletedStage || false,
          })),
        },
      },
      include: {
        stages: true,
      },
    });
  }

  async createTask(
    orgId: string,
    workflowId: string,
    userId: string,
    data: {
      stageId: string;
      title: string;
      description?: string;
      priority?: Priority;
      assigneeId?: string;
      dueDate?: string;
      order?: number;
      requiresApproval?: boolean;
      approverId?: string;
    }
  ) {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, organizationId: orgId },
    });

    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }

    const task = await prisma.$transaction(async (tx) => {
      const createdTask = await tx.workflowTask.create({
        data: {
          workflowId,
          stageId: data.stageId,
          title: data.title,
          description: data.description,
          priority: data.priority || Priority.MEDIUM,
          assigneeId: data.assigneeId,
          reporterId: userId,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          order: data.order || 0,
        },
        include: {
          assignee: true,
          stage: true,
        },
      });

      if (data.requiresApproval && data.approverId) {
        await tx.workflowApproval.create({
          data: {
            taskId: createdTask.id,
            approverId: data.approverId,
            status: ApprovalStatus.PENDING,
          },
        });
      }

      return createdTask;
    });

    if (data.assigneeId) {
      await prisma.notification.create({
        data: {
          organizationId: orgId,
          userId: data.assigneeId,
          type: NotificationType.WORKFLOW_ASSIGNED,
          title: 'New Workflow Task Assigned',
          message: `You were assigned task "${data.title}" in workflow "${workflow.title}".`,
          linkUrl: `/app/workflows/${workflow.id}`,
        },
      });
      emitToUser(data.assigneeId, 'notification', {
        title: 'New Workflow Task Assigned',
        message: `Task "${data.title}" assigned to you.`,
      });
    }

    emitToOrg(orgId, 'workflow_task_created', { workflowId, task });
    return task;
  }

  async updateTaskStage(
    orgId: string,
    taskId: string,
    data: { stageId: string; order?: number; isCompleted?: boolean }
  ) {
    const task = await prisma.workflowTask.findUnique({
      where: { id: taskId },
      include: { stage: true, workflow: true },
    });

    if (!task || task.workflow.organizationId !== orgId) {
      throw new NotFoundError('Task not found');
    }

    const targetStage = await prisma.workflowStage.findUnique({
      where: { id: data.stageId },
    });

    if (!targetStage || targetStage.workflowId !== task.workflowId) {
      throw new BadRequestError('Invalid destination stage');
    }

    const isCompleted = data.isCompleted ?? targetStage.isCompletedStage;

    const updatedTask = await prisma.workflowTask.update({
      where: { id: taskId },
      data: {
        stageId: data.stageId,
        order: data.order !== undefined ? data.order : task.order,
        isCompleted,
      },
      include: {
        assignee: true,
        stage: true,
        approvals: true,
      },
    });

    emitToOrg(orgId, 'workflow_task_moved', {
      workflowId: task.workflowId,
      taskId,
      stageId: data.stageId,
    });

    return updatedTask;
  }

  async reviewApproval(
    orgId: string,
    approvalId: string,
    userId: string,
    data: { status: ApprovalStatus; comments?: string }
  ) {
    const approval = await prisma.workflowApproval.findUnique({
      where: { id: approvalId },
      include: {
        task: {
          include: { workflow: true, reporter: true, assignee: true },
        },
      },
    });

    if (!approval || approval.task.workflow.organizationId !== orgId) {
      throw new NotFoundError('Approval request not found');
    }

    const updatedApproval = await prisma.workflowApproval.update({
      where: { id: approvalId },
      data: {
        status: data.status,
        comments: data.comments,
        approvedAt: new Date(),
      },
    });

    // Notify task assignee or reporter
    const notifyUser = approval.task.assigneeId || approval.task.reporterId;
    if (notifyUser) {
      await prisma.notification.create({
        data: {
          organizationId: orgId,
          userId: notifyUser,
          type: NotificationType.WORKFLOW_APPROVAL,
          title: `Task Approval ${data.status}`,
          message: `Approval for "${approval.task.title}" was marked as ${data.status}.`,
          linkUrl: `/app/workflows/${approval.task.workflowId}`,
        },
      });
    }

    return updatedApproval;
  }

  async addWorkflowComment(
    orgId: string,
    workflowId: string,
    userId: string,
    data: { taskId?: string; content: string }
  ) {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, organizationId: orgId },
    });

    if (!workflow) {
      throw new NotFoundError('Workflow not found');
    }

    return await prisma.workflowComment.create({
      data: {
        workflowId,
        taskId: data.taskId,
        userId,
        content: data.content,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }
}

export const workflowService = new WorkflowService();

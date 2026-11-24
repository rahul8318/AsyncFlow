import { Request, Response, NextFunction } from 'express';
import { organizationService } from './organizations.service.js';
import { sendSuccess } from '../../utils/response.js';

export class OrganizationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.createOrganization(req.user!.id, req.body);
      return sendSuccess(res, result, 'Organization created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getOrganization(req.organizationId!);
      return sendSuccess(res, result, 'Organization fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.updateOrganization(req.organizationId!, req.body);
      return sendSuccess(res, result, 'Organization updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.listMembers(req.organizationId!, req.query as any);
      return sendSuccess(res, result, 'Organization members fetched');
    } catch (error) {
      next(error);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.inviteMember(
        req.organizationId!,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, result, 'Member invited successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await organizationService.acceptInvitation(token, req.user!.id);
      return sendSuccess(res, result, 'Invitation accepted');
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      const result = await organizationService.updateMemberRole(
        req.organizationId!,
        memberId,
        req.body
      );
      return sendSuccess(res, result, 'Member role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { memberId } = req.params;
      await organizationService.removeMember(req.organizationId!, memberId);
      return sendSuccess(res, null, 'Member removed successfully');
    } catch (error) {
      next(error);
    }
  }

  async listDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.listDepartments(req.organizationId!);
      return sendSuccess(res, result, 'Departments retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.createDepartment(req.organizationId!, req.body);
      return sendSuccess(res, result, 'Department created', 201);
    } catch (error) {
      next(error);
    }
  }

  async listTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.listTeams(req.organizationId!);
      return sendSuccess(res, result, 'Teams retrieved');
    } catch (error) {
      next(error);
    }
  }

  async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.createTeam(req.organizationId!, req.body);
      return sendSuccess(res, result, 'Team created', 201);
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();

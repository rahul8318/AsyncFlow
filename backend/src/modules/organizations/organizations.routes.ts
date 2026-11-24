import { Router } from 'express';
import { organizationController } from './organizations.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireTenant } from '../../middleware/tenant.js';
import { requireRole } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { Role } from '@prisma/client';
import {
  createOrgSchema,
  updateOrgSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  createDepartmentSchema,
  createTeamSchema,
} from './organizations.validators.js';

const router = Router();

// Org creation is accessible to any authenticated user
router.post(
  '/',
  authenticate,
  validate({ body: createOrgSchema }),
  organizationController.create
);

// Accept invitation
router.post('/accept-invite', authenticate, organizationController.acceptInvite);

// Tenant-scoped routes
router.use(authenticate, requireTenant);

router.get('/current', organizationController.get);
router.patch(
  '/current',
  requireRole(Role.ORG_ADMIN),
  validate({ body: updateOrgSchema }),
  organizationController.update
);

// Members
router.get('/members', organizationController.listMembers);
router.post(
  '/members/invite',
  requireRole(Role.TEAM_MANAGER),
  validate({ body: inviteMemberSchema }),
  organizationController.inviteMember
);
router.patch(
  '/members/:memberId',
  requireRole(Role.ORG_ADMIN),
  validate({ body: updateMemberRoleSchema }),
  organizationController.updateMemberRole
);
router.delete(
  '/members/:memberId',
  requireRole(Role.ORG_ADMIN),
  organizationController.removeMember
);

// Departments
router.get('/departments', organizationController.listDepartments);
router.post(
  '/departments',
  requireRole(Role.ORG_ADMIN),
  validate({ body: createDepartmentSchema }),
  organizationController.createDepartment
);

// Teams
router.get('/teams', organizationController.listTeams);
router.post(
  '/teams',
  requireRole(Role.ORG_ADMIN),
  validate({ body: createTeamSchema }),
  organizationController.createTeam
);

export default router;

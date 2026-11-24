export type Role = 'SUPER_ADMIN' | 'ORG_ADMIN' | 'TEAM_MANAGER' | 'EMPLOYEE';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  jobTitle?: string | null;
  timezone: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  logoUrl?: string | null;
  plan: string;
  subscriptionStatus: string;
  createdById: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  departmentId?: string | null;
  teamId?: string | null;
  joinedAt: string;
  user: User;
  organization?: Organization;
  department?: Department | null;
  team?: Team | null;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  teams?: Team[];
  _count?: { members: number; teams?: number };
}

export interface Team {
  id: string;
  organizationId: string;
  departmentId?: string | null;
  name: string;
  description?: string | null;
  leadId?: string | null;
  department?: Department | null;
  _count?: { members: number };
}

export type SOPCategory =
  | 'POLICY'
  | 'COMMUNICATION'
  | 'MEETING'
  | 'TOOLING'
  | 'ESCALATION'
  | 'ONBOARDING'
  | 'GENERAL';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SOPStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface SOPChecklistItem {
  id: string;
  text: string;
  required: boolean;
}

export interface SOPVersion {
  id: string;
  sopId: string;
  versionNumber: number;
  title: string;
  content: string;
  changelog?: string | null;
  checklist?: SOPChecklistItem[] | null;
  createdAt: string;
  createdBy?: { id: string; firstName: string; lastName: string };
}

export interface SOPAssignment {
  id: string;
  sopId: string;
  teamId?: string | null;
  userId?: string | null;
  dueDate?: string | null;
  team?: Team | null;
  user?: { id: string; firstName: string; lastName: string } | null;
}

export interface SOPAcknowledgement {
  id: string;
  sopId: string;
  sopVersionId: string;
  userId: string;
  acknowledgedAt: string;
  user?: User;
}

export interface SOPComment {
  id: string;
  sopId: string;
  userId: string;
  content: string;
  parentId?: string | null;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  replies?: SOPComment[];
}

export interface SOP {
  id: string;
  organizationId: string;
  title: string;
  summary: string;
  category: SOPCategory;
  priority: Priority;
  status: SOPStatus;
  currentVersionNumber: number;
  createdById: string;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; firstName: string; lastName: string; avatarUrl?: string | null; jobTitle?: string | null };
  versions?: SOPVersion[];
  currentVersion?: SOPVersion;
  assignments?: SOPAssignment[];
  acknowledgements?: SOPAcknowledgement[];
  comments?: SOPComment[];
  isAcknowledgedByMe?: boolean;
  myAcknowledgement?: SOPAcknowledgement | null;
  _count?: { acknowledgements: number; comments: number; versions: number };
}

export type WorkflowCategory = 'ONBOARDING' | 'REPORTING' | 'INCIDENT' | 'HANDOVER' | 'POLICY_APPROVAL' | 'CUSTOM';
export type WorkflowStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface WorkflowStage {
  id: string;
  workflowId: string;
  name: string;
  order: number;
  color: string;
  isCompletedStage: boolean;
  tasks?: WorkflowTask[];
  _count?: { tasks: number };
}

export interface WorkflowApproval {
  id: string;
  taskId: string;
  approverId: string;
  status: ApprovalStatus;
  comments?: string | null;
  approvedAt?: string | null;
  approver: { id: string; firstName: string; lastName: string };
}

export interface WorkflowTask {
  id: string;
  workflowId: string;
  stageId: string;
  title: string;
  description?: string | null;
  priority: Priority;
  assigneeId?: string | null;
  reporterId?: string | null;
  dueDate?: string | null;
  order: number;
  isCompleted: boolean;
  createdAt: string;
  assignee?: User | null;
  reporter?: User | null;
  stage?: WorkflowStage;
  approvals?: WorkflowApproval[];
  _count?: { comments: number };
}

export interface Workflow {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  category: WorkflowCategory;
  priority: Priority;
  status: WorkflowStatus;
  createdById: string;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  stages: WorkflowStage[];
  _count?: { tasks: number; comments: number };
}

export type TrainingCategory =
  | 'REMOTE_FUNDAMENTALS'
  | 'ASYNC_COMMUNICATION'
  | 'EFFECTIVE_DOCUMENTATION'
  | 'DISTRIBUTED_COLLABORATION'
  | 'TIMEZONE_MANAGEMENT'
  | 'REMOTE_LEADERSHIP'
  | 'DIGITAL_ETIQUETTE'
  | 'OPERATIONAL_EXCELLENCE';

export interface TrainingLesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  contentType: 'ARTICLE' | 'VIDEO' | 'SOP_LINK' | 'INTERACTIVE';
  resourceUrl?: string | null;
  durationMinutes: number;
  order: number;
}

export interface TrainingModule {
  id: string;
  programId: string;
  title: string;
  description?: string | null;
  order: number;
  lessons: TrainingLesson[];
}

export interface QuizOption {
  id: string;
  questionId: string;
  optionText: string;
  order: number;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  explanation?: string | null;
  points: number;
  order: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  programId: string;
  title: string;
  description?: string | null;
  timeLimitMinutes: number;
  passingScore: number;
  maxAttempts: number;
  questions?: QuizQuestion[];
}

export interface TrainingEnrollment {
  id: string;
  programId: string;
  userId: string;
  organizationId: string;
  status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercent: number;
  certificateCode?: string | null;
  certificateIssuedAt?: string | null;
  completedAt?: string | null;
  program?: TrainingProgram;
  quizAttempts?: QuizAttempt[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctQuestions: number;
  isPassed: boolean;
  submittedAt: string;
}

export interface TrainingProgram {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  category: TrainingCategory;
  thumbnail?: string | null;
  estimatedHours: number;
  passingScore: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  modules: TrainingModule[];
  quizzes?: Quiz[];
  totalLessons?: number;
  myEnrollment?: TrainingEnrollment | null;
  isEnrolled?: boolean;
  enrollments?: TrainingEnrollment[];
  completedLessonIds?: string[];
}

export type WorkshopStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Workshop {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  instructorName: string;
  instructorId?: string | null;
  coverImage?: string | null;
  scheduledAt: string;
  durationMinutes: number;
  timezone: string;
  meetingUrl?: string | null;
  maxAttendees: number;
  status: WorkshopStatus;
  materialsUrl?: string | null;
  isRegistered?: boolean;
  registeredCount?: number;
  instructor?: User | null;
  registrations?: any[];
  myFeedback?: any;
}

export interface NotificationItem {
  id: string;
  organizationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  user?: { id: string; firstName: string; lastName: string; avatarUrl?: string | null } | null;
  metadata?: any;
}

export interface DashboardMetrics {
  kpis: {
    totalEmployees: number;
    activeTeams: number;
    publishedSOPs: number;
    trainingCompletionRate: number;
    totalEnrollments: number;
    completedEnrollments: number;
    pendingAcknowledgements: number;
    acknowledgementRate: number;
    workshopRegistrations: number;
    communicationScore: number;
  };
  recentActivities: ActivityLogItem[];
  departments: Department[];
}

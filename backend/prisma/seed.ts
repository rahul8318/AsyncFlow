import { PrismaClient, Role, SOPCategory, Priority, SOPStatus, WorkflowCategory, WorkflowStatus, ApprovalStatus, TrainingCategory, TrainingStatus, LessonType, EnrollmentStatus, WorkshopStatus, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for AsyncFlow...');

  // 1. Password hashing
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 2. Clean up existing records in reverse dependency order if any
  console.log('Cleaning up existing data...');
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.workshopFeedback.deleteMany({});
  await prisma.workshopAttendance.deleteMany({});
  await prisma.workshopRegistration.deleteMany({});
  await prisma.workshop.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.answerOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.lessonProgress.deleteMany({});
  await prisma.trainingLesson.deleteMany({});
  await prisma.trainingModule.deleteMany({});
  await prisma.trainingEnrollment.deleteMany({});
  await prisma.trainingProgram.deleteMany({});
  await prisma.workflowComment.deleteMany({});
  await prisma.workflowApproval.deleteMany({});
  await prisma.workflowTask.deleteMany({});
  await prisma.workflowStage.deleteMany({});
  await prisma.workflow.deleteMany({});
  await prisma.sOPComment.deleteMany({});
  await prisma.sOPAcknowledgement.deleteMany({});
  await prisma.sOPAssignment.deleteMany({});
  await prisma.sOPVersion.deleteMany({});
  await prisma.sOP.deleteMany({});
  await prisma.userSession.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.organizationMember.deleteMany({});
  await prisma.team.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  // 3. Create Users
  console.log('Creating users...');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@asyncflow.io',
      passwordHash: defaultPasswordHash,
      firstName: 'Apex',
      lastName: 'Administrator',
      jobTitle: 'Chief Platform Architect',
      timezone: 'America/New_York',
      isEmailVerified: true,
    },
  });

  const orgAdmin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Sarah',
      lastName: 'Chen',
      jobTitle: 'VP of Operations & Culture',
      timezone: 'America/Los_Angeles',
      isEmailVerified: true,
    },
  });

  const teamManager = await prisma.user.create({
    data: {
      email: 'manager@acme.com',
      passwordHash: defaultPasswordHash,
      firstName: 'David',
      lastName: 'Ross',
      jobTitle: 'Head of Engineering',
      timezone: 'America/New_York',
      isEmailVerified: true,
    },
  });

  const productManager = await prisma.user.create({
    data: {
      email: 'elena@acme.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Elena',
      lastName: 'Rostova',
      jobTitle: 'Director of Product Management',
      timezone: 'Europe/London',
      isEmailVerified: true,
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      email: 'employee@acme.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Alex',
      lastName: 'Rivera',
      jobTitle: 'Senior Full Stack Engineer',
      timezone: 'Asia/Tokyo',
      isEmailVerified: true,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'marcus@acme.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Marcus',
      lastName: 'Vance',
      jobTitle: 'Technical Writer & Knowledge Lead',
      timezone: 'Europe/Berlin',
      isEmailVerified: true,
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      email: 'priya@acme.com',
      passwordHash: defaultPasswordHash,
      firstName: 'Priya',
      lastName: 'Patel',
      jobTitle: 'UX Researcher',
      timezone: 'Asia/Kolkata',
      isEmailVerified: true,
    },
  });

  // 4. Create Organization
  console.log('Creating organization Acme Global Technologies...');
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Global Technologies',
      slug: 'acme-global',
      domain: 'acme.com',
      plan: 'ENTERPRISE',
      subscriptionStatus: 'ACTIVE',
      createdById: orgAdmin.id,
    },
  });

  // 5. Create Departments
  console.log('Creating departments...');
  const engineeringDept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'Engineering',
      description: 'Distributed infrastructure, platform systems, and product engineering teams.',
    },
  });

  const productDept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'Product & Design',
      description: 'Product strategy, user experience design, and research across global time zones.',
    },
  });

  const peopleDept = await prisma.department.create({
    data: {
      organizationId: org.id,
      name: 'People Operations',
      description: 'Global talent acquisition, remote workplace culture, onboarding, and training.',
    },
  });

  // 6. Create Teams
  console.log('Creating teams...');
  const infraTeam = await prisma.team.create({
    data: {
      organizationId: org.id,
      departmentId: engineeringDept.id,
      name: 'Platform Infrastructure',
      description: 'Maintains cloud architectures, CI/CD pipelines, and async dev tooling.',
      leadId: teamManager.id,
    },
  });

  const coreProductTeam = await prisma.team.create({
    data: {
      organizationId: org.id,
      departmentId: productDept.id,
      name: 'Core Experience',
      description: 'Full stack product pod focused on user-facing productivity workflows.',
      leadId: productManager.id,
    },
  });

  const remoteWorkEnablementTeam = await prisma.team.create({
    data: {
      organizationId: org.id,
      departmentId: peopleDept.id,
      name: 'Remote Enablement & L&D',
      description: 'Champions asynchronous workflows, documentation tooling, and training SOPs.',
      leadId: orgAdmin.id,
    },
  });

  // 7. Associate Organization Members
  console.log('Adding organization members with roles...');
  await prisma.organizationMember.createMany({
    data: [
      {
        organizationId: org.id,
        userId: orgAdmin.id,
        role: Role.ORG_ADMIN,
        departmentId: peopleDept.id,
        teamId: remoteWorkEnablementTeam.id,
      },
      {
        organizationId: org.id,
        userId: teamManager.id,
        role: Role.TEAM_MANAGER,
        departmentId: engineeringDept.id,
        teamId: infraTeam.id,
      },
      {
        organizationId: org.id,
        userId: productManager.id,
        role: Role.TEAM_MANAGER,
        departmentId: productDept.id,
        teamId: coreProductTeam.id,
      },
      {
        organizationId: org.id,
        userId: employee1.id,
        role: Role.EMPLOYEE,
        departmentId: engineeringDept.id,
        teamId: infraTeam.id,
      },
      {
        organizationId: org.id,
        userId: employee2.id,
        role: Role.EMPLOYEE,
        departmentId: peopleDept.id,
        teamId: remoteWorkEnablementTeam.id,
      },
      {
        organizationId: org.id,
        userId: employee3.id,
        role: Role.EMPLOYEE,
        departmentId: productDept.id,
        teamId: coreProductTeam.id,
      },
    ],
  });

  // 8. Create the 10 Reusable Enterprise SOPs
  console.log('Seeding 10 enterprise SOP templates...');
  const sopTemplates = [
    {
      title: '1. Async Communication Policy',
      category: SOPCategory.POLICY,
      priority: Priority.HIGH,
      summary: 'Foundational principles governing asynchronous communication expectations, deep work hours, and response SLAs across all departments.',
      checklist: [
        { id: '1', text: 'Default to asynchronous communication for all status updates and non-emergencies.', required: true },
        { id: '2', text: 'Set clear context, objective, and deadline in all initiating messages.', required: true },
        { id: '3', text: 'Respect coworker core focus hours and do not expect instantaneous responses.', required: true },
        { id: '4', text: 'Document final decisions in centralized AsyncFlow SOPs or RFCs.', required: true },
      ],
      content: `## 1. Objective & Philosophy
At Acme Global, we treat asynchronous communication not as an inconvenience, but as our primary competitive advantage. Asynchronous communication allows for thoughtful contemplation, uninterrupted deep work, and geographic inclusivity across 14 time zones.

## 2. Core Tenets
1. **Writing is thinking:** Before initiating a request, take 3 minutes to structure your question with full context, links, and proposed solutions.
2. **Never ask to ask:** Do not send messages like *"Hey, quick question?"*. State your complete question with all necessary context in the first message.
3. **No guilt around offline time:** Team members are empowered to mute notifications during deep work blocks without penalty.

## 3. Response SLAs
- **Standard messages (Slack/Teams):** Response expected within 4 to 8 working hours within the recipient's local business day.
- **AsyncFlow Reviews & SOPs:** Response within 24 business hours.
- **Urgent/Blocker:** Use the dedicated Incident Escalation phone/pager tree (see SOP #7).`,
    },
    {
      title: '2. Remote Meeting Guidelines',
      category: SOPCategory.MEETING,
      priority: Priority.HIGH,
      summary: 'Strict guidelines determining when a synchronous meeting is justified, mandatory prep doc protocols, and silent reading procedures.',
      checklist: [
        { id: '1', text: 'Verify that an async memo or Loom video could not accomplish the goal first.', required: true },
        { id: '2', text: 'Circulate meeting memo and agenda at least 24 hours in advance.', required: true },
        { id: '3', text: 'Spend the first 5-10 minutes silently reading the memo together before discussing.', required: true },
        { id: '4', text: 'Designate a scribe to record action items and async owners.', required: true },
      ],
      content: `## 1. The Meeting Filter Rule
Before scheduling any synchronous meeting with 3 or more people, ask yourself:
- Can this be decided via an AsyncFlow RFC or structured comment thread?
- Is this a one-way broadcast? (If so, record a 3-minute video or write a memo instead.)

## 2. Meeting Requirements
- **No Agenda, No Attenda:** Any invite without a clear agenda and linked background document will be politely declined.
- **Silent Reading (Amazon-style):** Rather than presenting slides, the meeting begins with 5 to 10 minutes of silent reading and commenting on the brief.
- **Default Duration:** 25 minutes or 50 minutes to preserve buffer intervals between calls.`,
    },
    {
      title: '3. Slack/Teams Communication Standards',
      category: SOPCategory.COMMUNICATION,
      priority: Priority.MEDIUM,
      summary: 'Channel taxonomy, notification etiquette, thread discipline, and emoji convention standards for chat tools.',
      checklist: [
        { id: '1', text: 'Always reply inside message threads to prevent channel fragmentation.', required: true },
        { id: '2', text: 'Use @here and @channel only for verifiable emergencies.', required: true },
        { id: '3', text: 'Use standardized emoji reactions for status (👀 looking, ✅ approved, ⏳ working).', required: true },
      ],
      content: `## 1. Channel Naming Conventions
- \`#announce-[topic]\`: Read-only broadcast channels for leadership or company-wide news.
- \`#proj-[name]\`: Temporary project-specific collaboration rooms.
- \`#team-[name]\`: Functional department day-to-day coordination.
- \`#help-[service]\`: Q&A and support requests for internal tools.

## 2. Thread Hygiene
Never post answers in the main channel stream. Always click "Reply in thread" to keep topic context cohesive and searchable.`,
    },
    {
      title: '4. Email Response Expectations',
      category: SOPCategory.COMMUNICATION,
      priority: Priority.MEDIUM,
      summary: 'External and internal email workflows, turnaround times, and subject line labeling protocols.',
      checklist: [
        { id: '1', text: 'Prepend subject lines with action tags [ACTION REQUIRED], [INFO], [DECISION].', required: true },
        { id: '2', text: 'Adhere to 24-48 hour turnaround for external customer/partner correspondence.', required: true },
        { id: '3', text: 'Transition long internal email chains into AsyncFlow workflows.', required: true },
      ],
      content: `## 1. Subject Line Categorization
Every internal email subject line must begin with one of the following tags:
- \`[ACTION REQUIRED by YYYY-MM-DD]\`: Requires recipient input or signoff.
- \`[DECISION NEEDED]\`: Requires stakeholder choice.
- \`[INFO / FYI]\`: No response expected, for situational awareness.

## 2. Email SLAs
Internal emails should expect a response within 24 hours. For urgent operational blockers, use designated high-priority workflow tasks instead of email ping-pong.`,
    },
    {
      title: '5. Documentation Standards',
      category: SOPCategory.POLICY,
      priority: Priority.HIGH,
      summary: 'Rules for document creation, single source of truth maintenance, deprecation cycles, and peer review of technical specs.',
      checklist: [
        { id: '1', text: 'Every system, API, and policy must have a defined maintainer.', required: true },
        { id: '2', text: 'Review and verify accuracy of assigned SOPs every 90 days.', required: true },
        { id: '3', text: 'Archive or flag deprecated documentation immediately.', required: true },
      ],
      content: `## 1. Single Source of Truth (SSOT)
Documentation is part of the code and part of the product. If a process is not written down in an AsyncFlow SOP, it does not exist.

## 2. Structure of an SOP
Every standard operating procedure must contain:
1. Executive Summary & Intended Audience
2. Step-by-step Execution Protocol
3. Edge Cases & Exception Handling
4. Verification & Acknowledgement Criteria`,
    },
    {
      title: '6. Decision-Making Framework',
      category: SOPCategory.POLICY,
      priority: Priority.HIGH,
      summary: 'DACI (Driver, Approver, Contributors, Informed) framework for remote decisions and RFC proposal cycles.',
      checklist: [
        { id: '1', text: 'Assign explicit DACI roles before drafting proposal.', required: true },
        { id: '2', text: 'Set an explicit RFC review window (typically 3 to 5 business days).', required: true },
        { id: '3', text: 'Approver records the final signed decision and rationale asynchronously.', required: true },
      ],
      content: `## 1. The DACI Roles
- **Driver:** The person responsible for writing the RFC, gathering feedback, and facilitating consensus.
- **Approver:** The single individual who possesses final authority to approve or reject the proposal.
- **Contributors:** Subject matter experts consulted for input.
- **Informed:** Stakeholders notified of the final outcome.

## 2. Disagree and Commit
Once an Approver records their decision in AsyncFlow, all team members commit fully to execution regardless of prior dissenting opinions.`,
    },
    {
      title: '7. Incident Escalation Process',
      category: SOPCategory.ESCALATION,
      priority: Priority.URGENT,
      summary: 'Severity definitions, on-call paging procedures, incident commander roles, and post-mortem review timelines.',
      checklist: [
        { id: '1', text: 'Declare incident severity level (SEV-1 Critical, SEV-2 High, SEV-3 Moderate).', required: true },
        { id: '2', text: 'Spin up dedicated incident channel and appoint Incident Commander (IC).', required: true },
        { id: '3', text: 'Publish hourly status page bulletins to stakeholders.', required: true },
        { id: '4', text: 'Complete blameless post-mortem within 72 hours of incident mitigation.', required: true },
      ],
      content: `## 1. Severity Classifications
- **SEV-1 (Critical Outage):** Core product down or data integrity at risk. Requires immediate paging of On-Call Commander.
- **SEV-2 (Major Degradation):** Key capability broken for significant user cohort. 30-minute escalation threshold.
- **SEV-3 (Minor Defect):** Workaround available; handle during next business day.

## 2. Communication Rules During Live Incidents
- All diagnostic chat occurs in the dedicated incident channel.
- Incident Commander is solely authorized to post public status updates.`,
    },
    {
      title: '8. Daily and Weekly Team Updates',
      category: SOPCategory.COMMUNICATION,
      priority: Priority.MEDIUM,
      summary: 'Standardized async standup formats, Monday priority setting, and Friday milestone reflection templates.',
      checklist: [
        { id: '1', text: 'Post daily async check-in by 10:00 AM in your local timezone.', required: true },
        { id: '2', text: 'Explicitly highlight blockers in bold with @mention of helper.', required: true },
        { id: '3', text: 'Submit weekly retrospective recap every Friday.', required: true },
      ],
      content: `## 1. The Async Standup Format
Replace morning video standups with this 3-bullet post:
1. **Shipped Yesterday:** Tangible completed tasks with PR links.
2. **Focus Today:** Top 1-2 priority outcomes.
3. **Blockers / Roadblocks:** Any external dependencies preventing velocity.

## 2. Friday Wins & Reflections
Every Friday afternoon, post a brief summary celebrating coworker assistance, lessons learned, and progress against monthly OKRs.`,
    },
    {
      title: '9. Remote Work Availability Policy',
      category: SOPCategory.POLICY,
      priority: Priority.MEDIUM,
      summary: 'Guidelines for calendar transparency, out-of-office signaling, core overlap hours, and health boundaries.',
      checklist: [
        { id: '1', text: 'Maintain up-to-date working hours and timezone in Slack & Google Calendar.', required: true },
        { id: '2', text: 'Set Slack status to Away/Focus when stepping away for >1 hour during work hours.', required: true },
        { id: '3', text: 'Schedule vacation / PTO at least 2 weeks in advance in AsyncFlow.', required: true },
      ],
      content: `## 1. Core Overlap Window
We do not demand rigid 9-to-5 schedules. However, full-time employees are expected to maintain at least **2 hours of predictable daily overlap** with their primary squad for collaborative handoffs.

## 2. Right to Disconnect
Employees are actively discouraged from reading or replying to non-emergency messages on evenings and weekends. Leadership will monitor and prevent burnout behaviors.`,
    },
    {
      title: '10. Cross-Time-Zone Collaboration Guidelines',
      category: SOPCategory.COMMUNICATION,
      priority: Priority.HIGH,
      summary: 'Protocols for handing off work across the globe, writing handover briefs, and leveraging 24-hour continuous delivery.',
      checklist: [
        { id: '1', text: 'Write end-of-day handoff memo before logging off for your cross-region counterpart.', required: true },
        { id: '2', text: 'Include reproducible steps, open branches, and pending blockers.', required: true },
        { id: '3', text: 'Record short screen-recording (Loom/OBS) for visual UX handoffs.', required: true },
      ],
      content: `## 1. The Sun Never Sets: Follow-the-Sun Delivery
When working with team members 8-12 hours apart (e.g. US West Coast and Tokyo/India), your end-of-day is their morning.

## 2. The Golden Handoff Protocol
Before signing off:
1. Push all work-in-progress to an open draft branch.
2. In the ticket or workflow task, write a brief comment:
   - *Current state of execution*
   - *Exact step where the next engineer can resume*
   - *Assumptions and decisions made today*`,
    },
  ];

  for (const tpl of sopTemplates) {
    const createdSop = await prisma.sOP.create({
      data: {
        organizationId: org.id,
        title: tpl.title,
        summary: tpl.summary,
        category: tpl.category,
        priority: tpl.priority,
        status: SOPStatus.PUBLISHED,
        currentVersionNumber: 1,
        createdById: orgAdmin.id,
        publishedAt: new Date(),
        versions: {
          create: {
            versionNumber: 1,
            title: tpl.title,
            content: tpl.content,
            changelog: 'Initial approved production baseline policy.',
            checklist: tpl.checklist,
            createdById: orgAdmin.id,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    const v1 = createdSop.versions[0];

    // Assign to Engineering team and employee
    await prisma.sOPAssignment.create({
      data: {
        sopId: createdSop.id,
        organizationId: org.id,
        teamId: infraTeam.id,
        assignedById: orgAdmin.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Create acknowledgement by Alex (Employee) for SOP #1 and #2
    if (tpl.title.startsWith('1.') || tpl.title.startsWith('2.')) {
      await prisma.sOPAcknowledgement.create({
        data: {
          sopId: createdSop.id,
          sopVersionId: v1.id,
          organizationId: org.id,
          userId: employee1.id,
          acknowledgedAt: new Date(),
          ipAddress: '192.168.1.42',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
        },
      });

      // Add a comment
      await prisma.sOPComment.create({
        data: {
          sopId: createdSop.id,
          userId: employee1.id,
          content: 'Read and acknowledged. The response SLA rules provide great peace of mind for deep work hours!',
        },
      });
    }
  }

  // 9. Create Workflows with Stages & Tasks
  console.log('Seeding enterprise workflows...');
  const onboardingWorkflow = await prisma.workflow.create({
    data: {
      organizationId: org.id,
      title: 'Engineering Remote Onboarding Protocol (First 30 Days)',
      description: 'Structured, self-guided onboarding roadmap designed to get new remote engineers deploying to production within 5 days.',
      category: WorkflowCategory.ONBOARDING,
      priority: Priority.HIGH,
      status: WorkflowStatus.ACTIVE,
      createdById: teamManager.id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      stages: {
        create: [
          { name: 'To Do', order: 1, color: '#94a3b8' },
          { name: 'In Progress', order: 2, color: '#3b82f6' },
          { name: 'In Review', order: 3, color: '#eab308' },
          { name: 'Completed', order: 4, color: '#22c55e', isCompletedStage: true },
        ],
      },
    },
    include: {
      stages: true,
    },
  });

  const stages = onboardingWorkflow.stages;
  const todoStage = stages.find((s) => s.name === 'To Do')!;
  const inProgressStage = stages.find((s) => s.name === 'In Progress')!;
  const inReviewStage = stages.find((s) => s.name === 'In Review')!;
  const completedStage = stages.find((s) => s.name === 'Completed')!;

  // Create Tasks for Onboarding Workflow
  const task1 = await prisma.workflowTask.create({
    data: {
      workflowId: onboardingWorkflow.id,
      stageId: completedStage.id,
      title: 'Setup GPG Keys, 1Password & Secure Dev Environment',
      description: 'Configure hardware YubiKey, local SSH/GPG signing keys, and clone core repository.',
      priority: Priority.HIGH,
      assigneeId: employee1.id,
      reporterId: teamManager.id,
      isCompleted: true,
      order: 1,
    },
  });

  const task2 = await prisma.workflowTask.create({
    data: {
      workflowId: onboardingWorkflow.id,
      stageId: inProgressStage.id,
      title: 'Review and Acknowledge Core Async Communication SOPs',
      description: 'Carefully study SOPs #1 through #5 in AsyncFlow and complete the digital acknowledgement checklists.',
      priority: Priority.HIGH,
      assigneeId: employee1.id,
      reporterId: teamManager.id,
      isCompleted: false,
      order: 2,
    },
  });

  const task3 = await prisma.workflowTask.create({
    data: {
      workflowId: onboardingWorkflow.id,
      stageId: inReviewStage.id,
      title: 'First Production Bug Fix PR (First Ship)',
      description: 'Pick an onboarding starter ticket, write tests, request an async review, and deploy.',
      priority: Priority.MEDIUM,
      assigneeId: employee1.id,
      reporterId: teamManager.id,
      isCompleted: false,
      order: 3,
      approvals: {
        create: {
          approverId: teamManager.id,
          status: ApprovalStatus.PENDING,
          comments: 'Awaiting PR CI checks completion and async code review signoff.',
        },
      },
    },
  });

  const task4 = await prisma.workflowTask.create({
    data: {
      workflowId: onboardingWorkflow.id,
      stageId: todoStage.id,
      title: 'Record 5-minute Loom Intro Video for #team-infra',
      description: 'Say hello, share your background, and share your favorite async work tip with the squad.',
      priority: Priority.LOW,
      assigneeId: employee1.id,
      reporterId: teamManager.id,
      isCompleted: false,
      order: 4,
    },
  });

  // Second Workflow: Weekly Reporting
  await prisma.workflow.create({
    data: {
      organizationId: org.id,
      title: 'Cross-Department Weekly Async Retrospective & Roadblock Sweep',
      description: 'Weekly alignment cadence replacing synchronous executive reporting meetings.',
      category: WorkflowCategory.REPORTING,
      priority: Priority.MEDIUM,
      status: WorkflowStatus.ACTIVE,
      createdById: orgAdmin.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      stages: {
        create: [
          { name: 'To Do', order: 1, color: '#94a3b8' },
          { name: 'In Progress', order: 2, color: '#3b82f6' },
          { name: 'In Review', order: 3, color: '#eab308' },
          { name: 'Completed', order: 4, color: '#22c55e', isCompletedStage: true },
        ],
      },
    },
  });

  // 10. Create Training Programs, Modules, Lessons & Quizzes
  console.log('Seeding training programs and assessments...');
  const asyncProgram = await prisma.trainingProgram.create({
    data: {
      organizationId: org.id,
      title: 'Asynchronous Operations & Remote Work Mastery',
      description: 'Comprehensive enterprise training curriculum covering documentation hygiene, deep focus preservation, and global timezone navigation.',
      category: TrainingCategory.ASYNC_COMMUNICATION,
      thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      estimatedHours: 2.5,
      passingScore: 80,
      status: TrainingStatus.PUBLISHED,
      createdById: orgAdmin.id,
      modules: {
        create: [
          {
            title: 'Module 1: The Economics of Attention and Asynchrony',
            description: 'Why synchronous interruptions destroy knowledge worker throughput and how async culture restores leverage.',
            order: 1,
            lessons: {
              create: [
                {
                  title: '1.1 The High Cost of Context Switching',
                  durationMinutes: 12,
                  order: 1,
                  contentType: LessonType.ARTICLE,
                  content: `### Why Every Interruption Costs 23 Minutes
Research by Gloria Mark at UC Irvine demonstrates that after a disruption, it takes an average of **23 minutes and 15 seconds** to return to the original task.

When a team relies on "quick syncs" and instant replies, work is chopped into small 10-minute fragments. Creative problem solving and complex engineering become impossible.

#### Key Takeaways:
1. Batch your messaging checks 2 to 3 times per day instead of keeping notifications always-on.
2. Protect 4-hour morning blocks for deep solo execution.
3. Treat unprompted video calls as an emergency measure, not an everyday habit.`,
                },
                {
                  title: '1.2 Writing as a Superpower',
                  durationMinutes: 15,
                  order: 2,
                  contentType: LessonType.ARTICLE,
                  content: `### High-Leverage Documentation
In an office, information spreads through watercooler gossip. In a remote organization, information spreads through written words.

To write well asynchronously:
- State the desired outcome in the first paragraph.
- Provide links to all reference material upfront.
- Give a deadline for feedback.`,
                },
              ],
            },
          },
          {
            title: 'Module 2: Running Silent Meetings & RFCs',
            description: 'Replacing slide deck presentations with Amazon-style memo reading and structured debate.',
            order: 2,
            lessons: {
              create: [
                {
                  title: '2.1 Anatomy of a 6-Page Narrative Memo',
                  durationMinutes: 20,
                  order: 1,
                  contentType: LessonType.ARTICLE,
                  content: `### Structure of an Enterprise RFC
1. **Context & Problem Statement:** What is broken or missing?
2. **Key Metrics & Goals:** How will we measure success?
3. **Proposed Solution:** Architectural and operational specifics.
4. **Alternatives Considered:** Why were other approaches rejected?
5. **Risks and Mitigations:** What could go wrong?`,
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      modules: {
        include: {
          lessons: true,
        },
      },
    },
  });

  // Create Quiz for the Training Program
  const asyncQuiz = await prisma.quiz.create({
    data: {
      programId: asyncProgram.id,
      title: 'Async Operations Certification Exam',
      description: 'Test your understanding of asynchronous SLAs, thread discipline, and silent meeting procedures.',
      timeLimitMinutes: 15,
      passingScore: 80,
      maxAttempts: 3,
      questions: {
        create: [
          {
            questionText: 'What is the recommended response window for non-urgent internal messages within business hours?',
            explanation: 'Under AsyncFlow SOP #1, standard internal messages expect a response within 4 to 8 working hours.',
            points: 25,
            order: 1,
            options: {
              create: [
                { optionText: 'Immediately within 5 minutes', isCorrect: false, order: 1 },
                { optionText: '4 to 8 working hours within local business day', isCorrect: true, order: 2 },
                { optionText: 'Within 5 business days', isCorrect: false, order: 3 },
                { optionText: 'Whenever the employee feels like it', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: 'How should synchronous meetings begin under our enterprise meeting guidelines?',
            explanation: 'The first 5-10 minutes are dedicated to silent reading and commenting on the circulated memo.',
            points: 25,
            order: 2,
            options: {
              create: [
                { optionText: 'With 30 minutes of icebreaker small talk', isCorrect: false, order: 1 },
                { optionText: 'With a 45-slide PowerPoint presentation', isCorrect: false, order: 2 },
                { optionText: '5 to 10 minutes of silent reading and commenting on the memo', isCorrect: true, order: 3 },
                { optionText: 'By asking everyone to improvise the agenda', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: 'What is the purpose of the DACI decision-making framework?',
            explanation: 'DACI clearly delineates Driver, Approver, Contributors, and Informed to accelerate decisions.',
            points: 25,
            order: 3,
            options: {
              create: [
                { optionText: 'To ensure every decision requires 100% unanimous agreement', isCorrect: false, order: 1 },
                { optionText: 'To assign single accountable Approvers and clear contributor roles', isCorrect: true, order: 2 },
                { optionText: 'To delay technical decisions indefinitely', isCorrect: false, order: 3 },
                { optionText: 'To eliminate written documentation', isCorrect: false, order: 4 },
              ],
            },
          },
          {
            questionText: 'When working across distant time zones, what must an engineer do before logging off for the day?',
            explanation: 'Under SOP #10, an end-of-day handoff comment with reproducible steps and open branch details must be shared.',
            points: 25,
            order: 4,
            options: {
              create: [
                { optionText: 'Close their laptop without any notes', isCorrect: false, order: 1 },
                { optionText: 'Schedule a midnight video call with teammates in other continents', isCorrect: false, order: 2 },
                { optionText: 'Post an async handoff memo summarizing WIP state and next steps', isCorrect: true, order: 3 },
                { optionText: 'Require the incoming shift to guess current status', isCorrect: false, order: 4 },
              ],
            },
          },
        ],
      },
    },
  });

  // Enroll Alex (Employee) in the Program
  const enrollment = await prisma.trainingEnrollment.create({
    data: {
      programId: asyncProgram.id,
      userId: employee1.id,
      organizationId: org.id,
      status: EnrollmentStatus.COMPLETED,
      progressPercent: 100,
      certificateCode: 'ASYNC-CERT-2026-ALEX',
      certificateIssuedAt: new Date(),
      completedAt: new Date(),
    },
  });

  // Record completed lesson progress for Alex
  const allLessons = asyncProgram.modules.flatMap((m) => m.lessons);
  for (const lesson of allLessons) {
    await prisma.lessonProgress.create({
      data: {
        enrollmentId: enrollment.id,
        lessonId: lesson.id,
        isCompleted: true,
      },
    });
  }

  // Record a passed quiz attempt for Alex
  await prisma.quizAttempt.create({
    data: {
      quizId: asyncQuiz.id,
      enrollmentId: enrollment.id,
      userId: employee1.id,
      score: 100,
      totalQuestions: 4,
      correctQuestions: 4,
      isPassed: true,
    },
  });

  // 11. Create Workshops & Events
  console.log('Seeding interactive workshops...');
  const workshop1 = await prisma.workshop.create({
    data: {
      organizationId: org.id,
      title: 'Mastering Async Decision Making & Silent Meetings',
      description: 'Hands-on live workshop where participants practice writing concise 2-page decision memos and executing a live silent-reading review session.',
      instructorId: orgAdmin.id,
      instructorName: 'Sarah Chen (VP Operations)',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      durationMinutes: 60,
      timezone: 'America/New_York',
      meetingUrl: 'https://meet.asyncflow.io/workshop-silent-meetings',
      maxAttendees: 30,
      status: WorkshopStatus.UPCOMING,
      materialsUrl: 'https://asyncflow.io/materials/workshop-silent-meetings.pdf',
    },
  });

  const workshop2 = await prisma.workshop.create({
    data: {
      organizationId: org.id,
      title: 'Cross-Time-Zone Handoffs: Zero-Lag Collaboration',
      description: 'Practical strategies for technical leads managing squads across North America, EMEA, and APAC without 2:00 AM emergency calls.',
      instructorId: teamManager.id,
      instructorName: 'David Ross (Head of Eng)',
      scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago (completed)
      durationMinutes: 75,
      timezone: 'UTC',
      meetingUrl: 'https://meet.asyncflow.io/workshop-timezone-handoffs',
      maxAttendees: 40,
      status: WorkshopStatus.COMPLETED,
    },
  });

  // Registrations and feedback
  await prisma.workshopRegistration.create({
    data: {
      workshopId: workshop1.id,
      userId: employee1.id,
      status: 'REGISTERED',
    },
  });

  await prisma.workshopRegistration.create({
    data: {
      workshopId: workshop2.id,
      userId: employee1.id,
      status: 'REGISTERED',
    },
  });

  await prisma.workshopAttendance.create({
    data: {
      workshopId: workshop2.id,
      userId: employee1.id,
      attendedDurationMinutes: 70,
    },
  });

  await prisma.workshopFeedback.create({
    data: {
      workshopId: workshop2.id,
      userId: employee1.id,
      rating: 5,
      comment: 'Super practical tips on follow-the-sun handoffs. Changed how our team wraps up daily shifts.',
    },
  });

  // 12. Create Notifications for users
  console.log('Seeding initial notifications...');
  await prisma.notification.createMany({
    data: [
      {
        organizationId: org.id,
        userId: employee1.id,
        type: NotificationType.SOP_ASSIGNED,
        title: 'New SOP Assigned',
        message: 'You have been assigned to review and acknowledge "1. Async Communication Policy".',
        linkUrl: '/app/sops',
        isRead: false,
      },
      {
        organizationId: org.id,
        userId: employee1.id,
        type: NotificationType.WORKSHOP_INVITE,
        title: 'Upcoming Workshop Reminder',
        message: 'Mastering Async Decision Making & Silent Meetings begins in 48 hours.',
        linkUrl: '/app/workshops',
        isRead: false,
      },
      {
        organizationId: org.id,
        userId: employee1.id,
        type: NotificationType.TRAINING_ASSIGNED,
        title: 'Certification Completed',
        message: 'Congratulations! You completed the Asynchronous Operations Certification Exam with 100%.',
        linkUrl: '/app/training',
        isRead: true,
      },
    ],
  });

  // 13. Create Activity Logs
  console.log('Seeding audit and activity logs...');
  await prisma.activityLog.createMany({
    data: [
      {
        organizationId: org.id,
        userId: orgAdmin.id,
        action: 'SOP_PUBLISHED',
        entityType: 'SOP',
        entityId: 'sop-1',
        metadata: { title: '1. Async Communication Policy', version: 1 },
      },
      {
        organizationId: org.id,
        userId: teamManager.id,
        action: 'WORKFLOW_CREATED',
        entityType: 'WORKFLOW',
        entityId: onboardingWorkflow.id,
        metadata: { title: onboardingWorkflow.title },
      },
      {
        organizationId: org.id,
        userId: employee1.id,
        action: 'TRAINING_COMPLETED',
        entityType: 'TRAINING',
        entityId: asyncProgram.id,
        metadata: { score: 100, certificate: 'ASYNC-CERT-2026-ALEX' },
      },
    ],
  });

  console.log('✅ AsyncFlow enterprise database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

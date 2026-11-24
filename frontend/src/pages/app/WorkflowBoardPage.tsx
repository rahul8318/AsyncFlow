import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Check,
  X,
  User,
  Shield,
  Layers,
  Flag,
  Share2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Workflow, WorkflowStage, WorkflowTask } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/EmptyState';
import { formatDate } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const WorkflowBoardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);

  // Task creation state
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string>('');
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    requiresApproval: false,
    approverId: '',
  });
  const [submittingTask, setSubmittingTask] = useState(false);

  const fetchBoard = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [boardRes, membersRes]: [any, any] = await Promise.all([
        api.get(`/workflows/${id}`),
        api.get('/organizations/members'),
      ]);
      setWorkflow(boardRes);
      setMembers(Array.isArray(membersRes) ? membersRes : []);
    } catch (err) {
      console.error('Failed to load workflow board:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [id]);

  const handleMoveTask = async (taskId: string, targetStageId: string) => {
    try {
      await api.patch(`/workflows/tasks/${taskId}/stage`, { stageId: targetStageId });
      await fetchBoard();
    } catch (err: any) {
      alert(err.message || 'Failed to move task');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !activeStageId) return;
    setSubmittingTask(true);

    try {
      await api.post(`/workflows/${id}/tasks`, {
        stageId: activeStageId,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        assigneeId: taskForm.assigneeId || undefined,
        requiresApproval: taskForm.requiresApproval,
        approverId: taskForm.approverId || undefined,
      });

      setShowCreateTaskModal(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assigneeId: '',
        requiresApproval: false,
        approverId: '',
      });
      await fetchBoard();
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleReviewApproval = async (approvalId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await api.post(`/workflows/approvals/${approvalId}`, { status });
      await fetchBoard();
    } catch (err: any) {
      alert(err.message || 'Failed to review approval');
    }
  };

  const totalTasks = workflow?.stages?.reduce((acc, s) => acc + (s.tasks?.length || 0), 0) || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl">
        <Layers className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-900">Pipeline board not found</h3>
        <p className="text-xs text-zinc-500 mt-1">This pipeline may have been deleted or archived.</p>
        <Button onClick={() => navigate('/app/workflows')} className="mt-4" size="sm">
          Return to Workflows
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/app/workflows')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Pipelines
            </button>
            <span className="text-zinc-300">/</span>
            <span className="font-mono text-xs text-zinc-500">PIPE-{workflow.id.slice(0, 8)}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{workflow.title}</h1>
            <Badge variant="outline" className="font-mono text-[10px] tracking-wide uppercase">
              {workflow.category.replace('_', ' ')}
            </Badge>
            <span className="text-xs font-mono text-zinc-400">
              {totalTasks} total {totalTasks === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-500">
            Owner: <strong className="text-zinc-800 font-medium">{workflow.createdBy?.firstName} {workflow.createdBy?.lastName}</strong>
          </div>

          <Button
            size="sm"
            onClick={() => {
              const firstStage = workflow.stages?.[0];
              if (firstStage) {
                setActiveStageId(firstStage.id);
                setShowCreateTaskModal(true);
              }
            }}
            leftIcon={<Plus className="h-3.5 w-3.5" />}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Visual Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {workflow.stages?.map((stage) => {
          const tasks = stage.tasks || [];

          return (
            <div
              key={stage.id}
              className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: stage.color || '#71717a' }}
                  />
                  <h3 className="text-xs font-semibold text-zinc-900">{stage.name}</h3>
                  <span className="font-mono rounded bg-zinc-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-700">
                    {tasks.length}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveStageId(stage.id);
                    setShowCreateTaskModal(true);
                  }}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
                  title={`Add task to ${stage.name}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5 min-h-[360px]">
                {tasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center rounded-lg border border-dashed border-zinc-200 text-[11px] font-mono text-zinc-400">
                    No active tasks
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border border-zinc-200 bg-white p-3.5 shadow-sm hover:border-zinc-300 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-medium text-zinc-900 leading-snug">
                          {task.title}
                        </h4>
                        <Badge
                          variant={
                            task.priority === 'URGENT'
                              ? 'danger'
                              : task.priority === 'HIGH'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="text-[9px] px-1.5 py-0 shrink-0 font-mono"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed font-normal">
                          {task.description}
                        </p>
                      )}

                      {/* Approval Request Banner */}
                      {task.approvals && task.approvals.length > 0 && (
                        <div className="rounded-md border border-amber-200 bg-amber-50/60 p-2.5 space-y-1.5 text-[10px]">
                          <div className="flex items-center justify-between font-medium text-amber-900">
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3 text-amber-700" /> Lead Approval:
                            </span>
                            <Badge variant={task.approvals[0].status === 'APPROVED' ? 'success' : task.approvals[0].status === 'REJECTED' ? 'danger' : 'warning'} className="text-[9px] px-1 py-0 font-mono">
                              {task.approvals[0].status}
                            </Badge>
                          </div>
                          {task.approvals[0].status === 'PENDING' && (
                            <div className="flex gap-1.5 pt-1">
                              <button
                                onClick={() => handleReviewApproval(task.approvals![0].id, 'APPROVED')}
                                className="flex-1 rounded bg-zinc-900 text-white font-medium py-1 text-[10px] flex items-center justify-center gap-1 hover:bg-zinc-800 transition-colors"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleReviewApproval(task.approvals![0].id, 'REJECTED')}
                                className="flex-1 rounded bg-white border border-rose-200 text-rose-700 font-medium py-1 text-[10px] flex items-center justify-center gap-1 hover:bg-rose-50 transition-colors"
                              >
                                <X className="h-3 w-3" /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom Row: Assignee & Stage Mover */}
                      <div className="border-t border-zinc-100 pt-2 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[9px] font-mono font-bold text-white">
                            {task.assignee?.firstName?.[0] || 'U'}
                          </div>
                          <span className="text-zinc-600 font-medium truncate max-w-[80px]">
                            {task.assignee ? task.assignee.firstName : 'Unassigned'}
                          </span>
                        </div>

                        {/* Move stage selector */}
                        <select
                          value={stage.id}
                          onChange={(e) => handleMoveTask(task.id, e.target.value)}
                          className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-600 font-medium focus:border-zinc-900 focus:outline-none transition-colors cursor-pointer"
                        >
                          {workflow.stages?.map((s) => (
                            <option key={s.id} value={s.id}>
                              → {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        title="Add Operational Task"
        description="Specify requirements and designated ownership for this pipeline item."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 pt-1">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="e.g. Verify GPG Key Signing & Staging Database Migration"
            required
          />

          <Textarea
            label="Description & Acceptance Criteria"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="Outline exact specifications, documentation links, and verification steps..."
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">Assignee</label>
              <select
                value={taskForm.assigneeId}
                onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.firstName} {m.user.lastName} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Lead Approval Gate */}
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 space-y-3">
            <label className="flex items-center gap-2.5 text-xs font-medium text-zinc-800 cursor-pointer">
              <input
                type="checkbox"
                checked={taskForm.requiresApproval}
                onChange={(e) => setTaskForm({ ...taskForm, requiresApproval: e.target.checked })}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-0 focus:outline-none h-4 w-4"
              />
              <span>Require Team Lead / Manager Approval before task completion</span>
            </label>

            {taskForm.requiresApproval && (
              <div className="pt-1">
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Designated Approver
                </label>
                <select
                  value={taskForm.approverId}
                  onChange={(e) => setTaskForm({ ...taskForm, approverId: e.target.value })}
                  className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-zinc-900 focus:outline-none transition-colors"
                  required={taskForm.requiresApproval}
                >
                  <option value="">Select Approver</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.firstName} {m.user.lastName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submittingTask}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

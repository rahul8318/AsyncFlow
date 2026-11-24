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
        title: taskForm.title,
        description: taskForm.description,
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center py-16">
        <h3 className="text-base font-bold text-slate-800">Workflow not found</h3>
        <Button onClick={() => navigate('/app/workflows')} className="mt-4">
          Back to Workflows
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => navigate('/app/workflows')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Workflows
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-slate-900">{workflow.title}</h1>
            <Badge variant="primary">{workflow.category}</Badge>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Created by <strong className="text-slate-700">{workflow.createdBy?.firstName} {workflow.createdBy?.lastName}</strong>
        </div>
      </div>

      {/* Visual Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {workflow.stages?.map((stage) => {
          const tasks = stage.tasks || [];

          return (
            <div
              key={stage.id}
              className="rounded-2xl border border-slate-200 bg-slate-100/70 p-3.5 space-y-3"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: stage.color || '#3b82f6' }}
                  />
                  <h3 className="text-xs font-bold text-slate-900">{stage.name}</h3>
                  <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-600">
                    {tasks.length}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveStageId(stage.id);
                    setShowCreateTaskModal(true);
                  }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                  title="Add task to column"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5 min-h-[300px]">
                {tasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-[11px] text-slate-400">
                    No tasks in {stage.name}
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm hover:shadow transition space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>
                        <Badge
                          variant={task.priority === 'URGENT' || task.priority === 'HIGH' ? 'danger' : 'secondary'}
                          className="text-[9px] px-1.5 py-0 shrink-0"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Approval Request Banner */}
                      {task.approvals && task.approvals.length > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 space-y-1.5 text-[10px]">
                          <div className="flex items-center justify-between font-bold text-amber-900">
                            <span>Approval Signoff:</span>
                            <span className="uppercase">{task.approvals[0].status}</span>
                          </div>
                          {task.approvals[0].status === 'PENDING' && (
                            <div className="flex gap-1.5 pt-1">
                              <button
                                onClick={() => handleReviewApproval(task.approvals![0].id, 'APPROVED')}
                                className="flex-1 rounded bg-emerald-600 text-white font-semibold py-1 flex items-center justify-center gap-1 hover:bg-emerald-700"
                              >
                                <Check className="h-3 w-3" /> Approve
                              </button>
                              <button
                                onClick={() => handleReviewApproval(task.approvals![0].id, 'REJECTED')}
                                className="flex-1 rounded bg-rose-600 text-white font-semibold py-1 flex items-center justify-center gap-1 hover:bg-rose-700"
                              >
                                <X className="h-3 w-3" /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bottom row: Assignee & Stage mover */}
                      <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">
                            {task.assignee?.firstName?.[0] || 'U'}
                          </div>
                          <span className="text-slate-700 font-medium">
                            {task.assignee ? `${task.assignee.firstName}` : 'Unassigned'}
                          </span>
                        </div>

                        {/* Move stage selector */}
                        <select
                          value={stage.id}
                          onChange={(e) => handleMoveTask(task.id, e.target.value)}
                          className="rounded bg-slate-50 border border-slate-200 px-1 py-0.5 text-[10px] text-slate-600 font-medium focus:outline-none"
                        >
                          {workflow.stages?.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move to: {s.name}
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
        title="Add Task to Workflow"
        description="Assign a structured task item with clear completion criteria."
      >
        <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            placeholder="e.g. Complete GPG Key Signing & Local Dev Setup"
            required
          />

          <Textarea
            label="Description & Acceptance Criteria"
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            placeholder="Specify exact links, steps, and artifacts required..."
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assignee</label>
              <select
                value={taskForm.assigneeId}
                onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
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

          {/* Optional Approval Requirement */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={taskForm.requiresApproval}
                onChange={(e) => setTaskForm({ ...taskForm, requiresApproval: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>Require Team Lead / Manager Approval before completion</span>
            </label>

            {taskForm.requiresApproval && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designated Approver
                </label>
                <select
                  value={taskForm.approverId}
                  onChange={(e) => setTaskForm({ ...taskForm, approverId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none"
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
            <Button type="button" variant="outline" onClick={() => setShowCreateTaskModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submittingTask}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

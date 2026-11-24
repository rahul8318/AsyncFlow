import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  Video,
  Users,
  CheckCircle2,
  Star,
  ArrowRight,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Workshop } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';
import { formatDateTime } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

export const WorkshopsPage: React.FC = () => {
  const { currentMembership } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'upcoming' | 'past'>('upcoming');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    instructorName: '',
    scheduledAt: '',
    durationMinutes: 60,
    meetingUrl: '',
    maxAttendees: 50,
  });

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comment: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/workshops?timeframe=${timeframe}`);
      setWorkshops(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to load workshops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [timeframe]);

  const handleRegister = async (workshopId: string) => {
    try {
      await api.post(`/workshops/${workshopId}/register`);
      await fetchWorkshops();
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  const handleCancelRegistration = async (workshopId: string) => {
    try {
      await api.post(`/workshops/${workshopId}/cancel`);
      await fetchWorkshops();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    }
  };

  const handleCreateWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/workshops', {
        ...createForm,
        scheduledAt: new Date(createForm.scheduledAt).toISOString(),
        durationMinutes: Number(createForm.durationMinutes),
        maxAttendees: Number(createForm.maxAttendees),
      });
      setShowCreateModal(false);
      await fetchWorkshops();
    } catch (err: any) {
      alert(err.message || 'Failed to create workshop');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshopId) return;
    setSubmitting(true);
    try {
      await api.post(`/workshops/${selectedWorkshopId}/feedback`, feedbackForm);
      setShowFeedbackModal(false);
      setSelectedWorkshopId(null);
      setFeedbackForm({ rating: 5, comment: '' });
      await fetchWorkshops();
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const canCreate =
    currentMembership?.role === 'ORG_ADMIN' ||
    currentMembership?.role === 'TEAM_MANAGER' ||
    currentMembership?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Live Interactive Workshops & Training Events
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Facilitated sessions on silent meetings, cross-timezone handoffs, and asynchronous leadership.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setTimeframe('upcoming')}
              className={`rounded-lg px-3 py-1.5 transition ${
                timeframe === 'upcoming' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeframe('past')}
              className={`rounded-lg px-3 py-1.5 transition ${
                timeframe === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Past / Completed
            </button>
          </div>

          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
              Schedule Workshop
            </Button>
          )}
        </div>
      </div>

      {/* Workshop Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-10 w-10 text-slate-400" />}
          title={`No ${timeframe} workshops`}
          description="Check back soon or schedule an interactive working session for your squad."
          actionLabel={canCreate ? 'Schedule First Workshop' : undefined}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workshops.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={w.status === 'COMPLETED' ? 'secondary' : 'primary'}>
                    {w.status}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formatDateTime(w.scheduledAt)} ({w.durationMinutes} mins)
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{w.title}</h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {w.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Instructor: <strong className="text-slate-800">{w.instructorName}</strong></span>
                  <span>•</span>
                  <span>Seats: <strong className="text-slate-800">{w.registeredCount || 0} / {w.maxAttendees}</strong></span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                {w.meetingUrl && w.isRegistered && (
                  <a
                    href={w.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Video className="h-3.5 w-3.5" /> Join Virtual Room <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {w.status === 'COMPLETED' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedWorkshopId(w.id);
                        setShowFeedbackModal(true);
                      }}
                      leftIcon={<Star className="h-3.5 w-3.5 text-amber-500" />}
                    >
                      Leave Feedback
                    </Button>
                  ) : w.isRegistered ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelRegistration(w.id)}
                      className="text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      Cancel RSVP
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleRegister(w.id)}
                      rightIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                    >
                      Register Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Workshop Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule Live Operations Workshop"
        description="Host an interactive session on asynchronous culture or technical handoffs."
      >
        <form onSubmit={handleCreateWorkshop} className="space-y-4 pt-2">
          <Input
            label="Workshop Title"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            placeholder="e.g. Mastering Async Decision Making & Silent Meetings"
            required
          />

          <Input
            label="Instructor Name & Title"
            value={createForm.instructorName}
            onChange={(e) => setCreateForm({ ...createForm, instructorName: e.target.value })}
            placeholder="e.g. Sarah Chen (VP Operations)"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Scheduled Date & Time"
              type="datetime-local"
              value={createForm.scheduledAt}
              onChange={(e) => setCreateForm({ ...createForm, scheduledAt: e.target.value })}
              required
            />
            <Input
              label="Duration (Minutes)"
              type="number"
              value={createForm.durationMinutes}
              onChange={(e) => setCreateForm({ ...createForm, durationMinutes: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Meeting URL (Google Meet / Zoom)"
              value={createForm.meetingUrl}
              onChange={(e) => setCreateForm({ ...createForm, meetingUrl: e.target.value })}
              placeholder="https://meet.asyncflow.io/workshop"
            />
            <Input
              label="Max Attendees"
              type="number"
              value={createForm.maxAttendees}
              onChange={(e) => setCreateForm({ ...createForm, maxAttendees: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Description & Learning Objectives"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder="What practical techniques will attendees master during this session?"
            rows={3}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Schedule Workshop
            </Button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Workshop Feedback & Rating"
        description="Share your perspective to help refine future asynchronous training."
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                  className={`p-2 rounded-xl border transition ${
                    feedbackForm.rating >= star
                      ? 'border-amber-300 bg-amber-50 text-amber-500'
                      : 'border-slate-200 text-slate-300'
                  }`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Comments / Takeaways"
            value={feedbackForm.comment}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
            placeholder="What was the most actionable insight from this session?"
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowFeedbackModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

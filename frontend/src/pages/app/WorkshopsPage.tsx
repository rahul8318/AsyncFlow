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
  X,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Interactive Workshops & Facilitated Clinics
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Live working sessions on silent meetings, documentation standards, and time-zone management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Toggle */}
          <div className="flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 text-xs">
            <button
              onClick={() => setTimeframe('upcoming')}
              className={`rounded px-3 py-1 font-medium transition-all ${
                timeframe === 'upcoming'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Upcoming ({workshops.length})
            </button>
            <button
              onClick={() => setTimeframe('past')}
              className={`rounded px-3 py-1 font-medium transition-all ${
                timeframe === 'past'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Past Sessions
            </button>
          </div>

          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Schedule Workshop
            </Button>
          )}
        </div>
      </div>

      {/* Workshop Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-60 rounded-xl" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-8 w-8 text-zinc-400" />}
          title={`No ${timeframe} workshops scheduled`}
          description="Check back soon or schedule an interactive working session for your organization."
          actionLabel={canCreate ? 'Schedule First Workshop' : undefined}
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {workshops.map((w) => {
            const dateObj = new Date(w.scheduledAt);
            const monthStr = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            const dayStr = dateObj.getDate();

            return (
              <div
                key={w.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-900 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start gap-4">
                    {/* Stacked Date Badge */}
                    <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg border border-zinc-200 bg-zinc-50 shrink-0 font-mono">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">{monthStr}</span>
                      <span className="text-base font-bold text-zinc-900 leading-tight">{dayStr}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant={w.status === 'COMPLETED' ? 'secondary' : 'outline'}
                          className="font-mono text-[10px]"
                        >
                          {w.status}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                          <Clock className="h-3 w-3" />
                          {w.durationMinutes} mins
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-zinc-900 mt-1 truncate">
                        {w.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-normal">
                    {w.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-100 font-mono text-[11px]">
                    <span>Instructor: <strong className="text-zinc-800 font-sans font-medium">{w.instructorName}</strong></span>
                    <span className="text-zinc-300">•</span>
                    <span>RSVPs: <strong className="text-zinc-800 font-mono font-medium">{w.registeredCount || 0} / {w.maxAttendees}</strong></span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between">
                  {w.meetingUrl && w.isRegistered ? (
                    <a
                      href={w.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-900 hover:underline"
                    >
                      <Video className="h-3.5 w-3.5 text-zinc-700" /> Join Virtual Room <ExternalLink className="h-3 w-3 text-zinc-400" />
                    </a>
                  ) : (
                    <div />
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
                        Feedback
                      </Button>
                    ) : w.isRegistered ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelRegistration(w.id)}
                        className="text-rose-600 hover:border-rose-300 hover:bg-rose-50"
                      >
                        Cancel RSVP
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleRegister(w.id)} leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}>
                        RSVP Seat
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Workshop Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Schedule Interactive Workshop"
        description="Organize a live interactive working session for distributed team alignment."
      >
        <form onSubmit={handleCreateWorkshop} className="space-y-4 pt-1">
          <Input
            label="Workshop Title"
            value={createForm.title}
            onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
            placeholder="e.g. Asynchronous Decision-Making & Silent Reading Clinic"
            required
          />

          <Textarea
            label="Workshop Overview"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder="State the core takeaways and agenda..."
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Lead Facilitator / Instructor"
              value={createForm.instructorName}
              onChange={(e) => setCreateForm({ ...createForm, instructorName: e.target.value })}
              placeholder="e.g. Sarah Jenkins (VP Operations)"
              required
            />

            <Input
              label="Date & Time (UTC)"
              type="datetime-local"
              value={createForm.scheduledAt}
              onChange={(e) => setCreateForm({ ...createForm, scheduledAt: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Duration (Minutes)"
              type="number"
              value={createForm.durationMinutes}
              onChange={(e) => setCreateForm({ ...createForm, durationMinutes: Number(e.target.value) })}
              min={15}
              max={240}
              required
            />

            <Input
              label="Max Attendees"
              type="number"
              value={createForm.maxAttendees}
              onChange={(e) => setCreateForm({ ...createForm, maxAttendees: Number(e.target.value) })}
              min={5}
              max={500}
              required
            />
          </div>

          <Input
            label="Virtual Meeting Link (Google Meet / Zoom)"
            value={createForm.meetingUrl}
            onChange={(e) => setCreateForm({ ...createForm, meetingUrl: e.target.value })}
            placeholder="https://meet.google.com/xyz-abcd-efg"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Schedule Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Session Feedback"
        description="Share your feedback to help improve future workshops."
      >
        <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">Rating (1 to 5 Stars)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                  className={`p-2 rounded-md border transition-all ${
                    feedbackForm.rating >= star
                      ? 'border-amber-400 bg-amber-50 text-amber-500'
                      : 'border-zinc-200 bg-white text-zinc-300'
                  }`}
                >
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Feedback & Suggestions"
            value={feedbackForm.comment}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
            placeholder="What was most helpful? What could be improved for asynchronous operations?"
            rows={3}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowFeedbackModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={submitting}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

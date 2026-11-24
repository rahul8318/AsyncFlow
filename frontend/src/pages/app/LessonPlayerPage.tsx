import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { TrainingProgram, TrainingLesson } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/EmptyState';

export const LessonPlayerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [program, setProgram] = useState<TrainingProgram | null>(null);
  const [activeLesson, setActiveLesson] = useState<TrainingLesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchProgram = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res: any = await api.get(`/training/${id}`);
      setProgram(res);
      setCompletedLessonIds(res.completedLessonIds || []);

      // Set active lesson to first uncompleted lesson, or the first lesson in module 1
      const allLessons = res.modules?.flatMap((m: any) => m.lessons) || [];
      const completedSet = new Set(res.completedLessonIds || []);
      const nextUncompleted = allLessons.find((l: any) => !completedSet.has(l.id));

      setActiveLesson(nextUncompleted || allLessons[0] || null);
    } catch (err) {
      console.error('Failed to load training program:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const handleCompleteLesson = async () => {
    if (!id || !activeLesson) return;
    setCompleting(true);

    try {
      await api.post(`/training/${id}/lessons/${activeLesson.id}/complete`);

      // Add to completed list
      setCompletedLessonIds((prev) => [...prev, activeLesson.id]);

      // Find next lesson
      const allLessons = program?.modules?.flatMap((m) => m.lessons) || [];
      const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);

      if (currentIndex !== -1 && currentIndex + 1 < allLessons.length) {
        setActiveLesson(allLessons[currentIndex + 1]);
      } else {
        // Completed all lessons!
        await fetchProgram();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to complete lesson');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="col-span-2 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-16">
        <h3 className="text-base font-bold text-slate-800">Training program not found</h3>
        <Button onClick={() => navigate('/app/training')} className="mt-4">
          Back to Training
        </Button>
      </div>
    );
  }

  const allLessons = program.modules?.flatMap((m) => m.lessons) || [];
  const completedCount = allLessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const isLessonCompleted = activeLesson ? completedLessonIds.includes(activeLesson.id) : false;
  const quiz = program.quizzes?.[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => navigate('/app/training')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Training Catalog
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-slate-900">{program.title}</h1>
            <Badge variant="primary">{program.category.replace('_', ' ')}</Badge>
          </div>
        </div>

        {/* Progress summary */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="font-semibold text-slate-900">{progressPercent}% Completed</span>
            <p className="text-[10px] text-slate-400">{completedCount} of {allLessons.length} lessons</p>
          </div>
          <div className="h-2 w-28 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Learning Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Module & Lesson Navigation Drawer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5 lg:col-span-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Course Syllabus
          </h3>

          <div className="space-y-4">
            {program.modules?.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="text-blue-600">Module {modIdx + 1}:</span>
                  <span className="truncate">{mod.title}</span>
                </h4>

                <div className="space-y-1 pl-2">
                  {mod.lessons?.map((lesson) => {
                    const isDone = completedLessonIds.includes(lesson.id);
                    const isActive = activeLesson?.id === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs transition text-left ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isDone ? (
                            <CheckCircle2
                              className={`h-4 w-4 shrink-0 ${
                                isActive ? 'text-white' : 'text-emerald-600'
                              }`}
                            />
                          ) : (
                            <Circle
                              className={`h-4 w-4 shrink-0 ${
                                isActive ? 'text-white' : 'text-slate-300'
                              }`}
                            />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span
                          className={`text-[10px] shrink-0 ${
                            isActive ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {lesson.durationMinutes}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Assessment Exam Link */}
            {quiz && (
              <div className="pt-3 border-t border-slate-100">
                <Link
                  to={`/app/training/${program.id}/quiz/${quiz.id}`}
                  className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs font-bold text-indigo-900 hover:bg-indigo-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-indigo-600" />
                    <span>Certification Exam</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-indigo-500" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Content Viewer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6 lg:col-span-2">
          {activeLesson ? (
            <>
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{activeLesson.durationMinutes} minutes reading</span>
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  {activeLesson.title}
                </h2>
              </div>

              {/* Rich Lesson Body */}
              <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line">
                {activeLesson.content}
              </div>

              {/* Completion Action Bar */}
              <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  {isLessonCompleted ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Completed by you
                    </span>
                  ) : (
                    <span>Click below to log completion and unlock the next lesson.</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleCompleteLesson}
                    isLoading={completing}
                    rightIcon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    {isLessonCompleted ? 'Next Lesson' : 'Mark Complete & Continue'}
                  </Button>

                  {quiz && completedCount >= allLessons.length && (
                    <Link to={`/app/training/${program.id}/quiz/${quiz.id}`}>
                      <Button variant="secondary" className="bg-indigo-600 text-white hover:bg-indigo-700">
                        Take Final Exam
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400">
              Select a lesson from the syllabus on the left to begin learning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

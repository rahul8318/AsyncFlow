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
  BookOpen,
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
      setCompletedLessonIds((prev) => [...prev, activeLesson.id]);

      const allLessons = program?.modules?.flatMap((m) => m.lessons) || [];
      const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);

      if (currentIndex !== -1 && currentIndex + 1 < allLessons.length) {
        setActiveLesson(allLessons[currentIndex + 1]);
      } else {
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
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-96 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl">
        <BookOpen className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-900">Training program not found</h3>
        <p className="text-xs text-zinc-500 mt-1">This course may no longer be available.</p>
        <Button onClick={() => navigate('/app/training')} className="mt-4" size="sm">
          Return to Course Catalog
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <button
            onClick={() => navigate('/app/training')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Course Catalog
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">{program.title}</h1>
            <Badge variant="outline" className="font-mono text-[10px] tracking-wide uppercase">
              {program.category.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="flex items-center gap-3 text-xs">
          <div className="text-right font-mono">
            <span className="font-semibold text-zinc-900">{progressPercent}% Completed</span>
            <p className="text-[10px] text-zinc-400">{completedCount} of {allLessons.length} lessons</p>
          </div>
          <div className="h-1.5 w-24 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Learning Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Module & Lesson Navigation Drawer */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-4 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Curriculum Syllabus
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">
              {allLessons.length} Lessons
            </span>
          </div>

          <div className="space-y-4">
            {program.modules?.map((mod, modIdx) => (
              <div key={mod.id} className="space-y-1.5">
                <h4 className="text-xs font-medium text-zinc-800 flex items-center gap-1.5">
                  <span className="font-mono text-zinc-400 text-[10px]">0{modIdx + 1}.</span>
                  <span className="truncate font-semibold">{mod.title}</span>
                </h4>

                <div className="space-y-1 pl-3 border-l border-zinc-100">
                  {mod.lessons?.map((lesson) => {
                    const isDone = completedLessonIds.includes(lesson.id);
                    const isActive = activeLesson?.id === lesson.id;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors text-left ${
                          isActive
                            ? 'bg-zinc-900 text-white font-medium'
                            : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isDone ? (
                            <CheckCircle2
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? 'text-white' : 'text-emerald-600'
                              }`}
                            />
                          ) : (
                            <Circle
                              className={`h-3.5 w-3.5 shrink-0 ${
                                isActive ? 'text-zinc-400' : 'text-zinc-300'
                              }`}
                            />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono shrink-0 ml-2 ${
                            isActive ? 'text-zinc-300' : 'text-zinc-400'
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
              <div className="pt-3 border-t border-zinc-100">
                <Link
                  to={`/app/training/${program.id}/quiz/${quiz.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs font-medium text-zinc-900 hover:border-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-zinc-700" />
                    <span>Final Certification Exam</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Content Viewer */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 lg:col-span-8">
          {activeLesson ? (
            <>
              <div className="border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{activeLesson.durationMinutes} minutes estimated</span>
                </div>
                <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
                  {activeLesson.title}
                </h2>
              </div>

              {/* Rich Lesson Body */}
              <div className="prose prose-zinc max-w-none text-zinc-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal">
                {activeLesson.content}
              </div>

              {/* Completion Action Bar */}
              <div className="mt-10 border-t border-zinc-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-zinc-500">
                  {isLessonCompleted ? (
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Completed by you
                    </span>
                  ) : (
                    <span>Click below to record lesson completion and advance.</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    onClick={handleCompleteLesson}
                    isLoading={completing}
                    size="sm"
                    rightIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  >
                    {isLessonCompleted ? 'Next Lesson' : 'Mark Complete & Continue'}
                  </Button>

                  {quiz && completedCount >= allLessons.length && (
                    <Link to={`/app/training/${program.id}/quiz/${quiz.id}`}>
                      <Button variant="secondary" size="sm">
                        Take Certification Exam
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-zinc-400 font-mono">
              Select a lesson from the syllabus on the left to begin learning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

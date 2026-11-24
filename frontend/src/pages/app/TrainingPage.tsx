import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BarChart,
  PlayCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { TrainingProgram, TrainingEnrollment } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';

export const TrainingPage: React.FC = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [myLearning, setMyLearning] = useState<TrainingEnrollment[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-learning'>('catalog');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [programsRes, learningRes]: [any, any] = await Promise.all([
        api.get('/training'),
        api.get('/training/my-learning'),
      ]);
      setPrograms(Array.isArray(programsRes) ? programsRes : []);
      setMyLearning(Array.isArray(learningRes) ? learningRes : []);
    } catch (err) {
      console.error('Failed to load training programs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Employee Training & Asynchronous LMS
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Structured courses, self-paced reading modules, and certified remote competency assessments.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`rounded-lg px-4 py-1.5 transition-all ${
              activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Course Catalog ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('my-learning')}
            className={`rounded-lg px-4 py-1.5 transition-all ${
              activeTab === 'my-learning' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Learning ({myLearning.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : activeTab === 'catalog' ? (
        /* Course Catalog */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="h-36 bg-gradient-to-tr from-blue-700 to-indigo-900 p-5 flex flex-col justify-between text-white relative">
                  <Badge variant="primary" className="bg-white/20 text-white border-none w-fit text-[10px]">
                    {prog.category.replace('_', ' ')}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-blue-100">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{prog.estimatedHours} hrs • {prog.totalLessons || 0} lessons</span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {prog.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between">
                {prog.myEnrollment ? (
                  <div className="flex items-center gap-2 text-xs">
                    {prog.myEnrollment.status === 'COMPLETED' ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <Award className="h-4 w-4" /> Certified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <PlayCircle className="h-4 w-4" /> {prog.myEnrollment.progressPercent}% Done
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400">Not started</span>
                )}

                <Link to={`/app/training/${prog.id}`}>
                  <Button size="sm" variant={prog.myEnrollment ? 'primary' : 'outline'} rightIcon={<ArrowRight className="h-3 w-3" />}>
                    {prog.myEnrollment ? 'Continue Course' : 'View Course'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* My Learning & Certificates */
        <div className="space-y-6">
          {myLearning.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="h-10 w-10 text-slate-400" />}
              title="No courses in progress"
              description="Browse the organization course catalog above and enroll in your first async training program."
              actionLabel="Browse Catalog"
              onAction={() => setActiveTab('catalog')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myLearning.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant={enrollment.status === 'COMPLETED' ? 'success' : 'primary'}>
                        {enrollment.status}
                      </Badge>
                      <h3 className="text-base font-bold text-slate-900 mt-2">
                        {enrollment.program?.title}
                      </h3>
                    </div>
                    {enrollment.certificateCode && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-center">
                        <Award className="h-6 w-6 text-emerald-600 mx-auto" />
                        <span className="text-[10px] font-mono font-bold text-emerald-800">
                          {enrollment.certificateCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-600 font-medium">
                      <span>Curriculum Progress</span>
                      <span>{enrollment.progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all"
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link to={`/app/training/${enrollment.programId}`}>
                      <Button size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                        {enrollment.status === 'COMPLETED' ? 'Review Lessons' : 'Resume Lesson'}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

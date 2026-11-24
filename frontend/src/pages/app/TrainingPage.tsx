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
  Check,
  Search,
  Layers,
} from 'lucide-react';
import { api } from '../../lib/api';
import { TrainingProgram, TrainingEnrollment } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState, Skeleton } from '../../components/ui/EmptyState';

export const TrainingPage: React.FC = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [myLearning, setMyLearning] = useState<TrainingEnrollment[]>([]);
  const [activeTab, setActiveTab] = useState<'catalog' | 'my-learning'>('catalog');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredPrograms = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Asynchronous Training Curriculum & LMS
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Standardized operational training programs, self-paced modules, and server-graded certification exams.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`rounded px-3.5 py-1 text-xs font-medium transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Course Catalog ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab('my-learning')}
            className={`rounded px-3.5 py-1 text-xs font-medium transition-all ${
              activeTab === 'my-learning'
                ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/60'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            My Learning ({myLearning.length})
          </button>
        </div>
      </div>

      {activeTab === 'catalog' && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search courses by skill or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none transition-colors"
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : activeTab === 'catalog' ? (
        /* Course Catalog */
        filteredPrograms.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-8 w-8 text-zinc-400" />}
            title="No training programs found"
            description="No training curricula match your search criteria."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPrograms.map((prog) => {
              const isCertified = prog.myEnrollment?.status === 'COMPLETED';
              const inProgress = prog.myEnrollment && !isCertified;

              return (
                <div
                  key={prog.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-zinc-900 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="font-mono text-[10px] tracking-wide uppercase">
                        {prog.category.replace('_', ' ')}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {prog.estimatedHours}h • {prog.totalLessons || 0} lessons
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-zinc-900 leading-snug">
                      {prog.title}
                    </h3>

                    <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed font-normal">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-4 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      {isCertified ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <Award className="h-3.5 w-3.5 text-emerald-600" /> Certified
                        </span>
                      ) : inProgress ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600">
                          <PlayCircle className="h-3.5 w-3.5 text-zinc-800" /> {prog.myEnrollment?.progressPercent}% complete
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400 font-mono">Not started</span>
                      )}
                    </div>

                    <Link to={`/app/training/${prog.id}`}>
                      <Button size="sm" variant={inProgress ? 'primary' : 'outline'} rightIcon={<ArrowRight className="h-3 w-3" />}>
                        {isCertified ? 'Review Syllabus' : inProgress ? 'Continue Lesson' : 'Start Course'}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* My Learning & Certificates */
        <div className="space-y-6">
          {myLearning.length === 0 ? (
            <EmptyState
              icon={<GraduationCap className="h-8 w-8 text-zinc-400" />}
              title="No courses currently in progress"
              description="Explore the organization training catalog to enroll in your first certification module."
              actionLabel="Browse Course Catalog"
              onAction={() => setActiveTab('catalog')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myLearning.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge
                        variant={enrollment.status === 'COMPLETED' ? 'success' : 'secondary'}
                        className="font-mono text-[10px]"
                      >
                        {enrollment.status}
                      </Badge>
                      <h3 className="text-sm font-semibold text-zinc-900 mt-2">
                        {enrollment.program?.title}
                      </h3>
                    </div>

                    {enrollment.certificateCode && (
                      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-center shrink-0">
                        <Award className="h-4 w-4 text-emerald-600 mx-auto mb-0.5" />
                        <span className="text-[10px] font-mono font-semibold text-emerald-800 block">
                          {enrollment.certificateCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-500 font-mono">
                      <span>Curriculum Completion</span>
                      <span>{enrollment.progressPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full bg-zinc-900 rounded-full transition-all"
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link to={`/app/training/${enrollment.programId}`}>
                      <Button size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                        {enrollment.status === 'COMPLETED' ? 'Review Syllabus' : 'Resume Lesson'}
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

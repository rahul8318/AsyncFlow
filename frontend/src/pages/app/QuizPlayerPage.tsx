import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Printer,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Quiz } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';

export const QuizPlayerPage: React.FC = () => {
  const { id: programId, quizId } = useParams<{ id: string; quizId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    if (!quizId) return;
    setLoading(true);
    api.get(`/training/quizzes/${quizId}`)
      .then((res: any) => setQuiz(res))
      .catch((err) => console.error('Failed to load quiz:', err))
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (result) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId) return;

    const answers = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }));

    setSubmitting(true);
    try {
      const res: any = await api.post(`/training/quizzes/${quizId}/submit`, { answers });
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20 bg-white border border-zinc-200 rounded-xl">
        <Award className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-zinc-900">Quiz assessment not found</h3>
        <p className="text-xs text-zinc-500 mt-1">This assessment could not be loaded.</p>
        <Button onClick={() => navigate(`/app/training/${programId}`)} className="mt-4" size="sm">
          Return to Course
        </Button>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <button
          onClick={() => navigate(`/app/training/${programId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Course Syllabus
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            <Clock className="h-3 w-3 mr-1 inline" /> {quiz.timeLimitMinutes} min limit
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px]">
            Passing: {quiz.passingScore}%
          </Badge>
        </div>
      </div>

      {/* Quiz Introduction Banner */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px] uppercase tracking-wider">
          <ShieldCheck className="h-3.5 w-3.5 text-zinc-700" />
          <span>Server-Graded Competency Assessment</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">{quiz.title}</h1>
        <p className="text-xs text-zinc-500 leading-relaxed font-normal">
          {quiz.description ||
            'Answer the multiple-choice questions below. Responses are validated against server cryptographic standards.'}
        </p>
      </div>

      {/* Results & Certificate Banner if Submitted */}
      {result && (
        <div className="space-y-6">
          <div
            className={`rounded-xl border p-6 text-center space-y-3 shadow-sm ${
              result.isPassed
                ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                : 'border-rose-200 bg-rose-50/50 text-rose-950'
            }`}
          >
            {result.isPassed ? (
              <>
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Award className="h-6 w-6" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold tracking-tight">Assessment Passed ({result.scorePercent}%)</h2>
                <p className="text-xs text-emerald-800 max-w-md mx-auto">
                  Congratulations! You have satisfied all asynchronous operating standards and earned your official competency verification.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Button size="sm" onClick={() => window.print()} variant="outline" leftIcon={<Printer className="h-3.5 w-3.5" />}>
                    Print Certificate
                  </Button>
                  <Button size="sm" onClick={() => navigate('/app/training')}>
                    Return to Dashboard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 text-white">
                    <XCircle className="h-6 w-6" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold tracking-tight">Score: {result.scorePercent}% (Required: {quiz.passingScore}%)</h2>
                <p className="text-xs text-rose-800 max-w-md mx-auto">
                  You did not meet the passing threshold. Review the lessons and attempt the assessment again.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setResult(null);
                      setSelectedAnswers({});
                    }}
                    leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                  >
                    Retry Assessment
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Printable Official Certificate View */}
          {result.isPassed && (
            <div className="rounded-xl border-2 border-zinc-900 bg-white p-8 text-center space-y-4 shadow-md font-sans">
              <div className="border-b border-zinc-200 pb-4">
                <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-500">
                  AsyncFlow Enterprise Verification
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
                  Certificate of Competency
                </h2>
              </div>

              <div className="py-2 space-y-2">
                <p className="text-xs text-zinc-500">This certifies that</p>
                <h3 className="text-lg font-bold text-zinc-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-xs text-zinc-600 max-w-md mx-auto">
                  has demonstrated verified proficiency in <strong>{quiz.title}</strong> according to enterprise asynchronous operational benchmarks.
                </p>
              </div>

              <div className="border-t border-zinc-100 pt-4 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Verification ID: AF-{quiz.id.slice(0, 8).toUpperCase()}</span>
                <span>Date: {new Date().toISOString().slice(0, 10)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {questions.map((q, qIndex) => {
          const selectedOption = selectedAnswers[q.id];
          const review = result?.questionReview?.find((r: any) => r.questionId === q.id);

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-5 transition-colors ${
                review
                  ? review.isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'border-zinc-200 bg-white'
              }`}
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xs font-semibold text-zinc-900 leading-snug">
                    <span className="font-mono text-zinc-400 mr-2">Q{qIndex + 1}.</span>
                    {q.questionText}
                  </h3>
                  {review && (
                    <Badge variant={review.isCorrect ? 'success' : 'danger'} className="text-[10px] font-mono">
                      {review.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  )}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOption === opt.id;
                    const isCorrectAnswer = review?.correctOptionId === opt.id;

                    let optionStyle = 'border-zinc-200 bg-zinc-50/50 hover:bg-zinc-100/60 text-zinc-800';

                    if (review) {
                      if (isCorrectAnswer) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                      } else if (isSelected && !review.isCorrect) {
                        optionStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-zinc-900 bg-zinc-900 text-white font-medium';
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-xs transition-colors cursor-pointer select-none ${optionStyle}`}
                      >
                        <span className={`font-mono text-[10px] w-4 text-center shrink-0 ${isSelected && !review ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1">{opt.optionText}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Text */}
                {review && review.explanation && (
                  <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50 p-2.5 text-xs text-zinc-700 flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                    <span><strong>Rationale:</strong> {review.explanation}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Submit Button */}
        {!result && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
            <span className="text-xs font-mono text-zinc-500">
              Answered {answeredCount} of {questions.length} questions
            </span>
            <Button
              type="submit"
              disabled={!isAllAnswered}
              isLoading={submitting}
              size="sm"
              rightIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
            >
              Submit Exam for Verification
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

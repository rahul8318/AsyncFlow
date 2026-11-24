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
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Quiz } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/EmptyState';

export const QuizPlayerPage: React.FC = () => {
  const { id: programId, quizId } = useParams<{ id: string; quizId: string }>();
  const navigate = useNavigate();

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
    if (result) return; // Prevent changing after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId) return;

    // Build payload array
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-16">
        <h3 className="text-base font-bold text-slate-800">Quiz assessment not found</h3>
        <Button onClick={() => navigate(`/app/training/${programId}`)} className="mt-4">
          Back to Course
        </Button>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate(`/app/training/${programId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Course Syllabus
        </button>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="gap-1">
            <Clock className="h-3 w-3" /> {quiz.timeLimitMinutes} min limit
          </Badge>
          <Badge variant="secondary">Passing Score: {quiz.passingScore}%</Badge>
        </div>
      </div>

      {/* Quiz Introduction Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
          <Award className="h-4 w-4" />
          <span>Competency Assessment</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">{quiz.title}</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          {quiz.description ||
            'Answer the multiple-choice questions below. Correct answers are verified securely on the server.'}
        </p>
      </div>

      {/* Results Banner if Submitted */}
      {result && (
        <div
          className={`rounded-2xl border p-6 text-center space-y-3 shadow-md animate-in fade-in zoom-in-95 ${
            result.isPassed
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : 'border-rose-200 bg-rose-50 text-rose-950'
          }`}
        >
          {result.isPassed ? (
            <>
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30">
                  <Award className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold">Assessment Passed with {result.scorePercent}%!</h2>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Congratulations! You have satisfied all asynchronous operational standards and earned your official enterprise certification.
              </p>
              <div className="pt-2">
                <Button onClick={() => navigate('/app/training')}>
                  Return to Learning Dashboard
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-500/30">
                  <XCircle className="h-8 w-8" />
                </div>
              </div>
              <h2 className="text-2xl font-extrabold">Score: {result.scorePercent}% (Passing: {quiz.passingScore}%)</h2>
              <p className="text-xs text-rose-800 max-w-md mx-auto">
                You did not meet the passing threshold. Please review the lesson material and retake the assessment.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
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
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, qIndex) => {
          const selectedOption = selectedAnswers[q.id];
          const review = result?.questionReview?.find((r: any) => r.questionId === q.id);

          return (
            <Card
              key={q.id}
              className={`rounded-2xl border p-6 transition-colors ${
                review
                  ? review.isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200/80 bg-white'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    <span className="text-blue-600 font-extrabold mr-2">Q{qIndex + 1}.</span>
                    {q.questionText}
                  </h3>
                  {review && (
                    <Badge variant={review.isCorrect ? 'success' : 'danger'}>
                      {review.isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  )}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt) => {
                    const isSelected = selectedOption === opt.id;
                    const isCorrectAnswer = review?.correctOptionId === opt.id;

                    let optionStyle = 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-800';

                    if (review) {
                      if (isCorrectAnswer) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                      } else if (isSelected && !review.isCorrect) {
                        optionStyle = 'border-rose-500 bg-rose-50 text-rose-900';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-blue-600 bg-blue-50/60 text-blue-900 font-semibold ring-1 ring-blue-600';
                    }

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(q.id, opt.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 text-xs transition cursor-pointer select-none ${optionStyle}`}
                      >
                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="flex-1">{opt.optionText}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation text after submission */}
                {review && review.explanation && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900 flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Rationale:</strong> {review.explanation}</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}

        {/* Submit Button */}
        {!result && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Answered {answeredCount} of {questions.length} questions
            </span>
            <Button
              type="submit"
              disabled={!isAllAnswered}
              isLoading={submitting}
              rightIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              Submit Exam for Grading
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { Trophy, Home, CheckCircle, XCircle, Eye } from "lucide-react";

const ResultsPage = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedResults = sessionStorage.getItem(`results_${attemptId}`);
    if (cachedResults) {
      setResults(JSON.parse(cachedResults));
      setLoading(false);
    } else {
      toast.error("Results not found");
      navigate("/");
    }
  }, [attemptId, navigate]);

  if (loading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const { score, total_marks, percentage, detailed_results } = results;
  const correctCount = detailed_results.filter((r) => r.is_correct).length;
  const incorrectCount = detailed_results.filter((r) => !r.is_correct).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <Card className="p-8 mb-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl">
          <div className="text-center">
            <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-300" />
            <h1 className="text-4xl font-bold mb-2">Test Completed!</h1>
            <p className="text-xl opacity-90 mb-6">Here are your results</p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <p className="text-sm opacity-80">Your Score</p>
                <p data-testid="total-score" className="text-4xl font-bold">
                  {score}/{total_marks}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <p className="text-sm opacity-80">Percentage</p>
                <p data-testid="percentage" className="text-4xl font-bold">
                  {percentage}%
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <p className="text-sm opacity-80">Correct Answers</p>
                <p data-testid="correct-count" className="text-4xl font-bold">
                  {correctCount}/{detailed_results.length}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            data-testid="home-button"
            onClick={() => navigate("/")}
            size="lg"
            className="gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
          <Button
            data-testid="view-answers-button"
            onClick={() => setShowAnswers(!showAnswers)}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <Eye className="w-5 h-5" />
            {showAnswers ? "Hide Answers" : "View Detailed Analysis"}
          </Button>
        </div>

        {showAnswers && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-indigo-900 mb-6">Question-wise Analysis</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {detailed_results.map((result, index) => (
                <AccordionItem key={result.question_id} value={`item-${index}`}>
                  <AccordionTrigger
                    data-testid={`question-${index + 1}-trigger`}
                    className={`hover:no-underline p-4 rounded-lg ${
                      result.is_correct ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      {result.is_correct ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className="font-semibold">Q{result.question_number}. </span>
                        <span className="text-gray-700">{result.question_text}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-600">{result.marks} marks</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-white">
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        {result.options.map((option) => (
                          <div
                            key={option.label}
                            data-testid={`result-option-${option.label}`}
                            className={`p-3 rounded-lg border-2 ${
                              option.label === result.correct_answer
                                ? "border-green-500 bg-green-50"
                                : option.label === result.selected_answer
                                ? "border-red-500 bg-red-50"
                                : "border-gray-200"
                            }`}
                          >
                            <p className="font-semibold text-sm mb-1">{option.label}. {option.text}</p>
                            {option.label === result.correct_answer && (
                              <span className="text-xs text-green-600 font-semibold">✓ Correct Answer</span>
                            )}
                            {option.label === result.selected_answer && option.label !== result.correct_answer && (
                              <span className="text-xs text-red-600 font-semibold">✗ Your Answer</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="font-semibold">Your Answer: </span>
                          <span
                            data-testid={`your-answer-${index + 1}`}
                            className={result.is_correct ? "text-green-600" : "text-red-600"}
                          >
                            {result.selected_answer}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">Correct Answer: </span>
                          <span data-testid={`correct-answer-${index + 1}`} className="text-green-600">
                            {result.correct_answer}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        )}

        <Card className="mt-8 p-6 bg-white">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">Performance Summary</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
              <p className="text-sm text-gray-600">Incorrect Answers</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <Trophy className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-indigo-600">{Math.round(score)}</p>
              <p className="text-sm text-gray-600">Total Marks Scored</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ResultsPage;

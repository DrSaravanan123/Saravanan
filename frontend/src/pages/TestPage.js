import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { toast } from "sonner";
import { Clock, ChevronLeft, ChevronRight, Send, BookOpen } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TestPage = () => {
  const navigate = useNavigate();
  const [tamilQuestions, setTamilQuestions] = useState([]);
  const [physicsQuestions, setPhysicsQuestions] = useState([]);
  const [currentSection, setCurrentSection] = useState("tamil");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(10800);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && (tamilQuestions.length > 0 || physicsQuestions.length > 0)) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, tamilQuestions, physicsQuestions]);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API}/questions/full`);
      setTamilQuestions(response.data.tamil_questions);
      setPhysicsQuestions(response.data.physics_questions);
      setTimeLeft(response.data.time_limit);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load questions");
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    try {
      const answersArray = Object.keys(answers).map((questionId) => ({
        question_id: questionId,
        selected_answer: answers[questionId],
      }));

      const response = await axios.post(`${API}/test/submit`, {
        test_type: "full",
        answers: answersArray,
        time_taken: 10800 - timeLeft,
      });

      sessionStorage.setItem(`results_${response.data.attempt_id}`, JSON.stringify(response.data));
      navigate(`/results/${response.data.attempt_id}`);
    } catch (error) {
      toast.error("Failed to submit test");
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading complete test...</p>
        </div>
      </div>
    );
  }

  const currentQuestions = currentSection === "tamil" ? tamilQuestions : physicsQuestions;
  const currentQuestion = currentQuestions[currentIndex];
  const allQuestions = [...tamilQuestions, ...physicsQuestions];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <Button
            data-testid="back-button"
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Button>
          <Card className="p-6 bg-white/80 backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-indigo-900">Complete Set 1 - Paper I</h1>
                <p className="text-sm text-gray-600">Total: 130 Questions | 200 Marks</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Time Left</p>
                  <div
                    data-testid="timer"
                    className={`text-2xl font-bold ${
                      timeLeft < 600 ? "text-red-600" : "text-indigo-900"
                    } flex items-center gap-2`}
                  >
                    <Clock className="w-6 h-6" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Answered</p>
                  <p className="text-2xl font-bold text-green-600">
                    {answeredCount}/{allQuestions.length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={currentSection} onValueChange={(val) => { setCurrentSection(val); setCurrentIndex(0); }}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger data-testid="tamil-tab" value="tamil" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Tamil (30 Q)
            </TabsTrigger>
            <TabsTrigger data-testid="physics-tab" value="physics" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Physics (100 Q)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tamil">
            <Card className="p-8 mb-6 bg-white shadow-xl">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                    Question {currentIndex + 1} of {tamilQuestions.length}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">
                    {currentQuestion.marks} marks
                  </span>
                </div>
                <h2
                  data-testid="question-text"
                  className="text-xl font-semibold text-gray-800 leading-relaxed tamil-text"
                >
                  {currentQuestion.question_text}
                </h2>
              </div>

              <RadioGroup
                key={currentQuestion.id}
                data-testid="options-group"
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.label}
                      data-testid={`option-${option.label}`}
                      className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer"
                    >
                      <RadioGroupItem value={option.label} id={`${currentQuestion.id}-${option.label}`} />
                      <Label
                        htmlFor={`${currentQuestion.id}-${option.label}`}
                        className="flex-1 cursor-pointer tamil-text"
                      >
                        <span className="font-semibold text-indigo-900">{option.label}.</span>{" "}
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </Card>
          </TabsContent>

          <TabsContent value="physics">
            <Card className="p-8 mb-6 bg-white shadow-xl">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                    Question {currentIndex + 1} of {physicsQuestions.length}
                  </span>
                  <span className="text-sm font-semibold text-gray-600">
                    {currentQuestion.marks} marks
                  </span>
                </div>
                <h2
                  data-testid="question-text"
                  className="text-xl font-semibold text-gray-800 leading-relaxed"
                >
                  {currentQuestion.question_text}
                </h2>
              </div>

              <RadioGroup
                data-testid="options-group"
                value={answers[currentQuestion.id]}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <div
                      key={option.label}
                      data-testid={`option-${option.label}`}
                      className="flex items-center space-x-3 p-4 rounded-lg border-2 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
                    >
                      <RadioGroupItem value={option.label} id={`${currentQuestion.id}-${option.label}`} />
                      <Label
                        htmlFor={`${currentQuestion.id}-${option.label}`}
                        className="flex-1 cursor-pointer"
                      >
                        <span className="font-semibold text-purple-900">{option.label}.</span>{" "}
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mb-6">
          <Button
            data-testid="previous-button"
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentSection === "physics" && currentIndex === physicsQuestions.length - 1 ? (
            <Button
              data-testid="submit-button"
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Test
            </Button>
          ) : (
            <Button
              data-testid="next-button"
              onClick={() => {
                if (currentIndex < currentQuestions.length - 1) {
                  setCurrentIndex((prev) => prev + 1);
                } else if (currentSection === "tamil") {
                  setCurrentSection("physics");
                  setCurrentIndex(0);
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Question Navigator</h3>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {currentQuestions.map((q, idx) => (
              <button
                key={q.id}
                data-testid={`nav-question-${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  idx === currentIndex
                    ? currentSection === "tamil"
                      ? "bg-indigo-600 text-white scale-110"
                      : "bg-purple-600 text-white scale-110"
                    : answers[q.id]
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;

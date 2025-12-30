"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, Award, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface QuizEngineProps {
  quizId: string
}

export function QuizEngine({ quizId }: QuizEngineProps) {
  const [quiz, setQuiz] = useState<any>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  useEffect(() => {
    if (quiz && timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && quiz && !showResults) {
      submitQuiz()
    }
  }, [timeRemaining])

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student/quizzes/${quizId}`, {
        credentials: "include"
      })
      if (!response.ok) throw new Error("Failed to fetch quiz")
      const data = await response.json()
      setQuiz(data)
      setTimeRemaining(data.timeLimit * 60) // Convert to seconds
    } catch (error) {
      toast.error("Failed to load quiz")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer })
  }

  const submitQuiz = async () => {
    const answersArray = quiz.questions.map((q: any) => ({
      question_id: q.id,
      selected_answer: answers[q.id] || "",
      is_correct: answers[q.id] === q.correctAnswer
    }))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student/quiz-attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz_id: quizId,
          answers: answersArray
        }),
        credentials: "include"
      })

      if (!response.ok) throw new Error("Failed to submit quiz")
      
      const data = await response.json()
      setResults(data)
      setShowResults(true)
      
      if (data.passed) {
        toast.success(`Congratulations! You scored ${data.score}%`)
      } else {
        toast.error(`You scored ${data.score}%. Passing score is ${quiz.passingScore}%`)
      }
    } catch (error) {
      toast.error("Failed to submit quiz")
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading quiz...</p>
        </CardContent>
      </Card>
    )
  }

  if (!quiz) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Quiz not found</p>
        </CardContent>
      </Card>
    )
  }

  if (showResults && results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{results.score}%</div>
            <Badge variant={results.passed ? "default" : "destructive"} className="mb-4">
              {results.passed ? "PASSED" : "FAILED"}
            </Badge>
            <div className="flex justify-center gap-8 text-sm">
              <div>
                <div className="text-2xl font-semibold">{results.correct_answers}</div>
                <div className="text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{results.total_questions - results.correct_answers}</div>
                <div className="text-muted-foreground">Wrong</div>
              </div>
              <div>
                <div className="text-2xl font-semibold">{results.time_taken}m</div>
                <div className="text-muted-foreground">Time Taken</div>
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-3">
            <h4 className="font-semibold">Detailed Breakdown:</h4>
            {quiz.questions.map((q: any, index: number) => {
              const userAnswer = answers[q.id]
              const isCorrect = userAnswer === q.correctAnswer
              
              return (
                <Card key={q.id} className={isCorrect ? "border-green-500" : "border-red-500"}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium mb-2">Q{index + 1}: {q.question}</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Your answer: <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                            {userAnswer || "Not answered"}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mb-2">
                            Correct answer: {q.correctAnswer}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Explanation: {q.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Improvement Areas */}
          {results.improvement_areas && results.improvement_areas.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Areas for Improvement:</h4>
              <ul className="space-y-1">
                {results.improvement_areas.map((area: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">• {area}</li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={() => window.location.reload()} className="w-full">
            Take Another Quiz
          </Button>
        </CardContent>
      </Card>
    )
  }

  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">{quiz.title}</h3>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">{question.question}</h3>
            
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value: string) => handleAnswerChange(question.id, value)}
            >
              <div className="space-y-3">
                {question.options.map((option: string) => (
                  <div key={option} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted transition-colors">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={submitQuiz}
                disabled={Object.keys(answers).length < quiz.questions.length}
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


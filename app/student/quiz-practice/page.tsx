"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuizEngine } from "@/components/student/quiz-engine"
import { GraduationCap, Clock, Trophy } from "lucide-react"
import { toast } from "sonner"

export default function QuizPracticePage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const quizId = searchParams.get("id")
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(quizId)

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
      return
    }

    if (isSignedIn && isLoaded && !quizId) {
      fetchQuizzes()
    }
  }, [isSignedIn, isLoaded, router])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student/quizzes`, {
        credentials: "include"
      })
      if (!response.ok) throw new Error("Failed to fetch quizzes")
      const data = await response.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      toast.error("Failed to load quizzes")
    }
  }

  if (!isLoaded || !isSignedIn) return null

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              <span className="gradient-text-glow">Quiz Practice</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Test your knowledge with interactive quizzes
            </p>
          </div>

          {selectedQuiz ? (
            <>
              <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
                ← Back to Quiz List
              </Button>
              <QuizEngine quizId={selectedQuiz} />
            </>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Available Quizzes</h2>
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedQuiz(quiz.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{quiz.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                      </div>
                      <Badge variant="outline">{quiz.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {quiz.totalQuestions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {quiz.timeLimit} minutes
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {quiz.passingScore}% to pass
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


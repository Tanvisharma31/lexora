"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gavel, Users, Clock, Trophy, ArrowRight, BookOpen, Star } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock Moot Problems
const MOOT_PROBLEMS = [
  {
    id: "moot-001",
    title: "Constitutional Challenge: Digital Privacy Act",
    difficulty: "Hard",
    area: "Constitutional Law",
    participants: 1240,
    description: "Argue on the validity of the new Digital Privacy Act which mandates data localization but allegedly violates Article 19 & 21.",
    img: "from-blue-500/20 to-purple-500/20"
  },
  {
    id: "moot-002",
    title: "Contract Breach: TechCorp vs StartUp Inc",
    difficulty: "Medium",
    area: "Contract Law",
    participants: 850,
    description: "A case involving force majeure clauses invoked during a cyber-attack. Determine liability and damages.",
    img: "from-emerald-500/20 to-teal-500/20"
  },
  {
    id: "moot-003",
    title: "Criminal Negligence: The Bridge Collapse",
    difficulty: "Hard",
    area: "IPC & Torts",
    participants: 2100,
    description: "Determine the criminal liability of the municipal corporation and the private contractor in a public infrastructure failure.",
    img: "from-orange-500/20 to-red-500/20"
  }
]

export default function MootCourtPage() {
  const router = useRouter()
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors duration-300">
      <Navigation />

      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1">
              AI Powered Simulation
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
              Virtual <span className="gradient-text-glow">Moot Court</span> Arena
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Practice your argumentation skills against an AI Judge.
              Receive real-time feedback on logic, citation accuracy, and courtroom demeanor.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 animate-fade-in-up stagger-1">
            {MOOT_PROBLEMS.map((problem) => (
              <Card key={problem.id} className="group relative overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${problem.img} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                      {problem.area}
                    </Badge>
                    <div className="flex items-center text-xs font-medium text-muted-foreground">
                      <Users className="h-3 w-3 mr-1" />
                      {problem.participants}
                    </div>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">{problem.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {problem.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className={problem.difficulty === 'Hard' ? 'text-red-500 font-medium' : 'text-blue-500 font-medium'}>
                        {problem.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>20 Mins</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button 
                    onClick={() => router.push(`/moot-court/arena?problem=${encodeURIComponent(problem.description)}&mode=oral&role=advocate&ai_role=judge`)} 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                  >
                    Enter Courtroom
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Gavel className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">12k+</h3>
              <p className="text-sm text-muted-foreground">Arguments Simulated</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">500+</h3>
              <p className="text-sm text-muted-foreground">Case Scenarios</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">4.8/5</h3>
              <p className="text-sm text-muted-foreground">Student Rating</p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">Top 10</h3>
              <p className="text-sm text-muted-foreground">Law Schools Partnered</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

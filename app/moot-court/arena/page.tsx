"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
    Mic,
    Send,
    AlertCircle,
    BookOpen,
    Pause,
    Play,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Gavel,
    Clock,
    Loader2
} from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface Message {
    role: 'ai' | 'user'
    text: string
    timestamp?: string
    score?: number
    feedback?: string
    metrics?: {
        legal_accuracy?: number
        citation_accuracy?: number
        logical_structure?: number
        relevance?: number
    }
}

export default function MootCourtArenaPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPlaying, setIsPlaying] = useState(true)
    const [timeLeft, setTimeLeft] = useState(1200) // 20 minutes
    const [currentTurn, setCurrentTurn] = useState<'petitioner' | 'judge' | 'respondent'>('petitioner')
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [score, setScore] = useState(0)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [caseProblem, setCaseProblem] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isInitializing, setIsInitializing] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Initialize session on mount
    useEffect(() => {
        const problem = searchParams.get('problem') || "Constitutional Challenge: Digital Privacy Act - Argue on the validity of the new Digital Privacy Act which mandates data localization but allegedly violates Article 19 & 21."
        const mode = searchParams.get('mode') || 'oral'
        const userRole = searchParams.get('role') || 'advocate'
        const aiRole = searchParams.get('ai_role') || 'judge'
        
        setCaseProblem(problem)
        initializeSession(problem, mode, userRole, aiRole)
    }, [])

    const initializeSession = async (problem: string, mode: string, userRole: string, aiRole: string) => {
        try {
            setIsInitializing(true)
            const response = await fetch('/api/moot-court', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_problem: problem,
                    mode,
                    role: userRole,
                    ai_role: aiRole
                })
            })

            if (!response.ok) {
                throw new Error('Failed to start session')
            }

            const data = await response.json()
            setSessionId(data.session_id)
            
            // Create session in database
            const sessionResponse = await fetch('/api/moot-court/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    case_problem: problem,
                    mode,
                    user_role: userRole,
                    ai_role: aiRole,
                    session_id: data.session_id
                })
            })

            if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json()
                setSessionId(sessionData.session_id)
            }

            // Add initial AI message
            if (data.ai_response) {
                setMessages([{ role: 'ai', text: data.ai_response, timestamp: new Date().toISOString() }])
            }
        } catch (error) {
            console.error('Error initializing session:', error)
            toast.error('Failed to start moot court session')
            router.push('/moot-court')
        } finally {
            setIsInitializing(false)
        }
    }

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isPlaying && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isPlaying, timeLeft])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handleSendMessage = async () => {
        if (!input.trim() || !sessionId || isLoading) return

        const userMessage = input.trim()
        setInput("")
        setIsLoading(true)

        // Add user message immediately
        const newMessages = [...messages, { 
            role: 'user' as const, 
            text: userMessage,
            timestamp: new Date().toISOString()
        }]
        setMessages(newMessages)
        setCurrentTurn('judge')

        try {
            // Call continue API
            const response = await fetch('/api/moot-court/continue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    user_argument: userMessage,
                    ai_role: 'judge'
                })
            })

            if (!response.ok) {
                throw new Error('Failed to get AI response')
            }

            const data = await response.json()
            
            // Add AI response with feedback
            const aiMessage: Message = {
                role: 'ai',
                text: data.ai_response || "I understand your argument. Please continue.",
                timestamp: new Date().toISOString(),
                score: data.score,
                feedback: data.feedback,
                metrics: data.metrics
            }
            setMessages([...newMessages, aiMessage])
            
            setCurrentTurn('petitioner')
            
            // Update score if provided
            if (data.score !== null && data.score !== undefined) {
                setScore(data.score)
                // Show feedback toast
                if (data.feedback) {
                    toast.success(`Score: ${data.score}/100 - ${data.feedback.substring(0, 100)}`)
                } else {
                    toast.success(`Score: ${data.score}/100`)
                }
            } else {
                // Increment score for participation
                setScore(prev => Math.min(prev + 5, 100))
                toast.success("Argument recorded +5 pts")
            }

            // Update session in database
            if (sessionId) {
                try {
                    await fetch(`/api/moot-court/sessions/${sessionId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            conversation: [...newMessages, { 
                                role: 'ai', 
                                text: data.ai_response,
                                timestamp: new Date().toISOString()
                            }],
                            score: data.score || score + 5
                        })
                    })
                } catch (err) {
                    console.error('Failed to update session:', err)
                    // Non-critical error, continue
                }
            }

            toast.success("Argument recorded")
        } catch (error) {
            console.error('Error sending message:', error)
            toast.error('Failed to send argument')
            // Still add a fallback message
            setMessages([...newMessages, { 
                role: 'ai', 
                text: "I'm processing your argument. Please continue.",
                timestamp: new Date().toISOString()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    if (isInitializing) {
        return (
            <div className="flex h-screen flex-col bg-background items-center justify-center">
                <Navigation />
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Initializing moot court session...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-background overflow-hidden">
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/moot-court')}>Exit</Button>
                    <h1 className="font-bold text-lg hidden md:block line-clamp-1">{caseProblem || "Moot Court Session"}</h1>
                </div>

                <div className="flex items-center gap-4 bg-muted/50 px-4 py-1.5 rounded-full border border-border">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : ''}`}>
                        {formatTime(timeLeft)}
                    </span>
                    <div className="h-4 w-[1px] bg-border" />
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="hidden md:flex gap-1">
                        <Gavel className="h-3 w-3" />
                        Scoring Enabled
                    </Badge>
                    <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground uppercase font-bold">Performance</span>
                        <span className="text-sm font-bold text-primary">{score}/100</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Virtual Judge */}
                <div className="w-1/3 border-r border-border bg-muted/10 hidden lg:flex flex-col relative">
                    <div className="flex-1 bg-black/90 relative p-4 flex items-center justify-center overflow-hidden">
                        {/* Placeholder for 3D/Video Avatar */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829585413-56de8ae18c73?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                        <div className="relative z-10 text-center space-y-4">
                            <div className="h-32 w-32 rounded-full border-4 border-primary/50 mx-auto overflow-hidden bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                <Gavel className="h-12 w-12 text-white/80" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-white font-bold text-xl">Hon'ble Justice AI</h3>
                                <Badge className="bg-primary/20 text-primary border-primary/30">Listening...</Badge>
                            </div>
                        </div>

                        {/* Analyze Overlay - Real-time Metrics */}
                        <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white/70 space-y-2">
                            {(() => {
                                const lastMessage = messages.filter(m => m.role === 'ai' && m.metrics).slice(-1)[0]
                                const metrics = lastMessage?.metrics || {
                                    legal_accuracy: 0,
                                    citation_accuracy: 0,
                                    logical_structure: 0,
                                    relevance: 0
                                }
                                return (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <span>Legal Accuracy</span>
                                            <div className="flex items-center gap-2">
                                                <Progress value={(metrics.legal_accuracy || 0) * 4} className="w-20 h-1.5" />
                                                <span className="text-white/80 font-mono">{(metrics.legal_accuracy || 0)}/25</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Citation Accuracy</span>
                                            <div className="flex items-center gap-2">
                                                <Progress value={(metrics.citation_accuracy || 0) * 4} className="w-20 h-1.5" />
                                                <span className="text-white/80 font-mono">{(metrics.citation_accuracy || 0)}/25</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Logical Structure</span>
                                            <div className="flex items-center gap-2">
                                                <Progress value={(metrics.logical_structure || 0) * 4} className="w-20 h-1.5" />
                                                <span className="text-white/80 font-mono">{(metrics.logical_structure || 0)}/25</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Relevance</span>
                                            <div className="flex items-center gap-2">
                                                <Progress value={(metrics.relevance || 0) * 4} className="w-20 h-1.5" />
                                                <span className="text-white/80 font-mono">{(metrics.relevance || 0)}/25</span>
                                            </div>
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Interaction */}
                <div className="flex-1 flex flex-col bg-background relative">
                    {/* Guidelines / Facts */}
                    <div className="h-16 border-b border-border flex items-center px-6 gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Case Facts</Badge>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Appellant Arguments</Badge>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">Acts Referenced</Badge>
                        <div className="ml-auto flex items-center text-xs text-muted-foreground gap-2">
                            <AlertCircle className="h-3 w-3" />
                            <span>Speak slowly and clearly</span>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`
                    max-w-[80%] rounded-2xl px-5 py-3 shadow-sm
                    ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted rounded-tl-none border border-border'}
                 `}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                                {/* Show feedback and score for AI messages */}
                                {msg.role === 'ai' && msg.feedback && (
                                    <div className="mt-2 max-w-[80%] rounded-lg bg-primary/10 border border-primary/20 p-3 text-xs">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-primary">Feedback</span>
                                            {msg.score !== undefined && (
                                                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                                                    Score: {msg.score}/100
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">{msg.feedback}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
                        <div className="max-w-4xl mx-auto flex gap-3 items-end">
                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl shrink-0">
                                <Mic className="h-5 w-5" />
                            </Button>
                            <div className="relative flex-1">
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your argument or citation here..."
                                    className="min-h-[48px] max-h-[120px] pr-12 rounded-xl border-border bg-background focus-visible:ring-primary"
                                />
                                <div className="absolute right-3 top-3">
                                    <BookOpen className="h-5 w-5 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
                                </div>
                            </div>
                            <Button
                                onClick={handleSendMessage} 
                                disabled={!input.trim() || isLoading}
                                className="h-12 px-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                        <p className="text-center text-[10px] text-muted-foreground mt-3">
                            AI Judge may verify citations against Indian Kanoon database in real-time.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

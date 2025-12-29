"use client"

import { useState, useRef, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Gavel, MessageSquare, Send, Mic, FileText, MicOff, Volume2, VolumeX, Square, FolderOpen, Trash2, UserCheck, Users } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function MootCourtPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [caseProblem, setCaseProblem] = useState("")
  const [mode, setMode] = useState<"oral" | "written">("oral")
  const [userRole, setUserRole] = useState<"advocate" | "judge" | "witness">("advocate")
  const [aiRole, setAiRole] = useState<"judge" | "advocate" | "witness">("judge")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Array<{ role: string; content: string; timestamp?: string }>>([])
  const [userInput, setUserInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [savedSessions, setSavedSessions] = useState<Array<any>>([])
  const [showSessions, setShowSessions] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null) // SpeechRecognition type
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved sessions on mount
  useEffect(() => {
    if (isSignedIn) {
      fetchSavedSessions()
    }
  }, [isSignedIn])

  const fetchSavedSessions = async () => {
    try {
      const response = await fetch("/api/moot-court/sessions")
      if (response.ok) {
        const data = await response.json()
        setSavedSessions(data)
      }
    } catch (error) {
      console.error("Failed to fetch saved sessions", error)
    }
  }

  const updateSavedSession = async (sessionId: string, conversation: Array<any>) => {
    try {
      await fetch(`/api/moot-court/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversation })
      })
    } catch (error) {
      console.error("Failed to update session", error)
    }
  }

  const loadSession = async (session: any) => {
    setCaseProblem(session.case_problem)
    setMode(session.mode as "oral" | "written")
    setUserRole(session.user_role as "advocate" | "judge" | "witness")
    setAiRole(session.ai_role as "judge" | "advocate" | "witness")
    setSessionId(session.session_id)
    setSavedSessionId(session.session_id)
    setConversation(session.conversation || [])
    setShowSessions(false)
    toast.success("Session loaded")
  }

  const startSession = async () => {
    if (!isSignedIn) {
      toast.info("Please sign in to use Moot Court")
      router.push("/sign-in")
      return
    }

    if (!caseProblem.trim()) {
      toast.error("Please enter a case problem")
      return
    }

    setIsLoading(true)
    try {
      // Start moot court session
      const mootResponse = await fetch("/api/moot-court", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_problem: caseProblem,
          mode: mode,
          role: aiRole // AI takes the selected role
        })
      })

      if (!mootResponse.ok) {
        throw new Error("Failed to start session")
      }

      const mootData = await mootResponse.json()
      const newSessionId = mootData.session_id

      // Save session to database
      const saveResponse = await fetch("/api/moot-court/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_problem: caseProblem,
          mode: mode,
          user_role: userRole,
          ai_role: aiRole,
          session_id: newSessionId
        })
      })

      if (saveResponse.ok) {
        const savedData = await saveResponse.json()
        setSavedSessionId(savedData.session_id)
        toast.success("Session started and saved")
      } else {
        console.warn("Failed to save session, but continuing")
      }

      setSessionId(newSessionId)
      const initialConversation = [
        { 
          role: "ai", 
          content: mootData.ai_response,
          timestamp: new Date().toISOString()
        }
      ]
      setConversation(initialConversation)

      // Update saved session with initial conversation
      if (saveResponse.ok) {
        await updateSavedSession(newSessionId, initialConversation)
      }
    } catch (error) {
      toast.error("Failed to start session. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-IN"

      recognitionRef.current.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setUserInput(prev => prev + transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error)
        if (event.error === "not-allowed") {
          toast.error("Microphone permission denied. Please enable it in browser settings.")
        }
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop()
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Start voice recording
  const startRecording = async () => {
    try {
      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Recording not supported in this browser. Please use Chrome, Edge, or Firefox.")
        return
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })

      // Determine supported MIME type
      let mimeType = "audio/webm"
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus"
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm"
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        mimeType = "audio/mp4"
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        mimeType = "audio/ogg"
      }

      const options: MediaRecorderOptions = { mimeType }
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log("Audio chunk received:", event.data.size, "bytes")
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event)
        toast.error("Recording error occurred")
        setIsRecording(false)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.onstop = () => {
        console.log("Recording stopped. Chunks:", audioChunksRef.current.length)
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
          const url = URL.createObjectURL(audioBlob)
          setAudioUrl(url)
          console.log("Audio URL created:", url)
          toast.success("Recording saved successfully")
        } else {
          toast.error("No audio data recorded")
        }
        stream.getTracks().forEach(track => track.stop())
      }

      // Start recording with timeslice for better chunk handling
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      console.log("Recording started with MIME type:", mimeType)
      toast.success("Recording started - Speak now!")
    } catch (error: any) {
      console.error("Error starting recording:", error)
      let errorMessage = "Failed to start recording."
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "Microphone permission denied. Please allow microphone access in browser settings."
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage = "No microphone found. Please connect a microphone."
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage = "Microphone is being used by another application."
      } else {
        errorMessage = `Recording error: ${error.message || error.name}`
      }
      
      toast.error(errorMessage)
      setIsRecording(false)
    }
  }

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      const state = mediaRecorderRef.current.state
      console.log("Stopping recording. Current state:", state)
      
      if (state === "recording") {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setRecordingTime(0)
        toast.info("Stopping recording...")
      } else if (state === "paused") {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setRecordingTime(0)
      } else {
        setIsRecording(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setRecordingTime(0)
        toast.warning("Recording was not active")
      }
    } else {
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setRecordingTime(0)
    }
  }

  // Start speech-to-text
  const startSpeechToText = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not supported in this browser")
      return
    }

    try {
      recognitionRef.current.start()
      setIsListening(true)
      toast.success("Listening... Speak now")
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      toast.error("Failed to start speech recognition")
    }
  }

  // Stop speech-to-text
  const stopSpeechToText = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      toast.success("Stopped listening")
    }
  }

  // Play AI response as audio (Text-to-Speech)
  const playAudioResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "en-US"
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 1

      utterance.onstart = () => setIsPlayingAudio(true)
      utterance.onend = () => setIsPlayingAudio(false)
      utterance.onerror = () => {
        setIsPlayingAudio(false)
        toast.error("Error playing audio")
      }

      window.speechSynthesis.speak(utterance)
    } else {
      toast.error("Text-to-speech not supported in this browser")
    }
  }

  // Stop audio playback
  const stopAudio = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      setIsPlayingAudio(false)
    }
  }

  const sendMessage = async () => {
    if (!sessionId || !userInput.trim()) return

    const userMessage = userInput
    setUserInput("")
    setConversation(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/moot-court/continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_argument: userMessage,
          ai_role: "judge"
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      setConversation(prev => [...prev, { role: "ai", content: data.ai_response }])
      
      // Auto-play AI response in oral mode
      if (mode === "oral") {
        playAudioResponse(data.ai_response)
      }
    } catch (error) {
      toast.error("Failed to get response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Format time for recording display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Navigation />
      
      <main className="flex-1 px-4 py-10 md:px-6 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              <span className="gradient-text-glow">AI Moot Court Simulator</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Practice your legal arguments with AI judge, opposing counsel, and witnesses
            </p>
          </div>

          {!sessionId ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Saved Sessions Button */}
              {savedSessions.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowSessions(!showSessions)}
                    className="liquid-subtle"
                  >
                    <FolderOpen className="mr-2 h-4 w-4" />
                    {showSessions ? "Hide" : "Load"} Saved Sessions ({savedSessions.length})
                  </Button>
                </div>
              )}

              {/* Saved Sessions List */}
              {showSessions && savedSessions.length > 0 && (
                <div className="liquid rounded-2xl p-6 space-y-3">
                  <h3 className="text-lg font-semibold mb-4">Saved Sessions</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {savedSessions.map((session) => (
                      <div
                        key={session.session_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 cursor-pointer"
                        onClick={() => loadSession(session)}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm truncate">{session.case_problem.substring(0, 60)}...</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {session.mode} • You: {session.user_role} • AI: {session.ai_role} • {new Date(session.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Delete session
                            fetch(`/api/moot-court/sessions/${session.session_id}`, { method: "DELETE" })
                              .then(() => {
                                toast.success("Session deleted")
                                fetchSavedSessions()
                              })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode Selection */}
              <div className="liquid rounded-2xl p-6">
                <label className="text-sm font-medium mb-3 block">Select Mode</label>
                <div className="flex gap-4">
                  <Button
                    variant={mode === "oral" ? "default" : "ghost"}
                    onClick={() => setMode("oral")}
                    className={mode === "oral" ? "liquid-glow text-white" : "liquid-subtle text-white"}
                  >
                    <Mic className="mr-2 h-4 w-4 " />
                    Oral Arguments
                  </Button>
                  <Button
                    variant={mode === "written" ? "default" : "ghost"}
                    onClick={() => setMode("written")}
                    className={mode === "written" ? "liquid-glow text-white" : "liquid-subtle text-white"}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Written Memorial
                  </Button>
                </div>
              </div>

              {/* Role Selection */}
              <div className="liquid rounded-2xl p-6">
                <label className="text-sm font-medium mb-3 block">Select Roles</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Your Role</label>
                    <div className="flex gap-2">
                      <Button
                        variant={userRole === "advocate" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setUserRole("advocate")}
                        className="flex-1"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Advocate
                      </Button>
                      <Button
                        variant={userRole === "judge" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setUserRole("judge")}
                        className="flex-1"
                      >
                        <Gavel className="mr-2 h-4 w-4" />
                        Judge
                      </Button>
                      <Button
                        variant={userRole === "witness" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setUserRole("witness")}
                        className="flex-1"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Witness
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">AI Role</label>
                    <div className="flex gap-2">
                      <Button
                        variant={aiRole === "judge" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setAiRole("judge")}
                        className="flex-1"
                      >
                        <Gavel className="mr-2 h-4 w-4" />
                        Judge
                      </Button>
                      <Button
                        variant={aiRole === "advocate" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setAiRole("advocate")}
                        className="flex-1"
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Advocate
                      </Button>
                      <Button
                        variant={aiRole === "witness" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setAiRole("witness")}
                        className="flex-1"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Witness
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Case Problem Input */}
              <div className="liquid rounded-2xl p-6">
                <label className="text-sm font-medium mb-3 block">Case Problem</label>
                <textarea
                  value={caseProblem}
                  onChange={(e) => setCaseProblem(e.target.value)}
                  placeholder="Enter the case problem, facts, and legal issues..."
                  className="w-full min-h-[300px] rounded-lg border border-primary/20 bg-background/50 px-4 py-3 liquid-subtle resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <Button
                onClick={startSession}
                disabled={isLoading || !caseProblem.trim()}
                className="w-full liquid-glow text-white"
                size="lg"
              >
                <Gavel className="mr-2 h-5 w-5" />
                {isLoading ? "Starting Session..." : "Start Moot Court Session"}
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Conversation Area */}
              <div className="liquid rounded-2xl p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
                <div className="space-y-4">
                  {conversation.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === "user"
                            ? "bg-primary/20 text-foreground"
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">
                            {msg.role === "user" ? "You (Advocate)" : "AI Judge"}
                          </span>
                          {msg.role === "ai" && mode === "oral" && (
                            <div className="flex items-center gap-2">
                              {isPlayingAudio ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={stopAudio}
                                  className="h-6 px-2"
                                >
                                  <VolumeX className="h-3 w-3" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => playAudioResponse(msg.content)}
                                  className="h-6 px-2"
                                >
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-75" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area - Different for Oral vs Written Mode */}
              {mode === "oral" ? (
                <div className="space-y-4">
                  {/* Voice Input Controls */}
                  <div className="liquid rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Oral Arguments</h3>
                      <div className="flex items-center gap-2">
                        {isRecording && (
                          <div className="flex items-center gap-2 text-red-500">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">{formatTime(recordingTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Speech-to-Text Input */}
                    <div className="flex gap-2 mb-4">
                      <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Your argument will appear here as you speak, or type manually..."
                        className="flex-1 rounded-lg border border-primary/20 bg-background/50 px-4 py-3 liquid-subtle resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows={4}
                      />
                    </div>

                    {/* Voice Control Buttons */}
                    <div className="flex items-center gap-3">
                      {!isListening ? (
                        <Button
                          onClick={startSpeechToText}
                          disabled={isRecording}
                          variant="outline"
                          className="liquid-subtle"
                        >
                          <Mic className="mr-2 h-4 w-4" />
                          Start Speaking
                        </Button>
                      ) : (
                        <Button
                          onClick={stopSpeechToText}
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <MicOff className="mr-2 h-4 w-4" />
                          Stop Listening
                        </Button>
                      )}

                      {!isRecording ? (
                        <Button
                          onClick={startRecording}
                          disabled={isListening}
                          variant="outline"
                          className="liquid-subtle"
                        >
                          <Mic className="mr-2 h-4 w-4" />
                          Record Audio
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          className="bg-red-500 hover:bg-red-600"
                        >
                          <Square className="mr-2 h-4 w-4" />
                          Stop Recording
                        </Button>
                      )}

                      <Button
                        onClick={sendMessage}
                        disabled={isLoading || !userInput.trim()}
                        className="flex-1 liquid-glow"
                        size="lg"
                      >
                        <Send className="mr-2 h-5 w-5" />
                        Submit Argument
                      </Button>
                    </div>

                    {isListening && (
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-sm text-muted-foreground">Listening... Speak your argument</span>
                      </div>
                    )}
                  </div>

                  {/* Audio Playback (if recorded) */}
                  {audioUrl && (
                    <div className="liquid rounded-2xl p-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Recorded Audio</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setAudioUrl(null)
                              if (audioRef.current) {
                                audioRef.current.src = ""
                              }
                            }}
                            className="text-xs"
                          >
                            Clear
                          </Button>
                        </div>
                        <audio 
                          ref={audioRef} 
                          src={audioUrl} 
                          controls 
                          className="w-full"
                          onError={(e) => {
                            console.error("Audio playback error:", e)
                            toast.error("Error playing audio. The format may not be supported.")
                          }}
                        />
                        <p className="text-xs text-muted-foreground">
                          You can play this recording or use the transcribed text above to submit your argument.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Browser Compatibility Info */}
                  {!navigator.mediaDevices && (
                    <div className="liquid rounded-2xl p-4 bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ Audio recording requires HTTPS or localhost. Please use Chrome, Edge, or Firefox for best results.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Type your argument or response..."
                    className="flex-1 rounded-lg border border-primary/20 bg-background/50 px-4 py-3 liquid-subtle resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={3}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !userInput.trim()}
                    className="liquid-glow"
                    size="lg"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <Button
                variant="ghost"
                onClick={() => {
                  setSessionId(null)
                  setConversation([])
                  setCaseProblem("")
                }}
                className="w-full liquid-subtle"
              >
                Start New Session
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


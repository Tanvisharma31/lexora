"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { X, Send, Mail, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface TrialExpiredModalProps {
  service: string
  onClose: () => void
}

export function TrialExpiredModal({ service, onClose }: TrialExpiredModalProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [showWaitingList, setShowWaitingList] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [waitingListEmail, setWaitingListEmail] = useState("")
  const [waitingListName, setWaitingListName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Please provide your feedback")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          feedback,
          type: "trial_expired",
        }),
      })

      if (response.ok) {
        toast.success("Thank you for your feedback!")
        setShowFeedback(false)
        setFeedback("")
      } else {
        throw new Error("Failed to submit feedback")
      }
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleWaitingListSubmit = async () => {
    if (!waitingListEmail.trim() || !waitingListName.trim()) {
      toast.error("Please fill all fields")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/waiting-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: waitingListEmail,
          name: waitingListName,
          service,
        }),
      })

      if (response.ok) {
        toast.success("You've been added to the waiting list! We'll contact you soon.")
        setShowWaitingList(false)
        setWaitingListEmail("")
        setWaitingListName("")
      } else {
        throw new Error("Failed to join waiting list")
      }
    } catch (error) {
      toast.error("Failed to join waiting list. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md liquid-glow border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="gradient-text text-2xl">Trial Expired</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              You've used all 5 free trials for {service}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {!showFeedback && !showWaitingList && (
            <>
              <p className="text-sm text-muted-foreground">
                We'd love to hear from you! Share your feedback or join our waiting list for early access to premium features.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 liquid-subtle"
                  onClick={() => setShowFeedback(true)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Give Feedback
                </Button>
                <Button
                  className="flex-1 liquid-glow"
                  onClick={() => setShowWaitingList(true)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Join Waitlist
                </Button>
              </div>
            </>
          )}

          {showFeedback && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Feedback</label>
                <Textarea
                  placeholder="Tell us about your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="bg-background/50 border-white/20"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={loading}
                  className="flex-1 liquid-glow"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit
                </Button>
              </div>
            </div>
          )}

          {showWaitingList && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name</label>
                <Input
                  placeholder="Enter your name"
                  value={waitingListName}
                  onChange={(e) => setWaitingListName(e.target.value)}
                  className="bg-background/50 border-white/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={waitingListEmail}
                  onChange={(e) => setWaitingListEmail(e.target.value)}
                  className="bg-background/50 border-white/20"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowWaitingList(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleWaitingListSubmit}
                  disabled={loading}
                  className="flex-1 liquid-glow"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Join Waitlist
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

export function SearchFooter() {
  return (
    <footer className="glass-subtle mt-auto px-4 py-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span>© 2025 LegalAI Search</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">Beta v0.1</span>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-muted-foreground/70 sm:text-left">
          Disclaimer: This AI tool provides general legal information, not legal advice. Always consult a qualified
          legal professional for specific legal matters.
        </p>
      </div>
    </footer>
  )
}

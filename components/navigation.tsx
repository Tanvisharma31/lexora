"use client"

import { usePathname, useRouter } from "next/navigation"
import { UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Scale,
  Search,
  Languages,
  FileText,
  Upload,
  Gavel,
  BookOpen,
  Briefcase,
  Menu,
  X,
  Sparkles,
} from "lucide-react"
import { useState, useEffect } from "react"

const navigationItems = [
  { name: "Search", href: "/", icon: Search, description: "Legal Search" },
  { name: "Translate", href: "/translate", icon: Languages, description: "Multi-language" },
  { name: "DraftGen", href: "/draftgen", icon: FileText, description: "AI Drafting" },
  { name: "Analyze", href: "/analyze", icon: Upload, description: "Document Review" },
  { name: "Moot Court", href: "/moot-court", icon: Gavel, description: "Practice Sessions" },
  { name: "Student Hub", href: "/student-hub", icon: BookOpen, description: "Learning Center" },
  { name: "Workspace", href: "/workspace", icon: Briefcase, description: "Collaborate" },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20" 
          : "bg-black/50 backdrop-blur-md border-b border-white/5"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Enhanced Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => router.push(isSignedIn ? "/" : "/landing")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl blur-md group-hover:blur-lg transition-all" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 group-hover:border-white/40 transition-all">
                <Scale className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Nyayik
                </span>
                <Sparkles className="h-3 w-3 text-white/40" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-medium">
                AI Legal Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation - Enhanced */}
          {isSignedIn && (
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                
                return (
                  <div key={item.name} className="relative group">
                    <Button
                      variant="ghost"
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "relative px-4 py-2 text-sm font-medium transition-all duration-200",
                        "text-white/70 hover:text-white hover:bg-white/5",
                        isActive && "text-white bg-white/10"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.name}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent" />
                      )}
                    </Button>
                    
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                      <p className="text-xs text-white/80">{item.description}</p>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/95 border-l border-t border-white/10 rotate-45" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* User Actions - Enhanced */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-white/60">Online</span>
                  </div>
                </div>
                <div className="ring-2 ring-white/10 ring-offset-2 ring-offset-black rounded-full hover:ring-white/20 transition-all">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/sign-in")}
                  className="text-white/80 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/sign-up")}
                  className="bg-white text-black hover:bg-white/90 font-medium shadow-lg shadow-white/20 hover:shadow-white/30 transition-all"
                >
                  Get Started
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Mobile menu button - Enhanced */}
            {isSignedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden relative overflow-hidden group border border-white/10 hover:border-white/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 relative z-10 transition-transform group-hover:rotate-90" />
                ) : (
                  <Menu className="h-5 w-5 relative z-10 transition-transform group-hover:scale-110" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Enhanced */}
      {isSignedIn && mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
          <div className="px-3 pt-3 pb-4 space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
              
              return (
                <Button
                  key={item.name}
                  variant="ghost"
                  onClick={() => {
                    router.push(item.href)
                    setMobileMenuOpen(false)
                  }}
                  className={cn(
                    "w-full justify-start gap-3 px-4 py-3 text-left transition-all",
                    "hover:bg-white/10 hover:translate-x-1",
                    isActive 
                      ? "bg-white/10 text-white border-l-2 border-white" 
                      : "text-white/70 border-l-2 border-transparent"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-white/40">{item.description}</span>
                  </div>
                </Button>
              )
            })}
          </div>
          
          {/* Mobile Footer */}
          <div className="px-4 py-3 border-t border-white/10 bg-white/5">
            <div className="flex items-center justify-between text-xs text-white/40">
              <span>© 2024 Nyayik</span>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
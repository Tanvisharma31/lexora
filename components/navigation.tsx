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
  LayoutDashboard,
  Shield,
  Building2,
  Calendar,
  Users,
  FileCheck,
  Clock,
  Library,
} from "lucide-react"
import { useState, useEffect } from "react"
import { UserRole } from "@/lib/models"
import { getDashboardRoute } from "@/lib/dashboard-routing"

// Base navigation items available to all users
const baseNavigationItems = [
  { name: "Search", href: "/search", icon: Search, description: "Legal Search", roles: ["ALL"] },
  { name: "Translate", href: "/translate", icon: Languages, description: "Multi-language", roles: ["ALL"] },
  { name: "DraftGen", href: "/draftgen", icon: FileText, description: "AI Drafting", roles: ["LAWYER", "ASSOCIATE", "IN_HOUSE_COUNSEL", "SUPER_ADMIN", "ADMIN"] },
  { name: "Analyze", href: "/analyze", icon: Upload, description: "Document Review", roles: ["LAWYER", "ASSOCIATE", "IN_HOUSE_COUNSEL", "SUPER_ADMIN", "ADMIN"] },
  { name: "Moot Court", href: "/moot-court", icon: Gavel, description: "Practice Sessions", roles: ["STUDENT", "LAWYER", "ASSOCIATE", "SUPER_ADMIN", "ADMIN"] },
  { name: "Workspace", href: "/workspace", icon: Briefcase, description: "Collaborate", roles: ["ALL"] },
  { name: "Research", href: "/research", icon: Library, description: "Research Library", roles: ["LAWYER", "ASSOCIATE", "JUDGE", "SUPER_ADMIN", "ADMIN"] },
  { name: "Calendar", href: "/calendar", icon: Calendar, description: "Deadlines", roles: ["LAWYER", "ASSOCIATE", "JUDGE", "SUPER_ADMIN", "ADMIN"] },
  { name: "Clients", href: "/clients", icon: Users, description: "Client Management", roles: ["LAWYER", "ASSOCIATE", "SUPER_ADMIN", "ADMIN"] },
  { name: "Contracts", href: "/contracts", icon: FileCheck, description: "Contract Management", roles: ["LAWYER", "ASSOCIATE", "IN_HOUSE_COUNSEL", "SUPER_ADMIN", "ADMIN"] },
  { name: "Time Tracking", href: "/time-tracking", icon: Clock, description: "Time & Billing", roles: ["LAWYER", "ASSOCIATE", "SUPER_ADMIN", "ADMIN"] },
]

// Dashboard items for specific roles
const dashboardItems = [
  { name: "Admin", href: "/admin", icon: Shield, description: "Admin Dashboard", roles: ["SUPER_ADMIN", "ADMIN"] },
  { name: "Judge", href: "/judge", icon: Gavel, description: "Judge Dashboard", roles: ["JUDGE", "SUPER_ADMIN", "ADMIN"] },
  { name: "Lawyer", href: "/lawyer", icon: Briefcase, description: "Lawyer Dashboard", roles: ["LAWYER", "ASSOCIATE", "SUPER_ADMIN", "ADMIN"] },
  { name: "Student", href: "/student", icon: BookOpen, description: "Student Dashboard", roles: ["STUDENT", "SUPER_ADMIN", "ADMIN"] },
  { name: "Company", href: "/company", icon: Building2, description: "Company Legal", roles: ["IN_HOUSE_COUNSEL", "COMPLIANCE_OFFICER", "SUPER_ADMIN", "ADMIN"] },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { isSignedIn } = useUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isSignedIn) {
      // Fetch user role
      fetch("/api/user/role")
        .then(res => res.json())
        .then(data => {
          if (data.role) {
            setUserRole(data.role as UserRole)
          }
        })
        .catch(err => console.error("Failed to fetch user role:", err))
    }
  }, [isSignedIn])

  // Filter navigation items based on user role
  const getFilteredItems = () => {
    if (!userRole) return baseNavigationItems

    const filtered = baseNavigationItems.filter(item => {
      if (item.roles.includes("ALL")) return true
      return item.roles.includes(userRole)
    })

    // Add dashboard link if user has a specific dashboard
    const dashboardRoute = getDashboardRoute(userRole)
    const dashboardItem = dashboardItems.find(item => item.href === dashboardRoute)
    
    if (dashboardItem && dashboardItem.roles.includes(userRole)) {
      // Insert dashboard at the beginning
      return [{ ...dashboardItem, name: "Dashboard" }, ...filtered]
    }

    return filtered
  }

  const navigationItems = getFilteredItems()

  return (
    <nav 
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20" 
          : "bg-black/50 backdrop-blur-md border-b border-white/5"
      )}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          {/* Enhanced Logo - Responsive */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0" 
            onClick={() => {
              if (isSignedIn && userRole) {
                const dashboardRoute = getDashboardRoute(userRole)
                router.push(dashboardRoute)
              } else {
                router.push("/landing")
              }
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-xl blur-md group-hover:blur-lg transition-all" />
              <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl border border-white/20 group-hover:border-white/40 transition-all">
                <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col hidden sm:flex">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                  Nyayik
                </span>
                <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white/40" />
              </div>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-white/40 font-medium hidden sm:block">
                AI Legal Platform
              </span>
            </div>
          </div>

          {/* Desktop Navigation - Enhanced & Responsive */}
          {isSignedIn && (
            <div className="hidden xl:flex xl:items-center xl:gap-1 overflow-x-auto scrollbar-hide">
              {navigationItems.slice(0, 6).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                
                return (
                  <div key={item.name} className="relative group flex-shrink-0">
                    <Button
                      variant="ghost"
                      onClick={() => router.push(item.href)}
                      className={cn(
                        "relative px-3 xl:px-4 py-2 text-xs xl:text-sm font-medium transition-all duration-200",
                        "text-white/70 hover:text-white hover:bg-white/5",
                        isActive && "text-white bg-white/10"
                      )}
                    >
                      <Icon className="mr-1.5 xl:mr-2 h-3.5 w-3.5 xl:h-4 xl:w-4" />
                      <span className="hidden 2xl:inline">{item.name}</span>
                      <span className="2xl:hidden">{item.name.length > 8 ? item.name.substring(0, 8) + '...' : item.name}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent" />
                      )}
                    </Button>
                    
                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-black/95 backdrop-blur-xl border border-white/10 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      <p className="text-xs text-white/80">{item.description}</p>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/95 border-l border-t border-white/10 rotate-45" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* User Actions - Enhanced & Responsive */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {isSignedIn ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden md:flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] sm:text-xs text-white/60">Online</span>
                  </div>
                </div>
                <div className="ring-1 sm:ring-2 ring-white/10 ring-offset-1 sm:ring-offset-2 ring-offset-black rounded-full hover:ring-white/20 transition-all">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 md:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/sign-in")}
                  className="text-xs sm:text-sm text-white/80 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push("/sign-up")}
                  className="text-xs sm:text-sm bg-white text-black hover:bg-white/90 font-medium shadow-lg shadow-white/20 hover:shadow-white/30 transition-all"
                >
                  <span className="hidden md:inline">Get Started</span>
                  <span className="md:hidden">Start</span>
                  <Sparkles className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}

            {/* Mobile menu button - Enhanced with Animation */}
            {isSignedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden relative overflow-hidden group border border-white/10 hover:border-white/20 transition-all duration-300 h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                <div className="relative z-10">
                  {mobileMenuOpen ? (
                    <X className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 group-hover:rotate-90" />
                  ) : (
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90" />
                  )}
                </div>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Enhanced with Slide Animation */}
      {isSignedIn && (
        <div 
          className={cn(
            "xl:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden",
            mobileMenuOpen 
              ? "max-h-[90vh] opacity-100 overflow-y-auto" 
              : "max-h-0 opacity-0"
          )}
        >
          <div className={cn(
            "px-2 sm:px-3 pt-2 sm:pt-3 pb-3 sm:pb-4 space-y-1 transition-all duration-300",
            mobileMenuOpen ? "translate-y-0" : "-translate-y-4"
          )}>
            {navigationItems.map((item, index) => {
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
                    "w-full justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all duration-200",
                    "hover:bg-white/10 active:bg-white/10",
                    isActive 
                      ? "bg-white/10 text-white border-l-2 border-white shadow-lg shadow-white/10" 
                      : "text-white/70 border-l-2 border-transparent",
                    mobileMenuOpen ? "animate-slide-in-left" : ""
                  )}
                  style={{
                    animationDelay: `${index * 30}ms`
                  }}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-transform" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-sm sm:text-base truncate">{item.name}</span>
                    <span className="text-[10px] sm:text-xs text-white/40 truncate">{item.description}</span>
                  </div>
                </Button>
              )
            })}
          </div>
          
          {/* Mobile Footer */}
          <div className={cn(
            "px-3 sm:px-4 py-2 sm:py-3 border-t border-white/10 bg-white/5 transition-all duration-300",
            mobileMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          )}>
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/40 gap-2">
              <span>© 2024 Nyayik</span>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="hidden sm:inline">All systems operational</span>
                <span className="sm:hidden">Online</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Search, FileText, Gavel, Languages, Briefcase, Brain, Shield, Zap } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "AI Legal Search",
    description: "Search through Indian laws, acts, and legal precedents with AI-powered answers and instant citations.",
    gradient: "from-white to-white/60"
  },
  {
    icon: FileText,
    title: "Document Analysis",
    description: "AI-powered analysis of legal documents including compliance scoring, risk assessment, and clause identification.",
    gradient: "from-white to-white/60"
  },
  {
    icon: Gavel,
    title: "Moot Court Simulator",
    description: "Practice legal arguments with our AI-powered moot court simulator. Play as advocate, judge, or witness.",
    gradient: "from-white to-white/60"
  },
  {
    icon: Languages,
    title: "PDF Translation",
    description: "Translate legal documents and PDFs between Indian languages with AI-powered accuracy.",
    gradient: "from-white to-white/60"
  },
  {
    icon: Briefcase,
    title: "Contract Drafting",
    description: "Generate legal documents from templates. Create contracts, agreements, and legal notices with AI assistance.",
    gradient: "from-white to-white/60"
  },
  {
    icon: Brain,
    title: "Legal Reasoning",
    description: "Get AI-powered legal reasoning in simple and professional modes for complex legal questions.",
    gradient: "from-white to-white/60"
  },
  {
    icon: Shield,
    title: "Compliance Checking",
    description: "Automated compliance checking and risk assessment for legal documents and contracts.",
    gradient: "from-white to-white/60"
  },
  {
    icon: Zap,
    title: "Workspace Management",
    description: "Organize your cases and documents. Store and manage all your legal work in one secure place.",
    gradient: "from-white to-white/60"
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Powerful Features for
            <br />
            <span className="gradient-text">Modern Legal Practice</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Everything you need to streamline your legal work, powered by advanced AI technology.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group liquid-subtle border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


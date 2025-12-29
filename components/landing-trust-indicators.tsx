"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Award, Users } from "lucide-react"

const indicators = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance",
  },
  {
    icon: Lock,
    title: "Data Privacy",
    description: "Your data stays private and secure",
  },
  {
    icon: Award,
    title: "Legal Compliance",
    description: "Built for Indian legal system",
  },
  {
    icon: Users,
    title: "Trusted by Professionals",
    description: "Used by lawyers, judges, and legal experts",
  },
]

export function LandingTrustIndicators() {
  return (
    <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-black border-y border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon
            return (
              <motion.div
                key={indicator.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {indicator.title}
                </h3>
                <p className="text-xs text-white/60">
                  {indicator.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


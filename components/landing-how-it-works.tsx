"use client"

import { motion } from "framer-motion"
import { UserPlus, Search, Sparkles, CheckCircle } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Sign Up Free",
    description: "Create your account in seconds. Get 5 free trials for each service to explore all features.",
  },
  {
    number: "02",
    icon: Search,
    title: "Choose Your Service",
    description: "Select from legal search, document analysis, contract drafting, moot court, and more.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "AI-Powered Results",
    description: "Get instant, accurate results powered by advanced AI technology trained on Indian legal data.",
  },
  {
    number: "04",
    icon: CheckCircle,
    title: "Enhance Your Practice",
    description: "Streamline your workflow, save time, and deliver better results for your clients.",
  },
]

export function LandingHowItWorks() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Get started in minutes and transform your legal practice today.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                )}

                <div className="relative">
                  {/* Number Badge */}
                  <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center">
                    <span className="text-2xl font-bold gradient-text">{step.number}</span>
                  </div>

                  {/* Card */}
                  <div className="liquid-subtle border-white/10 p-6 pt-12 rounded-2xl hover:border-white/20 transition-all duration-300">
                    <div className="flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


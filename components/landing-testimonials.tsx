"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

const testimonials = [
  {
    name: "Adv. Priya Sharma",
    role: "Senior Partner, Sharma & Associates",
    content: "Nyayik has transformed how we research and draft legal documents. The AI-powered search saves us hours every day.",
    rating: 5,
  },
  {
    name: "Dr. Rajesh Kumar",
    role: "Professor of Law, Delhi University",
    content: "As an educator, I use Nyayik to help students understand complex legal concepts. The moot court simulator is exceptional.",
    rating: 5,
  },
  {
    name: "Adv. Anjali Mehta",
    role: "In-House Counsel, TechCorp India",
    content: "The document analysis feature helps us quickly identify risks and compliance issues. It's become essential to our workflow.",
    rating: 5,
  },
]

export function LandingTestimonials() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-black">
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
            Trusted by <span className="gradient-text">Legal Professionals</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            See what lawyers, judges, and legal experts are saying about Nyayik.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Card className="liquid-subtle border-white/10 hover:border-white/20 transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <Quote className="h-8 w-8 text-white/40" />
                    <p className="text-white/80 leading-relaxed flex-1">
                      "{testimonial.content}"
                    </p>
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <div key={i} className="w-4 h-4 rounded-full bg-white/20" />
                        ))}
                      </div>
                      <p className="text-sm font-semibold text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-white/60">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


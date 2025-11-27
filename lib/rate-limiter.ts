export interface RateLimiterConfig {
  maxTokens: number // Maximum requests allowed
  refillRate: number // Tokens refilled per interval
  refillInterval: number // Interval in milliseconds
}

export interface RateLimiterState {
  tokens: number
  lastRefill: number
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxTokens: 5,
  refillRate: 1,
  refillInterval: 12000, // 12 seconds = 5 per minute
}

class TokenBucketRateLimiter {
  private config: RateLimiterConfig
  private state: RateLimiterState

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.state = {
      tokens: this.config.maxTokens,
      lastRefill: Date.now(),
    }
  }

  private refillTokens(): void {
    const now = Date.now()
    const timePassed = now - this.state.lastRefill
    const tokensToAdd = Math.floor(timePassed / this.config.refillInterval) * this.config.refillRate

    if (tokensToAdd > 0) {
      this.state.tokens = Math.min(this.config.maxTokens, this.state.tokens + tokensToAdd)
      this.state.lastRefill = now
    }
  }

  canMakeRequest(): boolean {
    this.refillTokens()
    return this.state.tokens > 0
  }

  consumeToken(): boolean {
    this.refillTokens()
    if (this.state.tokens > 0) {
      this.state.tokens--
      return true
    }
    return false
  }

  getTokensRemaining(): number {
    this.refillTokens()
    return this.state.tokens
  }

  getTimeUntilNextToken(): number {
    if (this.state.tokens >= this.config.maxTokens) return 0
    const timeSinceLastRefill = Date.now() - this.state.lastRefill
    return Math.max(0, this.config.refillInterval - timeSinceLastRefill)
  }

  getSecondsUntilNextToken(): number {
    return Math.ceil(this.getTimeUntilNextToken() / 1000)
  }

  reset(): void {
    this.state = {
      tokens: this.config.maxTokens,
      lastRefill: Date.now(),
    }
  }
}

// Singleton instance
let rateLimiterInstance: TokenBucketRateLimiter | null = null

export function getRateLimiter(config?: Partial<RateLimiterConfig>): TokenBucketRateLimiter {
  if (!rateLimiterInstance) {
    const maxTokens =
      typeof window !== "undefined" ? Number.parseInt(process.env.NEXT_PUBLIC_RATE_LIMIT_PER_MIN || "5", 10) : 5
    rateLimiterInstance = new TokenBucketRateLimiter({ ...config, maxTokens })
  }
  return rateLimiterInstance
}

export { TokenBucketRateLimiter }

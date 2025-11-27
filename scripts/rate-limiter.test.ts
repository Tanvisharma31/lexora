import { TokenBucketRateLimiter } from "../lib/rate-limiter"

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

function runTests() {
  console.log("🧪 Running Rate Limiter Tests...\n")

  // Test 1: Initial state
  console.log("Test 1: Initial state")
  const limiter1 = new TokenBucketRateLimiter({ maxTokens: 5, refillRate: 1, refillInterval: 1000 })
  assert(limiter1.getTokensRemaining() === 5, "Should start with max tokens")
  assert(limiter1.canMakeRequest() === true, "Should be able to make request initially")
  console.log("✅ Passed\n")

  // Test 2: Token consumption
  console.log("Test 2: Token consumption")
  const limiter2 = new TokenBucketRateLimiter({ maxTokens: 3, refillRate: 1, refillInterval: 1000 })
  assert(limiter2.consumeToken() === true, "First consume should succeed")
  assert(limiter2.getTokensRemaining() === 2, "Should have 2 tokens remaining")
  assert(limiter2.consumeToken() === true, "Second consume should succeed")
  assert(limiter2.consumeToken() === true, "Third consume should succeed")
  assert(limiter2.getTokensRemaining() === 0, "Should have 0 tokens remaining")
  assert(limiter2.consumeToken() === false, "Fourth consume should fail")
  assert(limiter2.canMakeRequest() === false, "Should not be able to make request")
  console.log("✅ Passed\n")

  // Test 3: Reset functionality
  console.log("Test 3: Reset functionality")
  const limiter3 = new TokenBucketRateLimiter({ maxTokens: 5, refillRate: 1, refillInterval: 1000 })
  limiter3.consumeToken()
  limiter3.consumeToken()
  limiter3.consumeToken()
  assert(limiter3.getTokensRemaining() === 2, "Should have 2 tokens before reset")
  limiter3.reset()
  assert(limiter3.getTokensRemaining() === 5, "Should have max tokens after reset")
  console.log("✅ Passed\n")

  // Test 4: Time until next token
  console.log("Test 4: Time until next token")
  const limiter4 = new TokenBucketRateLimiter({ maxTokens: 1, refillRate: 1, refillInterval: 5000 })
  limiter4.consumeToken()
  const timeUntilNext = limiter4.getTimeUntilNextToken()
  assert(timeUntilNext > 0 && timeUntilNext <= 5000, "Should return valid time until next token")
  console.log("✅ Passed\n")

  // Test 5: Custom configuration
  console.log("Test 5: Custom configuration")
  const limiter5 = new TokenBucketRateLimiter({ maxTokens: 10, refillRate: 2, refillInterval: 500 })
  assert(limiter5.getTokensRemaining() === 10, "Should respect custom max tokens")
  console.log("✅ Passed\n")

  console.log("🎉 All tests passed!")
}

runTests()

// Simple memory-based rate limiter for anti-DDoS protection
export const rateLimiter = new Map<string, { count: number, resetTime: number }>();

export function checkRateLimit(ip: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();

  let record = rateLimiter.get(ip);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
  } else {
    record.count += 1;
  }
  
  rateLimiter.set(ip, record);
  return record.count <= maxRequests;
}

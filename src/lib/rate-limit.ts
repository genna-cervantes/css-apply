import { NextRequest } from 'next/server';

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options;

  return (req: NextRequest) => {
    const key = keyGenerator ? keyGenerator(req) : getClientIP(req);
    const now = Date.now();

    // Clean up expired entries
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < now) {
        rateLimitMap.delete(k);
      }
    }

    const current = rateLimitMap.get(key);

    if (!current) {
      // First request in window
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { success: true, remaining: maxRequests - 1 };
    }

    if (current.resetTime < now) {
      // Window expired, reset
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return { success: true, remaining: maxRequests - 1 };
    }

    if (current.count >= maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    // Increment counter
    current.count++;
    rateLimitMap.set(key, current);

    return {
      success: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime,
    };
  };
}

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a default value since NextRequest doesn't have ip property
  return 'unknown';
}

// Predefined rate limiters for different endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 uploads per minute
});

export const adminRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 admin requests per minute
});

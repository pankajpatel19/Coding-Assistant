import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

// Helmet with custom CSP allowing specific origins
export const applyHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        "https://*.pinecone.io",
        "https://*.amazonaws.com"
      ],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// HTTP Parameter Pollution protection
export const applyHPP = hpp();

// Custom NoSQL/Mongo Sanitizer (lightweight replacement for express-mongo-sanitize)
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (obj instanceof Object) {
      for (let key in obj) {
        if (key.includes('$') || key.includes('.')) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// Global Catch-all Rate Limiter
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: "Too many requests",
    message: "Too many requests from this IP, please try again after 15 minutes"
  }
});

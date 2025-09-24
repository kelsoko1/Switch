module.exports = {
    // Server configuration
    port: process.env.PORT || 2025,
    
    // Frontend URL
    frontendUrl: 'https://kijumbesmart.co.tz',
    
    // Security settings
    cors: {
        origin: [
            'https://kijumbesmart.co.tz',
            'https://www.kijumbesmart.co.tz',
            'https://fra.cloud.appwrite.io'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Appwrite-Project',
            'X-Appwrite-Key'
        ]
    },
    
    // Rate limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    
    // Session configuration
    session: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        cookie: {
            secure: true,
            httpOnly: true,
            sameSite: 'strict'
        }
    },
    
    // Logging configuration
    logging: {
        level: 'info',
        format: 'combined',
        directory: 'logs'
    },
    
    // Cache configuration
    cache: {
        ttl: 60 * 60 * 1000, // 1 hour
        checkPeriod: 60 * 60 * 1000 // 1 hour
    },
    
    // Performance optimizations
    compression: {
        level: 6,
        threshold: 1024
    },
    
    // Security headers
    securityHeaders: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'blob:'],
                connectSrc: ["'self'", 'https://fra.cloud.appwrite.io'],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'self'"]
            }
        },
        xssFilter: true,
        noSniff: true,
        frameguard: {
            action: 'sameorigin'
        }
    }
};

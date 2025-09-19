const { AppwriteException } = require('node-appwrite');
const { account, TEAM_ROLES } = require('../config/appwrite');
const logger = require('../utils/logger');

/**
 * Middleware to verify JWT token from Appwrite
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is required'
            });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            // Set the JWT token for the client
            req.appwrite = req.appwrite || {};
            req.appwrite.jwt = token;
            
            // Get the current session
            const session = await account.getSession('current');
            
            if (!session || session.userId !== req.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired session'
                });
            }
            
            // Attach user ID to request
            req.userId = session.userId;
            
            next();
        } catch (error) {
            logger.error('Appwrite authentication error:', error);
            
            if (error.code === 401) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }
            
            throw error;
        }
    } catch (error) {
        logger.error('Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Middleware to check if user has required roles
 */
const authorize = (roles = []) => {
    return async (req, res, next) => {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // If no roles specified, allow access
            if (!roles.length) {
                return next();
            }

            // Get user teams and check roles
            const userTeams = await teams.list([
                Query.equal('userId', req.userId)
            ]);

            const userRoles = userTeams.teams
                .map(team => team.roles)
                .flat()
                .filter((role, index, self) => self.indexOf(role) === index);

            // Check if user has any of the required roles
            const hasRequiredRole = roles.some(role => userRoles.includes(role));

            if (!hasRequiredRole) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }

            next();
        } catch (error) {
            logger.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Error during authorization',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

/**
 * Middleware to handle Appwrite exceptions
 */
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppwriteException) {
        logger.error(`Appwrite Error [${err.code}]: ${err.message}`);
        
        const statusCode = err.code || 500;
        const errorResponse = {
            success: false,
            message: err.message,
            code: err.code,
            type: err.type
        };

        // Add more details in development
        if (process.env.NODE_ENV === 'development') {
            errorResponse.stack = err.stack;
            errorResponse.response = err.response;
        }

        return res.status(statusCode).json(errorResponse);
    }
    
    // Pass to default error handler if not an Appwrite exception
    next(err);
};

module.exports = {
    authenticate,
    authorize,
    errorHandler,
    TEAM_ROLES
};

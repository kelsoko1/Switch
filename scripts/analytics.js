const AppwriteUtils = require('../appwrite-utils');

class AnalyticsManager extends AppwriteUtils {
    constructor() {
        super();
        this.analyticsCollectionId = 'analytics_events';
    }

    /**
     * Track an analytics event
     * @param {string} eventName - Name of the event
     * @param {Object} eventData - Additional event data
     * @param {string} [userId] - Optional user ID
     */
    async trackEvent(eventName, eventData = {}, userId = null) {
        try {
            const event = {
                name: eventName,
                userId: userId || 'anonymous',
                timestamp: new Date().toISOString(),
                ...eventData
            };

            await this.createDocument(this.analyticsCollectionId, event);
            
        } catch (error) {
            console.error('Error tracking event:', error);
            // Don't throw, as we don't want to break the app if analytics fails
        }
    }

    /**
     * Get event counts by name
     * @param {Date} [startDate] - Optional start date filter
     * @param {Date} [endDate] - Optional end date filter
     * @returns {Promise<Object>} Event counts by name
     */
    async getEventCounts(startDate, endDate) {
        try {
            let queries = [];
            
            if (startDate) {
                queries.push(this.constructor.query('timestamp', 'greaterThanEqual', startDate.toISOString()));
            }
            
            if (endDate) {
                queries.push(this.constructor.query('timestamp', 'lessThanEqual', endDate.toISOString()));
            }
            
            // Get all events matching the filters
            const events = await this.listDocuments(this.analyticsCollectionId, queries);
            
            // Count events by name
            const counts = events.reduce((acc, event) => {
                acc[event.name] = (acc[event.name] || 0) + 1;
                return acc;
            }, {});
            
            return counts;
            
        } catch (error) {
            console.error('Error getting event counts:', error);
            throw error;
        }
    }

    /**
     * Get user activity stats
     * @param {string} userId - The ID of the user
     * @param {Date} [startDate] - Optional start date filter
     * @param {Date} [endDate] - Optional end date filter
     * @returns {Promise<Object>} User activity statistics
     */
    async getUserActivity(userId, startDate, endDate) {
        try {
            let queries = [
                this.constructor.query('userId', 'equal', userId)
            ];
            
            if (startDate) {
                queries.push(this.constructor.query('timestamp', 'greaterThanEqual', startDate.toISOString()));
            }
            
            if (endDate) {
                queries.push(this.constructor.query('timestamp', 'lessThanEqual', endDate.toISOString()));
            }
            
            // Get user's events
            const events = await this.listDocuments(this.analyticsCollectionId, queries);
            
            // Group events by day
            const dailyActivity = events.reduce((acc, event) => {
                const date = new Date(event.timestamp).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});
            
            // Get most frequent events
            const eventCounts = events.reduce((acc, event) => {
                acc[event.name] = (acc[event.name] || 0) + 1;
                return acc;
            }, {});
            
            const mostFrequentEvent = Object.entries(eventCounts).sort((a, b) => b[1] - a[1])[0] || [];
            
            return {
                totalEvents: events.length,
                firstSeen: events.length > 0 ? events[events.length - 1].timestamp : null,
                lastSeen: events.length > 0 ? events[0].timestamp : null,
                dailyActivity,
                mostFrequentEvent: mostFrequentEvent[0] || null,
                eventCounts
            };
            
        } catch (error) {
            console.error('Error getting user activity:', error);
            throw error;
        }
    }

    /**
     * Get platform usage statistics
     * @param {Date} [startDate] - Optional start date filter
     * @param {Date} [endDate] - Optional end date filter
     * @returns {Promise<Object>} Platform statistics
     */
    async getPlatformStats(startDate, endDate) {
        try {
            let queries = [];
            
            if (startDate) {
                queries.push(this.constructor.query('timestamp', 'greaterThanEqual', startDate.toISOString()));
            }
            
            if (endDate) {
                queries.push(this.constructor.query('timestamp', 'lessThanEqual', endDate.toISOString()));
            }
            
            // Get all events
            const events = await this.listDocuments(this.analyticsCollectionId, queries);
            
            // Get unique users
            const uniqueUsers = new Set(events.map(e => e.userId));
            
            // Group events by day
            const dailyEvents = events.reduce((acc, event) => {
                const date = new Date(event.timestamp).toISOString().split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});
            
            // Count events by type
            const eventCounts = events.reduce((acc, event) => {
                acc[event.name] = (acc[event.name] || 0) + 1;
                return acc;
            }, {});
            
            return {
                totalEvents: events.length,
                uniqueUsers: uniqueUsers.size,
                dailyEvents,
                eventCounts,
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null
            };
            
        } catch (error) {
            console.error('Error getting platform stats:', error);
            throw error;
        }
    }
}

// Example usage
async function example() {
    const analytics = new AnalyticsManager();
    const userId = 'user123';
    
    try {
        // Example: Track a user login
        // await analytics.trackEvent('user_login', { source: 'mobile' }, userId);
        
        // Example: Get today's event counts
        // const today = new Date();
        // today.setHours(0, 0, 0, 0);
        // const counts = await analytics.getEventCounts(today);
        // console.log("Today's events:", counts);
        
        // Example: Get user activity for the last 7 days
        // const sevenDaysAgo = new Date();
        // sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        // const userActivity = await analytics.getUserActivity(userId, sevenDaysAgo);
        // console.log('User activity:', userActivity);
        
        // Example: Get platform statistics
        // const platformStats = await analytics.getPlatformStats(sevenDaysAgo);
        // console.log('Platform stats:', platformStats);
        
    } catch (error) {
        console.error('Example failed:', error);
    }
}

// Uncomment to run the example
// example().catch(console.error);

module.exports = AnalyticsManager;

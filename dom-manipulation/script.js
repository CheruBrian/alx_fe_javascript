 // server-simulator.js
class ServerSimulator {
    constructor() {
        this.baseUrl = 'https://jsonplaceholder.typicode.com';
        this.quotesEndpoint = '/posts'; // We'll use posts as quotes
        this.lastSync = null;
    }

    // Simulate fetching quotes from server
    async fetchQuotes() {
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
            
            const response = await fetch(`${this.baseUrl}${this.quotesEndpoint}`);
            if (!response.ok) throw new Error('Failed to fetch quotes');
            
            const posts = await response.json();
            // Convert posts to quotes format
            const quotes = posts.slice(0, 10).map(post => ({
                id: `server-${post.id}`,
                text: post.title,
                author: `User ${post.userId}`,
                timestamp: new Date().toISOString(),
                source: 'server'
            }));
            
            this.lastSync = new Date().toISOString();
            return quotes;
        } catch (error) {
            console.error('Error fetching quotes:', error);
            throw error;
        }
    }

    // Simulate posting quotes to server
    async postQuotes(quotes) {
        try {
            // Simulate network delay and occasional failures
            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
            
            // Simulate 10% chance of server error
            if (Math.random() < 0.1) {
                throw new Error('Server temporarily unavailable');
            }

            // In a real app, you'd send the quotes to the server
            // For simulation, we'll just return success
            const serverQuotes = quotes.map(quote => ({
                ...quote,
                serverId: `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                lastSynced: new Date().toISOString()
            }));

            this.lastSync = new Date().toISOString();
            return serverQuotes;
        } catch (error) {
            console.error('Error posting quotes:', error);
            throw error;
        }
    }

    // Simulate getting server timestamp for conflict resolution
    async getServerTimestamp() {
        await new Promise(resolve => setTimeout(resolve, 200));
        return new Date().toISOString();
    }
}


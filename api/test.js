module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        console.log('Test function called');
        console.log('Request method:', req.method);
        console.log('Request body:', JSON.stringify(req.body));
        
        res.status(200).json({ 
            message: 'Test function working',
            received: req.body,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Test function error:', error);
        res.status(500).json({ 
            error: error.message,
            stack: error.stack
        });
    }
};
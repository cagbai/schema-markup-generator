const https = require('https');
const http = require('http');

async function fetchWebsiteContent(websiteUrl) {
    return new Promise((resolve, reject) => {
        try {
            const parsedUrl = new URL(websiteUrl);
            const protocol = parsedUrl.protocol === 'https:' ? https : http;
            
            const options = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; Schema Generator Bot)'
                },
                timeout: 10000
            };
            
            const req = protocol.request(options, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                    return;
                }
                
                let data = '';
                res.setEncoding('utf8');
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.end();
        } catch (err) {
            reject(err);
        }
    });
}

function extractBasicData(html, types) {
    const result = {};
    
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    
    if (types.includes('product')) {
        result.product = {
            name: titleMatch ? titleMatch[1].trim() : '',
            description: descMatch ? descMatch[1].trim() : ''
        };
    }
    
    if (types.includes('breadcrumb')) {
        result.breadcrumb = [];
        if (titleMatch) {
            result.breadcrumb.push({ name: 'Home', url: '/' });
            result.breadcrumb.push({ name: titleMatch[1].trim(), url: '#' });
        }
    }
    
    return result;
}

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { url: websiteUrl, types } = req.body || {};
        
        if (!websiteUrl || !websiteUrl.startsWith('http')) {
            return res.status(400).json({ 
                error: 'Please provide a valid URL starting with http:// or https://' 
            });
        }
        
        console.log('Fetching:', websiteUrl);
        const html = await fetchWebsiteContent(websiteUrl);
        
        console.log('Extracting data for types:', types);
        const extractedData = extractBasicData(html, types || []);
        
        res.status(200).json(extractedData);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            error: error.message || 'Failed to analyze website'
        });
    }
};
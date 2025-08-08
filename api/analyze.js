const https = require('https');
const http = require('http');

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
    const entities = {
        '&#x27;': "'",
        '&quot;': '"',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&#39;': "'",
        '&apos;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#x3D;': '='
    };
    
    return text.replace(/&#?\w+;/g, (entity) => {
        return entities[entity] || entity;
    });
}

// Helper to fetch and parse website content
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
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                },
                timeout: 10000
            };
            
            if (parsedUrl.port) {
                options.port = parsedUrl.port;
            }
            
            const req = protocol.request(options, (res) => {
                // Handle redirects
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const redirectUrl = res.headers.location.startsWith('http') 
                        ? res.headers.location 
                        : new URL(res.headers.location, websiteUrl).toString();
                    fetchWebsiteContent(redirectUrl).then(resolve).catch(reject);
                    return;
                }
                
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    return;
                }
                
                let data = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve(data);
                });
            });
            
            req.on('error', (err) => {
                reject(err);
            });
            
            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.end();
        } catch (err) {
            reject(err);
        }
    });
}

// Extract structured data from HTML (simplified version)
function extractStructuredData(html, types, websiteUrl) {
    const result = {};
    
    // Extract basic meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    
    // Try to extract product data
    if (types.includes('product')) {
        result.product = {
            name: titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : '',
            description: descMatch ? decodeHtmlEntities(descMatch[1].trim()) : ''
        };
    }
    
    // Try to extract breadcrumb data from URL
    if (types.includes('breadcrumb') && websiteUrl) {
        result.breadcrumb = [];
        try {
            const urlObj = new URL(websiteUrl);
            const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
            
            result.breadcrumb.push({
                name: 'Home',
                url: urlObj.origin
            });
            
            let currentPath = '';
            pathParts.forEach((part) => {
                currentPath += '/' + part;
                const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
                result.breadcrumb.push({
                    name: name,
                    url: urlObj.origin + currentPath
                });
            });
        } catch (e) {
            // URL parsing failed
        }
    }
    
    // Extract existing schema markup
    result.existingSchema = [];
    
    // Look for JSON-LD scripts
    const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    jsonLdMatches.forEach((match, index) => {
        try {
            const jsonContent = match[1].trim();
            
            // Validate content looks like JSON before parsing
            if (!jsonContent || (!jsonContent.startsWith('{') && !jsonContent.startsWith('['))) {
                result.existingSchema.push({
                    type: 'JSON-LD',
                    index: index + 1,
                    error: 'Content is not valid JSON format',
                    raw: jsonContent
                });
                return;
            }
            
            const schemaData = JSON.parse(jsonContent);
            result.existingSchema.push({
                type: 'JSON-LD',
                index: index + 1,
                data: schemaData,
                raw: jsonContent
            });
        } catch (e) {
            result.existingSchema.push({
                type: 'JSON-LD',
                index: index + 1,
                error: 'Invalid JSON',
                raw: match[1].trim()
            });
        }
    });
    
    return result;
}

// Main handler function
module.exports = async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        // Parse request body
        const { url: websiteUrl, types } = req.body || {};
        
        if (!websiteUrl || !websiteUrl.startsWith('http')) {
            res.status(400).json({ 
                error: 'Please provide a valid URL starting with http:// or https://' 
            });
            return;
        }
        
        console.log('Analyzing:', websiteUrl);
        
        // Fetch website content
        const html = await fetchWebsiteContent(websiteUrl);
        console.log('Fetched', html.length, 'characters');
        
        // Extract data
        const extractedData = extractStructuredData(html, types || [], websiteUrl);
        
        // Send response
        res.status(200).json(extractedData);
        
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ 
            error: error.message || 'Failed to analyze website',
            details: 'The website may be blocking automated requests'
        });
    }
};
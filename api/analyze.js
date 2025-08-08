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
            // Parse the URL
            const parsedUrl = new URL(websiteUrl);
            const protocol = parsedUrl.protocol === 'https:' ? https : http;
            
            const options = {
                hostname: parsedUrl.hostname,
                path: parsedUrl.pathname + parsedUrl.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
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
                
                // Handle compression
                if (res.headers['content-encoding'] === 'gzip') {
                    const zlib = require('zlib');
                    const gunzip = zlib.createGunzip();
                    res.pipe(gunzip);
                    gunzip.on('data', (chunk) => {
                        data += chunk.toString();
                    });
                    gunzip.on('end', () => {
                        resolve(data);
                    });
                } else {
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    res.on('end', () => {
                        resolve(data);
                    });
                }
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

// Extract structured data from HTML
function extractStructuredData(html, types, websiteUrl) {
    const result = {};
    
    // Extract basic meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    
    // Try to extract product data
    if (types.includes('product')) {
        result.product = {
            name: titleMatch ? decodeHtmlEntities(titleMatch[1].trim()) : '',
            description: descMatch ? decodeHtmlEntities(descMatch[1].trim()) : '',
            image: ogImageMatch ? ogImageMatch[1].trim() : ''
        };
        
        // Try to find price patterns
        const priceMatch = html.match(/\$(\d+(?:\.\d{2})?)|(\d+(?:\.\d{2})?)\s*USD/i);
        if (priceMatch) {
            result.product.price = priceMatch[1] || priceMatch[2];
            result.product.currency = 'USD';
        }
    }
    
    // Try to extract breadcrumb data
    if (types.includes('breadcrumb')) {
        result.breadcrumb = [];
        
        // Method 1: Look for structured breadcrumb HTML
        const breadcrumbPatterns = [
            /<nav[^>]*aria-label=["']breadcrumb["'][^>]*>([\s\S]*?)<\/nav>/i,
            /<nav[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i,
            /<ol[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>([\s\S]*?)<\/ol>/i,
            /<ul[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>([\s\S]*?)<\/ul>/i,
            /<div[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
        ];
        
        for (let pattern of breadcrumbPatterns) {
            const breadcrumbMatch = html.match(pattern);
            if (breadcrumbMatch) {
                const links = breadcrumbMatch[1].match(/<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi);
                if (links) {
                    links.forEach(link => {
                        const hrefMatch = link.match(/href=["']([^"']+)["']/i);
                        const textMatch = link.match(/>([^<]+)</);
                        if (hrefMatch && textMatch) {
                            result.breadcrumb.push({
                                name: decodeHtmlEntities(textMatch[1].trim()),
                                url: hrefMatch[1]
                            });
                        }
                    });
                }
                break;
            }
        }
        
        // Method 2: Look for breadcrumb-like text patterns
        if (result.breadcrumb.length === 0) {
            const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
            const breadcrumbTextPattern = /Home\s*[>\u203a\u00bb]\s*([^>\u203a\u00bb]+)(?:\s*[>\u203a\u00bb]\s*([^>\u203a\u00bb]+))?(?:\s*[>\u203a\u00bb]\s*([^>\u203a\u00bb]+))?/i;
            const textMatch = plainText.match(breadcrumbTextPattern);
            
            if (textMatch) {
                result.breadcrumb.push({ name: 'Home', url: '/' });
                for (let i = 1; i < textMatch.length; i++) {
                    if (textMatch[i]) {
                        const name = textMatch[i].trim();
                        if (name && name.length < 50) {
                            result.breadcrumb.push({
                                name: decodeHtmlEntities(name),
                                url: '#'
                            });
                        }
                    }
                }
            }
        }
        
        // Method 3: Generate breadcrumbs from URL structure as fallback
        if (result.breadcrumb.length === 0 && websiteUrl) {
            try {
                const urlObj = new URL(websiteUrl);
                const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
                
                if (pathParts.length > 0) {
                    result.breadcrumb.push({
                        name: 'Home',
                        url: urlObj.origin
                    });
                    
                    let currentPath = '';
                    pathParts.forEach((part, index) => {
                        currentPath += '/' + part;
                        const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
                        result.breadcrumb.push({
                            name: name,
                            url: urlObj.origin + currentPath
                        });
                    });
                }
            } catch (e) {
                console.log('Could not generate breadcrumbs from URL:', e.message);
            }
        }
    }
    
    // Try to extract FAQ data
    if (types.includes('faq')) {
        result.faq = [];
        
        // Method 1: Look for structured FAQ sections
        const faqSection = html.match(/<(?:section|div)[^>]*class=["'][^"']*faq[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|div)>/i);
        if (faqSection) {
            const questions = faqSection[1].match(/<h[2-6][^>]*>([^<]+)<\/h[2-6]>/gi);
            const answers = faqSection[1].match(/<p[^>]*>([^<]+)<\/p>/gi);
            
            if (questions && answers) {
                const minLength = Math.min(questions.length, answers.length);
                for (let i = 0; i < minLength; i++) {
                    const qText = questions[i].replace(/<[^>]+>/g, '').trim();
                    const aText = answers[i].replace(/<[^>]+>/g, '').trim();
                    if (qText && aText) {
                        result.faq.push({
                            question: qText,
                            answer: aText
                        });
                    }
                }
            }
        }
        
        // Method 2: Look for FAQ patterns in text content
        if (result.faq.length === 0) {
            const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
            
            const qPatterns = [
                /Q:\s*([^?]+\?)/gi,
                /###\s*What\s+([^?]+\?)/gi,
                /###\s*How\s+([^?]+\?)/gi,
                /###\s*Why\s+([^?]+\?)/gi,
                /###\s*Can\s+([^?]+\?)/gi,
                /###\s*Does\s+([^?]+\?)/gi
            ];
            
            for (let pattern of qPatterns) {
                const matches = [...plainText.matchAll(pattern)];
                if (matches.length > 0) {
                    for (let match of matches) {
                        const question = match[1].trim();
                        if (question.length > 10 && question.length < 200) {
                            const questionIndex = plainText.indexOf(match[0]);
                            const nextQuestionMatch = plainText.substring(questionIndex + match[0].length).match(/(?:Q:|###\s*(?:What|How|Why|Can|Does))/);
                            const answerEnd = nextQuestionMatch ? questionIndex + match[0].length + nextQuestionMatch.index : questionIndex + match[0].length + 500;
                            const answerText = plainText.substring(questionIndex + match[0].length, answerEnd).trim();
                            
                            if (answerText && answerText.length > 20 && answerText.length < 1000) {
                                result.faq.push({
                                    question: decodeHtmlEntities(question),
                                    answer: decodeHtmlEntities(answerText.substring(0, 500))
                                });
                            }
                        }
                    }
                    break;
                }
            }
        }
        
        result.faq = result.faq.slice(0, 10);
    }
    
    // Try to extract carousel/list data
    if (types.includes('carousel')) {
        result.carousel = [];
        
        // Method 1: Look for common carousel/slider structures
        const carouselPatterns = [
            /<(?:div|section)[^>]*class=["'][^"']*(?:carousel|slider|swiper)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi,
            /<(?:div|section)[^>]*class=["'][^"']*(?:testimonial|review)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi,
            /<(?:div|section)[^>]*class=["'][^"']*(?:card|item)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/gi
        ];
        
        for (let pattern of carouselPatterns) {
            const matches = [...html.matchAll(pattern)];
            if (matches.length >= 2) {
                matches.slice(0, 6).forEach((match, index) => {
                    const itemHtml = match[1];
                    
                    const titleMatch = itemHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) || 
                                     itemHtml.match(/<[^>]*class=["'][^"']*(?:title|name|heading)[^"']*["'][^>]*>([^<]+)<\/[^>]*>/i);
                    
                    const linkMatch = itemHtml.match(/<a[^>]*href=["']([^"']+)["'][^>]*>/i);
                    const imageMatch = itemHtml.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
                    const descMatch = itemHtml.match(/<p[^>]*>([^<]+)<\/p>/i);
                    
                    if (titleMatch && titleMatch[1].trim().length > 2) {
                        const item = {
                            name: decodeHtmlEntities(titleMatch[1].trim()),
                            url: linkMatch ? linkMatch[1] : '#',
                            image: imageMatch ? imageMatch[1] : '',
                            description: descMatch ? decodeHtmlEntities(descMatch[1].trim()) : '',
                            price: ''
                        };
                        
                        if (item.name.length < 100) {
                            result.carousel.push(item);
                        }
                    }
                });
                
                if (result.carousel.length >= 2) {
                    break;
                }
            }
        }
        
        // Method 2: Look for service/product grids
        if (result.carousel.length === 0) {
            const headings = [...html.matchAll(/<h[2-4][^>]*>([^<]+)<\/h[2-4]>/gi)];
            if (headings.length >= 3) {
                headings.slice(0, 8).forEach(heading => {
                    const title = heading[1].trim();
                    if (title.length > 5 && title.length < 80 && 
                        !title.toLowerCase().includes('about') && 
                        !title.toLowerCase().includes('contact')) {
                        
                        result.carousel.push({
                            name: decodeHtmlEntities(title),
                            url: '#',
                            image: '',
                            description: '',
                            price: ''
                        });
                    }
                });
            }
        }
        
        // Method 3: Extract from structured lists
        if (result.carousel.length === 0) {
            const listItems = [...html.matchAll(/<li[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/li>/gi)];
            if (listItems.length >= 3) {
                listItems.slice(0, 6).forEach(item => {
                    const text = item[1].replace(/<[^>]*>/g, ' ').trim();
                    if (text.length > 5 && text.length < 60) {
                        result.carousel.push({
                            name: decodeHtmlEntities(text),
                            url: '#',
                            image: '',
                            description: '',
                            price: ''
                        });
                    }
                });
            }
        }
        
        result.carousel = result.carousel.slice(0, 6);
    }
    
    // Extract existing schema markup
    result.existingSchema = [];
    
    // Look for JSON-LD scripts
    const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    jsonLdMatches.forEach((match, index) => {
        try {
            const jsonContent = match[1].trim();
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
    
    // Look for microdata
    const microdataElements = [...html.matchAll(/<[^>]+itemscope[^>]*>/gi)];
    if (microdataElements.length > 0) {
        result.existingSchema.push({
            type: 'Microdata',
            count: microdataElements.length,
            note: 'Microdata detected (detailed extraction not implemented)'
        });
    }
    
    // Look for RDFa
    const rdfaElements = [...html.matchAll(/<[^>]+(?:property|typeof|vocab)[^>]*>/gi)];
    if (rdfaElements.length > 0) {
        result.existingSchema.push({
            type: 'RDFa',
            count: rdfaElements.length,
            note: 'RDFa detected (detailed extraction not implemented)'
        });
    }
    
    return result;
}

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
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is required' });
        }
        
        const { url: websiteUrl, types } = req.body;
        
        console.log(`Analyzing website: ${websiteUrl}`, { types });
        
        if (!websiteUrl || !websiteUrl.startsWith('http')) {
            return res.status(400).json({ 
                error: 'Please provide a valid URL starting with http:// or https://' 
            });
        }
        
        if (!types || !Array.isArray(types) || types.length === 0) {
            return res.status(400).json({ 
                error: 'Please select at least one schema type' 
            });
        }
        
        const html = await fetchWebsiteContent(websiteUrl);
        console.log(`Fetched ${html.length} characters from ${websiteUrl}`);
        
        const extractedData = extractStructuredData(html, types, websiteUrl);
        console.log('Extraction complete:', Object.keys(extractedData));
        
        res.status(200).json(extractedData);
    } catch (error) {
        console.error('Error analyzing website:', error);
        res.status(500).json({ 
            error: error.message || 'Unknown error occurred',
            details: 'The website may be blocking automated requests or be temporarily unavailable'
        });
    }
}
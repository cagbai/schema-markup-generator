/**
 * Enhanced JSON-LD Validator
 * Fixes the issue where valid JSON-LD is incorrectly marked as invalid
 */

/**
 * Validates JSON-LD content with better error handling
 * @param {string} content - The raw content to validate
 * @returns {Object} - { valid: boolean, data?: object, error?: string }
 */
function validateJsonLd(content) {
    // Handle empty or invalid input
    if (!content || typeof content !== 'string') {
        return { 
            valid: false, 
            error: 'Empty or invalid content' 
        };
    }
    
    let trimmed = content.trim();
    
    // Handle empty strings after trimming
    if (!trimmed) {
        return { 
            valid: false, 
            error: 'Empty content' 
        };
    }
    
    // Remove potential BOM (Byte Order Mark)
    if (trimmed.charCodeAt(0) === 0xFEFF) {
        trimmed = trimmed.slice(1);
    }
    
    // Handle JSONP callbacks (some sites wrap JSON-LD in callbacks)
    const jsonpMatch = trimmed.match(/^[\w$]+\((.*)\);?$/s);
    if (jsonpMatch) {
        trimmed = jsonpMatch[1];
    }
    
    // Check if it looks like JSON at all
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        // Check for HTML content
        if (trimmed.startsWith('<')) {
            return { 
                valid: false, 
                error: 'HTML content instead of JSON-LD' 
            };
        }
        return { 
            valid: false, 
            error: 'Content does not appear to be JSON' 
        };
    }
    
    try {
        // Attempt to parse the JSON
        const parsed = JSON.parse(trimmed);
        
        // Validate it's actually schema.org content
        const isValidSchema = validateSchemaContent(parsed);
        
        if (!isValidSchema.valid) {
            return isValidSchema;
        }
        
        return { 
            valid: true, 
            data: parsed 
        };
        
    } catch (e) {
        // Provide more helpful error messages
        let errorMessage = 'Invalid JSON: ';
        
        if (e.message.includes('Unexpected token')) {
            // Try to identify common issues
            if (trimmed.includes('<!--') || trimmed.includes('-->')) {
                errorMessage = 'JSON contains HTML comments';
            } else if (trimmed.includes('&quot;') || trimmed.includes('&amp;')) {
                errorMessage = 'JSON contains unescaped HTML entities';
            } else {
                errorMessage += e.message;
            }
        } else {
            errorMessage += e.message;
        }
        
        return { 
            valid: false, 
            error: errorMessage 
        };
    }
}

/**
 * Validates that parsed JSON is actually schema.org content
 * @param {any} parsed - The parsed JSON object
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateSchemaContent(parsed) {
    // Handle null or undefined
    if (parsed === null || parsed === undefined) {
        return { 
            valid: false, 
            error: 'Parsed content is null or undefined' 
        };
    }
    
    // Check for array of schemas
    if (Array.isArray(parsed)) {
        // Empty array is not valid schema
        if (parsed.length === 0) {
            return { 
                valid: false, 
                error: 'Empty array is not valid schema markup' 
            };
        }
        
        // Check if at least one item has schema indicators
        const hasValidSchema = parsed.some(item => 
            item && (
                item['@context'] || 
                item['@type'] || 
                item['type'] ||
                item['@graph']
            )
        );
        
        if (hasValidSchema) {
            return { valid: true };
        }
        
        return { 
            valid: false, 
            error: 'Array items do not contain valid schema.org markup' 
        };
    }
    
    // Check for object with schema indicators
    if (typeof parsed === 'object') {
        // Check for standard schema.org properties
        const hasContext = parsed['@context'];
        const hasType = parsed['@type'] || parsed['type'];
        const hasGraph = parsed['@graph'];
        
        // Valid if it has @context or @graph
        if (hasContext || hasGraph) {
            return { valid: true };
        }
        
        // Also valid if it has @type (some schemas omit @context)
        if (hasType) {
            // Common schema types that might not have @context
            const validTypes = [
                'Product', 'Organization', 'Person', 'Article', 
                'WebPage', 'Event', 'LocalBusiness', 'Review',
                'BreadcrumbList', 'FAQPage', 'ItemList'
            ];
            
            const typeValue = Array.isArray(hasType) ? hasType[0] : hasType;
            
            // Check if it's a known schema type
            if (validTypes.some(t => typeValue.includes(t))) {
                return { valid: true };
            }
            
            // Still valid even if not in our list - it has @type
            return { valid: true };
        }
        
        // Check for nested @graph (some sites use wrapper objects)
        if (parsed.hasOwnProperty('@graph') && Array.isArray(parsed['@graph'])) {
            return { valid: true };
        }
        
        return { 
            valid: false, 
            error: 'Object does not contain schema.org indicators (@context, @type, or @graph)' 
        };
    }
    
    // Not an object or array
    return { 
        valid: false, 
        error: 'Content is not an object or array' 
    };
}

/**
 * Extracts the top-level schema types from validated JSON-LD
 * @param {any} data - The validated schema data
 * @returns {Array} - Array of type strings
 */
function extractSchemaTypes(data) {
    const types = [];
    
    if (!data) return types;
    
    // Handle arrays
    if (Array.isArray(data)) {
        data.forEach(item => {
            const itemTypes = extractSchemaTypes(item);
            types.push(...itemTypes);
        });
        return types;
    }
    
    // Handle @graph
    if (data['@graph'] && Array.isArray(data['@graph'])) {
        data['@graph'].forEach(item => {
            const itemTypes = extractSchemaTypes(item);
            types.push(...itemTypes);
        });
        return types;
    }
    
    // Handle @type
    if (data['@type']) {
        if (Array.isArray(data['@type'])) {
            types.push(...data['@type']);
        } else {
            types.push(data['@type']);
        }
    }
    
    // Handle type (without @)
    if (data['type']) {
        if (Array.isArray(data['type'])) {
            types.push(...data['type']);
        } else {
            types.push(data['type']);
        }
    }
    
    return types;
}

// Make functions available globally
window.validateJsonLd = validateJsonLd;
window.extractSchemaTypes = extractSchemaTypes;
/**
 * LS Retail Option A - Security Fixes and Sanitization
 * Addresses all critical XSS and injection vulnerabilities
 * 
 * USAGE: Include this before option-a-lsretail-cookie-enhancer.js
 * OR integrate functions into main file
 */

// Content Security Policy Nonce Support
const SecurityManager = {
    // Generate CSP-compatible nonce for dynamic content
    nonce: null,
    
    init: function() {
        // Extract nonce from existing script tag or generate
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.nonce) {
                this.nonce = script.nonce;
                break;
            }
        }
        
        // Fallback: Generate secure random nonce
        if (!this.nonce) {
            this.nonce = this.generateNonce();
        }
        
        console.log('[LS Retail Security]', 'Security Manager initialized with nonce:', this.nonce ? 'present' : 'missing');
    },
    
    generateNonce: function() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode.apply(null, array)).replace(/[+/=]/g, '');
    },
    
    // HTML Sanitization for rich content
    sanitizeHTML: function(html) {
        if (!html) return '';
        
        // Create safe parsing environment
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Allowed tags for cookie descriptions
        const allowedTags = ['p', 'strong', 'em', 'ul', 'li', 'br'];
        const allowedAttributes = ['class']; // Very restricted
        
        this.cleanNode(doc.body, allowedTags, allowedAttributes);
        return doc.body.innerHTML;
    },
    
    cleanNode: function(node, allowedTags, allowedAttributes) {
        const walker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_ELEMENT,
            null,
            false
        );
        
        const nodesToRemove = [];
        let currentNode = walker.nextNode();
        
        while (currentNode) {
            const tagName = currentNode.tagName.toLowerCase();
            
            if (!allowedTags.includes(tagName)) {
                // Remove disallowed tags but keep content
                nodesToRemove.push(currentNode);
            } else {
                // Clean attributes
                const attributes = Array.from(currentNode.attributes);
                attributes.forEach(attr => {
                    if (!allowedAttributes.includes(attr.name.toLowerCase())) {
                        currentNode.removeAttribute(attr.name);
                    }
                });
            }
            
            currentNode = walker.nextNode();
        }
        
        // Remove disallowed elements
        nodesToRemove.forEach(node => {
            const parent = node.parentNode;
            while (node.firstChild) {
                parent.insertBefore(node.firstChild, node);
            }
            parent.removeChild(node);
        });
    },
    
    // Text sanitization for plain content
    sanitizeText: function(text) {
        if (!text) return '';
        
        // Remove any HTML tags and decode entities
        const temp = document.createElement('div');
        temp.innerHTML = text;
        return temp.textContent || temp.innerText || '';
    },
    
    // Create secure element with content
    createSecureElement: function(tagName, textContent, className) {
        const element = document.createElement(tagName);
        
        if (textContent) {
            element.textContent = this.sanitizeText(textContent);
        }
        
        if (className) {
            element.className = this.sanitizeText(className);
        }
        
        // Add nonce if it's a script or style element
        if ((tagName === 'script' || tagName === 'style') && this.nonce) {
            element.nonce = this.nonce;
        }
        
        return element;
    },
    
    // Secure HTML template creation
    createSecureTemplate: function(templateData) {
        const container = document.createElement('div');
        
        Object.keys(templateData).forEach(key => {
            const value = templateData[key];
            const element = document.createElement('div');
            element.className = key;
            element.textContent = this.sanitizeText(value);
            container.appendChild(element);
        });
        
        return container;
    },
    
    // Generate secure random ID
    generateSecureId: function(prefix = 'ls') {
        const randomBytes = new Uint8Array(8);
        crypto.getRandomValues(randomBytes);
        const randomId = Array.from(randomBytes, byte => 
            byte.toString(16).padStart(2, '0')
        ).join('');
        return `${prefix}-${randomId}`;
    },
    
    // Validate URL to prevent javascript: protocol attacks
    validateURL: function(url) {
        if (!url) return '';
        
        try {
            const urlObj = new URL(url, window.location.origin);
            const allowedProtocols = ['http:', 'https:', 'mailto:'];
            
            if (allowedProtocols.includes(urlObj.protocol)) {
                return urlObj.href;
            }
        } catch (e) {
            console.error('[LS Retail Security]', 'Invalid URL:', url);
        }
        
        return ''; // Return empty string for invalid URLs
    }
};

// Secure replacements for vulnerable functions
const SecureImplementation = {
    // Secure category element creation
    createSecureCategoryElement: function(category) {
        const categoryEl = document.createElement('div');
        categoryEl.className = 'ls-category';
        categoryEl.setAttribute('data-category', SecurityManager.sanitizeText(category.key));
        
        // Create header with secure content
        const header = document.createElement('div');
        header.className = 'ls-category-header';
        
        // Category info section
        const categoryInfo = document.createElement('div');
        categoryInfo.className = 'ls-category-info';
        
        const iconSpan = SecurityManager.createSecureElement('span', category.icon, 'ls-category-icon');
        const labelSpan = SecurityManager.createSecureElement('span', category.label, 'ls-category-label');
        
        categoryInfo.appendChild(iconSpan);
        categoryInfo.appendChild(labelSpan);
        
        // Controls section
        const controls = document.createElement('div');
        controls.className = 'ls-category-controls';
        
        // Secure Learn More button
        const learnMoreBtn = SecurityManager.createSecureElement('button', 'Learn More', 'ls-learn-more-btn');
        learnMoreBtn.setAttribute('data-category', SecurityManager.sanitizeText(category.key));
        learnMoreBtn.setAttribute('aria-expanded', 'false');
        learnMoreBtn.setAttribute('type', 'button'); // Prevent form submission
        
        // Secure toggle
        const toggleLabel = document.createElement('label');
        toggleLabel.className = 'ls-toggle';
        toggleLabel.setAttribute('aria-label', `Enable ${SecurityManager.sanitizeText(category.label)}`);
        
        const toggleInput = document.createElement('input');
        toggleInput.type = 'checkbox';
        toggleInput.className = 'ls-toggle-input';
        toggleInput.setAttribute('data-category', SecurityManager.sanitizeText(category.key));
        
        if (category.required) {
            toggleInput.checked = true;
            toggleInput.disabled = true;
        }
        
        const toggleSlider = document.createElement('span');
        toggleSlider.className = 'ls-toggle-slider';
        
        toggleLabel.appendChild(toggleInput);
        toggleLabel.appendChild(toggleSlider);
        
        controls.appendChild(learnMoreBtn);
        controls.appendChild(toggleLabel);
        
        header.appendChild(categoryInfo);
        header.appendChild(controls);
        categoryEl.appendChild(header);
        
        // Secure details section
        const details = document.createElement('div');
        details.className = 'ls-category-details';
        details.style.display = 'none';
        details.setAttribute('role', 'region');
        details.setAttribute('aria-labelledby', `category-${SecurityManager.sanitizeText(category.id)}-header`);
        
        // Secure description
        const description = document.createElement('div');
        description.className = 'ls-category-description';
        
        const descriptionPara = document.createElement('p');
        descriptionPara.textContent = SecurityManager.sanitizeText(category.description);
        description.appendChild(descriptionPara);
        
        details.appendChild(description);
        categoryEl.appendChild(details);
        
        return categoryEl;
    },
    
    // Secure cookie list creation
    createSecureCookiesList: function(cookieData) {
        const container = document.createElement('div');
        container.className = 'ls-cookies-list';
        
        if (!cookieData || cookieData.length === 0) {
            const noCookiesMsg = document.createElement('p');
            noCookiesMsg.textContent = 'No specific cookies defined for this category.';
            container.appendChild(noCookiesMsg);
            return container;
        }
        
        const header = SecurityManager.createSecureElement('h4', 'Cookies in this category:', '');
        container.appendChild(header);
        
        const list = document.createElement('ul');
        
        cookieData.forEach(cookie => {
            const item = document.createElement('li');
            item.className = 'ls-cookie-item';
            
            // Cookie header
            const cookieHeader = document.createElement('div');
            cookieHeader.className = 'ls-cookie-header';
            
            const cookieName = SecurityManager.createSecureElement('strong', cookie.cookie_name, '');
            const duration = SecurityManager.createSecureElement('span', cookie.duration, 'ls-cookie-duration');
            
            cookieHeader.appendChild(cookieName);
            cookieHeader.appendChild(duration);
            
            // Cookie purpose  
            const purpose = SecurityManager.createSecureElement('div', cookie.purpose, 'ls-cookie-purpose');
            
            // Cookie description (sanitized HTML allowed)
            const description = document.createElement('div');
            description.className = 'ls-cookie-description';
            description.innerHTML = SecurityManager.sanitizeHTML(cookie.description);
            
            item.appendChild(cookieHeader);
            item.appendChild(purpose);
            item.appendChild(description);
            
            list.appendChild(item);
        });
        
        container.appendChild(list);
        return container;
    }
};

// CSP-Compliant Style Management
const SecureStyleManager = {
    // CSS custom properties for secure styling
    setCSSProperty: function(element, property, value) {
        // Validate CSS property name
        if (!this.isValidCSSProperty(property)) {
            console.error('[LS Retail Security]', 'Invalid CSS property:', property);
            return;
        }
        
        // Sanitize CSS value
        const sanitizedValue = this.sanitizeCSSValue(value);
        element.style.setProperty(property, sanitizedValue);
    },
    
    isValidCSSProperty: function(property) {
        const allowedProperties = [
            'opacity', 'max-height', 'transition', 'transform',
            'padding-top', 'padding-bottom', '--natural-height'
        ];
        return allowedProperties.includes(property);
    },
    
    sanitizeCSSValue: function(value) {
        // Remove potentially dangerous CSS constructs
        const sanitized = String(value)
            .replace(/[<>'"]/g, '') // Remove HTML/JS injection chars
            .replace(/url\(/gi, '') // Remove url() functions
            .replace(/expression\(/gi, '') // Remove IE expressions
            .replace(/javascript:/gi, ''); // Remove JS protocol
        
        return sanitized;
    },
    
    // Secure transition management
    setSecureTransition: function(element, property, duration, easing) {
        const validProperty = this.sanitizeCSSValue(property);
        const validDuration = this.sanitizeCSSValue(duration + 'ms');
        const validEasing = this.sanitizeCSSValue(easing);
        
        this.setCSSProperty(element, 'transition', `${validProperty} ${validDuration} ${validEasing}`);
    }
};

// Initialize security manager
document.addEventListener('DOMContentLoaded', function() {
    SecurityManager.init();
});

// Export for use in main implementation
window.LSRetailSecurity = {
    SecurityManager,
    SecureImplementation,
    SecureStyleManager
};
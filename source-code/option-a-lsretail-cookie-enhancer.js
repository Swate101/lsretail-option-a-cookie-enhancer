/**
 * LS Retail Cookie Banner Enhancer - Option A Implementation
 * Individual "Learn More" Links with Category Injection
 * Based on live banner analysis of LS Retail's HubSpot implementation
 * @version 1.0.0 - Option A
 */

(function() {
    'use strict';

    // Configuration based on live analysis
    const CONFIG = {
        portalId: '491011', // LS Retail's actual portal ID
        hubdbTableId: 'YOUR_HUBDB_TABLE_ID', // Replace with HubDB table ID
        apiEndpoint: '/hubdb/api/v2/tables',
        cacheKey: 'lsretail_option_a_cookies',
        cacheDuration: 86400000, // 24 hours
        
        // Exact selectors from live analysis
        selectors: {
            banner: '#hs-eu-cookie-confirmation',
            inner: '#hs-eu-cookie-confirmation-inner',
            settingsBtn: '#hs-eu-cookie-settings-button',
            policyWording: '#hs-eu-policy-wording',
            buttonGroup: '#hs-eu-confirmation-button-group',
            acceptBtn: '#hs-eu-confirmation-button',
            declineBtn: '#hs-eu-decline-button'
        },
        
        // Cookie categories for Option A
        categories: [
            {
                key: '1',
                id: 'essential',
                label: 'Essential Cookies',
                description: 'These cookies are necessary for our LS Retail platform to function properly and cannot be disabled.',
                required: true,
                icon: '🔒'
            },
            {
                key: '2', 
                id: 'analytics',
                label: 'Analytics Cookies',
                description: 'Help us understand how businesses use our retail solutions to improve our products.',
                required: false,
                icon: '📊'
            },
            {
                key: '3',
                id: 'marketing',
                label: 'Marketing Cookies', 
                description: 'Enable targeted content about our unified commerce solutions for your business type.',
                required: false,
                icon: '🎯'
            }
        ],
        
        // LS Retail brand colors from analysis
        brandColors: {
            primary: '#361d5c',
            accent: '#f6c370',
            success: '#4caf50',
            text: '#ffffff',
            background: 'rgba(255,255,255,0.1)'
        },
        
        animations: {
            duration: 300,
            easing: 'ease-in-out'
        },
        
        debug: true
    };

    // Utility functions
    const Utils = {
        log: function(...args) {
            if (CONFIG.debug) {
                console.log('[LS Retail Option A]', ...args);
            }
        },
        
        error: function(...args) {
            console.error('[LS Retail Option A]', ...args);
        },

        getCookie: function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            return parts.length === 2 ? parts.pop().split(';').shift() : null;
        },

        parseConsentCookie: function() {
            const cookie = Utils.getCookie('__hs_cookie_cat_pref');
            if (!cookie) return {};
            
            const consent = {};
            cookie.split('_').forEach(part => {
                const [key, value] = part.split(':');
                if (key && value !== undefined) {
                    consent[key] = value === 'true';
                }
            });
            return consent;
        }
    };

    // HubSpot API Integration (using live analysis findings)
    const HubSpotAPI = {
        initialized: false,
        originalSettingsHandler: null,

        init: function() {
            if (this.initialized) return;

            Utils.log('Initializing HubSpot API integration');
            
            if (typeof window._hsp === 'undefined') {
                Utils.log('HubSpot API not found, running in mock mode');
                this.initMockAPI();
            } else {
                Utils.log('Connected to LS Retail HubSpot portal 491011');
                this.initRealAPI();
            }
            
            this.initialized = true;
        },

        initRealAPI: function() {
            window._hsp = window._hsp || [];
            
            // Listen for consent updates
            window._hsp.push(['addPrivacyConsentListener', function(consent) {
                Utils.log('LS Retail consent updated:', consent);
                OptionAEnhancer.updateConsentUI(consent);
            }]);

            // Get initial consent state
            window._hsp.push(['getPrivacyConsentState', function(consentState) {
                Utils.log('LS Retail initial consent:', consentState);
                OptionAEnhancer.updateConsentUI(consentState);
            }]);
        },

        initMockAPI: function() {
            window._hsp = window._hsp || [];
            window._hsp.mockConsent = Utils.parseConsentCookie() || {
                '1': true,  // Essential always enabled
                '2': false,
                '3': false
            };

            window._hsp.push = function(args) {
                const [method, callback] = args;
                
                if (method === 'addPrivacyConsentListener') {
                    window._hsp.consentListener = callback;
                } else if (method === 'getPrivacyConsentState') {
                    setTimeout(() => callback(window._hsp.mockConsent), 10);
                } else if (method === 'updatePrivacyConsent') {
                    const consent = args[1];
                    window._hsp.mockConsent = Object.assign({}, window._hsp.mockConsent, consent);
                    if (window._hsp.consentListener) {
                        window._hsp.consentListener(window._hsp.mockConsent);
                    }
                    Utils.log('Mock consent updated:', window._hsp.mockConsent);
                }
            };
        },

        updateConsent: function(categoryKey, enabled) {
            const consent = Utils.parseConsentCookie();
            consent[categoryKey] = enabled;
            
            if (window._hsp && window._hsp.push) {
                window._hsp.push(['updatePrivacyConsent', consent]);
                Utils.log('Updating consent for category', categoryKey, 'to', enabled);
            }
        }
    };

    // HubDB Integration for cookie details
    const HubDBIntegration = {
        async loadData() {
            // Check cache first
            const cached = this.getCachedData();
            if (cached) {
                Utils.log('Using cached cookie data');
                return cached;
            }

            // Try real HubDB if configured
            if (CONFIG.portalId !== 'YOUR_PORTAL_ID' && CONFIG.hubdbTableId !== 'YOUR_HUBDB_TABLE_ID') {
                try {
                    const response = await fetch(
                        `${CONFIG.apiEndpoint}/${CONFIG.hubdbTableId}/rows?portalId=${CONFIG.portalId}`,
                        { headers: { 'Accept': 'application/json' } }
                    );
                    
                    if (response.ok) {
                        const data = await response.json();
                        this.setCachedData(data);
                        Utils.log('Loaded cookie data from HubDB');
                        return data;
                    }
                } catch (error) {
                    Utils.error('Failed to load HubDB data:', error);
                }
            }

            // Return LS Retail mock data
            return this.getLSRetailMockData();
        },

        getCachedData: function() {
            try {
                const cached = localStorage.getItem(CONFIG.cacheKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < CONFIG.cacheDuration) {
                        return parsed.data;
                    }
                }
            } catch (error) {
                Utils.error('Cache read error:', error);
            }
            return null;
        },

        setCachedData: function(data) {
            try {
                localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
                    timestamp: Date.now(),
                    data: data
                }));
            } catch (error) {
                Utils.error('Cache write error:', error);
            }
        },

        getLSRetailMockData: function() {
            return {
                rows: [
                    {
                        values: {
                            category_key: '1',
                            cookie_name: '_hs_session',
                            purpose: 'LS Retail session management',
                            duration: 'Session',
                            description: 'Essential for secure access to LS Central and maintaining your dashboard session'
                        }
                    },
                    {
                        values: {
                            category_key: '1',
                            cookie_name: '__hs_opt_out',
                            purpose: 'Privacy preferences storage',
                            duration: '13 months',
                            description: 'Remembers your cookie consent choices for LS Retail services'
                        }
                    },
                    {
                        values: {
                            category_key: '2',
                            cookie_name: '_ga',
                            purpose: 'Website analytics',
                            duration: '2 years',
                            description: 'Helps us understand how retail businesses use our website and solutions'
                        }
                    },
                    {
                        values: {
                            category_key: '2',
                            cookie_name: '__hstc',
                            purpose: 'Visitor behavior tracking',
                            duration: '13 months',
                            description: 'Tracks visitor sessions to optimize the LS Central user experience'
                        }
                    },
                    {
                        values: {
                            category_key: '3',
                            cookie_name: '_fbp',
                            purpose: 'Marketing campaign optimization',
                            duration: '3 months',
                            description: 'Enables targeted marketing about unified commerce solutions for your industry'
                        }
                    },
                    {
                        values: {
                            category_key: '3',
                            cookie_name: '__hs_cta_track',
                            purpose: 'Content personalization',
                            duration: '6 months',
                            description: 'Personalizes content about LS Central features based on your business needs'
                        }
                    }
                ]
            };
        }
    };

    // Main Option A Implementation
    const OptionAEnhancer = {
        banner: null,
        categoryContainer: null,
        cookieData: null,
        isExpanded: false,
        currentConsent: {},

        async init() {
            Utils.log('Initializing LS Retail Option A Cookie Enhancer');
            
            // Wait for HubSpot banner to appear
            this.banner = await this.waitForBanner();
            if (!this.banner) {
                Utils.error('LS Retail banner not found');
                return;
            }

            Utils.log('Found LS Retail banner:', this.banner.id);

            // Initialize HubSpot API
            HubSpotAPI.init();

            // Load cookie data from HubDB
            this.cookieData = await HubDBIntegration.loadData();
            Utils.log('Cookie data loaded:', this.cookieData);

            // Intercept cookie settings button
            this.interceptCookieSettings();

            // Get initial consent state
            this.currentConsent = Utils.parseConsentCookie();
            
            Utils.log('LS Retail Option A initialized successfully');
        },

        // Wait for LS Retail banner based on live analysis
        waitForBanner: function() {
            return new Promise((resolve) => {
                // Check if banner already exists
                const existing = document.querySelector(CONFIG.selectors.banner);
                if (existing && existing.offsetParent !== null) {
                    resolve(existing);
                    return;
                }

                // Watch for banner appearance using exact selector from analysis
                const observer = new MutationObserver((mutations) => {
                    const banner = document.querySelector(CONFIG.selectors.banner);
                    if (banner && banner.offsetParent !== null) {
                        observer.disconnect();
                        resolve(banner);
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });

                // Timeout after 10 seconds
                setTimeout(() => {
                    observer.disconnect();
                    resolve(null);
                }, 10000);
            });
        },

        // Intercept the "Cookie settings" button from live analysis
        interceptCookieSettings: function() {
            const settingsBtn = this.banner.querySelector(CONFIG.selectors.settingsBtn);
            
            if (!settingsBtn) {
                Utils.error('Cookie settings button not found');
                return;
            }

            Utils.log('Intercepting cookie settings button');

            // Store original handler
            HubSpotAPI.originalSettingsHandler = settingsBtn.onclick;

            // Replace with our handler
            settingsBtn.onclick = null;
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCategoryOptions();
            });

            // Update button text to be more descriptive
            settingsBtn.textContent = 'Manage Cookie Preferences';
        },

        // Toggle category options display
        toggleCategoryOptions: function() {
            if (this.isExpanded) {
                this.hideCategoryOptions();
            } else {
                this.showCategoryOptions();
            }
        },

        // Show individual category options (Option A core functionality)
        showCategoryOptions: function() {
            Utils.log('Showing category options');
            
            if (!this.categoryContainer) {
                this.createCategoryContainer();
            }

            // Inject into banner after policy wording
            const policyWording = this.banner.querySelector(CONFIG.selectors.policyWording);
            if (policyWording && !this.categoryContainer.parentNode) {
                policyWording.insertAdjacentElement('afterend', this.categoryContainer);
            }

            // Show with animation
            this.categoryContainer.style.display = 'block';
            this.categoryContainer.style.opacity = '0';
            
            // Animate in
            setTimeout(() => {
                this.categoryContainer.style.transition = `opacity ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
                this.categoryContainer.style.opacity = '1';
            }, 10);

            this.isExpanded = true;

            // Update settings button
            const settingsBtn = this.banner.querySelector(CONFIG.selectors.settingsBtn);
            settingsBtn.textContent = 'Hide Cookie Preferences';
            settingsBtn.setAttribute('aria-expanded', 'true');
        },

        // Hide category options
        hideCategoryOptions: function() {
            Utils.log('Hiding category options');
            
            if (this.categoryContainer) {
                this.categoryContainer.style.transition = `opacity ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
                this.categoryContainer.style.opacity = '0';
                
                setTimeout(() => {
                    this.categoryContainer.style.display = 'none';
                }, CONFIG.animations.duration);
            }

            this.isExpanded = false;

            // Update settings button
            const settingsBtn = this.banner.querySelector(CONFIG.selectors.settingsBtn);
            settingsBtn.textContent = 'Manage Cookie Preferences';
            settingsBtn.setAttribute('aria-expanded', 'false');
        },

        // Create category container (Option A implementation)
        createCategoryContainer: function() {
            Utils.log('Creating category container');
            
            this.categoryContainer = document.createElement('div');
            this.categoryContainer.id = 'ls-option-a-categories';
            this.categoryContainer.className = 'ls-option-a-categories';
            this.categoryContainer.setAttribute('role', 'region');
            this.categoryContainer.setAttribute('aria-label', 'Cookie category preferences');

            // Add header
            const header = document.createElement('div');
            header.className = 'ls-categories-header';
            header.innerHTML = `
                <h3>Choose Your Cookie Preferences</h3>
                <p>Click "Learn More" to see details about each cookie category.</p>
            `;
            this.categoryContainer.appendChild(header);

            // Create each category section
            CONFIG.categories.forEach(category => {
                const categoryElement = this.createCategoryElement(category);
                this.categoryContainer.appendChild(categoryElement);
            });

            // Add action buttons
            const actionButtons = this.createActionButtons();
            this.categoryContainer.appendChild(actionButtons);
        },

        // Create individual category element (core of Option A)
        createCategoryElement: function(category) {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'ls-category';
            categoryEl.setAttribute('data-category', category.key);

            // Category header with Learn More button (Option A key feature)
            const header = document.createElement('div');
            header.className = 'ls-category-header';
            header.innerHTML = `
                <div class="ls-category-info">
                    <span class="ls-category-icon">${category.icon}</span>
                    <span class="ls-category-label">${category.label}</span>
                </div>
                <div class="ls-category-controls">
                    <button class="ls-learn-more-btn" data-category="${category.key}" aria-expanded="false">
                        Learn More
                    </button>
                    <label class="ls-toggle" aria-label="Enable ${category.label}">
                        <input type="checkbox" 
                               class="ls-toggle-input" 
                               data-category="${category.key}"
                               ${category.required ? 'checked disabled' : ''}>
                        <span class="ls-toggle-slider"></span>
                    </label>
                </div>
            `;
            categoryEl.appendChild(header);

            // Expandable details section (Option A core feature)
            const details = document.createElement('div');
            details.className = 'ls-category-details';
            details.style.display = 'none';
            details.setAttribute('role', 'region');
            details.setAttribute('aria-labelledby', `category-${category.id}-header`);

            // Add category description
            const description = document.createElement('div');
            description.className = 'ls-category-description';
            description.innerHTML = `<p>${category.description}</p>`;
            details.appendChild(description);

            // Add cookies list for this category
            const cookiesList = this.createCookiesListForCategory(category.key);
            details.appendChild(cookiesList);

            categoryEl.appendChild(details);

            // Add event listeners
            this.attachCategoryEventListeners(categoryEl, category);

            return categoryEl;
        },

        // Create cookies list for specific category
        createCookiesListForCategory: function(categoryKey) {
            const container = document.createElement('div');
            container.className = 'ls-cookies-list';

            const categoryCookies = this.getCookiesForCategory(categoryKey);
            
            if (categoryCookies.length > 0) {
                container.innerHTML = '<h4>Cookies in this category:</h4>';
                
                const list = document.createElement('ul');
                categoryCookies.forEach(cookie => {
                    const item = document.createElement('li');
                    item.className = 'ls-cookie-item';
                    item.innerHTML = `
                        <div class="ls-cookie-header">
                            <strong>${cookie.cookie_name}</strong>
                            <span class="ls-cookie-duration">${cookie.duration}</span>
                        </div>
                        <div class="ls-cookie-purpose">${cookie.purpose}</div>
                        <div class="ls-cookie-description">${cookie.description}</div>
                    `;
                    list.appendChild(item);
                });
                
                container.appendChild(list);
            } else {
                container.innerHTML = '<p>No specific cookies defined for this category.</p>';
            }

            return container;
        },

        // Get cookies for specific category from HubDB data
        getCookiesForCategory: function(categoryKey) {
            if (!this.cookieData || !this.cookieData.rows) return [];
            
            return this.cookieData.rows
                .filter(row => row.values.category_key === categoryKey)
                .map(row => row.values);
        },

        // Attach event listeners to category elements
        attachCategoryEventListeners: function(categoryEl, category) {
            // Learn More button toggle (Option A key interaction)
            const learnMoreBtn = categoryEl.querySelector('.ls-learn-more-btn');
            const details = categoryEl.querySelector('.ls-category-details');
            
            learnMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCategoryDetails(categoryEl, category);
            });

            // Toggle checkbox
            const toggle = categoryEl.querySelector('.ls-toggle-input');
            toggle.addEventListener('change', (e) => {
                this.handleCategoryToggle(category.key, e.target.checked);
            });

            // Set initial state
            const isEnabled = this.currentConsent[category.key] !== false;
            toggle.checked = category.required || isEnabled;
        },

        // Toggle individual category details (Option A core feature)
        toggleCategoryDetails: function(categoryEl, category) {
            const learnMoreBtn = categoryEl.querySelector('.ls-learn-more-btn');
            const details = categoryEl.querySelector('.ls-category-details');
            const isExpanded = learnMoreBtn.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                // Collapse
                details.style.transition = `all ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
                details.style.maxHeight = '0px';
                details.style.opacity = '0';
                details.style.paddingTop = '0px';
                details.style.paddingBottom = '0px';
                
                setTimeout(() => {
                    details.style.display = 'none';
                }, CONFIG.animations.duration);

                learnMoreBtn.textContent = 'Learn More';
                learnMoreBtn.setAttribute('aria-expanded', 'false');
                Utils.log('Collapsed category:', category.label);
            } else {
                // Expand
                details.style.display = 'block';
                details.style.maxHeight = '0px';
                details.style.opacity = '0';
                details.style.paddingTop = '0px';
                details.style.paddingBottom = '0px';
                
                // Get natural height
                const naturalHeight = details.scrollHeight;
                
                setTimeout(() => {
                    details.style.transition = `all ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
                    details.style.maxHeight = naturalHeight + 'px';
                    details.style.opacity = '1';
                    details.style.paddingTop = '15px';
                    details.style.paddingBottom = '15px';
                }, 10);

                learnMoreBtn.textContent = 'Show Less';
                learnMoreBtn.setAttribute('aria-expanded', 'true');
                Utils.log('Expanded category:', category.label);
            }
        },

        // Handle category toggle changes
        handleCategoryToggle: function(categoryKey, enabled) {
            Utils.log('Category toggled:', categoryKey, enabled);
            
            this.currentConsent[categoryKey] = enabled;
            HubSpotAPI.updateConsent(categoryKey, enabled);
        },

        // Create action buttons
        createActionButtons: function() {
            const container = document.createElement('div');
            container.className = 'ls-action-buttons';
            
            container.innerHTML = `
                <button class="ls-save-btn" id="ls-save-preferences">
                    Save Preferences
                </button>
                <button class="ls-accept-all-btn" id="ls-accept-all">
                    Accept All
                </button>
                <button class="ls-reject-all-btn" id="ls-reject-all">
                    Reject All Optional
                </button>
            `;

            // Add event listeners
            container.querySelector('#ls-save-preferences').addEventListener('click', () => {
                this.savePreferences();
            });

            container.querySelector('#ls-accept-all').addEventListener('click', () => {
                this.acceptAll();
            });

            container.querySelector('#ls-reject-all').addEventListener('click', () => {
                this.rejectAll();
            });

            return container;
        },

        // Save current preferences
        savePreferences: function() {
            Utils.log('Saving preferences:', this.currentConsent);
            
            // Update all consent at once
            Object.keys(this.currentConsent).forEach(key => {
                HubSpotAPI.updateConsent(key, this.currentConsent[key]);
            });

            this.hideCategoryOptions();
            this.showSuccessMessage('Your cookie preferences have been saved.');
        },

        // Accept all cookies
        acceptAll: function() {
            Utils.log('Accepting all cookies');
            
            CONFIG.categories.forEach(category => {
                if (!category.required) {
                    this.currentConsent[category.key] = true;
                    const toggle = this.categoryContainer.querySelector(`[data-category="${category.key}"]`);
                    if (toggle) toggle.checked = true;
                }
            });

            this.savePreferences();
        },

        // Reject all optional cookies
        rejectAll: function() {
            Utils.log('Rejecting all optional cookies');
            
            CONFIG.categories.forEach(category => {
                if (!category.required) {
                    this.currentConsent[category.key] = false;
                    const toggle = this.categoryContainer.querySelector(`[data-category="${category.key}"]`);
                    if (toggle) toggle.checked = false;
                }
            });

            this.savePreferences();
        },

        // Show success message
        showSuccessMessage: function(message) {
            const toast = document.createElement('div');
            toast.className = 'ls-success-toast';
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        // Update consent UI when changed externally
        updateConsentUI: function(consentState) {
            if (!consentState || !this.categoryContainer) return;
            
            Object.keys(consentState).forEach(key => {
                const toggle = this.categoryContainer.querySelector(`[data-category="${key}"]`);
                if (toggle) {
                    toggle.checked = !!consentState[key];
                }
                this.currentConsent[key] = !!consentState[key];
            });
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => OptionAEnhancer.init(), 100);
        });
    } else {
        setTimeout(() => OptionAEnhancer.init(), 100);
    }

    // Export for debugging
    window.LSRetailOptionA = {
        enhancer: OptionAEnhancer,
        hubspotAPI: HubSpotAPI,
        hubDB: HubDBIntegration,
        utils: Utils,
        config: CONFIG
    };

    Utils.log('LS Retail Option A Cookie Enhancer loaded');

})();
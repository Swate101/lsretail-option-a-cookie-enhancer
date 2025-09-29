/**
 * LS Retail Cookie Banner Enhancer - HubSpot Integrated Version
 * Enhanced with HubSpot Consent Management Integration
 * @version 2.1.0 - Corrected Initialization Logic
 */

(function() {
    'use strict';

    // Configuration based on live analysis
    const CONFIG = {
        portalId: '491011', // LS Retail's actual portal ID
        hubdbTableId: '130537251', // LS Retail Cookie Catalog HubDB table
        apiEndpoint: '/hubdb/api/v2/tables',
        cacheVersion: '2025-08-26', // Bump this to invalidate cache
        cacheKey: 'lsr_cookie_cache_2025-08-26_130537251', // Version + table ID for cache control
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
        categories:,

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

        // Debug modes
        debug: new URLSearchParams(window.location.search).has('lsr_debug'),
        verifyMode: new URLSearchParams(window.location.search).has('lsr_verify')
    };

    // Utility functions
    const Utils = {
        log: function(...args) {
            if (CONFIG.debug) {
                console.log('',...args);
            }
        },

        error: function(...args) {
            console.error('',...args);
        },

        getCookie: function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            return parts.length === 2? parts.pop().split(';').shift() : null;
        },

        parseConsentCookie: function() {
            const cookie = Utils.getCookie('__hs_cookie_cat_pref');
            if (!cookie) return {};

            const consent = {};
            cookie.split('_').forEach(part => {
                const [key, value] = part.split(':');
                if (key && value!== undefined) {
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
                Utils.log('HubSpot API not found, initializing');
                window._hsp = window._hsp ||;
            }

            Utils.log('Connected to LS Retail HubSpot portal 491011');
            this.initRealAPI();

            this.initialized = true;
        },

        initRealAPI: function() {
            window._hsp = window._hsp ||;

            // Listen for consent updates
            window._hsp.push();

            // Get initial consent state
            window._hsp.push();
        },

        updateConsent: function(categoryKey, enabled) {
            const consent = Utils.parseConsentCookie();
            consent[categoryKey] = enabled;

            if (window._hsp && window._hsp.push) {
                window._hsp.push(['updatePrivacyConsent', consent]);
                Utils.log('Updating consent for category', categoryKey, 'to', enabled);
            }
        },

        // NEW: Set HubSpot consent for all categories at once
        setHubSpotConsent: function(consentObject) {
            var _hsp = window._hsp = window._hsp ||;
            _hsp.push();
            Utils.log('HubSpot consent set:', consentObject);
        }
    };

    // HubDB Integration for cookie details
    const HubDBIntegration = {
        dataSource: 'unknown', // Track data source for verify mode

        async loadData() {
            // Check cache first (skip if debug mode)
            const cached =!CONFIG.debug? this.getCachedData() : null;
            if (cached) {
                this.dataSource = `HubDB (${cached.rows?.length |

| 0}) [cached]`;
                Utils.log('Using cached cookie data:', cached.rows?.length |

| 0, 'rows');
                return cached;
            }

            // Try to load from HubDB
            if (CONFIG.portalId!== 'YOUR_PORTAL_ID' && CONFIG.hubdbTableId!== 'YOUR_HUBDB_TABLE_ID') {
                try {
                    const response = await fetch(
                        `${CONFIG.apiEndpoint}/${CONFIG.hubdbTableId}/rows?portalId=${CONFIG.portalId}`, {
                            headers: {
                                'Accept': 'application/json'
                            }
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();
                        this.setCachedData(data);
                        this.dataSource = `HubDB (${data.rows?.length |

| 0}) [live]`;
                        Utils.log('Loaded cookie data from HubDB');
                        return data;
                    }
                } catch (error) {
                    Utils.error('Failed to load HubDB data:', error);
                }
            }

            // Fallback to mock data
            const mockData = this.getLSRetailMockData();
            this.dataSource = `Mock (${mockData.rows?.length |

| 0})`;
            return mockData;
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
                rows:
            };
        }
    };

    // Main Option A Enhancer
    const OptionAEnhancer = {
        banner: null,
        categoryContainer: null,
        cookieData: null,
        isExpanded: false,
        currentConsent: {},

        async init() {
            Utils.log('Initializing LS Retail Option A Cookie Enhancer with HubSpot Integration');

            this.banner = await this.waitForBanner();
            if (!this.banner) {
                Utils.error('LS Retail banner not found');
                return;
            }

            Utils.log('Found LS Retail banner:', this.banner.id);

            HubSpotAPI.init();
            this.cookieData = await HubDBIntegration.loadData();
            Utils.log('Cookie data loaded:', this.cookieData);

            this.interceptCookieSettings();
            this.enhanceAcceptDeclineButtons();
            this.currentConsent = Utils.parseConsentCookie();

            Utils.log('LS Retail Option A with HubSpot Integration initialized successfully');
        },

        waitForBanner: function() {
            return new Promise((resolve) => {
                const existing = document.querySelector(CONFIG.selectors.banner);
                if (existing && existing.offsetParent!== null) {
                    resolve(existing);
                    return;
                }

                const observer = new MutationObserver((mutations) => {
                    const banner = document.querySelector(CONFIG.selectors.banner);
                    if (banner && banner.offsetParent!== null) {
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

        interceptCookieSettings: function() {
            const settingsBtn = this.banner.querySelector(CONFIG.selectors.settingsBtn);
            if (!settingsBtn) {
                Utils.error('Cookie settings button not found');
                return;
            }

            Utils.log('Intercepting cookie settings button');

            // Store original handler
            HubSpotAPI.originalSettingsHandler = settingsBtn.onclick;
            settingsBtn.onclick = null;

            // Add our own handler
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCategoryOptions();
            });

            settingsBtn.textContent = 'Manage Cookie Preferences';
        },

        // NEW: Enhance existing accept and decline buttons with HubSpot integration
        enhanceAcceptDeclineButtons: function() {
            const acceptBtn = this.banner.querySelector(CONFIG.selectors.acceptBtn);
            const declineBtn = this.banner.querySelector(CONFIG.selectors.declineBtn);

            if (acceptBtn) {
                // Store original handler
                const originalAcceptHandler = acceptBtn.onclick;
                acceptBtn.onclick = null;

                // Add enhanced handler
                acceptBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.acceptAllWithHubSpot();

                    // Call original handler if it exists
                    if (originalAcceptHandler) {
                        originalAcceptHandler.call(acceptBtn, e);
                    }
                });
                Utils.log('Enhanced Accept button with HubSpot integration');
            }

            if (declineBtn) {
                // Store original handler
                const originalDeclineHandler = declineBtn.onclick;
                declineBtn.onclick = null;

                // Add enhanced handler
                declineBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.declineAllWithHubSpot();

                    // Call original handler if it exists
                    if (originalDeclineHandler) {
                        originalDeclineHandler.call(declineBtn, e);
                    }
                });
                Utils.log('Enhanced Decline button with HubSpot integration');
            }
        },

        toggleCategoryOptions: function() {
            if (this.isExpanded) {
                this.hideCategoryOptions();
            } else {
                this.showCategoryOptions();
            }
        },

        showCategoryOptions: function() {
            Utils.log('Showing category options');

            if (!this.categoryContainer) {
                this.createCategoryContainer();
            }

            const policyWording = this.banner.querySelector(CONFIG.selectors.policyWording);
            if (policyWording &&!this.categoryContainer.parentNode) {
                policyWording.insertAdjacentElement('afterend', this.categoryContainer);
            }

            this.categoryContainer.style.display = 'block';
            this.categoryContainer.style.opacity = '0';

            setTimeout(() => {
                this.categoryContainer.style.transition = `opacity ${CONFIG.animations.duration}ms ${CONFIG.animations.easing}`;
                this.categoryContainer.style.opacity = '1';
            }, 10);

            this.isExpanded = true;

            const settingsBtn = this.banner.querySelector(CONFIG.selectors.settingsBtn);
            settingsBtn.textContent = 'Hide Cookie Preferences';
            settingsBtn.setAttribute('aria-expanded', 'true');
        },

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

            const settingsBtn = this.banner.querySelector(CONFIG.selectors.settingsBtn);
            settingsBtn.textContent = 'Manage Cookie Preferences';
            settingsBtn.setAttribute('aria-expanded', 'false');
        },

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

            // Add categories
            CONFIG.categories.forEach(category => {
                const categoryElement = this.createCategoryElement(category);
                this.categoryContainer.appendChild(categoryElement);
            });

            // Add action buttons
            const actionButtons = this.createActionButtons();
            this.categoryContainer.appendChild(actionButtons);
        },

        createCategoryElement: function(category) {
            const categoryEl = document.createElement('div');
            categoryEl.className = 'ls-category';
            categoryEl.setAttribute('data-category', category.key);

            // Category header
            const header = document.createElement('div');
            header.className = 'ls-category-header';
            header.innerHTML = `
                <div class="ls-category-info">
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
                               ${category.required? 'checked disabled' : ''}>
                        <span class="ls-toggle-slider"></span>
                    </label>
                </div>
            `;
            categoryEl.appendChild(header);

            // Category details (hidden by default)
            const details = document.createElement('div');
            details.className = 'ls-category-details';
            details.style.display = 'none';
            details.setAttribute('role', 'region');
            details.setAttribute('aria-labelledby', `category-${category.id}-header`);

            const description = document.createElement('div');
            description.className = 'ls-category-description';
            description.innerHTML = `<p>${category.description}</p>`;
            details.appendChild(description);

            const cookiesList = this.createCookiesListForCategory(category.key);
            details.appendChild(cookiesList);

            categoryEl.appendChild(details);

            // Attach event listeners
            this.attachCategoryEventListeners(categoryEl, category);

            return categoryEl;
        },

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

        getCookiesForCategory: function(categoryKey) {
            if (!this.cookieData ||!this.cookieData.rows) return;

            return this.cookieData.rows
               .filter(row => row.values.category_key === categoryKey)
               .map(row => row.values);
        },

        attachCategoryEventListeners: function(categoryEl, category) {
            const learnMoreBtn = categoryEl.querySelector('.ls-learn-more-btn');
            const details = categoryEl.querySelector('.ls-category-details');

            learnMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleCategoryDetails(categoryEl, category);
            });

            const toggle = categoryEl.querySelector('.ls-toggle-input');
            toggle.addEventListener('change', (e) => {
                this.handleCategoryToggle(category.key, e.target.checked);
            });

            // Set initial state based on current consent
            const isEnabled = this.currentConsent[category.key]!== false;
            toggle.checked = category.required |

| isEnabled;
        },

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

        handleCategoryToggle: function(categoryKey, enabled) {
            Utils.log('Category toggled:', categoryKey, enabled);
            this.currentConsent[categoryKey] = enabled;
            HubSpotAPI.updateConsent(categoryKey, enabled);
        },

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

            // Attach event listeners
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

        // ENHANCED: Accept all cookies with HubSpot tracking
        acceptAll: function() {
            Utils.log('Accepting all cookies with HubSpot tracking');

            // Update UI toggles
            CONFIG.categories.forEach(category => {
                if (!category.required) {
                    this.currentConsent[category.key] = true;
                    const toggle = this.categoryContainer?.querySelector(`[data-category="${category.key}"]`);
                    if (toggle) toggle.checked = true;
                }
            });

            // --- HUBSPOT INTEGRATION ---
            // Tell HubSpot that user has consented to all categories
            var _hsp = window._hsp = window._hsp ||;
            _hsp.push();
            Utils.log('HubSpot consent updated: All categories accepted');
            // --- END HUBSPOT INTEGRATION ---

            this.savePreferences();
        },

        // ENHANCED: Accept all with HubSpot (for direct button clicks)
        acceptAllWithHubSpot: function() {
            Utils.log('Direct Accept All clicked - updating HubSpot consent');

            // --- HUBSPOT INTEGRATION ---
            var _hsp = window._hsp = window._hsp ||;
            _hsp.push();
            // --- END HUBSPOT INTEGRATION ---

            // Update internal consent state
            CONFIG.categories.forEach(category => {
                this.currentConsent[category.key] = true;
            });

            this.hideCategoryOptions();
            Utils.log('All cookies accepted via HubSpot integration');
        },

        // ENHANCED: Reject all optional cookies with HubSpot tracking
        rejectAll: function() {
            Utils.log('Rejecting all optional cookies with HubSpot tracking');

            // Update UI toggles
            CONFIG.categories.forEach(category => {
                if (!category.required) {
                    this.currentConsent[category.key] = false;
                    const toggle = this.categoryContainer?.querySelector(`[data-category="${category.key}"]`);
                    if (toggle) toggle.checked = false;
                }
            });

            // --- HUBSPOT INTEGRATION ---
            // Tell HubSpot that user has declined all optional categories
            var _hsp = window._hsp = window._hsp ||;
            _hsp.push();
            Utils.log('HubSpot consent updated: Only necessary cookies accepted');
            // --- END HUBSPOT INTEGRATION ---

            this.savePreferences();
        },

        // ENHANCED: Decline all with HubSpot (for direct button clicks)
        declineAllWithHubSpot: function() {
            Utils.log('Direct Decline All clicked - updating HubSpot consent');

            // --- HUBSPOT INTEGRATION ---
            var _hsp = window._hsp = window._hsp ||;
            _hsp.push();
            // --- END HUBSPOT INTEGRATION ---

            // Update internal consent state
            CONFIG.categories.forEach(category => {
                this.currentConsent[category.key] = category.required;
            });

            this.hideCategoryOptions();
            Utils.log('Optional cookies declined via HubSpot integration');
        },

        // Show success message
        showSuccessMessage: function(message) {
            const toast = document.createElement('div');
            toast.className = 'ls-success-toast';
            toast.textContent = message;
            document.body.appendChild(toast);

            // Fade in
            setTimeout(() => {
                toast.style.opacity = '1';
            }, 10);

            // Fade out and remove
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },

        updateConsentUI: function(consentState) {
            if (!consentState ||!this.categoryContainer) return;

            Object.keys(consentState).forEach(key => {
                const toggle = this.categoryContainer.querySelector(`[data-category="${key}"]`);
                if (toggle) {
                    toggle.checked =!!consentState[key];
                }
                this.currentConsent[key] =!!consentState[key];
            });
        }
    };

    // --- CORRECTED INITIALIZATION LOGIC ---
    // This simple check ensures our script runs after the page is ready.
    // The OptionAEnhancer.init() function is smart enough to wait for the
    // HubSpot banner to appear, so we don't need complex consent listeners here.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => OptionAEnhancer.init());
    } else {
        OptionAEnhancer.init();
    }

    // Export for debugging and testing
    window.LSRetailOptionA = {
        enhancer: OptionAEnhancer,
        hubspotAPI: HubSpotAPI,
        hubDB: HubDBIntegration,
        utils: Utils,
        config: CONFIG
    };

    Utils.log('LS Retail Option A Cookie Enhancer with HubSpot Integration loaded');
})();

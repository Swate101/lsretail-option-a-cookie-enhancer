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
                required: true
            },
            {
                key: '2', 
                id: 'functional',
                label: 'Functional Cookies',
                description: 'Enable enhanced functionality and personalization features for improved user experience.',
                required: false
            },
            {
                key: '3', 
                id: 'analytics',
                label: 'Analytics Cookies',
                description: 'Help us understand how businesses use our retail solutions to improve our products.',
                required: false
            },
            {
                key: '4',
                id: 'marketing',
                label: 'Marketing Cookies', 
                description: 'Enable targeted content about our unified commerce solutions for your business type.',
                required: false
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
                '2': false, // Functional
                '3': false, // Analytics
                '4': false  // Marketing
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
          "rows": [
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "30 minutes",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "ar_debug",
                                        "purpose": "Google Analytics (Debug) - Website analytics",
                                        "duration": "Session",
                                        "description": "Google Analytics debug mode cookie for testing and validating tracking implementations.",
                                        "provider": "Google Analytics (Debug)"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "2",
                                        "cookie_name": "sp_t",
                                        "purpose": "Spotify Integration - Enhanced features",
                                        "duration": "Session",
                                        "description": "Required to ensure the functionality of the integrated Spotify plugin...",
                                        "provider": "Spotify Integration"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "2",
                                        "cookie_name": "sp_landing",
                                        "purpose": "Spotify Integration - Enhanced features",
                                        "duration": "Session",
                                        "description": "Required to ensure the functionality of the integrated Spotify plugin...",
                                        "provider": "Spotify Integration"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "_ga",
                                        "purpose": "Google Analytics - Website analytics",
                                        "duration": "13 months",
                                        "description": "ID used to identify users",
                                        "provider": "Google Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__hs_do_not_track",
                                        "purpose": "HubSpot Privacy - Essential functionality",
                                        "duration": "6 months",
                                        "description": "Prevents the tracking code from sending any information to HubSpot",
                                        "provider": "HubSpot Privacy"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "MR",
                                        "purpose": "Microsoft Advertising - Marketing optimization",
                                        "duration": "1 week",
                                        "description": "Used to collect information for analytics purposes.",
                                        "provider": "Microsoft Advertising"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "__hstc",
                                        "purpose": "HubSpot Analytics - Website analytics",
                                        "duration": "6 months",
                                        "description": "Analytics tracking cookie",
                                        "provider": "HubSpot Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "2",
                                        "cookie_name": "AnalyticsSyncHistory",
                                        "purpose": "LinkedIn Analytics - Enhanced features",
                                        "duration": "1 month",
                                        "description": "Used to store information about the time a sync with the lms_analytics cookie took place...",
                                        "provider": "LinkedIn Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "li_sugr",
                                        "purpose": "LinkedIn Analytics - Website analytics",
                                        "duration": "3 months",
                                        "description": "Used to make a probabilistic match of a user's identity outside the Designated Countries",
                                        "provider": "LinkedIn Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "_ga_CWBWGSSZTV",
                                        "purpose": "Google Analytics - Website analytics",
                                        "duration": "13 months",
                                        "description": "Used to persist session state",
                                        "provider": "Google Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "SM",
                                        "purpose": "Microsoft Clarity - Website analytics",
                                        "duration": "Session",
                                        "description": "Microsoft Clarity session identifier for user experience analytics and heatmap generation.",
                                        "provider": "Microsoft Clarity"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "hubspotutk",
                                        "purpose": "HubSpot Analytics - Website analytics",
                                        "duration": "6 months",
                                        "description": "Contains visitor's identity",
                                        "provider": "HubSpot Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "__hssrc",
                                        "purpose": "HubSpot Analytics - Website analytics",
                                        "duration": "Session",
                                        "description": "Used to determine if a session is a new session",
                                        "provider": "HubSpot Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "ANONCHK",
                                        "purpose": "Microsoft Bing Ads - Marketing optimization",
                                        "duration": "Session",
                                        "description": "Used to store session ID for a users session to ensure that clicks from adverts...",
                                        "provider": "Microsoft Bing Ads"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "bcookie",
                                        "purpose": "LinkedIn Analytics - Marketing optimization",
                                        "duration": "1 year",
                                        "description": "Used by LinkedIn to track the use of embedded services.",
                                        "provider": "LinkedIn Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "__hssc",
                                        "purpose": "HubSpot Analytics - Website analytics",
                                        "duration": "30 minutes",
                                        "description": "Analytics session cookie",
                                        "provider": "HubSpot Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "_fbp",
                                        "purpose": "Facebook Pixel - Marketing optimization",
                                        "duration": "3 months",
                                        "description": "Facebook analytics cookie",
                                        "provider": "Facebook Pixel"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "_gcl_au",
                                        "purpose": "Google Ads - Marketing optimization",
                                        "duration": "3 months",
                                        "description": "Used by Google AdSense for experimenting with advertisement efficiency...",
                                        "provider": "Google Ads"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "_rdt_uuid",
                                        "purpose": "Reddit Pixel - Marketing optimization",
                                        "duration": "Session",
                                        "description": "This cookie is set by Reddit and is used for remarketing on reddit.com",
                                        "provider": "Reddit Pixel"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "30 minutes",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "2",
                                        "cookie_name": "_clck",
                                        "purpose": "Microsoft Clarity - Enhanced features",
                                        "duration": "Session",
                                        "description": "Microsoft Clarity click tracking cookie for user interaction analysis and website optimization.",
                                        "provider": "Microsoft Clarity"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "2",
                                        "cookie_name": "SRM_B",
                                        "purpose": "Microsoft Bing - Enhanced features",
                                        "duration": "Session",
                                        "description": "Collected user data is specifically adapted to the user or device...",
                                        "provider": "Microsoft Bing"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "MUID",
                                        "purpose": "Microsoft Advertising - Essential functionality",
                                        "duration": "Session",
                                        "description": "Identifies unique web browsers visiting Microsoft sites...",
                                        "provider": "Microsoft Advertising"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "lidc",
                                        "purpose": "LinkedIn Analytics - Marketing optimization",
                                        "duration": "1 day",
                                        "description": "Used by the social networking service, LinkedIn, for tracking the use of embedded services.",
                                        "provider": "LinkedIn Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "MR",
                                        "purpose": "Microsoft Advertising - Marketing optimization",
                                        "duration": "Session",
                                        "description": "Used to collect information for analytics purposes.",
                                        "provider": "Microsoft Advertising"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "UserMatchHistory",
                                        "purpose": "LinkedIn Advertising - Marketing optimization",
                                        "duration": "1 month",
                                        "description": "These cookies are set by LinkedIn for advertising purposes...",
                                        "provider": "LinkedIn Advertising"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "bscookie",
                                        "purpose": "LinkedIn Analytics - Marketing optimization",
                                        "duration": "1 year",
                                        "description": "Used by LinkedIn to track the use of embedded services.",
                                        "provider": "LinkedIn Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "30 minutes",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "3",
                                        "cookie_name": "CLID",
                                        "purpose": "Microsoft Clarity - Website analytics",
                                        "duration": "Session",
                                        "description": "Microsoft Clarity session ID for tracking user behavior and website performance metrics.",
                                        "provider": "Microsoft Clarity"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "2",
                                        "cookie_name": "_clsk",
                                        "purpose": "Microsoft Clarity - Enhanced features",
                                        "duration": "Session",
                                        "description": "Microsoft Clarity session key for maintaining user session state during analytics collection.",
                                        "provider": "Microsoft Clarity"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "MUID",
                                        "purpose": "Microsoft Advertising - Marketing optimization",
                                        "duration": "13 months",
                                        "description": "Identifies unique web browsers visiting Microsoft sites...",
                                        "provider": "Microsoft Advertising"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__hs_cookie_cat_pref",
                                        "purpose": "HubSpot Cookie Banner - Essential functionality",
                                        "duration": "Session",
                                        "description": "The HubSpot Cookie Banner's consent preferences cookie.",
                                        "provider": "HubSpot Cookie Banner"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "30 minutes",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "2",
                                        "cookie_name": "ARRAffinitySameSite",
                                        "purpose": "Azure Load Balancer - Enhanced features",
                                        "duration": "Session",
                                        "description": "When using Microsoft Azure as a hosting platform...",
                                        "provider": "Azure Load Balancer"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "2",
                                        "cookie_name": "test_cookie",
                                        "purpose": "Google DoubleClick - Enhanced features",
                                        "duration": "15 minutes",
                                        "description": "This cookie is set by DoubleClick (which is owned by Google)...",
                                        "provider": "Google DoubleClick"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "NID",
                                        "purpose": "Google Services - Essential functionality",
                                        "duration": "6 months",
                                        "description": "This cookies is used to collect website statistics...",
                                        "provider": "Google Services"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "VISITOR_INFO1_LIVE",
                                        "purpose": "YouTube Analytics - Marketing optimization",
                                        "duration": "6 months",
                                        "description": "Tries to estimate the users' bandwidth on pages with integrated YouTube videos.",
                                        "provider": "YouTube Analytics"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "IDE",
                                        "purpose": "Google DoubleClick - Essential functionality",
                                        "duration": "13 months",
                                        "description": "This cookie is used for targeting, analyzing and optimisation of ad campaigns...",
                                        "provider": "Google DoubleClick"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__Secure-ROLLOUT_TOKEN",
                                        "purpose": "YouTube Security - Essential functionality",
                                        "duration": "Session",
                                        "description": "YouTube security token for progressive feature rollout and A/B testing.",
                                        "provider": "YouTube Security"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "1",
                                        "cookie_name": "__cf_bm",
                                        "purpose": "Cloudflare Bot Management - Essential functionality",
                                        "duration": "Session",
                                        "description": "Cloud flare's bot products identify and mitigate automated traffic...",
                                        "provider": "Cloudflare Bot Management"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "2",
                                        "cookie_name": "YSC",
                                        "purpose": "YouTube Session - Enhanced features",
                                        "duration": "Session",
                                        "description": "Registers a unique ID to keep statistics of what videos from YouTube the user has seen.",
                                        "provider": "YouTube Session"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "fr",
                                        "purpose": "Facebook Advertising - Marketing optimization",
                                        "duration": "3 months",
                                        "description": "Contains a unique browser and user ID, used for targeted advertising.",
                                        "provider": "Facebook Advertising"
                              }
                    },
                    {
                              "values": {
                                        "category_key": "4",
                                        "cookie_name": "VISITOR_PRIVACY_METADATA",
                                        "purpose": "YouTube Privacy - Marketing optimization",
                                        "duration": "Session",
                                        "description": "YouTube visitor privacy metadata for GDPR compliance and privacy preference management.",
                                        "provider": "YouTube Privacy"
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
            settingsBtn.textContent = 'Close Preferences Panel';
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
                    <span class="ls-category-label">${category.label}</span>
                </div>
                <div class="ls-category-controls">
                    <button class="ls-learn-more-btn" data-category="${category.key}" aria-expanded="false">
                        Learn More
                    </button>
                    ${category.required ? 
                        '<span class="ls-always-active">Always Active</span>' : 
                        `<label class="ls-toggle" aria-label="Enable ${category.label}">
                            <input type="checkbox" 
                                   class="ls-toggle-input" 
                                   data-category="${category.key}">
                            <span class="ls-toggle-slider"></span>
                        </label>`
                    }
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
                container.innerHTML = `
                    <h4>
                        Cookies in this category: 
                        <span class="ls-cookie-count">${categoryCookies.length} cookies</span>
                    </h4>
                `;
                
                const list = document.createElement('ul');
                categoryCookies.forEach(cookie => {
                    const item = document.createElement('li');
                    item.className = 'ls-cookie-item';
                    item.innerHTML = `
                        <div class="ls-cookie-header">
                            <div class="ls-cookie-name">${cookie.cookie_name}</div>
                            <div class="ls-cookie-provider">${cookie.provider || 'Unknown'}</div>
                            <div class="ls-cookie-duration">${cookie.duration}</div>
                        </div>
                        <div class="ls-cookie-details">
                            <div class="ls-cookie-purpose">${cookie.purpose}</div>
                            <div class="ls-cookie-description">${cookie.description}</div>
                        </div>
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
                // Collapse with enhanced CSS animation
                details.classList.remove('expanded');
                details.classList.add('collapsing');
                
                // Change button state immediately for better UX
                learnMoreBtn.textContent = 'Learn More';
                learnMoreBtn.setAttribute('aria-expanded', 'false');
                
                // Remove collapsing class after animation
                setTimeout(() => {
                    details.classList.remove('collapsing');
                    details.style.display = 'none';
                }, 300);

                Utils.log('Collapsed category:', category.label);
            } else {
                // Expand with enhanced CSS animation
                details.style.display = 'block';
                details.classList.remove('collapsing');
                
                // Use requestAnimationFrame for smooth animation
                requestAnimationFrame(() => {
                    details.classList.add('expanded');
                });

                // Change button state
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
                    Confirm My Choices
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
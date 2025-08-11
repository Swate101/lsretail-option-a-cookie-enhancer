# LS Retail Cookie Banner Deep Analysis - Actionable Intelligence

**Analysis Date:** August 9, 2025  
**Target URL:** https://www.lsretail.com/  
**Analysis Method:** Live Playwright Browser Automation  
**Purpose:** Build Option A - Individual "Learn More" Links Implementation

---

## 🎯 Executive Summary

**CRITICAL DISCOVERY**: LS Retail uses HubSpot's **standard EU cookie confirmation banner** (`#hs-eu-cookie-confirmation`), NOT a privacy preference center with individual category toggles. This means Option A must inject "Learn More" links into their existing simple banner structure.

## 🔍 Live Banner Structure Analysis

### Banner Container
```html
<div id="hs-eu-cookie-confirmation" 
     class="hs-banner-optimization-animation" 
     data-nosnippet="true" 
     role="dialog" 
     aria-describedby="hs-eu-policy-wording" 
     aria-label="Cookie banner" 
     tabindex="0">
```

### Key Elements Discovered
- **Primary Selector**: `#hs-eu-cookie-confirmation`
- **Inner Container**: `#hs-eu-cookie-confirmation-inner`
- **Animation Class**: `hs-banner-optimization-animation`
- **Button Container**: `#hs-eu-confirmation-button-group`

### Button Structure Analysis
```html
<div id="hs-eu-confirmation-button-group">
    <button id="hs-eu-cookie-settings-button" aria-label="Cookie settings" tabindex="0">
        Cookie settings
    </button>
    <div id="hs-eu-opt-in-buttons">
        <button id="hs-eu-confirmation-button" aria-label="Accept all" tabindex="0">
            Accept all
        </button>
        <button id="hs-eu-decline-button" aria-label="Decline" tabindex="0">
            Decline
        </button>
    </div>
</div>
```

## ⚙️ HubSpot Integration Points

### JavaScript API Detection
- **HubSpot Global**: `window._hsp` ✅ Available
- **Portal ID**: `491011` 
- **Banner Script**: `https://js.hs-banner.com/v2/491011/banner.js`
- **Analytics Script**: `https://js.hs-analytics.net/analytics/1754781600000/491011.js`

### Key Integration Methods
```javascript
// Show banner programmatically
window._hsp.push(['showBanner']);

// Listen for consent changes
window._hsp.push(['addPrivacyConsentListener', function(consent) {
    // Handle consent updates
}]);

// Get current consent state
window._hsp.push(['getPrivacyConsentState', function(state) {
    // Access current consent
}]);
```

## 🚨 CRITICAL INSIGHT: No Individual Category Structure

**The banner does NOT have individual cookie category toggles!**

- No checkboxes or toggles found (`"toggles": []`)
- No category sections found (`"categories": []`)
- Only has: Accept All, Decline, Cookie Settings buttons

**This changes Option A implementation completely.**

## 🔄 Revised Option A Strategy

Since there are no individual categories in the banner, Option A must work differently:

### Option A Approach: Inject Category Information
Instead of "Learn More" links next to categories, we need to:

1. **Detect the "Cookie settings" button** (`#hs-eu-cookie-settings-button`)
2. **Inject individual category information** when clicked
3. **Create our own category structure** within the banner space
4. **Show individual "Learn More" expandables** for each category

### Implementation Plan

#### Phase 1: Banner Enhancement (2 hours)
```javascript
// Wait for HubSpot banner
const banner = await waitForSelector('#hs-eu-cookie-confirmation');

// Intercept "Cookie settings" button
const settingsBtn = banner.querySelector('#hs-eu-cookie-settings-button');

// Replace button behavior
settingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showCategoryOptions();
});
```

#### Phase 2: Category Injection (3 hours)
Instead of modifying existing categories, we create them:

```html
<!-- Injected after policy wording -->
<div id="ls-cookie-categories" style="display:none;">
    <div class="ls-cookie-category">
        <div class="ls-category-header">
            <span>Essential Cookies</span>
            <button class="ls-learn-more-btn">Learn More</button>
        </div>
        <div class="ls-category-details" style="display:none;">
            <!-- Cookie details loaded from HubDB -->
        </div>
    </div>
    <!-- Repeat for Analytics, Marketing -->
</div>
```

## 💡 Actionable Integration Points

### 1. Banner Detection
```javascript
const CONFIG = {
    selectors: {
        banner: '#hs-eu-cookie-confirmation',
        inner: '#hs-eu-cookie-confirmation-inner',
        settingsBtn: '#hs-eu-cookie-settings-button',
        policyWording: '#hs-eu-policy-wording',
        buttonGroup: '#hs-eu-confirmation-button-group'
    }
};
```

### 2. HubSpot API Integration
```javascript
// Portal ID from analysis
const HUBSPOT_PORTAL_ID = '491011';

// HubSpot consent categories (standard)
const COOKIE_CATEGORIES = {
    essential: { key: '1', label: 'Essential Cookies' },
    analytics: { key: '2', label: 'Analytics Cookies' },
    advertising: { key: '3', label: 'Advertising Cookies' }
};
```

### 3. Injection Strategy
```javascript
// Inject after policy wording, before buttons
const policyWording = document.getElementById('hs-eu-policy-wording');
const categoryContainer = createCategoryContainer();
policyWording.insertAdjacentElement('afterend', categoryContainer);
```

## 🎨 Styling Integration

### Existing HubSpot Classes to Match
- `hs-banner-optimization-animation` - For animations
- `hs-close-button` - For button styling
- Use existing font family and colors from banner

### CSS Strategy
```css
/* Match existing banner styling */
.ls-cookie-category {
    margin: 15px 0;
    padding: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.2);
}

.ls-category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.ls-learn-more-btn {
    background: transparent;
    border: 1px solid #f6c370; /* LS Retail accent */
    color: #f6c370;
    padding: 5px 10px;
    font-size: 12px;
    cursor: pointer;
}
```

## 📊 Technical Specifications

### Required Modifications
- **Target Element**: `#hs-eu-cookie-settings-button`
- **Injection Point**: After `#hs-eu-policy-wording`
- **Animation Class**: Inherit from `hs-banner-optimization-animation`
- **Portal Integration**: Use portal ID `491011`

### HubDB Integration
Since categories don't exist in banner, we need to:
1. **Create our own category structure**
2. **Load cookie data by category from HubDB**
3. **Display in expandable sections**
4. **Sync with HubSpot consent API**

## 🚀 Option A Implementation Timeline

### Phase 1: Core Detection & Injection (2-3 hours)
- [x] Banner detection working (`#hs-eu-cookie-confirmation`)
- [ ] Intercept "Cookie settings" button click
- [ ] Create category injection system
- [ ] Basic "Learn More" buttons

### Phase 2: Category Details & HubDB (2-3 hours)
- [ ] HubDB integration for cookie details
- [ ] Individual category expansion
- [ ] Smooth animations
- [ ] Mobile responsive design

**Total Estimate: 4-6 hours** (vs original 5-7 hour estimate)

## 🔧 Key Code Integration Points

### 1. Banner Wait Function
```javascript
async function waitForLSRetailBanner() {
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutations) => {
            const banner = document.querySelector('#hs-eu-cookie-confirmation');
            if (banner && banner.offsetParent !== null) { // visible
                observer.disconnect();
                resolve(banner);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
```

### 2. Settings Button Interceptor
```javascript
function interceptCookieSettings(banner) {
    const settingsBtn = banner.querySelector('#hs-eu-cookie-settings-button');
    
    if (settingsBtn) {
        settingsBtn.removeEventListener('click', originalHandler);
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCategoryOptions();
        });
    }
}
```

### 3. Category Container Creation
```javascript
function createCategoryContainer() {
    const container = document.createElement('div');
    container.id = 'ls-cookie-categories';
    container.className = 'ls-cookie-categories';
    container.style.display = 'none';
    
    COOKIE_CATEGORIES.forEach(category => {
        const categoryElement = createCategoryElement(category);
        container.appendChild(categoryElement);
    });
    
    return container;
}
```

---

## 🎯 Final Recommendation

**Option A is viable but requires a different approach than originally envisioned.**

Instead of adding "Learn More" to existing categories, we:
1. **Intercept the "Cookie settings" button**
2. **Inject our own category structure**
3. **Create individual "Learn More" expandables**
4. **Integrate with HubSpot consent API**

This approach gives us the granular control needed while working within HubSpot's standard banner framework.

**Ready to proceed with implementation using these exact specifications.**
# HubSpot Cookie Consent Integration Guide

## Overview
This guide shows how your LS Retail Cookie Enhancer has been integrated with HubSpot's consent management system. The integration ensures that your custom cookie banner communicates properly with HubSpot's tracking and compliance infrastructure.

## What Has Been Added

### 1. Accept All Button Integration
The "Accept All" button now includes HubSpot consent tracking:

```javascript
// When user clicks "Accept All"
var _hsp = window._hsp = window._hsp || [];
_hsp.push(['setHubSpotConsent', {
    necessary: true,       // Essential cookies
    functionality: true,   // Functional cookies
    analytics: true,       // Analytics cookies
    advertisement: true    // Marketing cookies
}]);
```

**Location in code**:
- `acceptAll()` function (line ~882)
- `acceptAllWithHubSpot()` function (line ~902)

### 2. Decline All Button Integration
The "Decline All" button now properly communicates with HubSpot:

```javascript
// When user clicks "Decline All"
var _hsp = window._hsp = window._hsp || [];
_hsp.push(['setHubSpotConsent', {
    necessary: true,       // Essential cookies (always true)
    functionality: false,  // Functional cookies declined
    analytics: false,      // Analytics cookies declined
    advertisement: false   // Marketing cookies declined
}]);
```

**Location in code**:
- `rejectAll()` function (line ~925)
- `declineAllWithHubSpot()` function (line ~945)

### 3. Consent Listener Implementation
The cookie enhancer script now waits for user consent before running:

```javascript
// Wrap initialization in consent listener
var _hsp = window._hsp = window._hsp || [];
_hsp.push(['addPrivacyConsentListener', function(consent) {
    if (consent.categories && consent.categories.functionality) {
        // Only initialize if user has given consent
        OptionAEnhancer.init();
    }
}]);
```

**Location in code**: `initializeWithConsent()` function (line ~1002)

## Key Integration Points

### HubSpot Consent Categories
The integration maps your categories to HubSpot's standard consent model:

| Your Category | HubSpot Category | Description |
|--------------|------------------|-------------|
| Essential (1) | necessary | Always enabled, required for basic functionality |
| Functional (2) | functionality | Enhanced features and personalization |
| Analytics (3) | analytics | Usage tracking and performance metrics |
| Marketing (4) | advertisement | Targeted marketing and retargeting |

### Event Flow

1. **Page Load**:
   - Script checks for existing consent via HubSpot's API
   - If no consent exists (first visit), banner appears
   - If consent exists, honors previous choices

2. **User Accepts All**:
   - Updates internal consent state
   - Sends consent signal to HubSpot
   - HubSpot enables all tracking scripts
   - Banner closes

3. **User Declines All**:
   - Updates internal consent state
   - Sends decline signal to HubSpot
   - HubSpot disables optional tracking
   - Only essential cookies remain active

4. **User Customizes Preferences**:
   - Each category toggle updates HubSpot
   - Changes are communicated in real-time
   - Preferences are saved on "Save Preferences" click

## File Structure

```
source-code/
├── option-a-lsretail-cookie-enhancer.js (original)
└── option-a-lsretail-cookie-enhancer-hubspot-integrated.js (enhanced version)
```

## Implementation Steps

1. **Replace the JavaScript file**:
   - Use `option-a-lsretail-cookie-enhancer-hubspot-integrated.js` instead of the original
   - Ensure the file is loaded after HubSpot's tracking code

2. **Verify HubSpot tracking code**:
   - Confirm HubSpot's tracking code is present on all pages
   - The tracking code provides the `_hsp` object needed for integration

3. **Test the integration**:
   - Open browser developer console
   - Add `?lsr_debug` to URL for debug output
   - Click buttons and verify console messages show HubSpot consent updates

## Testing Checklist

- [ ] Accept All button sends consent to HubSpot
- [ ] Decline All button sends decline to HubSpot
- [ ] Custom preferences are communicated to HubSpot
- [ ] Cookie enhancer only runs when consent is given
- [ ] HubSpot tracking respects user choices
- [ ] Consent choices persist across page reloads

## Benefits of This Integration

1. **Compliance**: Ensures GDPR/CCPA compliance through HubSpot's infrastructure
2. **Reporting**: HubSpot tracks consent rates and preferences
3. **Automation**: Marketing automation respects consent choices
4. **Consistency**: Single source of truth for consent across all tools
5. **Legal Protection**: HubSpot's compliance engine handles regulatory requirements

## Troubleshooting

### Console Debugging
Add `?lsr_debug` to any URL to enable debug logging:
```
https://yoursite.com/page?lsr_debug
```

### Common Issues

1. **_hsp is undefined**:
   - Ensure HubSpot tracking code loads before the cookie enhancer
   - Check that HubSpot portal ID is correct (491011)

2. **Consent not persisting**:
   - Verify cookies are not blocked in browser
   - Check that domain settings are correct

3. **Tracking not respecting consent**:
   - Ensure all tracking scripts use HubSpot's consent API
   - Verify script loading order

## Next Steps

1. **Deploy to staging**: Test the integration in a staging environment
2. **Monitor consent rates**: Use HubSpot's privacy dashboard
3. **Review compliance**: Ensure all third-party scripts respect consent
4. **Documentation**: Update internal documentation with these changes

## Support

For questions about the integration:
- Review the inline comments in the JavaScript file
- Check HubSpot's consent management documentation
- Enable debug mode with `?lsr_debug` for detailed logging

---

**Version**: 2.0.0 (HubSpot Integrated)
**Last Updated**: December 2024
**Portal ID**: 491011 (LS Retail)
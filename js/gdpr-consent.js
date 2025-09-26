/*!
 * GDPR Consent Management for AdvantageAI
 * Handles cookie consent and GTM loading
 */

window.AdvantageAI = window.AdvantageAI || {};

AdvantageAI.consent = {
  // Configuration - you can modify these
  config: {
    gtmId: null, // Will be set dynamically from Jekyll config
    cookieName: 'analytics-consent',
    cookieDateName: 'consent-date',
    bannerSelector: '#cookie-banner'
  },

  // Initialize the consent system
  init: function(gtmContainerId) {
    this.config.gtmId = gtmContainerId;
    this.setupEventListeners();
    this.checkInitialConsent();
  },

  // Check if user has given consent
  hasConsent: function() {
    return localStorage.getItem(this.config.cookieName) === 'granted';
  },

  // Grant analytics consent
  grantConsent: function() {
    localStorage.setItem(this.config.cookieName, 'granted');
    localStorage.setItem(this.config.cookieDateName, new Date().toISOString());
    
    // Initialize tracking
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'consent_granted',
      'consent_timestamp': new Date().toISOString()
    });
    
    // Load GTM if not already loaded
    if (!window.gtmLoaded) {
      this.loadGTM();
    }
    
    // Hide consent banner
    this.hideBanner();
    
    // Optional: Show confirmation message
    this.showConsentConfirmation();
  },

  // Revoke consent
  revokeConsent: function() {
    localStorage.removeItem(this.config.cookieName);
    localStorage.removeItem(this.config.cookieDateName);
    
    // Push revoke event before removing tracking
    if (window.dataLayer) {
      window.dataLayer.push({
        'event': 'consent_revoked',
        'revoke_timestamp': new Date().toISOString()
      });
    }
    
    // Show message and suggest page refresh
    alert('Analytics consent revoked. Please refresh the page for changes to take full effect.');
  },

  // Load Google Tag Manager
  loadGTM: function() {
    if (!this.config.gtmId || window.gtmLoaded) {
      return;
    }

    // Load GTM script
    (function(w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', this.config.gtmId);

    // Add noscript iframe for users without JavaScript
    this.addGTMNoscript();
    
    window.gtmLoaded = true;
    console.log('GTM loaded with consent');
  },

  // Add GTM noscript iframe
  addGTMNoscript: function() {
    var noscript = document.createElement('noscript');
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.googletagmanager.com/ns.html?id=' + this.config.gtmId;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
  },

  // Show cookie banner
  showBanner: function() {
    var banner = document.querySelector(this.config.bannerSelector);
    if (banner) {
      banner.style.display = 'block';
      // Add smooth slide-up animation
      setTimeout(function() {
        banner.style.transform = 'translateY(0)';
        banner.style.opacity = '1';
      }, 100);
    }
  },

  // Hide cookie banner
  hideBanner: function() {
    var banner = document.querySelector(this.config.bannerSelector);
    if (banner) {
      banner.style.transform = 'translateY(100%)';
      banner.style.opacity = '0';
      setTimeout(function() {
        banner.style.display = 'none';
      }, 300);
    }
  },

  // Show confirmation message after consent
  showConsentConfirmation: function() {
    var confirmation = document.createElement('div');
    confirmation.innerHTML = '✅ Analytics enabled. Thank you!';
    confirmation.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #28a745; color: white; padding: 15px 20px; border-radius: 5px; z-index: 10000; font-size: 14px;';
    document.body.appendChild(confirmation);
    
    // Remove after 3 seconds
    setTimeout(function() {
      if (confirmation.parentNode) {
        confirmation.parentNode.removeChild(confirmation);
      }
    }, 3000);
  },

  // Set up event listeners
  setupEventListeners: function() {
    var self = this;
    
    // Listen for consent buttons (will be added to HTML)
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('consent-accept')) {
        e.preventDefault();
        self.grantConsent();
      } else if (e.target.classList.contains('consent-decline')) {
        e.preventDefault();
        self.hideBanner();
      }
    });
  },

  // Check consent status on page load
  checkInitialConsent: function() {
    if (this.hasConsent()) {
      this.loadGTM();
    } else {
      // Show banner after a brief delay for better UX
      setTimeout(() => {
        this.showBanner();
      }, 1000);
    }
  },

  // Utility: Check if consent was granted within last X days
  isConsentRecent: function(days = 365) {
    var consentDate = localStorage.getItem(this.config.cookieDateName);
    if (!consentDate) return false;
    
    var daysSinceConsent = (new Date() - new Date(consentDate)) / (1000 * 60 * 60 * 24);
    return daysSinceConsent <= days;
  },

  // Debug function - useful during development
  debugInfo: function() {
    console.log('GDPR Consent Debug Info:', {
      hasConsent: this.hasConsent(),
      consentDate: localStorage.getItem(this.config.cookieDateName),
      gtmLoaded: window.gtmLoaded,
      gtmId: this.config.gtmId,
      dataLayer: window.dataLayer
    });
  }
};
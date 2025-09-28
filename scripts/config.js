// Page Summarizer Extension Configuration
const CONFIG = {
    // General settings
    charLimit: 100000,
    minContentLength: 200,
    summaryId: 'page-summarizer-popup',
    overlayId: 'page-summarizer-overlay',
    stylesId: 'page-summarizer-styles',

    // Content extraction settings
    contentSelectors: [
        'article',
        'main',
        '[role="main"]',
        '.post-content',
        '.entry-content',
        '.article-content',
        '.story-content',
        '.content',
        '#content',
        '#main',
        '.post',
        '.story'
    ],

    textSelectors: 'p, h1, h2, h3, h4, h5, h6, li, blockquote, .text, .description',

    excludedSelectors: 'script, style, noscript, header, footer, nav, .ad, .advertisement, .social-share',

    // Skip these domains/protocols
    excludedProtocols: ['chrome-extension:', 'chrome:', 'moz-extension:', 'edge-extension:'],
    excludedDomains: ['docs.google.com', 'drive.google.com'],

    // API settings
    apiEndpoints: {
        cohere: 'https://api.cohere.ai/v1/chat',
        openai: 'https://api.openai.com/v1/chat/completions'
    },

    // UI settings
    animations: {
        fadeInDelay: 10,
        statusDuration: 3000,
        loadingDelay: 1000
    },

    // Boilerplate text patterns to filter out
    boilerplatePatterns: [
        /^(skip to|jump to|go to)/i,
        /^(menu|navigation|nav)/i,
        /^(share|tweet|like|follow)/i,
        /^(copyright|©|\(c\))/i,
        /^(subscribe|sign up|newsletter)/i,
        /^(cookies?|privacy|terms)/i,
        /^(advertisement|sponsored)/i,
        /^\d+\s*(comments?|replies?)/i
    ]
};

// Make CONFIG available globally
window.PAGE_SUMMARIZER_CONFIG = CONFIG;
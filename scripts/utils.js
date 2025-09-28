// Page Summarizer Extension Utilities
class SummarizerUtils {
    static isBoilerplateText(text) {
        const config = window.PAGE_SUMMARIZER_CONFIG;
        return config.boilerplatePatterns.some(pattern => pattern.test(text.toLowerCase()));
    }

    static isValidPageForSummarization() {
        const config = window.PAGE_SUMMARIZER_CONFIG;

        // Check protocol
        if (config.excludedProtocols.some(protocol => window.location.protocol === protocol)) {
            return false;
        }

        // Check domain
        if (config.excludedDomains.some(domain => window.location.hostname.includes(domain))) {
            return false;
        }

        return true;
    }

    static extractPageText() {
        const config = window.PAGE_SUMMARIZER_CONFIG;
        let contentContainer = null;

        // Try to find the main content container
        for (const selector of config.contentSelectors) {
            const element = $(selector).first();
            if (element.length > 0 && element.text().trim().length > 200) {
                contentContainer = element;
                break;
            }
        }

        // Fallback to body if no specific content container found
        if (!contentContainer) {
            contentContainer = $('body');
        }

        let allText = [];
        let charCount = 0;

        // Extract text from paragraphs, headings, and list items
        contentContainer.find(config.textSelectors).each(function() {
            if (charCount >= config.charLimit) {
                return false;
            }

            const $element = $(this);

            // Skip if element is not visible or is inside excluded elements
            if (!$element.is(':visible') ||
                $element.closest(config.excludedSelectors).length > 0) {
                return;
            }

            const text = $element.text().trim();

            // Only include meaningful text blocks
            if (text.length > 20 && !SummarizerUtils.isBoilerplateText(text)) {
                allText.push(text);
                charCount += text.length;
            }
        });

        // If we didn't get enough content, fall back to all visible text
        if (allText.join(' ').length < 500) {
            allText = [];
            charCount = 0;

            contentContainer.find('*').each(function() {
                if (charCount >= config.charLimit) {
                    return false;
                }

                const $element = $(this);

                if ($element.is(':visible') &&
                    !$element.is(config.excludedSelectors) &&
                    $element.closest('.ad, .advertisement, .social-share').length === 0) {

                    const text = $element.contents().filter(function() {
                        return this.nodeType === 3; // Text nodes only
                    }).text().trim();

                    if (text.length > 15 && !SummarizerUtils.isBoilerplateText(text)) {
                        allText.push(text);
                        charCount += text.length;
                    }
                }
            });
        }

        const finalText = allText.join('\n').substring(0, config.charLimit);
        console.log(`Page Summarizer: Extracted ${finalText.length} characters of content`);

        return finalText;
    }

    static getStorageData() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(['selectedModel', 'cohereApiKey', 'openaiApiKey'], resolve);
        });
    }

    static validateApiKey(model, key) {
        if (!key || key.trim().length === 0) {
            return 'API key is required';
        }

        if (model === 'openai' && !key.startsWith('sk-')) {
            return 'OpenAI API keys should start with "sk-"';
        }

        if (key.length < 10) {
            return 'API key appears to be too short';
        }

        return null;
    }

    static createErrorMessage(type, model) {
        const messages = {
            noModel: "⚙️ Setup Required\n\nPlease configure your AI model in the extension settings to start summarizing pages.\n\nRight-click the extension icon and select 'Options' to get started.",
            noApiKey: `🔑 API Key Missing\n\nPlease add your ${model === 'cohere' ? 'Cohere' : 'OpenAI'} API key in the extension settings.\n\nRight-click the extension icon and select 'Options' to configure your API key.`,
            shortContent: "📄 Content Too Short\n\nThis page doesn't have enough content to generate a meaningful summary.\n\nTry visiting a page with more text content.",
            invalidKey: "Invalid API key. Please check your API key in the extension settings.",
            rateLimit: "Rate limit exceeded. Please try again in a moment.",
            networkError: "Network error. Please check your internet connection.",
            genericError: "Failed to generate summary. Please try again."
        };

        return messages[type] || messages.genericError;
    }
}

// Make utilities available globally
window.SummarizerUtils = SummarizerUtils;
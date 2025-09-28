// Page Summarizer Extension - Main Entry Point
class PageSummarizer {
    constructor() {
        this.config = window.PAGE_SUMMARIZER_CONFIG;
        this.utils = window.SummarizerUtils;
        this.ui = window.SummarizerUI;
        this.api = window.SummarizerAPI;
    }

    async initialize() {
        // Check if we're on a valid page for summarization
        if (!this.utils.isValidPageForSummarization()) {
            console.log('Page Summarizer: Skipping unsupported page');
            return;
        }

        try {
            const settings = await this.utils.getStorageData();
            await this.processSummarization(settings);
        } catch (error) {
            console.error('Page Summarizer Error:', error);
            this.ui.display(this.utils.createErrorMessage('genericError'), true);
        }
    }

    async processSummarization(settings) {
        const { selectedModel: model, cohereApiKey, openaiApiKey } = settings;

        // Validate configuration
        if (!model) {
            this.ui.display(this.utils.createErrorMessage('noModel'), true);
            return;
        }

        const apiKey = model === 'cohere' ? cohereApiKey : openaiApiKey;
        if (!apiKey) {
            this.ui.display(this.utils.createErrorMessage('noApiKey', model), true);
            return;
        }

        // Extract and validate content
        const pageText = this.utils.extractPageText();
        if (pageText.length < this.config.minContentLength) {
            this.ui.display(this.utils.createErrorMessage('shortContent'), true);
            return;
        }

        console.log(`Page Summarizer: Starting summarization with ${model} - Content: ${pageText.length} chars`);

        // Generate summary
        await this.api.summarize(pageText, model, apiKey);
    }
}

// Initialize the extension
function initializePageSummarizer() {
    // Ensure all dependencies are loaded
    if (!window.PAGE_SUMMARIZER_CONFIG || !window.SummarizerUtils ||
        !window.SummarizerUI || !window.SummarizerAPI) {
        console.log('Page Summarizer: Dependencies not loaded, retrying...');
        setTimeout(initializePageSummarizer, 100);
        return;
    }

    const summarizer = new PageSummarizer();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => summarizer.initialize(), window.PAGE_SUMMARIZER_CONFIG.animations.loadingDelay);
        });
    } else {
        // Add a delay to ensure page content is fully loaded
        setTimeout(() => summarizer.initialize(), window.PAGE_SUMMARIZER_CONFIG.animations.loadingDelay);
    }
}

// Start the initialization
initializePageSummarizer();
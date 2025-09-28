// Page Summarizer Extension API Handlers
class SummarizerAPI {
    static async summarizeWithCohere(text, apiKey) {
        const config = window.PAGE_SUMMARIZER_CONFIG;
        const ui = window.SummarizerUI;

        const options = {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-type": "application/json",
                "Authorization": "Bearer " + apiKey,
                "Request-Source": "page-summarizer-extension"
            },
            body: JSON.stringify({
                "message": text,
                "preamble": "You are an expert content summarizer. Create a clear, concise summary of this webpage that captures the key points, main arguments, and important details. Format your response to be easily readable.",
                "temperature": 0.1,
                "max_tokens": 1000
            })
        };

        try {
            const response = await fetch(config.apiEndpoints.cohere, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.text) {
                ui.display(data.text);
            } else {
                throw new Error(data.message || "No summary generated");
            }
        } catch (err) {
            console.error('Cohere API Error:', err);
            this.handleApiError(err, 'cohere');
        }
    }

    static async summarizeWithOpenAI(text, apiKey) {
        const config = window.PAGE_SUMMARIZER_CONFIG;
        const ui = window.SummarizerUI;

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + apiKey
            },
            body: JSON.stringify({
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert content analyst. Create comprehensive yet concise summaries that capture the essence of web content. Focus on key insights, main arguments, and actionable information."
                    },
                    {
                        "role": "user",
                        "content": "Please provide a well-structured summary of the following web page content. Include the main points and any important details:\n\n" + text
                    }
                ],
                "temperature": 0.1,
                "max_tokens": 1000
            })
        };

        try {
            const response = await fetch(config.apiEndpoints.openai, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.choices && data.choices[0]?.message?.content) {
                ui.display(data.choices[0].message.content);
            } else {
                throw new Error(data.error?.message || "No summary generated");
            }
        } catch (err) {
            console.error('OpenAI API Error:', err);
            this.handleApiError(err, 'openai');
        }
    }

    static handleApiError(error, provider) {
        const ui = window.SummarizerUI;
        const utils = window.SummarizerUtils;

        let errorMessage = utils.createErrorMessage('genericError');

        if (error.message.includes('401')) {
            errorMessage = utils.createErrorMessage('invalidKey');
        } else if (error.message.includes('429')) {
            errorMessage = utils.createErrorMessage('rateLimit');
        } else if (error.message.includes('network') || error.name === 'TypeError') {
            errorMessage = utils.createErrorMessage('networkError');
        }

        ui.display(errorMessage, true);
    }

    static async summarize(text, model, apiKey) {
        const ui = window.SummarizerUI;

        ui.showLoadingState();

        switch (model) {
            case 'cohere':
                await this.summarizeWithCohere(text, apiKey);
                break;
            case 'openai':
                await this.summarizeWithOpenAI(text, apiKey);
                break;
            default:
                ui.display("Please configure your AI model in the extension settings before using the summarizer.", true);
        }
    }
}

// Make API class available globally
window.SummarizerAPI = SummarizerAPI;
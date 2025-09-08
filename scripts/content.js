// Increased character limit since gpt-4o has a large context window
const charLimit = 100000;

// Display the text on top of the page
function display(text) {
    // Check if our header already exists
    let header = document.getElementById('condense-summary-header');
    if (!header) {
        header = document.createElement("div");
        header.id = 'condense-summary-header';

        // --- Style Updates ---
        header.style.backgroundColor = "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)";
        header.style.background = "#4a0e63"; // Fallback color
        header.style.color = "white";
        header.style.padding = "12px";
        header.style.fontFamily = "Arial, sans-serif";
        header.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
        header.style.borderBottom = "1px solid #ddd";
        
        // --- Crucial CSS for visibility ---
        header.style.position = "sticky";
        header.style.top = "0";
        header.style.left = "0";
        header.style.width = "100%";
        header.style.zIndex = "2147483647"; // The highest possible z-index

        const tldr = document.createElement("p");
        tldr.id = 'condense-summary-text';
        tldr.style.margin = "0 auto";
        tldr.style.maxWidth = "900px";
        tldr.style.padding = "0 20px";
        tldr.style.fontSize = "15px";
        tldr.style.lineHeight = "1.5";
        tldr.style.textAlign = "center";
        header.appendChild(tldr);
        
        document.body.insertBefore(header, document.body.firstChild);
    }
    
    document.getElementById('condense-summary-text').textContent = text;
}


// --- Summarization logic for Cohere ---
function summarizeWithCohere(text, apiKey) {
    const options = {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            "Authorization": "Bearer " + apiKey,
            "Request-Source": "sandbox-condense"
        },
        body: JSON.stringify({
            "message": text,
            "preamble": "Generate a summary of this webpage extracting the most important information.",
            "temperature": 0.1
        })
    };

    fetch('https://api.cohere.ai/v1/chat', options)
        .then(response => response.json())
        .then(response => {
            if (response.text) {
                display("tl;dr: " + response.text);
            } else {
                display("Error with Cohere API: " + (response.message || "Unknown error"));
            }
        })
        .catch(err => {
            console.error(err);
            display("Failed to fetch summary from Cohere.");
        });
}

// --- Summarization logic for OpenAI ---
function summarizeWithOpenAI(text, apiKey) {
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
                    "content": "You are an expert at summarizing web pages."
                },
                {
                    "role": "user",
                    "content": "Please provide a concise summary of the following web page content:\n\n" + text
                }
            ],
            "temperature": 0.1,
            "max_tokens": 1000 
        })
    };

    fetch('https://api.openai.com/v1/chat/completions', options)
        .then(response => response.json())
        .then(response => {
            if (response.choices && response.choices[0].message.content) {
                display("At a Glance: " + response.choices[0].message.content);
            } else {
                display("Error with OpenAI API: " + (response.error?.message || "Unknown error"));
            }
        })
        .catch(err => {
            console.error(err);
            display("Failed to fetch summary from OpenAI.");
        });
}

// --- Dispatcher function ---
function summarize(text, model, apiKey) {
    display("Summarizing... 🧠");
    if (model === 'cohere') {
        summarizeWithCohere(text, apiKey);
    } else if (model === 'openai') {
        summarizeWithOpenAI(text, apiKey);
    } else {
        display("No summarization model selected. Please choose one in the extension options.");
    }
}

// Returns only the visible text from the page
function getVisibleText() {
    let body = $('article, main, #content, #main, .post, .story').first();
    if (body.length === 0) {
        body = $('body');
    }

    let allText = [];
    let charCount = 0;

    body.find('*').each(function() {
        if (charCount >= charLimit) {
            return false; 
        }
        if ($(this).is(':visible') && !$(this).is('script, style, noscript, header, footer, nav')) {
            const text = $(this).contents().filter(function() {
                return this.nodeType === 3;
            }).text().trim();

            if (text.length > 10) { 
                allText.push(text);
                charCount += text.length;
            }
        }
    });
    
    return allText.join('\n').substring(0, charLimit);
}

// Main function to run the summarizer
function main() {
    chrome.storage.sync.get(['selectedModel', 'cohereApiKey', 'openaiApiKey'], items => {
        const model = items.selectedModel;
        const apiKey = model === 'cohere' ? items.cohereApiKey : items.openaiApiKey;

        if (!model || !apiKey) {
            let message = "Please select a model and set its API key in the extension's options.";
            if (model === 'cohere' && !apiKey) {
                message = "Please set your Cohere API key in the extension's options.";
            } else if (model === 'openai' && !apiKey) {
                message = "Please set your OpenAI API key in the extension's options.";
            }
            display(message);
        } else {
            const visibleText = getVisibleText();
            if (visibleText.length < 100) { 
                console.log("Page content is too short to summarize.");
                return;
            }
            console.log(`Text sent for summarization (${visibleText.length} chars):`, visibleText);
            summarize(visibleText, model, apiKey);
        }
    });
}

// Run the script
main();
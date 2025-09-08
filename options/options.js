const modelSelect = document.getElementById('modelSelect');
const apiKeyInput = document.getElementById('apiKey');
const optionsForm = document.getElementById('optionsForm');
const statusDiv = document.getElementById('status');

// Update API key input placeholder and value based on selected model
function updateFormUI(selectedModel, keys) {
    apiKeyInput.placeholder = `Enter API Key for ${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}`;
    if (selectedModel === 'cohere') {
        apiKeyInput.value = keys.cohereApiKey || '';
    } else if (selectedModel === 'openai') {
        apiKeyInput.value = keys.openaiApiKey || '';
    }
}

// Load saved settings when the options page is opened
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['selectedModel', 'cohereApiKey', 'openaiApiKey'], (items) => {
        const model = items.selectedModel || 'cohere'; // Default to Cohere
        modelSelect.value = model;
        updateFormUI(model, items);
    });
});

// When the user changes the model, update the UI
modelSelect.addEventListener('change', () => {
    chrome.storage.sync.get(['cohereApiKey', 'openaiApiKey'], (keys) => {
        updateFormUI(modelSelect.value, keys);
    });
});

// Save settings on form submit
optionsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedModel = modelSelect.value;
    const apiKey = apiKeyInput.value;

    let settingsToSave = {
        selectedModel: selectedModel
    };

    if (selectedModel === 'cohere') {
        settingsToSave.cohereApiKey = apiKey;
    } else if (selectedModel === 'openai') {
        settingsToSave.openaiApiKey = apiKey;
    }

    chrome.storage.sync.set(settingsToSave, () => {
        statusDiv.textContent = 'Options saved.';
        setTimeout(() => {
            statusDiv.textContent = '';
        }, 1500);
    });
});
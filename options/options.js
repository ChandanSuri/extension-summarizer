const modelSelect = document.getElementById('modelSelect');
const apiKeyInput = document.getElementById('apiKey');
const optionsForm = document.getElementById('optionsForm');
const statusDiv = document.getElementById('status');
const saveBtn = document.getElementById('saveBtn');
const btnText = document.getElementById('btnText');
const modelInfo = document.getElementById('modelInfo');

// Model information mapping
const modelInfoMap = {
    cohere: 'High-quality summarization with excellent understanding',
    openai: 'Advanced GPT-4 model for comprehensive and accurate summaries'
};

// Update API key input placeholder and value based on selected model
function updateFormUI(selectedModel, keys) {
    apiKeyInput.placeholder = `Enter your ${selectedModel === 'cohere' ? 'Cohere' : 'OpenAI'} API key`;
    modelInfo.textContent = modelInfoMap[selectedModel];

    if (selectedModel === 'cohere') {
        apiKeyInput.value = keys.cohereApiKey || '';
    } else if (selectedModel === 'openai') {
        apiKeyInput.value = keys.openaiApiKey || '';
    }
}

// Show status message with animation
function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = `status show ${isError ? 'error' : 'success'}`;

    setTimeout(() => {
        statusDiv.className = 'status';
    }, 3000);
}

// Update button state
function updateButtonState(loading = false) {
    if (loading) {
        saveBtn.disabled = true;
        btnText.textContent = 'Saving...';
    } else {
        saveBtn.disabled = false;
        btnText.textContent = 'Save Settings';
    }
}

// Validate API key format
function validateApiKey(model, key) {
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
    const apiKey = apiKeyInput.value.trim();

    // Validate the API key
    const validationError = validateApiKey(selectedModel, apiKey);
    if (validationError) {
        showStatus(validationError, true);
        return;
    }

    updateButtonState(true);

    let settingsToSave = {
        selectedModel: selectedModel
    };

    if (selectedModel === 'cohere') {
        settingsToSave.cohereApiKey = apiKey;
    } else if (selectedModel === 'openai') {
        settingsToSave.openaiApiKey = apiKey;
    }

    chrome.storage.sync.set(settingsToSave, () => {
        updateButtonState(false);
        showStatus('Settings saved successfully! 🎉');
    });
});

// Add input validation feedback
apiKeyInput.addEventListener('input', (e) => {
    const key = e.target.value.trim();
    const model = modelSelect.value;

    if (key.length > 0) {
        const validationError = validateApiKey(model, key);
        if (validationError) {
            apiKeyInput.style.borderColor = '#f56565';
        } else {
            apiKeyInput.style.borderColor = '#48bb78';
        }
    } else {
        apiKeyInput.style.borderColor = '#e2e8f0';
    }
});
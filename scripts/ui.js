// Page Summarizer Extension UI Components
class SummarizerUI {
    static removeExistingPopup() {
        const config = window.PAGE_SUMMARIZER_CONFIG;
        const existing = document.getElementById(config.summaryId);
        if (existing) existing.remove();
    }

    static createPopup(content, isError = false) {
        const config = window.PAGE_SUMMARIZER_CONFIG;

        const popup = document.createElement('div');
        popup.id = config.summaryId;
        popup.innerHTML = this.generatePopupHTML(content, isError, config);

        this.addStyles();
        this.attachEventListeners(popup, config);

        return popup;
    }

    static generatePopupHTML(content, isError, config) {
        return `
            <div class="summarizer-overlay" id="${config.overlayId}">
                <div class="summarizer-popup">
                    <div class="summarizer-header">
                        <div class="summarizer-icon">
                            ${isError ? '⚠️' : '📄'}
                        </div>
                        <div class="summarizer-title">
                            <h3>${isError ? 'Error' : 'Page Summary'}</h3>
                            <p class="summarizer-subtitle">${isError ? 'Something went wrong' : 'AI-powered content summary'}</p>
                        </div>
                        <button class="summarizer-close" onclick="this.closest('#${config.summaryId}').remove()">
                            ✕
                        </button>
                    </div>
                    <div class="summarizer-content">
                        <div class="summarizer-text ${isError ? 'error' : ''}">
                            ${content}
                        </div>
                    </div>
                    <div class="summarizer-footer">
                        <button class="summarizer-btn secondary" onclick="this.closest('#${config.summaryId}').remove()">
                            Close
                        </button>
                        ${!isError ? `
                        <button class="summarizer-btn primary" id="copy-summary-btn">
                            Copy Summary
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    static attachEventListeners(popup, config) {
        // Click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target.id === config.overlayId) {
                popup.remove();
            }
        });

        // Copy button functionality
        const copyBtn = popup.querySelector('#copy-summary-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                try {
                    const textElement = popup.querySelector('.summarizer-text');
                    if (textElement) {
                        const text = textElement.textContent.trim();
                        await navigator.clipboard.writeText(text);

                        // Visual feedback
                        const originalText = copyBtn.textContent;
                        copyBtn.textContent = 'Copied!';
                        copyBtn.classList.add('copied');

                        setTimeout(() => {
                            copyBtn.textContent = originalText;
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    }
                } catch (err) {
                    console.error('Failed to copy text:', err);
                    copyBtn.textContent = 'Copy Failed';
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy Summary';
                    }, 2000);
                }
            });
        }

        // Keyboard shortcut to close
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                popup.remove();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }

    static display(text, isError = false) {
        const config = window.PAGE_SUMMARIZER_CONFIG;

        this.removeExistingPopup();

        const popup = this.createPopup(text, isError);
        document.body.appendChild(popup);

        // Trigger animation
        setTimeout(() => popup.classList.add('visible'), config.animations.fadeInDelay);
    }

    static showLoadingState() {
        this.display(`<div style="text-align: center; padding: 20px;">
            <div class="summarizer-loading" style="margin: 20px auto; display: block;"></div>
            <p style="margin: 10px 0; color: #6b7280; text-align: center;">Analyzing page content...</p>
            <p style="margin: 0; font-size: 14px; color: #9ca3af; text-align: center;">This may take a few seconds</p>
        </div>`);
    }

    static addStyles() {
        const config = window.PAGE_SUMMARIZER_CONFIG;

        if (document.getElementById(config.stylesId)) return;

        const styles = document.createElement('style');
        styles.id = config.stylesId;
        styles.textContent = this.getCSS(config);

        document.head.appendChild(styles);
    }

    static getCSS(config) {
        return `
            .summarizer-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(4px);
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            #${config.summaryId}.visible .summarizer-overlay {
                opacity: 1;
            }

            .summarizer-popup {
                background: white;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                max-width: 700px;
                width: 100%;
                max-height: 80vh;
                overflow: hidden;
                transform: scale(0.95) translateY(20px);
                transition: transform 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            }

            #${config.summaryId}.visible .summarizer-popup {
                transform: scale(1) translateY(0);
            }

            .summarizer-header {
                display: flex;
                align-items: center;
                padding: 24px 24px 16px;
                border-bottom: 1px solid #e5e7eb;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .summarizer-icon {
                font-size: 24px;
                margin-right: 12px;
            }

            .summarizer-title {
                flex: 1;
            }

            .summarizer-title h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }

            .summarizer-subtitle {
                margin: 2px 0 0 0;
                font-size: 14px;
                opacity: 0.9;
            }

            .summarizer-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: background 0.2s ease;
            }

            .summarizer-close:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .summarizer-content {
                padding: 24px;
                max-height: 50vh;
                overflow-y: auto;
            }

            .summarizer-text {
                font-size: 16px;
                line-height: 1.6;
                color: #374151;
                white-space: pre-wrap;
            }

            .summarizer-text.error {
                color: #dc2626;
            }

            .summarizer-footer {
                padding: 16px 24px 24px;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }

            .summarizer-btn {
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .summarizer-btn.secondary {
                background: #f3f4f6;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .summarizer-btn.secondary:hover {
                background: #e5e7eb;
            }

            .summarizer-btn.primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
            }

            .summarizer-btn.primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }

            .summarizer-btn.primary.copied {
                background: #10b981;
                transform: scale(0.95);
            }

            .summarizer-loading {
                display: block;
                width: 20px;
                height: 20px;
                border: 3px solid #f3f3f3;
                border-top: 3px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @media (max-width: 768px) {
                .summarizer-popup {
                    max-width: calc(100vw - 40px);
                    margin: 20px;
                }

                .summarizer-header {
                    padding: 16px;
                }

                .summarizer-content {
                    padding: 16px;
                }

                .summarizer-footer {
                    padding: 12px 16px 16px;
                    flex-direction: column;
                }
            }
        `;
    }
}

// Make UI class available globally
window.SummarizerUI = SummarizerUI;
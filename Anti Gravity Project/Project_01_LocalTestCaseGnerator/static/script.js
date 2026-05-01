document.addEventListener('DOMContentLoaded', () => {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const statusDot = document.getElementById('ollama-status');
    const statusText = document.getElementById('status-text');

    // Auto-resize textarea
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    const modelSelect = document.getElementById('model-select');

    // Check health and models on load
    checkHealth();
    checkModels();
    setInterval(checkHealth, 10000);

    async function checkModels() {
        try {
            const response = await fetch('/api/models');
            const data = await response.json();
            if (data.models) {
                modelSelect.innerHTML = data.models.map(m =>
                    `<option value="${m}" ${m === data.current ? 'selected' : ''}>${m}</option>`
                ).join('');
            }
        } catch (error) {
            console.error('Failed to load models');
        }
    }

    modelSelect.addEventListener('change', async () => {
        const model = modelSelect.value;
        try {
            await fetch('/api/model', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model })
            });
            checkHealth(); // Update status text
        } catch (error) {
            console.error('Failed to change model');
        }
    });

    async function checkHealth() {
        try {
            const response = await fetch('/api/health');
            const data = await response.json();

            if (data.ollama_status === 'connected') {
                statusDot.classList.remove('disconnected');
                statusDot.classList.add('connected');
                statusText.textContent = `Ollama: Ready`;
            } else {
                statusDot.classList.remove('connected');
                statusDot.classList.add('disconnected');
                statusText.textContent = 'Ollama: Disconnected';
            }
        } catch (error) {
            statusDot.classList.remove('connected');
            statusDot.classList.add('disconnected');
            statusText.textContent = 'Server: Offline';
        }
    }

    function addMessage(type, content, isMarkdown = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        if (isMarkdown) {
            contentDiv.innerHTML = marked.parse(content);
        } else {
            contentDiv.textContent = content;
        }

        wrapper.appendChild(contentDiv);

        if (type === 'system' && isMarkdown) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn';
            copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(content);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="far fa-copy"></i> Copy';
                }, 2000);
            };

            actionsDiv.appendChild(copyBtn);
            wrapper.appendChild(actionsDiv);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(wrapper);
        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return contentDiv;
    }

    function addLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message system loading-message';
        loadingDiv.innerHTML = `
            <div class="avatar"><i class="fas fa-robot"></i></div>
            <div class="content">
                <div class="loading-dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingDiv;
    }

    async function generateTestCases() {
        const input = userInput.value.trim();
        if (!input) return;

        // Clear input and reset height
        userInput.value = '';
        userInput.style.height = 'auto';

        // Add user message
        addMessage('user', input);

        // Add loading
        const loadingMessage = addLoading();
        sendBtn.disabled = true;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: input })
            });

            const data = await response.json();

            // Remove loading
            chatMessages.removeChild(loadingMessage);
            sendBtn.disabled = false;

            if (data.success) {
                addMessage('system', data.response, true);
            } else {
                addMessage('system', `Error: ${data.error || 'Something went wrong'}`);
            }
        } catch (error) {
            chatMessages.removeChild(loadingMessage);
            sendBtn.disabled = false;
            addMessage('system', 'Error: Could not connect to the server.');
        }
    }

    sendBtn.addEventListener('click', generateTestCases);

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            generateTestCases();
        }
    });
});

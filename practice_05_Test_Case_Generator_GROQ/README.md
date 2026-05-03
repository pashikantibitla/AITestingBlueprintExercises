# Kimi CLI

A powerful command-line interface for interacting with Moonshot AI's Kimi LLM, built with Python 3.13 (compatible with 3.11+).

## Features

- ⚡ **Streaming Responses**: Real-time output using `rich.live`.
- 🎨 **Beautiful UI**: Syntax highlighting and Markdown rendering.
- 💬 **Interactive Mode**: Seamless conversational experience.
- 🔧 **Customizable**: Support for different models and system prompts.

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd kimi-cli

# Install dependencies
pip install .
```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your Kimi API key to `.env`:
   ```env
   KIMI_API_KEY=your_actual_api_key_here
   ```

## Usage

Start an interactive session:
```bash
kimi chat
```

Run a single prompt:
```bash
kimi chat --prompt "What is the capital of France?"
```

Use a specific model:
```bash
kimi chat --model moonshot-v1-32k
```

## Requirements

- Python 3.11+ (Targeted for 3.13)
- `typer`
- `rich`
- `httpx`
- `openai`
- `python-dotenv`

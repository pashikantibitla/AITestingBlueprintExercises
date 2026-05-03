import typer
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.live import Live
from rich.table import Table
from .api import KimiClient
from .models import get_available_models, get_model_info, DEFAULT_MODEL
import sys

app = typer.Typer(help="Kimi CLI - Interact with Moonshot AI's Kimi LLM")
console = Console()

@app.command()
def chat(
    prompt: str = typer.Option(None, "--prompt", "-p", help="Direct prompt to Kimi"),
    model: str = typer.Option(DEFAULT_MODEL, "--model", "-m", help=f"Kimi model to use. Available: {', '.join(get_available_models())}"),
    system_prompt: str = typer.Option("You are Kimi, a helpful AI assistant developed by Moonshot AI.", "--system", "-s", help="System prompt")
):
    """
    Start an interactive chat session with Kimi.
    """
    try:
        client = KimiClient()
    except ValueError as e:
        console.print(f"[bold red]Error:[/bold red] {e}")
        raise typer.Exit(code=1)

    messages = [{"role": "system", "content": system_prompt}]

    if prompt:
        messages.append({"role": "user", "content": prompt})
        _send_query(client, messages, model)
        return

    console.print(Panel("[bold cyan]Welcome to Kimi CLI![/bold cyan]\nType 'exit' or 'quit' to end the session.", title="Kimi"))

    while True:
        user_input = console.input("[bold green]You:[/bold green] ")
        if user_input.lower() in ["exit", "quit"]:
            break
        
        messages.append({"role": "user", "content": user_input})
        _send_query(client, messages, model)

def _send_query(client, messages, model):
    console.print("[bold magenta]Kimi:[/bold magenta] ", end="")
    
    full_response = ""
    try:
        with Live(Markdown(""), refresh_per_second=10, console=console) as live:
            response = client.chat(messages, model=model, stream=True)
            for chunk in response:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    live.update(Markdown(full_response))
        
        messages.append({"role": "assistant", "content": full_response})
    except Exception as e:
        console.print(f"\n[bold red]Error during communication:[/bold red] {e}")

@app.command()
def models():
    """List available Kimi models."""
    table = Table(title="Available Kimi Models")
    table.add_column("Model Name", style="cyan")
    table.add_column("Context Window", style="green")
    table.add_column("Description", style="white")
    
    for model_name in get_available_models():
        info = get_model_info(model_name)
        table.add_row(
            model_name,
            f"{info.get('context_window', 'N/A'):,} tokens",
            info.get('description', '')
        )
    
    console.print(table)

if __name__ == "__main__":
    app()

from fastmcp import FastMCP
import urllib.request
import json
from urllib.parse import quote


mcp = FastMCP("Weather")


def _fetch_weather_data(city: str) -> dict:
    """Internal helper to fetch weather data from wttr.in."""
    url = f"https://wttr.in/{quote(city)}?format=j1"
    req = urllib.request.Request(url, headers={"User-Agent": "MCP-Weather/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode())


@mcp.tool()
def get_weather(city: str) -> dict:
    """Get current weather for any city. Returns temperature, condition, humidity."""
    try:
        data = _fetch_weather_data(city)
        current = data["current_condition"][0]
        return {
            "city": city,
            "temp_c": current["temp_C"],
            "temp_f": current["temp_F"],
            "condition": current["weatherDesc"][0]["value"],
            "humidity": current["humidity"] + "%",
            "wind_kmph": current["windspeedKmph"],
            "feels_like_c": current["FeelsLikeC"],
        }
    except Exception as e:
        return {"error": f"Could not fetch weather for '{city}': {str(e)}"}


@mcp.resource("weather://{city}/current")
def get_current_weather_resource(city: str) -> str:
    """Current weather conditions as a readable text resource."""
    try:
        data = _fetch_weather_data(city)
        current = data["current_condition"][0]
        return (
            f"Current Weather for {city}\n"
            f"=========================\n"
            f"Condition: {current['weatherDesc'][0]['value']}\n"
            f"Temperature: {current['temp_C']}°C / {current['temp_F']}°F\n"
            f"Feels Like: {current['FeelsLikeC']}°C\n"
            f"Humidity: {current['humidity']}%\n"
            f"Wind Speed: {current['windspeedKmph']} km/h\n"
        )
    except Exception as e:
        return f"Error fetching weather for {city}: {e}"


@mcp.resource("weather://{city}/forecast")
def get_forecast_resource(city: str) -> str:
    """3-day weather forecast as a readable text resource."""
    try:
        data = _fetch_weather_data(city)
        days = data["weather"][:3]
        lines = [f"3-Day Forecast for {city}", "=" * 30]
        for day in days:
            date = day["date"]
            max_temp = day["maxtempC"]
            min_temp = day["mintempC"]
            desc = day["hourly"][4]["weatherDesc"][0]["value"]
            lines.append(f"{date}: {desc}, {min_temp}°C - {max_temp}°C")
        return "\n".join(lines)
    except Exception as e:
        return f"Error fetching forecast for {city}: {e}"


@mcp.resource("weather://cities/popular")
def get_popular_cities() -> str:
    """List of popular cities supported by the weather service."""
    cities = [
        "London", "New York", "Tokyo", "Paris", "Sydney",
        "Mumbai", "Dubai", "Singapore", "Berlin", "Toronto"
    ]
    return "Popular Cities:\n" + "\n".join(f"  - {c}" for c in cities)


if __name__ == "__main__":
    mcp.run()

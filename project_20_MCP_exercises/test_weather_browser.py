import asyncio
from playwright.async_api import async_playwright

async def test_weather_cities():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1400, "height": 900})
        page = await context.new_page()
        
        # Open MCP Inspector
        await page.goto("http://localhost:6274/?MCP_PROXY_PORT=6275")
        await page.wait_for_timeout(3000)
        
        # Take screenshot of initial state
        await page.screenshot(path="weather_inspector_01_home.png")
        print("Screenshot saved: weather_inspector_01_home.png")
        
        # Click Connect button
        connect_btn = await page.query_selector("button:has-text('Connect')")
        if connect_btn:
            await connect_btn.click()
            print("Clicked Connect button")
            await page.wait_for_timeout(4000)
            await page.screenshot(path="weather_inspector_02_connected.png")
            print("Screenshot saved: weather_inspector_02_connected.png")
        else:
            print("Connect button not found")
            await browser.close()
            return
        
        # Look for the Tools tab and click it
        tools_tab = await page.query_selector("text=Tools")
        if tools_tab:
            await tools_tab.click()
            print("Clicked Tools tab")
            await page.wait_for_timeout(2000)
            await page.screenshot(path="weather_inspector_03_tools.png")
            print("Screenshot saved: weather_inspector_03_tools.png")
        else:
            print("Tools tab not found")
        
        # Look for get_weather tool
        get_weather_btn = await page.query_selector("text=get_weather")
        if get_weather_btn:
            await get_weather_btn.click()
            print("Clicked get_weather tool")
            await page.wait_for_timeout(1500)
            await page.screenshot(path="weather_inspector_04_get_weather.png")
            print("Screenshot saved: weather_inspector_04_get_weather.png")
        else:
            print("get_weather button not found")
            await browser.close()
            return
        
        cities = ["London", "New York", "Tokyo", "Sydney", "Mumbai"]
        results = []
        
        for city in cities:
            # Find city input - try different selectors
            city_input = None
            selectors = [
                "input[name='city']",
                "input[placeholder*='city' i]",
                "input[type='text']",
                "input"
            ]
            for sel in selectors:
                inputs = await page.query_selector_all(sel)
                for inp in inputs:
                    placeholder = await inp.get_attribute("placeholder") or ""
                    name = await inp.get_attribute("name") or ""
                    if "city" in placeholder.lower() or "city" in name.lower() or sel == "input":
                        city_input = inp
                        break
                if city_input:
                    break
            
            if city_input:
                await city_input.fill(city)
                print(f"Filled city: {city}")
                await page.wait_for_timeout(500)
                
                # Click Run button
                run_btn = await page.query_selector("button:has-text('Run')")
                if run_btn:
                    await run_btn.click()
                    print(f"Clicked Run for {city}")
                    await page.wait_for_timeout(3000)
                    
                    # Take screenshot
                    safe_city = city.replace(" ", "_")
                    await page.screenshot(path=f"weather_inspector_05_result_{safe_city}.png")
                    print(f"Screenshot saved: weather_inspector_05_result_{safe_city}.png")
                    
                    # Try to capture result text from JSON display
                    result_selectors = ["pre", "code", ".result", "[class*='json']", "[class*='response']"]
                    found_text = None
                    for rsel in result_selectors:
                        el = await page.query_selector(rsel)
                        if el:
                            text = await el.inner_text()
                            if text.strip():
                                found_text = text.strip()[:300]
                                break
                    results.append(f"{city}: {found_text or '(see screenshot)'}")
                else:
                    print(f"Run button not found for {city}")
                
                # Clear input for next city
                await city_input.fill("")
                await page.wait_for_timeout(300)
            else:
                print(f"City input not found for {city}")
        
        print("\n--- Weather Results ---")
        for r in results:
            print(r)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_weather_cities())

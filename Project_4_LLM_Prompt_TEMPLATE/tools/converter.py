
import re

class JavaToPlaywrightConverter:
    def __init__(self):
        self.logs = []

    def log(self, message):
        self.logs.append(message)

    def convert(self, java_source):
        self.logs = []
        ts_code = []
        
        # 1. Imports
        ts_code.append("import { test, expect } from '@playwright/test';")
        ts_code.append("")
        
        # 2. Structure identification
        lines = java_source.split('\n')
        in_test_method = False
        indent = ""
        
        for line in lines:
            stripped = line.strip()
            
            # Skip Java package/imports
            if stripped.startswith("package ") or stripped.startswith("import "):
                continue
                
            # Class definition -> test.describe
            if "class " in stripped and "{" in stripped:
                class_name = re.search(r"class\s+(\w+)", stripped).group(1)
                ts_code.append(f"test.describe('{class_name}', () => {{")
                indent = "  "
                continue
            
            # @Test annotation
            if "@Test" in stripped:
                continue
                
            # Test method start
            if "public void" in stripped and "{" in stripped:
                method_name = re.search(r"public void (\w+)", stripped).group(1)
                ts_code.append(f"{indent}test('{method_name}', async ({{ page }}) => {{")
                in_test_method = True
                continue
                
            # Closing braces
            if stripped == "}":
                if in_test_method:
                    ts_code.append(f"{indent}}});")
                    in_test_method = False
                else:
                    ts_code.append("});")
                continue

            # --- Statement Conversion ---
            
            # 1. Driver.get / Navigate
            if "driver.get" in stripped or "driver.navigate().to" in stripped:
                url_match = re.search(r'\"(.*?)\"', stripped)
                if url_match:
                    ts_code.append(f"{indent}  await page.goto('{url_match.group(1)}');")
                continue

            # 2. Find Element & Actions
            # Match: driver.findElement(By.id("foo")).click();
            # This is complex, so we'll do simple heuristics for now
            
            if "driver.findElement" in stripped:
                # Extract Locator Strategy
                locator_part = ""
                if 'By.id("' in stripped:
                    val = re.search(r'By\.id\(\"(.*?)\"\)', stripped).group(1)
                    locator_part = f"page.locator('#{val}')"
                elif 'By.xpath("' in stripped:
                    val = re.search(r'By\.xpath\(\"(.*?)\"\)', stripped).group(1)
                    locator_part = f"page.locator('{val}')"
                elif 'By.cssSelector("' in stripped:
                    val = re.search(r'By\.cssSelector\(\"(.*?)\"\)', stripped).group(1)
                    locator_part = f"page.locator('{val}')"
                elif 'By.name("' in stripped:
                    val = re.search(r'By\.name\(\"(.*?)\"\)', stripped).group(1)
                    locator_part = f"page.locator('[name=\"{val}\"]')"
                else:
                    self.log(f"Warning: Could not identify locator in: {stripped}")
                    ts_code.append(f"{indent}  // TODO: Verify locator: {stripped}")
                    continue
                
                # Extract Action
                if ".click()" in stripped:
                    ts_code.append(f"{indent}  await {locator_part}.click();")
                elif ".sendKeys(" in stripped:
                    text = re.search(r'\.sendKeys\(\"(.*?)\"\)', stripped).group(1)
                    ts_code.append(f"{indent}  await {locator_part}.fill('{text}');")
                elif ".getText()" in stripped:
                     # Usually part of an assertion, but if standalone:
                     ts_code.append(f"{indent}  await {locator_part}.textContent();")
                else:
                    # Just the locator (assigning to var?)
                    if "=" in stripped:
                         var_name = stripped.split("=")[0].strip().split()[-1] # simple hack
                         ts_code.append(f"{indent}  const {var_name} = {locator_part};")
                    else:
                         ts_code.append(f"{indent}  // {locator_part}; // No action detected")
                continue

            # 3. Assertions
            if "Assert.assertEquals" in stripped:
                 # Assert.assertEquals(actual, expected);
                 # This is tricky because actual might be a variable or function call
                 parts = re.search(r'Assert\.assertEquals\((.*),(.*)\);', stripped)
                 if parts:
                     actual = parts.group(1).strip()
                     expected = parts.group(2).strip()
                     ts_code.append(f"{indent}  expect({actual}).toBe({expected});")
                 continue
                 
            if "Assert.assertTrue" in stripped:
                 cond = re.search(r'Assert\.assertTrue\((.*)\);', stripped).group(1)
                 ts_code.append(f"{indent}  expect({cond}).toBeTruthy();")
                 continue

            # Default: Comment out unknown lines
            if stripped:
                ts_code.append(f"{indent}  // {stripped} // TODO: Manual conversion")
        
        return "\n".join(ts_code), self.logs

if __name__ == "__main__":
    # Test Stub
    sample_java = """
    package com.example;
    import org.testng.annotations.Test;
    import org.openqa.selenium.By;
    import org.openqa.selenium.WebDriver;
    import org.testng.Assert;

    public class LoginTest {
        @Test
        public void testLogin() {
            driver.get("https://example.com");
            driver.findElement(By.id("username")).sendKeys("admin");
            driver.findElement(By.id("login-btn")).click();
            String title = driver.getTitle();
            Assert.assertEquals(title, "Dashboard");
        }
    }
    """
    converter = JavaToPlaywrightConverter()
    result, logs = converter.convert(sample_java)
    print("LOGS:", logs)
    print("RESULT:\n", result)

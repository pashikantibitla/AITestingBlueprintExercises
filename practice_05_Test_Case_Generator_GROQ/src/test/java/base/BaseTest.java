package base;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.safari.SafariDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Parameters;
import utils.ConfigReader;

import java.time.Duration;

public class BaseTest {

    protected WebDriver driver;
    protected static final String BASE_URL = "https://login.salesforce.com/?locale=in";

    @BeforeMethod
    @Parameters("browser")
    public void setUp(String browser) {
        driver = initializeDriver(browser);
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
        driver.get(BASE_URL);
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    private WebDriver initializeDriver(String browser) {
        WebDriver webDriver;
        switch (browser.toLowerCase()) {
            case "chrome":
                WebDriverManager.chromedriver().setup();
                webDriver = new ChromeDriver();
                break;
            case "firefox":
                WebDriverManager.firefoxdriver().setup();
                webDriver = new FirefoxDriver();
                break;
            case "edge":
                WebDriverManager.edgedriver().setup();
                webDriver = new EdgeDriver();
                break;
            case "safari":
                webDriver = new SafariDriver();
                break;
            default:
                WebDriverManager.chromedriver().setup();
                webDriver = new ChromeDriver();
        }
        return webDriver;
    }

    public WebDriver getDriver() {
        return driver;
    }
}

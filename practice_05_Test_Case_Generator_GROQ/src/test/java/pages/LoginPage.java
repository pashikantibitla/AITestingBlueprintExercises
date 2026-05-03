package pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.NoSuchElementException;

import java.time.Duration;

public class LoginPage {

    private WebDriver driver;
    private WebDriverWait wait;

    @FindBy(xpath = "//input[@id='username']")
    private WebElement usernameField;

    @FindBy(xpath = "//input[@id='password']")
    private WebElement passwordField;

    @FindBy(xpath = "//input[@id='Login']")
    private WebElement loginButton;

    @FindBy(xpath = "//input[@id='rememberUn']")
    private WebElement rememberMeCheckbox;

    @FindBy(xpath = "//div[@id='error']")
    private WebElement errorMessage;

    @FindBy(xpath = "//div[@class='loginError']")
    private WebElement loginErrorDiv;

    @FindBy(xpath = "//span[@id='idcard-identity']")
    private WebElement rememberedUsername;

    @FindBy(xpath = "//a[@id='forgot_password_link']")
    private WebElement forgotPasswordLink;

    @FindBy(xpath = "//a[@id='signup_link']")
    private WebElement signUpLink;

    @FindBy(xpath = "//div[@id='logo']")
    private WebElement salesforceLogo;

    @FindBy(xpath = "//div[@class='zen-visualLogger']")
    private WebElement visualLogger;

    @FindBy(xpath = "//span[contains(text(),'Please check your username and password')]")
    private WebElement invalidCredentialsError;

    @FindBy(xpath = "//span[contains(text(),'Please enter your password')]")
    private WebElement emptyPasswordError;

    @FindBy(xpath = "//input[@id='username']//following-sibling::div[contains(@class,'error')]")
    private WebElement usernameFieldError;

    @FindBy(xpath = "//div[contains(@class,'uiInput')]//div[contains(@class,'error')]")
    private WebElement passwordFieldError;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        PageFactory.initElements(driver, this);
    }

    public void enterUsername(String username) {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameField));
            usernameField.clear();
            usernameField.sendKeys(username);
        } catch (TimeoutException e) {
            throw new RuntimeException("Username field not visible within timeout: " + e.getMessage());
        } catch (NoSuchElementException e) {
            throw new RuntimeException("Username field not found: " + e.getMessage());
        }
    }

    public void enterPassword(String password) {
        try {
            wait.until(ExpectedConditions.visibilityOf(passwordField));
            passwordField.clear();
            passwordField.sendKeys(password);
        } catch (TimeoutException e) {
            throw new RuntimeException("Password field not visible within timeout: " + e.getMessage());
        } catch (NoSuchElementException e) {
            throw new RuntimeException("Password field not found: " + e.getMessage());
        }
    }

    public void clickLoginButton() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(loginButton));
            loginButton.click();
        } catch (TimeoutException e) {
            throw new RuntimeException("Login button not clickable within timeout: " + e.getMessage());
        } catch (NoSuchElementException e) {
            throw new RuntimeException("Login button not found: " + e.getMessage());
        }
    }

    public void checkRememberMe() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(rememberMeCheckbox));
            if (!rememberMeCheckbox.isSelected()) {
                rememberMeCheckbox.click();
            }
        } catch (TimeoutException e) {
            throw new RuntimeException("Remember Me checkbox not clickable within timeout: " + e.getMessage());
        } catch (NoSuchElementException e) {
            throw new RuntimeException("Remember Me checkbox not found: " + e.getMessage());
        }
    }

    public void uncheckRememberMe() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(rememberMeCheckbox));
            if (rememberMeCheckbox.isSelected()) {
                rememberMeCheckbox.click();
            }
        } catch (TimeoutException e) {
            throw new RuntimeException("Remember Me checkbox not clickable within timeout: " + e.getMessage());
        } catch (NoSuchElementException e) {
            throw new RuntimeException("Remember Me checkbox not found: " + e.getMessage());
        }
    }

    public void performLogin(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        clickLoginButton();
    }

    public void performLoginWithRememberMe(String username, String password) {
        enterUsername(username);
        enterPassword(password);
        checkRememberMe();
        clickLoginButton();
    }

    public String getErrorMessage() {
        try {
            wait.until(ExpectedConditions.visibilityOf(errorMessage));
            return errorMessage.getText();
        } catch (TimeoutException e) {
            return "";
        } catch (NoSuchElementException e) {
            return "";
        }
    }

    public String getInvalidCredentialsErrorMessage() {
        try {
            wait.until(ExpectedConditions.visibilityOf(invalidCredentialsError));
            return invalidCredentialsError.getText();
        } catch (TimeoutException e) {
            try {
                wait.until(ExpectedConditions.visibilityOf(errorMessage));
                return errorMessage.getText();
            } catch (TimeoutException ex) {
                return "";
            }
        } catch (NoSuchElementException e) {
            return "";
        }
    }

    public String getEmptyPasswordErrorMessage() {
        try {
            wait.until(ExpectedConditions.visibilityOf(emptyPasswordError));
            return emptyPasswordError.getText();
        } catch (TimeoutException e) {
            try {
                wait.until(ExpectedConditions.visibilityOf(passwordFieldError));
                return passwordFieldError.getText();
            } catch (TimeoutException ex) {
                return "";
            }
        } catch (NoSuchElementException e) {
            return "";
        }
    }

    public String getRememberedUsername() {
        try {
            wait.until(ExpectedConditions.visibilityOf(rememberedUsername));
            return rememberedUsername.getText();
        } catch (TimeoutException e) {
            return "";
        } catch (NoSuchElementException e) {
            return "";
        }
    }

    public boolean isErrorMessageDisplayed() {
        try {
            wait.until(ExpectedConditions.visibilityOf(errorMessage));
            return errorMessage.isDisplayed();
        } catch (TimeoutException e) {
            return false;
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    public boolean isLoginButtonDisplayed() {
        try {
            wait.until(ExpectedConditions.visibilityOf(loginButton));
            return loginButton.isDisplayed();
        } catch (TimeoutException e) {
            return false;
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    public boolean isUsernameFieldDisplayed() {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameField));
            return usernameField.isDisplayed();
        } catch (TimeoutException e) {
            return false;
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    public boolean isPasswordFieldDisplayed() {
        try {
            wait.until(ExpectedConditions.visibilityOf(passwordField));
            return passwordField.isDisplayed();
        } catch (TimeoutException e) {
            return false;
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    public boolean isRememberMeCheckboxDisplayed() {
        try {
            wait.until(ExpectedConditions.visibilityOf(rememberMeCheckbox));
            return rememberMeCheckbox.isDisplayed();
        } catch (TimeoutException e) {
            return false;
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    public boolean isRememberMeChecked() {
        try {
            wait.until(ExpectedConditions.visibilityOf(rememberMeCheckbox));
            return rememberMeCheckbox.isSelected();
        } catch (TimeoutException e) {
            return false;
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    public void clickForgotPasswordLink() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(forgotPasswordLink));
            forgotPasswordLink.click();
        } catch (TimeoutException e) {
            throw new RuntimeException("Forgot Password link not clickable within timeout: " + e.getMessage());
        } catch (NoSuchElementException e) {
            throw new RuntimeException("Forgot Password link not found: " + e.getMessage());
        }
    }

    public void clickSignUpLink() {
        try {
            wait.until(ExpectedConditions.elementToBeClickable(signUpLink));
            signUpLink.click();
        } catch (TimeoutException e) {
            throw new RuntimeException("Sign Up link not clickable within timeout: " + e.getMessage());
        } catch (NoSuchElementException e) {
            throw new RuntimeException("Sign Up link not found: " + e.getMessage());
        }
    }

    public void clearUsernameField() {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameField));
            usernameField.clear();
        } catch (TimeoutException e) {
            throw new RuntimeException("Username field not visible within timeout: " + e.getMessage());
        } catch (NoSuchElementException e) {
            throw new RuntimeException("Username field not found: " + e.getMessage());
        }
    }

    public void clearPasswordField() {
        try {
            wait.until(ExpectedConditions.visibilityOf(passwordField));
            passwordField.clear();
        } catch (TimeoutException e) {
            throw new RuntimeException("Password field not visible within timeout: " + e.getMessage());
        } catch (NoSuchElementException e) {
            throw new RuntimeException("Password field not found: " + e.getMessage());
        }
    }

    public String getUsernameFieldValue() {
        try {
            wait.until(ExpectedConditions.visibilityOf(usernameField));
            return usernameField.getAttribute("value");
        } catch (TimeoutException e) {
            return "";
        } catch (NoSuchElementException e) {
            return "";
        }
    }

    public String getPasswordFieldValue() {
        try {
            wait.until(ExpectedConditions.visibilityOf(passwordField));
            return passwordField.getAttribute("value");
        } catch (TimeoutException e) {
            return "";
        } catch (NoSuchElementException e) {
            return "";
        }
    }

    public boolean isSalesforceLogoDisplayed() {
        try {
            wait.until(ExpectedConditions.visibilityOf(salesforceLogo));
            return salesforceLogo.isDisplayed();
        } catch (TimeoutException e) {
            return false;
        } catch (NoSuchElementException e) {
            return false;
        }
    }
}

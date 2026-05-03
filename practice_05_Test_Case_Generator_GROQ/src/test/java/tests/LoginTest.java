package tests;

import base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;
import pages.LoginPage;

public class LoginTest extends BaseTest {

    @Test(priority = 1, description = "Verify login page elements are displayed")
    public void verifyLoginPageElements() {
        LoginPage loginPage = new LoginPage(driver);
        
        Assert.assertTrue(loginPage.isUsernameFieldDisplayed(), "Username field is not displayed");
        Assert.assertTrue(loginPage.isPasswordFieldDisplayed(), "Password field is not displayed");
        Assert.assertTrue(loginPage.isLoginButtonDisplayed(), "Login button is not displayed");
        Assert.assertTrue(loginPage.isRememberMeCheckboxDisplayed(), "Remember Me checkbox is not displayed");
        Assert.assertTrue(loginPage.isSalesforceLogoDisplayed(), "Salesforce logo is not displayed");
    }

    @Test(priority = 2, description = "Verify login with valid credentials - Positive Test Case")
    public void verifyValidLogin() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("validuser@example.com", "ValidPassword123!");
        
        boolean isLoginButtonStillPresent = loginPage.isLoginButtonDisplayed();
        Assert.assertFalse(isLoginButtonStillPresent, "Login button should not be displayed after successful login");
    }

    @Test(priority = 3, description = "Verify login with invalid credentials - Negative Test Case")
    public void verifyInvalidLogin() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("invaliduser@example.com", "InvalidPassword123!");
        
        Assert.assertTrue(loginPage.isErrorMessageDisplayed(), "Error message should be displayed for invalid credentials");
        
        String errorMessage = loginPage.getInvalidCredentialsErrorMessage();
        Assert.assertTrue(
            errorMessage.contains("username and password") || 
            errorMessage.contains("check your username") ||
            errorMessage.contains("Your login attempt has failed"),
            "Error message should indicate invalid credentials"
        );
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed(), "Login button should still be displayed after failed login");
    }

    @Test(priority = 4, description = "Verify login with empty username - Negative Test Case")
    public void verifyEmptyUsernameLogin() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("", "SomePassword123!");
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed(), "Login button should still be displayed");
    }

    @Test(priority = 5, description = "Verify login with empty password - Negative Test Case")
    public void verifyEmptyPasswordLogin() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("user@example.com", "");
        
        Assert.assertTrue(loginPage.isErrorMessageDisplayed() || loginPage.isLoginButtonDisplayed(), 
            "Error message or login button should be displayed for empty password");
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed(), "Login button should still be displayed");
    }

    @Test(priority = 6, description = "Verify login with both empty fields - Negative Test Case")
    public void verifyBothFieldsEmptyLogin() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("", "");
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed(), "Login button should still be displayed when both fields are empty");
    }

    @Test(priority = 7, description = "Verify Remember Me functionality")
    public void verifyRememberMeFunctionality() {
        LoginPage loginPage = new LoginPage(driver);
        String username = "testuser@example.com";
        
        loginPage.enterUsername(username);
        loginPage.enterPassword("TestPassword123!");
        loginPage.checkRememberMe();
        
        Assert.assertTrue(loginPage.isRememberMeChecked(), "Remember Me checkbox should be checked");
        
        loginPage.uncheckRememberMe();
        Assert.assertFalse(loginPage.isRememberMeChecked(), "Remember Me checkbox should be unchecked");
    }

    @Test(priority = 8, description = "Verify login with special characters in username - Negative Test Case")
    public void verifySpecialCharactersInUsername() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("user!@#$%^&*()@example.com", "Password123!");
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed() || loginPage.isErrorMessageDisplayed(),
            "Login button or error should be present for invalid username format");
    }

    @Test(priority = 9, description = "Verify login with SQL injection attempt - Security Test Case")
    public void verifySQLInjectionAttempt() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("' OR '1'='1", "' OR '1'='1");
        
        Assert.assertTrue(loginPage.isErrorMessageDisplayed() || loginPage.isLoginButtonDisplayed(),
            "SQL injection attempt should be handled properly");
    }

    @Test(priority = 10, description = "Verify login with XSS attempt - Security Test Case")
    public void verifyXSSAttempt() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("<script>alert('xss')</script>", "password123");
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed() || loginPage.isErrorMessageDisplayed(),
            "XSS attempt should be handled properly");
    }

    @Test(priority = 11, description = "Verify login with very long username - Boundary Test Case")
    public void verifyLongUsername() {
        LoginPage loginPage = new LoginPage(driver);
        String longUsername = "a".repeat(256) + "@example.com";
        
        loginPage.performLogin(longUsername, "Password123!");
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed() || loginPage.isErrorMessageDisplayed(),
            "Long username should be handled properly");
    }

    @Test(priority = 12, description = "Verify login with very long password - Boundary Test Case")
    public void verifyLongPassword() {
        LoginPage loginPage = new LoginPage(driver);
        String longPassword = "b".repeat(256);
        
        loginPage.performLogin("user@example.com", longPassword);
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed() || loginPage.isErrorMessageDisplayed(),
            "Long password should be handled properly");
    }

    @Test(priority = 13, description = "Verify field clear functionality")
    public void verifyFieldClear() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.enterUsername("testuser@example.com");
        loginPage.enterPassword("TestPassword123!");
        
        Assert.assertFalse(loginPage.getUsernameFieldValue().isEmpty(), "Username should be entered");
        Assert.assertFalse(loginPage.getPasswordFieldValue().isEmpty(), "Password should be entered");
        
        loginPage.clearUsernameField();
        loginPage.clearPasswordField();
        
        Assert.assertTrue(loginPage.getUsernameFieldValue().isEmpty(), "Username field should be cleared");
    }

    @Test(priority = 14, description = "Verify login with incorrect email format - Negative Test Case")
    public void verifyInvalidEmailFormat() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("invalidemailformat", "Password123!");
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed() || loginPage.isErrorMessageDisplayed(),
            "Invalid email format should be handled properly");
    }

    @Test(priority = 15, description = "Verify login with only spaces in fields - Negative Test Case")
    public void verifySpacesOnlyLogin() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("   ", "   ");
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed() || loginPage.isErrorMessageDisplayed(),
            "Spaces-only input should be handled properly");
    }

    @Test(priority = 16, description = "Verify username case sensitivity")
    public void verifyUsernameCaseSensitivity() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLogin("USER@EXAMPLE.COM", "Password123!");
        
        Assert.assertTrue(loginPage.isLoginButtonDisplayed() || loginPage.isErrorMessageDisplayed(),
            "Username case sensitivity should be handled");
    }

    @Test(priority = 17, description = "Verify Forgot Password link navigation")
    public void verifyForgotPasswordLink() {
        LoginPage loginPage = new LoginPage(driver);
        String originalUrl = driver.getCurrentUrl();
        
        loginPage.clickForgotPasswordLink();
        
        String currentUrl = driver.getCurrentUrl();
        Assert.assertNotEquals(currentUrl, originalUrl, "URL should change after clicking Forgot Password");
    }

    @Test(priority = 18, description = "Verify Sign Up link navigation")
    public void verifySignUpLink() {
        LoginPage loginPage = new LoginPage(driver);
        String originalUrl = driver.getCurrentUrl();
        
        loginPage.clickSignUpLink();
        
        String currentUrl = driver.getCurrentUrl();
        Assert.assertNotEquals(currentUrl, originalUrl, "URL should change after clicking Sign Up");
    }

    @Test(priority = 19, description = "Verify login with valid credentials and Remember Me checked - Positive Test Case")
    public void verifyValidLoginWithRememberMe() {
        LoginPage loginPage = new LoginPage(driver);
        
        loginPage.performLoginWithRememberMe("validuser@example.com", "ValidPassword123!");
        
        boolean isLoginButtonStillPresent = loginPage.isLoginButtonDisplayed();
        Assert.assertFalse(isLoginButtonStillPresent, "Login button should not be displayed after successful login with Remember Me");
    }

    @Test(priority = 20, description = "Verify multiple failed login attempts handling")
    public void verifyMultipleFailedLoginAttempts() {
        LoginPage loginPage = new LoginPage(driver);
        
        for (int i = 0; i < 3; i++) {
            loginPage.clearUsernameField();
            loginPage.clearPasswordField();
            loginPage.performLogin("wronguser" + i + "@example.com", "WrongPassword123!");
            
            Assert.assertTrue(loginPage.isLoginButtonDisplayed(), "Login should fail for attempt " + (i + 1));
        }
        
        Assert.assertTrue(loginPage.isErrorMessageDisplayed() || loginPage.isLoginButtonDisplayed(),
            "Error handling should work after multiple failed attempts");
    }
}

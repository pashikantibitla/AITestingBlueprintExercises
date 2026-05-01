# CrewAI QA Test Scenarios - Login Page

To ensure comprehensive testing of the login page, I've created five test scenarios that cover various possibilities for given email and password combinations. These scenarios aim to validate the functionality, security, and user experience of the login feature. Here are the detailed test scenarios:

**Scenario 1: Valid Email and Password**
Description: This scenario tests the login functionality with a valid email address and password. The user should be able to log in successfully and be redirected to the dashboard or home page.
Test Steps:
- Enter a valid email address in the email field.
- Enter a valid password in the password field.
- Click the login button.
- Verify that the user is logged in and redirected to the expected page.

**Scenario 2: Invalid Email and Valid Password**
Description: This scenario tests the login functionality with an invalid email address and a valid password. The system should display an error message indicating that the email address is not recognized.
Test Steps:
- Enter an invalid email address in the email field.
- Enter a valid password in the password field.
- Click the login button.
- Verify that an error message is displayed, and the user is not logged in.

**Scenario 3: Valid Email and Invalid Password**
Description: This scenario tests the login functionality with a valid email address and an invalid password. The system should display an error message indicating that the password is incorrect.
Test Steps:
- Enter a valid email address in the email field.
- Enter an invalid password in the password field.
- Click the login button.
- Verify that an error message is displayed, and the user is not logged in.

**Scenario 4: Empty Email and Password Fields**
Description: This scenario tests the login functionality with empty email and password fields. The system should display error messages for both fields, indicating that they are required.
Test Steps:
- Leave the email field empty.
- Leave the password field empty.
- Click the login button.
- Verify that error messages are displayed for both fields, and the user is not logged in.

**Scenario 5: SQL Injection and Cross-Site Scripting (XSS) Attempt**
Description: This scenario tests the login functionality's vulnerability to SQL injection and XSS attacks. The system should prevent such attacks and display an error message or block the attempt.
Test Steps:
- Enter a SQL injection payload (e.g., `' OR 1=1 --`) in the email or password field.
- Enter an XSS payload (e.g., `<script>alert('XSS')</script>`) in the email or password field.
- Click the login button.
- Verify that the system prevents the attack and displays an error message or blocks the attempt.

These five test scenarios cover various possibilities for email and password combinations, ensuring that the login page is thoroughly tested for functionality, security, and user experience.
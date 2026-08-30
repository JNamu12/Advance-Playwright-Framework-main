# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> @P0 @Smoke @Login Login - Using Fixtures >> should display correct username after login
- Location: src\tests\login.spec.ts:121:9

# Error details

```
Error: page.goto: NS_ERROR_CONNECTION_REFUSED
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

# Page snapshot

```yaml
- article [ref=e3]:
  - generic [ref=e6]:
    - heading "Unable to connect" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - text: Nightly can’t connect to the server at
      - strong [ref=e9]: localhost:3000
    - generic [ref=e10]:
      - heading "What can you do about it?" [level=3] [ref=e11]
      - list [ref=e12]:
        - listitem [ref=e13]: The site could be temporarily unavailable or too busy. Try again in a few moments.
        - listitem [ref=e14]: If you are unable to load any pages, check your computer’s network connection.
        - listitem [ref=e15]: If your computer or network is protected by a firewall or proxy, make sure that Nightly is permitted to access the web.
    - button "Try Again" [ref=e18]
```

# Test source

```ts
  1   | import { expect, Page } from '@playwright/test';
  2   | 
  3   | export class LoginPage {
  4   |     private page: Page;
  5   | 
  6   |     constructor(page: Page) {
  7   |         this.page = page;
  8   |     }
  9   | 
  10  |     // ============================================
  11  |     // LOCATORS (as arrow functions)
  12  |     // ============================================
  13  | 
  14  |     usernameInput = () => this.page.locator('#username');
  15  |     passwordInput = () => this.page.locator('#password');
  16  |     loginButton = () => this.page.locator('button[type="submit"]');
  17  |     errorMessage = () => this.page.locator('[data-testid="error-message"]');
  18  |     forgotPasswordLink = () => this.page.locator('a:has-text("Forgot Password")');
  19  |     rememberMeCheckbox = () => this.page.locator('#remember-me');
  20  |     signUpLink = () => this.page.locator('a:has-text("Sign Up")');
  21  |     pageTitle = () => this.page.locator('h1');
  22  | 
  23  |     // ============================================
  24  |     // ACTIONS (simple, single UI interactions)
  25  |     // ============================================
  26  | 
  27  |     /**
  28  |      * Navigate to the login page
  29  |      */
  30  |     async navigate(): Promise<void> {
> 31  |         await this.page.goto('/login');
      |                         ^ Error: page.goto: NS_ERROR_CONNECTION_REFUSED
  32  |     }
  33  | 
  34  |     /**
  35  |      * Enter username in the username field
  36  |      */
  37  |     async enterUsername(username: string): Promise<void> {
  38  |         await this.usernameInput().fill(username);
  39  |     }
  40  | 
  41  |     /**
  42  |      * Enter password in the password field
  43  |      */
  44  |     async enterPassword(password: string): Promise<void> {
  45  |         await this.passwordInput().fill(password);
  46  |     }
  47  | 
  48  |     /**
  49  |      * Click the login button
  50  |      */
  51  |     async clickLogin(): Promise<void> {
  52  |         await this.loginButton().click();
  53  |     }
  54  | 
  55  |     /**
  56  |      * Click the forgot password link
  57  |      */
  58  |     async clickForgotPassword(): Promise<void> {
  59  |         await this.forgotPasswordLink().click();
  60  |     }
  61  | 
  62  |     /**
  63  |      * Toggle the remember me checkbox
  64  |      */
  65  |     async toggleRememberMe(): Promise<void> {
  66  |         await this.rememberMeCheckbox().click();
  67  |     }
  68  | 
  69  |     /**
  70  |      * Click the sign up link
  71  |      */
  72  |     async clickSignUp(): Promise<void> {
  73  |         await this.signUpLink().click();
  74  |     }
  75  | 
  76  |     /**
  77  |      * Get the error message text
  78  |      */
  79  |     async getErrorMessage(): Promise<string> {
  80  |         return (await this.errorMessage().textContent()) || '';
  81  |     }
  82  | 
  83  |     /**
  84  |      * Get the page title text
  85  |      */
  86  |     async getPageTitle(): Promise<string> {
  87  |         return (await this.pageTitle().textContent()) || '';
  88  |     }
  89  | 
  90  |     /**
  91  |      * Clear the username field
  92  |      */
  93  |     async clearUsername(): Promise<void> {
  94  |         await this.usernameInput().clear();
  95  |     }
  96  | 
  97  |     /**
  98  |      * Clear the password field
  99  |      */
  100 |     async clearPassword(): Promise<void> {
  101 |         await this.passwordInput().clear();
  102 |     }
  103 | 
  104 |     // ============================================
  105 |     // ASSERTIONS (inline expectations)
  106 |     // ============================================
  107 | 
  108 |     /**
  109 |      * Expect error message to be visible
  110 |      */
  111 |     async expectErrorVisible(): Promise<void> {
  112 |         await expect(this.errorMessage()).toBeVisible();
  113 |     }
  114 | 
  115 |     /**
  116 |      * Expect error message to be hidden
  117 |      */
  118 |     async expectErrorHidden(): Promise<void> {
  119 |         await expect(this.errorMessage()).toBeHidden();
  120 |     }
  121 | 
  122 |     /**
  123 |      * Expect login button to be enabled
  124 |      */
  125 |     async expectLoginButtonEnabled(): Promise<void> {
  126 |         await expect(this.loginButton()).toBeEnabled();
  127 |     }
  128 | 
  129 |     /**
  130 |      * Expect login button to be disabled
  131 |      */
```
// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const registerSubmitBtn = document.getElementById('register-btn');

// Error Elements
const emailError = document.getElementById('email-error');
const phoneError = document.getElementById('phone-error');

// Toggle to Registration Form
showRegisterBtn.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

// Toggle to Login Form
showLoginBtn.addEventListener('click', () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Registration Validation Logic
registerSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent page reload

    // Grab input values
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    
    let isValid = true;

    // Reset error messages
    emailError.style.display = 'none';
    phoneError.style.display = 'none';

    // Validate Email
    if (!email.endsWith('@gmail.com') && !email.endsWith('@outlook.com')) {
        emailError.style.display = 'block';
        isValid = false;
    }

    // Validate Phone (Exactly 10 digits)
    if (phone.length !== 10) {
        phoneError.style.display = 'block';
        isValid = false;
    }

    // If validations pass
    if (isValid) {
        alert("Validation Passed! Ready to send to Spring Boot Backend.");
        // Normally, you would trigger your API fetch request here.
    }
});

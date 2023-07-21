const registrationForm = document.getElementById('registrationForm');
const errorMessage = document.getElementById('errorMessage');

registrationForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Validate password and confirm password
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
        errorMessage.textContent = "Password does not match Confirm Password";
        console.log(errorMessage.textContent);
        //return;
        console.log(errorMessage.textContent);
    }

    // Submit the form
    registrationForm.submit();
});
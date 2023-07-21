const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Get the user/email and password from the form
    const userEmail = document.getElementById('userEmail').value;
    const password = document.getElementById('password').value;

    // Submit the form data using Fetch API (AJAX)
    fetch('/authentication/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userEmail, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Handle the response from the server
            if (data.success) {
                window.location.href = 'http://127.0.0.1:666'; // Redirect to the root page on successful login
            } else {
                errorMessage.textContent = data.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'Server error';
        });
});
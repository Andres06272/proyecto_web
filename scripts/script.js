const container = document.querySelector('.container')
const registerBtn = document.querySelector('.register-btn')
const loginBtn = document.querySelector('.login-btn')

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
})

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
})

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');

    // URL base de la API (ajustar según sea necesario)
    const API_BASE_URL = 'http://tu-backend.com/api';

    // Toggle entre formularios
    registerBtn.addEventListener('click', () => {
        container.classList.add('active');
    });

    loginBtn.addEventListener('click', () => {
        container.classList.remove('active');
    });

    // Manejar el registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        // Validación básica
        if (!username || !email || !password) {
            showMessage(registerMessage, 'Por favor completa todos los campos', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre: username,
                    correo: email,
                    contraseña: password
                })
            });

            if (response.ok) {
                showMessage(registerMessage, '¡Registro exitoso! Por favor inicia sesión.', 'success');
                // Cambiar al formulario de login después de 2 segundos
                setTimeout(() => {
                    container.classList.remove('active');
                    registerForm.reset();
                    registerMessage.textContent = '';
                }, 2000);
            } else if (response.status === 409) {
                showMessage(registerMessage, 'El correo electrónico ya está registrado.', 'error');
            } else {
                showMessage(registerMessage, 'Error en el registro. Por favor intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(registerMessage, 'Error de conexión. Por favor intenta nuevamente.', 'error');
        }
    });

    // Manejar el login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Validación básica
        if (!email || !password) {
            showMessage(loginMessage, 'Por favor completa todos los campos', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    contraseña: password
                })
            });

            if (response.ok) {
                const data = await response.json();
                // Guardar el token en localStorage
                localStorage.setItem('authToken', data.token);
                // Redirigir al dashboard
                window.location.href = 'dashboard.html';
            } else if (response.status === 401) {
                showMessage(loginMessage, 'Contraseña incorrecta.', 'error');
            } else if (response.status === 404) {
                showMessage(loginMessage, 'Usuario no encontrado.', 'error');
            } else {
                showMessage(loginMessage, 'Error en el inicio de sesión. Por favor intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(loginMessage, 'Error de conexión. Por favor intenta nuevamente.', 'error');
        }
    });

    // Función para mostrar mensajes
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message ' + type;
    }
});
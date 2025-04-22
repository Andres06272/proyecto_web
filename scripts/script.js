document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');

    // URL base de la API (backend local de tu compañero)
    const API_BASE_URL = 'http://localhost:8080/api';

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
                    name: username,
                    email: email,
                    password: password,
                    roleEntity: {
                        id: 1 // ID del rol por defecto (1 para usuarios normales)
                    }
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
            } else {
                const errorData = await response.json();
                if (response.status === 409) {
                    showMessage(registerMessage, errorData.message || 'El correo electrónico ya está registrado.', 'error');
                } else {
                    showMessage(registerMessage, errorData.message || 'Error en el registro. Por favor intenta nuevamente.', 'error');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(registerMessage, 'Error de conexión con el servidor. Por favor intenta nuevamente.', 'error');
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
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar el token en localStorage
                localStorage.setItem('authToken', data.token);
                // Redirigir al dashboard
                window.location.href = 'dashboard.html';
            } else if (response.status === 401) {
                showMessage(loginMessage, data.message || 'Credenciales incorrectas', 'error');
            } else if (response.status === 404) {
                showMessage(loginMessage, data.message || 'Usuario no encontrado', 'error');
            } else {
                showMessage(loginMessage, data.message || 'Error en el inicio de sesión', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage(loginMessage, 'Error de conexión con el servidor', 'error');
        }
    });

    // Función para mostrar mensajes
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message ' + type;
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 5000);
    }
});
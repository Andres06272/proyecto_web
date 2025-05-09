document.addEventListener('DOMContentLoaded', function() {
    // Configuración de la API
    const API_BASE_URL = 'https://e74d-2803-1800-133a-e914-a34b-1e51-ff20-8ff4.ngrok-free.app/api';
    
    // Elementos del DOM
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');

    // Configuración común para fetch
    const fetchConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        }
    };

    // Función para mostrar mensajes
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'message ' + type;
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 5000);
    }

    // Función para enviar correo de confirmación
    async function sendConfirmationEmail(email, username) {
        try {
            const response = await fetch(`${API_BASE_URL}/send-welcome-email`, {
                ...fetchConfig,
                method: 'POST',
                body: JSON.stringify({
                    recipient: email,
                    subject: '¡Bienvenido a Turismo Médico!',
                    body: `
                        ¡Gracias por registrarte, ${username}!
                        Tu cuenta en Turismo Médico ha sido creada exitosamente.
                        Ahora puedes acceder a todos nuestros servicios médicos.
                        Si no realizaste este registro, por favor contacta con soporte.
                    `
                })
            });
            
            if (!response.ok) {
                console.warn('El correo no pudo enviarse, pero el registro fue exitoso');
            }
        } catch (error) {
            console.error('Error enviando correo:', error);
        }
    }

    // Manejar el registro
    async function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        // Validación básica
        if (!username || !email || !password) {
            showMessage(registerMessage, 'Por favor completa todos los campos', 'error');
            return;
        }

        // Validación de email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showMessage(registerMessage, 'Por favor ingresa un email válido', 'error');
            return;
        }

        try {
            // 1. Registrar al usuario
            const registerResponse = await fetch(`${API_BASE_URL}/users`, {
                ...fetchConfig,
                method: 'POST',
                body: JSON.stringify({
                    name: username,
                    email: email,
                    password: password,
                    roleEntity: { id: 2 } // 2 para usuario normal
                })
            });

            if (registerResponse.ok) {
                // 2. Enviar correo de confirmación (en segundo plano)
                sendConfirmationEmail(email, username);
                
                // 3. Mostrar mensaje al usuario
                showMessage(registerMessage, '¡Registro exitoso! Revisa tu correo para la confirmación.', 'success');
                
                // 4. Cambiar a vista de login después de 3 segundos
                setTimeout(() => {
                    container.classList.remove('active');
                    registerForm.reset();
                }, 3000);
                
            } else if (registerResponse.status === 409) {
                showMessage(registerMessage, 'Este correo ya está registrado', 'error');
            } else {
                showMessage(registerMessage, 'Error en el registro. Intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            showMessage(registerMessage, 'Error de conexión con el servidor', 'error');
        }
    }

    // Manejar el login
    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                ...fetchConfig,
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (response.status === 200) {
                const data = await response.json();
                
                if (!data.token) {
                    throw new Error('El servidor no devolvió un token válido');
                }
                
                localStorage.setItem('authToken', data.token);
                window.location.href = 'home.html';
                
            } else if (response.status === 401) {
                showMessage(loginMessage, 'Contraseña incorrecta', 'error');
            } else if (response.status === 404) {
                showMessage(loginMessage, 'Usuario no encontrado', 'error');
            } else {
                const errorData = await response.json().catch(() => ({}));
                showMessage(loginMessage, errorData.message || `Error inesperado (${response.status})`, 'error');
            }
            
        } catch (error) {
            console.error('Error en login:', error);
            showMessage(loginMessage, error.message || 'Error de conexión con el servidor', 'error');
        }
    }

    // Event Listeners
    registerBtn.addEventListener('click', () => container.classList.add('active'));
    loginBtn.addEventListener('click', () => container.classList.remove('active'));
    registerForm.addEventListener('submit', handleRegister);
    loginForm.addEventListener('submit', handleLogin);
});
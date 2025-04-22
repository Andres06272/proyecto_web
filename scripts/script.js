document.addEventListener('DOMContentLoaded', function() {
    // Configuración de la API
    const API_BASE_URL = 'https://0683-190-24-56-13.ngrok-free.app/api';
    
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

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                ...fetchConfig,
                method: 'POST',
                body: JSON.stringify({
                    name: username,
                    email: email,
                    password: password,
                    roleEntity: { id: 2 } // 2 para usuario normal, 1 para admin
                })
            });

            if (response.ok) {
                showMessage(registerMessage, '¡Registro exitoso! Por favor inicia sesión.', 'success');
                setTimeout(() => {
                    container.classList.remove('active');
                    registerForm.reset();
                }, 2000);
            } else if (response.status === 409) {
                showMessage(registerMessage, 'El correo electrónico ya está registrado', 'error');
            } else {
                showMessage(registerMessage, 'Error en el registro. Intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error en registro:', error);
            showMessage(registerMessage, 'Error de conexión con el servidor', 'error');
        }
    }

    // Manejar el login (adaptado a la API de tu compañero)
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

            // Manejo específico de códigos de estado
            if (response.status === 200) {
                const data = await response.json();
                
                if (!data.token) {
                    throw new Error('El servidor no devolvió un token válido');
                }
                
                // Guardar token y redirigir
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

    // Función de diagnóstico (opcional)
    async function checkBackendConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                ...fetchConfig,
                method: 'GET'
            });
            
            if (!response.ok) {
                console.warn('El backend respondió con estado:', response.status);
            }
        } catch (error) {
            console.error('Error conectando al backend:', error);
        }
    }
    
    // Verificar conexión al cargar (opcional)
    checkBackendConnection();
});
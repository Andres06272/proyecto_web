document.addEventListener('DOMContentLoaded', function() {
    // Configuración de la API con la URL que te envió tu compañero
    const API_BASE_URL = 'https://0683-190-24-56-13.ngrok-free.app/api';
    
    // Configuración optimizada para CORS
    const fetchConfig = {
        mode: 'cors',
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
        setTimeout(() => element.textContent = '', 5000);
    }

    // Verificar conexión con el backend
    async function checkBackendConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                ...fetchConfig,
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error('Error verificando conexión:', error);
            showMessage(document.getElementById('loginMessage'), 'Error conectando al servidor', 'error');
            showMessage(document.getElementById('registerMessage'), 'Error conectando al servidor', 'error');
            return false;
        }
    }

    // Manejar el registro
    async function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const registerMessage = document.getElementById('registerMessage');

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
                    roleEntity: { id: 2 } // ID 2 para usuarios normales (1 para admin)
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(registerMessage, '¡Registro exitoso! Por favor inicia sesión.', 'success');
                setTimeout(() => {
                    container.classList.remove('active');
                    registerForm.reset();
                }, 2000);
            } else {
                showMessage(registerMessage, data.message || 'Error en el registro', 'error');
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
        const loginMessage = document.getElementById('loginMessage');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                ...fetchConfig,
                method: 'POST',
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                window.location.href = 'dashboard.html';
            } else {
                showMessage(loginMessage, data.message || 'Credenciales incorrectas', 'error');
            }
        } catch (error) {
            console.error('Error en login:', error);
            showMessage(loginMessage, 'Error de conexión con el servidor', 'error');
        }
    }

    // Inicialización
    const container = document.querySelector('.container');
    const registerBtn = document.querySelector('.register-btn');
    const loginBtn = document.querySelector('.login-btn');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    registerBtn.addEventListener('click', () => container.classList.add('active'));
    loginBtn.addEventListener('click', () => container.classList.remove('active'));
    registerForm.addEventListener('submit', handleRegister);
    loginForm.addEventListener('submit', handleLogin);

    // Verificar conexión al cargar
    checkBackendConnection();
});
let isAuthenticated = false

function renderPage(page) {
  if (page !== "login" && !isAuthenticated) {
    renderPage("login")
    return
  }

  const appContainer = document.getElementById("app")
  appContainer.innerHTML = ""

  if (isAuthenticated && page !== "login") {
    const navbar = document.createElement("nav")
    navbar.className = "navbar"
    navbar.innerHTML = `
            <ul>
                <li><a href="#" onclick="logout()">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Cerrar Sesión
                </a></li>
                <li><a href="#" onclick="renderPage('chat')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Chat
                </a></li>
                <li><a href="#" onclick="renderPage('voicebot')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><circle cx="12" cy="12" r="4"></circle></svg>
                    Voicebot
                </a></li>
            </ul>
        `
    appContainer.appendChild(navbar)
  }

  if (page === "login") {
    appContainer.innerHTML = `
            <div class="login-container">
                <div class="login-box">
                    <div class="login-logo">
                        <img src="logo.png" alt="Kognia Logo">
                    </div>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="username">Usuario</label>
                            <input type="text" id="username" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Contraseña</label>
                            <input type="password" id="password" required>
                        </div>
                        <button type="submit" class="btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                            Iniciar Sesión
                        </button>
                    </form>
                    <div id="login-message"></div>
                </div>
            </div>
        `
    document.querySelector("#login-form").addEventListener("submit", handleLogin)
    return
  }

  appContainer.innerHTML = `
        <div class="app-container">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="logo.png" alt="Kognia Logo">
                </div>
               
                <nav>
                    <ul class="nav-links">
                        <li><a href="#" onclick="renderPage('chat')" class="${page === "chat" ? "active" : ""}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            Chat
                        </a></li>
                        <li><a href="#" onclick="renderPage('voicebot')" class="${page === "voicebot" ? "active" : ""}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><circle cx="12" cy="12" r="4"></circle></svg>
                            Voicebot
                        </a></li>
                    </ul>
                </nav>
            </aside>
            <main class="main-content">
                <div id="page-content"></div>
            </main>
        </div>
    `

  const pageContent = document.getElementById("page-content")

  switch (page) {
    case "chat":
      renderChatPage(pageContent)
      break
    case "voicebot":
      renderVoicebotPage(pageContent)
      break
  }
}

function handleLogin(e) {
  e.preventDefault()
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  const messageElement = document.getElementById("login-message")

  if (username === "kognia" && password === "1234") {
    isAuthenticated = true
    messageElement.textContent = "Inicio de sesión exitoso"
    messageElement.className = "success"

    // Añadir animación de carga
    messageElement.innerHTML = `
            <div class="loading-spinner" style="display: inline-block; margin-right: 10px;"></div>
            Iniciando sesión...
        `

    setTimeout(() => {
      renderPage("chat")
    }, 1500)
  } else {
    messageElement.textContent = "Credenciales incorrectas"
    messageElement.className = "error"

    // Añadir animación de shake al formulario
    const form = document.getElementById("login-form")
    form.classList.add("shake")
    setTimeout(() => {
      form.classList.remove("shake")
    }, 500)
  }
}

function logout() {
  isAuthenticated = false
  renderPage("login")
}

function renderChatPage(container) {
  container.innerHTML = `
        <div class="page-header">
            <h1 class="chat-title">Chat Asistente</h1>
        </div>
        <div class="chat-container" style="width: 100%; height: 80vh; display: flex; flex-direction: column;">
            <div class="chat-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px;">
                <span class="chat-bot-name">Alan</span>
                <div class="chat-bot-status">
                    <span class="status-dot"></span>
                    <span class="status-text">En línea</span>
                </div>
            </div>
            <div class="loading" id="chat-loading">
                <div class="loading-spinner"></div>
            </div>
            <iframe 
                src="https://copilotstudio.microsoft.com/environments/Default-a8195a51-a3b6-4a79-b3ea-7031366f77d5/bots/cr65f_gaee/webchat?__version__=2" 
                frameborder="0" 
                class="chat-iframe" 
                style="opacity: 0;"
                id="chat-iframe"
                onload="handleIframeLoad()">
            </iframe>
        </div>
    `
}

function handleIframeLoad() {
  const iframe = document.getElementById("chat-iframe")
  const loading = document.getElementById("chat-loading")

  setTimeout(() => {
    if (loading) loading.style.display = "none"
    if (iframe) iframe.style.opacity = "1"
  }, 1000)
}

function renderVoicebotPage(container) {
  container.innerHTML = `
        <div class="page-header">
            <h1 class="voicebot-title">Asistente de Voz</h1>
        </div>
        <div class="voicebot-container">
            <div class="loading" id="voicebot-loading">
                <div class="loading-spinner"></div>
            </div>
            <iframe 
                src="VOICEBOT/index.html" 
                style="width: 100%; height: 100%; border: none; opacity: 0;" 
                id="voicebot-iframe"
                onload="handleVoicebotIframeLoad()">
            </iframe>
        </div>
    `
}

function handleVoicebotIframeLoad() {
  const iframe = document.getElementById("voicebot-iframe")
  const loading = document.getElementById("voicebot-loading")

  setTimeout(() => {
    if (loading) loading.style.display = "none"
    if (iframe) iframe.style.opacity = "1"
  }, 1000)
}

// Añadir animación de shake
document.head.insertAdjacentHTML(
  "beforeend",
  `
    <style>
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
    </style>
`,
)

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  renderPage("login")
})


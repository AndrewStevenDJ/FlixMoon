// --- FlixMoon auth.js ---

// Función para obtener lista de usuarios registrados (array)
function getRegisteredUsers() {
  return JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
}

// Función para guardar lista de usuarios registrados
function saveRegisteredUsers(users) {
  localStorage.setItem("usuariosRegistrados", JSON.stringify(users));
}

// Registrar un usuario
function registerUser(username, email, password) {
  const users = getRegisteredUsers();

  // Verificar si el email ya está registrado
  if (users.find(u => u.email === email)) {
    return { success: false, message: "El correo ya está registrado." };
  }

  // Agregar nuevo usuario
  users.push({ username, email, password });
  saveRegisteredUsers(users);
  return { success: true };
}

// Iniciar sesión
function loginUser(email, password) {
  const users = getRegisteredUsers();

  const user = users.find(u => u.email === email);
  if (!user) {
    return { success: false, message: "Usuario no encontrado." };
  }

  if (user.password !== password) {
    return { success: false, message: "Contraseña incorrecta." };
  }

  // Guardar usuario activo en localStorage
  localStorage.setItem("usuario", JSON.stringify({ username: user.username, email: user.email }));
  return { success: true, user };
}

// Cerrar sesión
function logoutUser() {
  localStorage.removeItem("usuario");
}

// Verificar si hay sesión activa
function isAuthenticated() {
  return !!localStorage.getItem("usuario");
}

document.addEventListener("DOMContentLoaded", () => {
  const authSection = document.getElementById("authSection");
  const appSection = document.getElementById("appSection");
  const profileBtn = document.getElementById("profileBtn");
  const modalPerfil = document.getElementById("modalPerfil");
  const cerrarPerfil = document.getElementById("cerrarPerfil");
  const perfilForm = document.getElementById("perfilForm");
  const perfilUsername = document.getElementById("perfilUsername");
  const perfilEmail = document.getElementById("perfilEmail");
  const perfilPassword = document.getElementById("perfilPassword");
  const btnLogoutPerfil = document.getElementById("btnLogoutPerfil");
  const perfilMsg = document.getElementById("perfilMsg");
  const bienvenidaUsuario = document.getElementById("bienvenidaUsuario");

  // Vistas y formularios
  const loginView = document.getElementById("loginView");
  const registerView = document.getElementById("registerView");
  const formLogin = document.getElementById("formLogin");
  const formRegister = document.getElementById("formRegister");
  const loginError = document.getElementById("loginError");
  const registerError = document.getElementById("registerError");
  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");

  // Mostrar la app o login según sesión
  if (isAuthenticated()) {
    mostrarApp();
  } else {
    mostrarLogin();
  }

  // Mostrar/ocultar icono de perfil
  function toggleProfileBtn(show) {
    if (profileBtn) profileBtn.style.display = show ? "inline-block" : "none";
  }

  // Cambiar entre vistas
  showRegister.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarRegistro();
  });
  showLogin.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarLogin();
  });

  // Login
  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    limpiarLoginError();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    if (!email || !password) {
      mostrarLoginError("Completa todos los campos");
      return;
    }
    const login = loginUser(email, password);
    if (!login.success) {
      mostrarLoginError(login.message);
    } else {
      mostrarApp();
    }
  });

  // Registro
  formRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    limpiarRegisterError();
    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    if (!username || !email || !password) {
      mostrarRegisterError("Completa todos los campos");
      return;
    }
    const registro = registerUser(username, email, password);
    if (!registro.success) {
      mostrarRegisterError(registro.message);
    } else {
      mostrarLogin();
      mostrarLoginError("¡Registro exitoso! Ahora inicia sesión.");
    }
  });

  function mostrarApp() {
    authSection.style.display = "none";
    appSection.style.display = "block";
    toggleProfileBtn(true);
    mostrarBienvenidaUsuario();
    // Mostrar botón Mi lista
    const btnMiLista = document.getElementById('btnMiLista');
    if (btnMiLista) btnMiLista.style.display = "inline-block";
  }

  function mostrarLogin() {
    authSection.style.display = "block";
    appSection.style.display = "none";
    toggleProfileBtn(false);
    loginView.style.display = "block";
    registerView.style.display = "none";
    formLogin.reset();
    limpiarLoginError();
    if (bienvenidaUsuario) bienvenidaUsuario.style.display = "none";
    // Ocultar botón Mi lista
    const btnMiLista = document.getElementById('btnMiLista');
    if (btnMiLista) btnMiLista.style.display = "none";
  }

  function mostrarRegistro() {
    authSection.style.display = "block";
    appSection.style.display = "none";
    toggleProfileBtn(false);
    loginView.style.display = "none";
    registerView.style.display = "block";
    formRegister.reset();
    limpiarRegisterError();
    if (bienvenidaUsuario) bienvenidaUsuario.style.display = "none";
    // Ocultar botón Mi lista
    const btnMiLista = document.getElementById('btnMiLista');
    if (btnMiLista) btnMiLista.style.display = "none";
  }

  function mostrarLoginError(msg) {
    loginError.textContent = msg;
    loginError.style.display = "block";
  }
  function limpiarLoginError() {
    loginError.textContent = "";
    loginError.style.display = "none";
  }
  function mostrarRegisterError(msg) {
    registerError.textContent = msg;
    registerError.style.display = "block";
  }
  function limpiarRegisterError() {
    registerError.textContent = "";
    registerError.style.display = "none";
  }

  // Bienvenida junto al perfil
  function mostrarBienvenidaUsuario() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && bienvenidaUsuario) {
      bienvenidaUsuario.textContent = `Bienvenido, ${usuario.username}`;
      bienvenidaUsuario.style.display = "inline-block";
    }
    mostrarSugerencias();
  }

  // Sugerencias y estrenos (solo estructura, la lógica de consulta va en main.js)
  function mostrarSugerencias() {
    const sugerencias = document.getElementById("sugerencias");
    sugerencias.innerHTML = "<div class='sugerencia-card'>Cargando sugerencias...</div>";
    // Aquí se puede llamar a una función global para cargar sugerencias reales
    if (window.cargarSugerencias) window.cargarSugerencias();
  }

  // --- Modal de perfil ---
  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      cargarPerfil();
      modalPerfil.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  }
  if (cerrarPerfil) {
    cerrarPerfil.addEventListener("click", () => {
      modalPerfil.style.display = "none";
      perfilMsg.textContent = "";
      document.body.style.overflow = "auto";
    });
  }
  // Cargar datos del usuario en el modal
  function cargarPerfil() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (!usuario) return;
    perfilUsername.value = usuario.username;
    perfilEmail.value = usuario.email;
    perfilPassword.value = "";
    perfilMsg.textContent = "";
  }
  // Guardar cambios de perfil
  if (perfilForm) {
    perfilForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nuevoNombre = perfilUsername.value.trim();
      const nuevaPass = perfilPassword.value.trim();
      if (!nuevoNombre) {
        perfilMsg.textContent = "El nombre de usuario no puede estar vacío.";
        return;
      }
      // Actualizar usuario en localStorage
      let usuarios = JSON.parse(localStorage.getItem("usuariosRegistrados")) || [];
      let usuario = JSON.parse(localStorage.getItem("usuario"));
      const idx = usuarios.findIndex(u => u.email === usuario.email);
      if (idx !== -1) {
        usuarios[idx].username = nuevoNombre;
        if (nuevaPass) usuarios[idx].password = nuevaPass;
        localStorage.setItem("usuariosRegistrados", JSON.stringify(usuarios));
        usuario.username = nuevoNombre;
        localStorage.setItem("usuario", JSON.stringify(usuario));
        cargarPerfil();
        perfilMsg.textContent = "¡Datos actualizados!";
      }
    });
  }
  // Logout desde el modal
  if (btnLogoutPerfil) {
    btnLogoutPerfil.addEventListener("click", () => {
      logoutUser();
      modalPerfil.style.display = "none";
      perfilMsg.textContent = "";
      document.body.style.overflow = "auto";
      // Ocultar botón Mi lista al hacer logout
      const btnMiLista = document.getElementById('btnMiLista');
      if (btnMiLista) btnMiLista.style.display = "none";
      mostrarLogin();
    });
  }
});

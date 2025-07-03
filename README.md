# 🌙 FlixMoon - Catálogo de Películas

## 📋 Descripción del Proyecto

FlixMoon es una aplicación web para explorar y descubrir películas y series de televisión. Permite buscar contenido, ver detalles completos, crear listas de favoritos y gestionar un perfil de usuario.

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura de la página
- **CSS3** - Estilos y diseño responsive
- **JavaScript** - Funcionalidad interactiva
- **TMDb API** - Base de datos de películas
- **LocalStorage** - Almacenamiento local

## 🚀 Cómo Ejecutar el Proyecto

### **Método 1: Versión Online (Más Fácil)**
🌐 **Accede directamente a la aplicación desplegada:**
- [https://andrewstevendj.github.io/FlixMoon/](https://andrewstevendj.github.io/FlixMoon/)

¡No necesitas descargar nada! Solo abre el enlace en tu navegador.

### **Requisitos Previos**
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para acceder a la API de películas)

### **Método 2: Abrir Directamente**
1. Descarga o clona el proyecto
2. Abre el archivo `index.html` en tu navegador
3. ¡Listo! La aplicación debería funcionar

### **Método 3: Servidor Local (Recomendado)**
1. Abre tu terminal o línea de comandos
2. Navega hasta la carpeta del proyecto
3. Ejecuta uno de estos comandos:

**Con Python:**
```bash
python -m http.server 8000
```

**Con Node.js:**
```bash
npx http-server
```

**Con PHP:**
```bash
php -S localhost:8000
```

4. Abre tu navegador y ve a: `http://localhost:8000`

### **Método 4: Live Server (VS Code)**
1. Instala la extensión "Live Server" en VS Code
2. Abre la carpeta del proyecto
3. Haz clic derecho en `index.html`
4. Selecciona "Open with Live Server"

## 📁 Estructura del Proyecto

```
flixmoon/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos de la aplicación
├── js/
│   ├── auth.js         # Sistema de autenticación
│   └── main.js         # Funcionalidad principal
├── README.md           # Este archivo
└── .gitignore          # Archivos a ignorar
```

## 🎯 Funcionalidades Principales

### **Para Todos los Usuarios:**
- 🔍 Buscar películas y series
- 🎭 Ver detalles completos con tráilers
- 🖼️ Galería de imágenes navegable
- 📱 Diseño responsive

### **Para Usuarios Registrados:**
- 👤 Crear cuenta y gestionar perfil
- ❤️ Guardar favoritos en "Mi Lista"
- 🔐 Sistema de autenticación seguro

### **👤 Usuario Demo (Predefinido):**
- **📧 Correo:** `demo@flixmoon.com`
- **🔒 Contraseña:** `demo123`
- **💡** Puedes usar estas credenciales para probar la aplicación sin registrarte

## 🎨 Características de la Interfaz

- **Tema oscuro** elegante y moderno
- **Animaciones suaves** y efectos hover
- **Diseño responsive** para móviles, tablets y desktop
- **Navegación intuitiva** con controles de teclado

## 🔧 Solución de Problemas

### **La aplicación no carga:**
- Verifica tu conexión a internet
- Asegúrate de que todos los archivos estén en la carpeta correcta
- Intenta usar un servidor local en lugar de abrir directamente

### **Las imágenes no se ven:**
- Verifica tu conexión a internet
- La API de TMDb puede tener limitaciones temporales

### **El registro no funciona:**
- Verifica que tu navegador soporte LocalStorage
- Intenta en modo incógnito

## 📞 Soporte

Si tienes problemas para ejecutar el proyecto:
1. Verifica que todos los archivos estén presentes
2. Asegúrate de tener conexión a internet
3. Intenta con un navegador diferente

## 👨‍💻 Autor

**Steven Diaz**
- Estudiante de desarrollo web
- Proyecto académico

---

*Proyecto creado para fines educativos | Datos de [TMDb](https://www.themoviedb.org/)*
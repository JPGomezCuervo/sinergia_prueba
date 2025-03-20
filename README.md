## SINERGIA CREATIVA PRUEBA TECNICA
Este proyecto es una aplicación web mobile first con funcionalidades básicas de autenticación, gestión de empresas, productos, socios y **simulaciones o planeaciones mensuales**. Está pensado como una prueba técnica y busca ser fácil de ejecutar y probar. Está desarrollada con NextJS, Tailwind, ShadCN y SQLite.

## ¿Cómo ejecuta el proyecto?

### 🐧 Para sistemas Unix-like (Linux / macOS)

1. Clona este repositorio:
   ```bash
   git clone https://github.com/JPGomezCuervo/sinergia_prueba

2. Entra al directorio del proyecto
   ```bash
   cd ./conteo-prueba

3. Instala las dependencias y arranca el servidor de desarrollo
   ```bash
   cd npm install && npm run build && npm run start
   
4. Abre tu navegador en http://localhost:3000 (o la URL que te muestre la terminal)

### 🪟 ¿Y en Windows?

Si estás en Windows y no usas WSL (Windows Subsystem for Linux), igual pueded ejecutar el proyecto:

1. Instala Node.js desde su sitio oficial: https://nodejs.org/
2. Usa Git Bash o PowerShell para los comandos.
3. Luego, sigue los mismos pasos que para Unix: clonar, instalar dependencias y correr `npm run dev`.

⚠️ Recomendación: usar WSL es más cómodo si estás haciendo proyectos web con herramientas pensadas para Unix.

## Funcionalidades principales

La aplicación tiene dos vistas principales:

**Login:** Para autenticarse en el sistema.

**Dashboard:** Desde aquí puedes: Crear empresas. Crear productos asociados a las empresas. Crear Miembros. Crear planeaciones mensuales. Eliminar empresas. Eliminar productos. Eliminar miembros. Eliminar planeaciones mensuales Todo desde una interfaz sencilla y directa.

## Usuario de prueba
### Para que puedas comenzar a probar sin perder tiempo creando cuentas, ya viene un usuario preconfigurado: ###

**Email:** admin@admin.com

**Contraseña:** en el correo electrónico que te envié está :) 

De todas formas, si lo deseas, puedes crear tu propio usuario desde la pantalla de login.

## Datos precargados 
El sistema ya incluye algunas empresas **si inicias sesión con los usuario suministrados** y productos de ejemplo, así que puedes comenzar a probar funcionalidades desde el primer minuto. Pero si quieres, puedes eliminarlos, modificarlos o agregar nuevos sin problema.

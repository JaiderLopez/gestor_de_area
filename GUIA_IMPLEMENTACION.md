# Guía de Implementación del Sistema - Gestor de Áreas

Esta guía detalla los pasos necesarios para desplegar y ejecutar el proyecto "Gestor de Áreas" en un nuevo dispositivo. El sistema consta de un backend desarrollado en Django (Python) y un frontend en React (JavaScript).

## 1. Requisitos Previos

Antes de comenzar, asegúrate de tener instalado el siguiente software en el dispositivo:

*   **Python**: Versión 3.10 o superior. [Descargar Python](https://www.python.org/downloads/)
*   **Node.js**: Versión 16 o superior (incluye npm). [Descargar Node.js](https://nodejs.org/)
*   **PostgreSQL**: Base de datos relacional. [Descargar PostgreSQL](https://www.postgresql.org/download/)
*   **Git**: Para clonar el repositorio (opcional si descargas el código como ZIP).

## 2. Clonar el Repositorio

Si tienes acceso al repositorio git, clónalo en tu máquina local. Si tienes el código fuente en un archivo comprimido, descomprímelo en la ubicación deseada.

```bash
git clone <URL_DEL_REPOSITORIO>
cd gestor_de_area
```

## 3. Configuración de Base de Datos (PostgreSQL)

1.  Abre pgAdmin o tu terminal de SQL favorita.
2.  Crea una nueva base de datos y un usuario con los siguientes credenciales (o ajusta `backend/gestor_areas_project/settings.py` más tarde):

```sql
CREATE DATABASE gestor_areas_db;
CREATE USER user_admin WITH PASSWORD 'admin111-';
ALTER ROLE user_admin SET client_encoding TO 'utf8';
ALTER ROLE user_admin SET default_transaction_isolation TO 'read committed';
ALTER ROLE user_admin SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE gestor_areas_db TO user_admin;
```

> **Nota:** Si cambias el nombre, usuario o contraseña, deberás actualizar el archivo `backend/gestor_areas_project/settings.py` en la sección `DATABASES`.

## 4. Configuración del Backend (Django)

1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```

2.  Crea un entorno virtual para aislar las dependencias:
    ```bash
    python -m venv venv
    ```

3.  Activa el entorno virtual:
    *   **Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    *   **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```

4.  Instala las dependencias necesarias:
    ```bash
    pip install -r requirements.txt
    ```

5.  Realiza las migraciones para crear las tablas en la base de datos:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

6.  (Opcional) Crea un superusuario para acceder al panel de administración:
    ```bash
    python manage.py createsuperuser
    ```

7.  Ejecuta el servidor de desarrollo:
    ```bash
    python manage.py runserver
    ```
    El backend estará corriendo en `http://127.0.0.1:8000/`.

## 5. Configuración del Frontend (React)

1.  Abre una nueva terminal y navega a la carpeta del frontend:
    ```bash
    cd frontend
    ```

2.  Instala las dependencias del proyecto:
    ```bash
    npm install
    ```

3.  Inicia la aplicación de React:
    ```bash
    npm start
    ```
    El frontend debería abrirse automáticamente en tu navegador en `http://localhost:3000/`.

## 6. Verificación

Una vez que ambos servidores (Backend y Frontend) estén corriendo:

1.  Abre tu navegador y ve a `http://localhost:3000/`.
2.  Deberías ver la interfaz de usuario del Gestor de Áreas.
3.  Intenta navegar por las diferentes pestañas (Dashboard, Inventario, Mantenimiento) para verificar que los datos se cargan correctamente desde el backend.

## Solución de Problemas Comunes

*   **Error de conexión a Base de Datos:** Verifica que el servicio de PostgreSQL esté corriendo y que las credenciales en `settings.py` coincidan con las configuradas en tu base de datos.
*   **Error CORS:** Si el frontend no puede conectarse al backend, revisa la configuración `CORS_ALLOWED_ORIGINS` en `settings.py` y asegúrate de que la URL de tu frontend (ej. `http://localhost:3000`) esté en la lista.
*   **ModuleNotFoundError:** Si ves errores de módulos faltantes (como `dashboard`), asegúrate de haber activado el entorno virtual y que todas las apps estén correctamente listadas en `INSTALLED_APPS` (settings.py). Un reinicio del servidor (`Ctrl+C` y luego `runserver`) suele solucionar problemas de caché de importación.

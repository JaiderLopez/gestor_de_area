# Guía para Ejecutar Servidores y Probar el Módulo de Discos

Esta guía detalla los pasos para levantar los servidores de backend y frontend, y cómo probar las funcionalidades del módulo de "Discos" en la aplicación.

## 1. Iniciar el Servidor Backend (Django)

El backend es una aplicación Django que expone la API REST.

1.  **Abrir una Terminal:** Navega hasta el directorio `backend/` del proyecto.
    ```bash
    cd c:\Proyectos\gestor_de_area\backend
    ```
2.  **Activar el Entorno Virtual:**
    *   **Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    *   **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
3.  **Iniciar el Servidor de Desarrollo:**
    ```bash
    python manage.py runserver
    ```
    El servidor se iniciará en `http://127.0.0.1:8000/` (o `http://localhost:8000/`). Deja esta terminal abierta.

## 2. Iniciar el Servidor Frontend (React)

El frontend es una aplicación React que consume la API del backend.

1.  **Abrir una Nueva Terminal:** Navega hasta el directorio `frontend/` del proyecto.
    ```bash
    cd c:\Proyectos\gestor_de_area\frontend
    ```
2.  **Instalar Dependencias (si no lo has hecho antes):**
    ```bash
    npm install
    # o si usas yarn
    # yarn install
    ```
3.  **Iniciar el Servidor de Desarrollo:**
    ```bash
    npm start
    # o si usas yarn
    # yarn start
    ```
    Esto abrirá la aplicación en tu navegador, generalmente en `http://localhost:3000/`. Deja esta terminal abierta.

## 3. Rutas y Funcionalidades del Módulo de Discos

Una vez que ambos servidores estén corriendo, puedes acceder a la aplicación frontend y probar las funcionalidades.

### Rutas del Frontend (Navegador)

*   **Dashboard de Discos:** `http://localhost:3000/discos`
    *   Aquí verás la lista de discos en formato de tarjeta.
    *   Podrás usar los filtros de búsqueda (nombre, tipo, fecha de contenido, espacio libre) y el botón "Cargar más".
    *   Cada tarjeta mostrará un resumen de los contenidos del disco.
*   **Añadir Nuevo Disco:** `http://localhost:3000/discos/new`
    *   Formulario para crear un nuevo disco.
    *   Puedes usar la funcionalidad de "Escanear Contenido" introduciendo una ruta local (ej. `C:\Users\TuUsuario\Documentos` o `/home/tuusuario/documentos`).
    *   El formulario incluye validaciones y mensajes de carga/éxito/error.
*   **Editar Disco Existente:** `http://localhost:3000/discos/:id/edit`
    *   Haz clic en "Editar" en una tarjeta de disco en el dashboard para ir a esta ruta.
    *   Permite modificar los datos de un disco existente y sus contenidos.

### Endpoints del Backend (API REST)

Puedes probar estos endpoints directamente usando herramientas como `curl`, Postman, Insomnia, o incluso desde el navegador para las peticiones `GET`.

**Base URL de la API:** `http://localhost:8000/api/discos/`

1.  **Listar Discos (GET)**
    *   **Descripción:** Obtiene una lista de todos los discos.
    *   **Ruta:** `GET http://localhost:8000/api/discos/`
    *   **Ejemplo `curl`:**
        ```bash
        curl -X GET "http://localhost:8000/api/discos/"
        ```
    *   **Ejemplos con Filtros:**
        *   Buscar por nombre: `http://localhost:8000/api/discos/?search=MiDisco`
        *   Filtrar por tipo: `http://localhost:8000/api/discos/?tipo=SSD`
        *   Filtrar por fecha de contenido (desde): `http://localhost:8000/api/discos/?contenido_fecha_desde=2023-01-01`
        *   Filtrar por espacio libre (mínimo): `http://localhost:8000/api/discos/?espacio_libre_min=100`
        *   Combinar filtros: `http://localhost:8000/api/discos/?search=Backup&tipo=HDD&contenido_fecha_hasta=2024-12-31&espacio_libre_max=500`

2.  **Crear Disco (POST)**
    *   **Descripción:** Crea un nuevo disco.
    *   **Ruta:** `POST http://localhost:8000/api/discos/`
    *   **Ejemplo `curl`:**
        ```bash
        curl -X POST -H "Content-Type: application/json" -d 
        {
            "nombre": "Disco de Pruebas",
            "tipo": "SSD",
            "tamanio_gb": 256,
            "descripcion": "Disco para almacenar documentos importantes."
        }
         "http://localhost:8000/api/discos/"
        ```

3.  **Obtener Detalles de un Disco (GET)**
    *   **Descripción:** Obtiene la información detallada de un disco específico.
    *   **Ruta:** `GET http://localhost:8000/api/discos/{id}/` (reemplaza `{id}` con el ID real del disco)
    *   **Ejemplo `curl`:**
        ```bash
        curl -X GET "http://localhost:8000/api/discos/1/"
        ```

4.  **Actualizar Disco (PUT/PATCH)**
    *   **Descripción:** Actualiza la información de un disco existente.
    *   **Ruta:** `PUT http://localhost:8000/api/discos/{id}/` (reemplaza `{id}` con el ID real del disco)
    *   **Ejemplo `curl` (PUT - actualización completa):**
        ```bash
        curl -X PUT -H "Content-Type: application/json" -d 
        {
            "nombre": "Disco de Pruebas Actualizado",
            "tipo": "SSD",
            "tamanio_gb": 512,
            "descripcion": "Descripción actualizada del disco de pruebas."
        }
         "http://localhost:8000/api/discos/1/"
        ```

5.  **Eliminar Disco (DELETE)**
    *   **Descripción:** Elimina un disco específico.
    *   **Ruta:** `DELETE http://localhost:8000/api/discos/{id}/` (reemplaza `{id}` con el ID real del disco)
    *   **Ejemplo `curl`:**
        ```bash
        curl -X DELETE "http://localhost:8000/api/discos/1/"
        ```

6.  **Escanear Contenido de Disco (POST)**
    *   **Descripción:** Escanea un directorio local y devuelve su contenido para asociarlo a un disco.
    *   **Ruta:** `POST http://localhost:8000/api/discos/scan/`
    *   **Ejemplo `curl`:**
        ```bash
        curl -X POST -H "Content-Type: application/json" -d 
        {
            "path": "C:\\Users\\TuUsuario\\Documentos",
            "disco_nombre": "Documentos Personales",
            "disco_tipo": "SSD",
            "disco_tamanio_gb": 1000
        }
         "http://localhost:8000/api/discos/scan/"
        ```
        *Asegúrate de que la ruta exista en el sistema donde se ejecuta el backend.*

Con esta guía, deberías poder levantar la aplicación y probar todas las funcionalidades del módulo de discos.

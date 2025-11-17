# Frontend: Sistema Gestor del Área de Sistemas

Este directorio contiene todo el código fuente y los recursos para el frontend de la aplicación **"Sistema Gestor del Área de Sistemas"**. La interfaz será desarrollada en **React** para crear una experiencia de usuario moderna, modular e interactiva.

## Propósito del Proyecto

El frontend se encargará de renderizar la interfaz con la que los usuarios interactuarán para gestionar los módulos de la aplicación. Se comunicará a través de una API REST con el backend (desarrollado en Django) para persistir y consultar la información.

El objetivo es crear una **Single Page Application (SPA)** que sea rápida, intuitiva y fácil de usar para el personal de LA EMPRESA.

### Tecnologías Principales
- **Librería:** React
- **Enrutamiento:** React Router Dom
- **Gestión de Estado:** Context API (o Redux si la complejidad aumenta)
- **Librería de Componentes:** A definir (ej. Material-UI, Ant Design, Bootstrap)
- **Cliente API:** Axios o Fetch API

---

## Módulos a Desarrollar

El desarrollo del frontend se centrará en la creación de las vistas y componentes necesarios para cada módulo definido en el backend:

### 1. Módulo de Gestor de Discos (Vista Admin)
- **Objetivo:** Crear una interfaz para que el administrador pueda gestionar los discos de la empresa.
- **Componentes y Vistas:**
    - **Vista Principal:** Un dashboard con tarjetas que representen cada disco y su información resumida.
    - **Formulario de Registro/Edición:** Un formulario modal o en una página dedicada para añadir nuevos discos o modificar existentes. Incluirá un campo para seleccionar el disco desde el explorador de archivos.
    - **Barra de Búsqueda y Filtros:** Componentes para filtrar los discos por nombre, contenido, etc.

### 2. Módulo de Inventario (Vista Admin)
- **Objetivo:** Desarrollar la interfaz para la gestión del inventario tecnológico.
- **Componentes y Vistas:**
    - **Panel de Inventario:** Una vista organizada por categorías de dispositivos.
    - **Tabla de Dispositivos:** Una tabla para listar los equipos con su estado, ubicación y responsable. Permitirá ordenar y filtrar.
    - **Formularios de Gestión:** Interfaces para registrar nuevos dispositivos y gestionar su movimiento entre áreas.

### 3. Módulo de Reportes de Incidentes (Vistas User/Admin)
- **Objetivo:** Diseñar interfaces para que los usuarios puedan crear reportes y los administradores puedan gestionarlos.
- **Componentes y Vistas:**
    - **Formulario de Nuevo Reporte (Vista User):** Un formulario sencillo para que cualquier usuario pueda registrar una incidencia, adjuntando descripción y archivos.
    - **Dashboard de Reportes (Vista Admin):** Una vista para que el equipo de sistemas pueda ver, filtrar y gestionar los reportes recibidos.
    - **Vista de Historial:** Una tabla o lista que muestre todos los reportes históricos, con opción de exportar.

### 4. Módulo de Mantenimientos (Vista Admin)
- **Objetivo:** Crear la interfaz para documentar y consultar el historial de mantenimientos.
- **Componentes y Vistas:**
    - **Vista de Historial por Dispositivo:** Al seleccionar un dispositivo del inventario, se podrá ver una pestaña o sección con su historial de mantenimientos.
    - **Formulario de Mantenimiento:** Un formulario para registrar un nuevo mantenimiento, asociándolo a un dispositivo y un técnico.

### Tareas Generales de UI/UX
- **Autenticación:** Crear las vistas de Login para el control de acceso.
- **Navegación:** Implementar un menú de navegación principal (sidebar o topbar) para moverse entre los diferentes módulos.
- **Diseño Responsivo:** Asegurar que la aplicación sea usable en diferentes tamaños de pantalla.
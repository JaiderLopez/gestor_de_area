# Plan de Desarrollo del Proyecto

Aquí se listan las tareas principales para la construcción del **Sistema Gestor del Área de Sistemas**.

## Fase 1: Backend y Base de Datos

- [x] **1. Configurar el Entorno del Backend:**
  - [x] Crear un entorno virtual para Python.
  - [x] Instalar las dependencias del archivo `backend/requirements.txt`.
  - [x] Configurar la conexión a la base de datos PostgreSQL en `settings.py`.

- [x] **2. Crear las Aplicaciones de los Módulos:**
  - [x] Crear las apps `discos`, `inventario`, `reportes` y `mantenimiento`.
  - [x] Registrar las nuevas apps en `settings.py`.

- [x] **3. Definir los Modelos de Datos (Módulo de Discos):**
  - [x] En `discos/models.py`, definir el modelo `Disco`.
  - [x] En `discos/models.py`, definir el modelo `ContenidoDisco` con una relación al modelo `Disco`.

- [x] **4. Crear y Aplicar las Migraciones:**
  - [x] Ejecutar `makemigrations` para generar el esquema de la base de datos a partir de los modelos.
  - [x] Ejecutar `migrate` para aplicar los cambios a la base de datos PostgreSQL.

- [x] **5. Crear los Endpoints de la API (CRUD para Discos):**
  - [x] En `discos/serializers.py`, crear un `ModelSerializer` para el modelo `Disco`.
  - [x] En `discos/views.py`, crear un `ModelViewSet` para gestionar las operaciones CRUD de `Disco`.
  - [x] En `discos/urls.py` y `gestor_areas_project/urls.py`, configurar las rutas para exponer la API.

- [x] **6. Verificar la API:**
  - [x] Iniciar el servidor de desarrollo de Django.
  - [x] Usar el navegador o una herramienta como Postman/curl para verificar que los endpoints de `/api/discos/` funcionan correctamente.

- [x] **7. Crear API para Contenido de Discos:**
  - [x] Crear `ContenidoDiscoSerializer`.
  - [x] Crear `ContenidoDiscoViewSet`.
  - [x] Configurar URL anidada (`/discos/<id>/contenidos/`).
- [x] **8. Implementar Filtros para Discos:**
  - [x] Instalar `django-filter`.
  - [x] Crear `DiscoFilterSet`.
  - [x] Conectar el filtro al `DiscoViewSet`.
- [x] **9. Mejorar Serializers (Nesting):**
  - [x] Mostrar contenidos al consultar un disco.
  - [x] Mostrar el nombre del disco al consultar un contenido.
- [x] **10. Implementar Funcionalidad de Escaneo de Discos:**
  - [x] 10.1. Crear Endpoint para Escaneo (APIView o acción personalizada en ViewSet).
  - [x] 10.2. Lógica de Escaneo de Archivos (recorrer disco hasta profundidad 1, extraer datos).
  - [x] 10.3. Creación Automática de ContenidoDisco (basado en el escaneo).
  - [x] 10.4. Manejo de Errores y Validaciones (rutas inválidas, permisos).
- [x] **11. Implementar Filtro por Espacio Libre en Discos:**
  - [x] 11.1. Calcular Espacio Usado (propiedad o método en modelo Disco/FilterSet).
  - [x] 11.2. Crear Filtro de Espacio Libre (ej. `espacio_libre_min`, `espacio_libre_max` en `DiscoFilter`).

## Fase 2: Frontend - Módulo de Discos
 
- [ ] **12. Configuración Inicial del Frontend:**
  - [x] 12.1. Configurar el proyecto de React (si no está hecho).
  - [x] 12.2. Crear la estructura de carpetas para el módulo de discos (e.g., `src/modules/discos`).
  - [x] 12.3. Definir las rutas de navegación para el módulo de discos (e.g., `/discos`, `/discos/new`, `/discos/:id/edit`).

- [x] **13. Desarrollo de la Vista Principal (Dashboard de Discos):**
  - [x] 13.1. Crear el componente principal `DiscosDashboard` para mostrar la lista de discos.
  - [x] 13.2. Implementar la lógica para consumir la API `/api/discos/` del backend.
  - [x] 13.3. Diseñar y desarrollar el componente `DiscoCard` para mostrar información resumida de cada disco.
  - [x] 13.4. Integrar la paginación (si es necesaria) en el dashboard.

- [x] **14. Implementación de Búsqueda y Filtros:**
  - [x] 14.1. Desarrollar componentes de UI para la barra de búsqueda (por nombre de disco, descripción, nombre de contenido).
  - [x] 14.2. Desarrollar componentes de UI para los filtros avanzados (por tipo de disco, rango de fechas de contenido, rango de tamaño total, rango de espacio libre).
  - [x] 14.3. Integrar la lógica para enviar las peticiones de filtrado a la API del backend.

- [x] **15. Desarrollo del Formulario de Registro/Edición de Discos:**
  - [x] 15.1. Crear el componente `DiscoForm` para añadir nuevos discos o editar existentes.
  - [x] 15.2. Implementar campos para `nombre`, `tipo`, `tamanio_gb`, `descripcion`.
  - [x] 15.3. **Funcionalidad de Escaneo de Disco:**
    - [x] 15.3.1. Implementar un campo de entrada para la ruta del directorio a escanear.
    - [x] 15.3.2. Integrar la llamada a la API `/api/discos/scan/` con la ruta proporcionada.
    - [x] 15.3.3. Mostrar los resultados del escaneo (lista de contenidos) en el formulario.
    - [x] 15.3.4. Permitir al usuario ajustar manualmente el `peso_gb` para las carpetas escaneadas.
  - [x] 15.4. Implementar la lógica para guardar (POST/PUT) el disco y sus contenidos a través de la API.

- [x] **16. Manejo de Estado y Conexión con la API:**
  - [x] 16.1. Utilizar Context API (o Redux) para gestionar el estado global de los discos y contenidos.
  - [x] 16.2. Crear servicios o utilidades para interactuar con los endpoints de la API del backend.

- [x] **17. Consideraciones de UI/UX:**
  - [x] 17.1. Asegurar un diseño responsivo para todos los componentes del módulo.
  - [x] 17.2. Implementar validaciones en el formulario `DiscoForm`.
  - [x] 17.3. Mostrar mensajes de carga, éxito y error al usuario.

## Fase 3: Completar Funcionalidades del Módulo de Discos

- [x] **18. Mostrar Contenido Resumido en Tarjetas de Disco:**
  - [x] 18.1. Modificar `DiscoCard.js` para renderizar una lista con los primeros contenidos del disco.
  - [x] 18.2. Ajustar estilos en `Discos.css` para que la nueva lista no rompa el diseño de la tarjeta.

- [x] **19. Implementar Filtros Avanzados en la Interfaz:**
  - [x] 19.1. Añadir campos de UI en `DiscosDashboardPage.js` para filtrar por rango de fechas y espacio libre.
  - [x] 19.2. Añadir el estado correspondiente para los nuevos filtros en el componente.
  - [x] 19.3. Actualizar la función `applyFilters` para incluir los nuevos parámetros en la URL de la API.
  - [x] 19.4. Ajustar `Discos.css` para asegurar que los nuevos filtros se vean bien en el contenedor.

- [x] **20. Implementar Funcionalidad de Eliminación de Discos:**
  - [x] 20.1. **Backend:** Verificar que el endpoint `DELETE /api/discos/{id}/` esté activo y funcional.
  - [x] 20.2. **Frontend:** Añadir la función `deleteDisco(id)` en `services/api.js`.
  - [x] 20.3. **Frontend:** Crear la función `deleteDisco` en `DiscoContext.js` para actualizar el estado.
  - [x] 20.4. **Frontend:** Añadir un botón "Eliminar" en el componente `DiscoCard.js`.
  - [x] 20.5. **Frontend:** Implementar un diálogo de confirmación antes de ejecutar la eliminación.
  - [x] 20.6. **Frontend:** Proveer feedback visual al usuario (éxito/error) tras la operación.


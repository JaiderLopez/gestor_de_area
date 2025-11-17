# Backend: Sistema Gestor del Área de Sistemas

Este directorio contiene todo el código relacionado con el backend del **"Sistema Gestor del Área de Sistemas"** de LA EMPRESA.

## Propósito del Proyecto

El backend es el núcleo de la aplicación, construido con **Python y Django**. Su responsabilidad principal es centralizar y gestionar la lógica de negocio, la seguridad y los datos para las operaciones del área de sistemas.

Se desarrollará una API RESTful que permitirá al frontend (y a futuros clientes) interactuar de forma segura con los recursos de la aplicación, resolviendo problemas como la falta de inventario, registro de incidentes y gestión de discos.

### Tecnologías Principales
- **Framework:** Django
- **API:** Django Rest Framework (DRF)
- **Base de Datos:** PostgreSQL
- **Autenticación:** Basada en Tokens (JWT o similar)

---

## Módulos a Desarrollar

La aplicación se compondrá de los siguientes módulos principales:

### 1. Módulo de Gestor de Discos (Admin)
- **Objetivo:** Registrar y catalogar todos los discos físicos (HDD, SSD, CD) de la empresa.
- **Funcionalidades:**
    - **CRUD de Discos:** Registrar, actualizar y dar de baja discos.
    - **Escaneo de Contenido:** Recorrer el contenido de un disco (profundidad 1) para listar carpetas y archivos, capturando nombre, fecha de modificación y peso.
    - **Vista de Discos:** Presentar los discos en formato de tarjetas con información clave.
    - **Filtros:** Permitir búsquedas por nombre, contenido, fecha y espacio.

### 2. Módulo de Inventario (Admin)
- **Objetivo:** Gestionar el ciclo de vida de todos los recursos tecnológicos de la empresa.
- **Funcionalidades:**
    - **Registro de Dispositivos:** Ficha técnica, ubicación, responsable y estado (activo, dañado, en reparación, disponible).
    - **Categorización:** Organizar dispositivos por categorías.
    - **Trazabilidad:** Registrar movimientos de equipos entre áreas o fincas.

### 3. Módulo de Reportes de Incidentes (Users/Admin)
- **Objetivo:** Formalizar el registro y seguimiento de las peticiones diarias al área de sistemas.
- **Funcionalidades:**
    - **Creación de Reportes:** Permitir a los usuarios registrar incidencias por tipo (impresora, red, etc.).
    - **Adjuntar Evidencia:** Posibilidad de incluir descripciones y capturas de pantalla.
    - **Historial y Exportación:** Mantener un historial de todos los reportes y permitir su exportación.
    - **Estadísticas:** (Futuro) Analizar datos para obtener estadísticas sobre tipos de incidentes.

### 4. Módulo de Mantenimientos (Admin)
- **Objetivo:** Documentar y planificar el mantenimiento de los equipos.
- **Funcionalidades:**
    - **Historial por Dispositivo:** Registrar todos los mantenimientos realizados a un equipo.
    - **Detalle del Mantenimiento:** Incluir fecha, tipo de mantenimiento y técnico responsable.
    - **Alertas Preventivas:** (Futuro) Generar recomendaciones de mantenimiento preventivo.

### Consideraciones Adicionales
- **Seguridad:** Implementar autenticación para proteger las rutas y los datos sensibles.
- **Despliegue:** La API debe ser accesible en la red local de LA EMPRESA a través de una IP fija.
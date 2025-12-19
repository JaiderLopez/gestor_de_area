# Gestor de Área

Una aplicación centralizada y moderna diseñada para gestionar activos tecnológicos, discos físicos de almacenamiento y registros de mantenimiento dentro de la infraestructura de red local de la empresa.

## 🚀 Propósito del Proyecto
Este sistema soluciona la fragmentación de información en el área de sistemas, proporcionando una herramienta única para el inventario de hardware, la indexación de contenidos en medios extraíbles y el seguimiento de intervenciones técnicas.

---

## 📦 Módulos Principales

### 1. Inventario de Hardware
Gestión completa del ciclo de vida de los activos tecnológicos.
- **Registro Detallado**: Marca, modelo, serial, código de inventario y especificaciones técnicas.
- **Estados de Equipo**: Control de dispositivos Activos, Disponibles, En Reparación, Dañados o De Baja.
- **Gestión de Movimientos**: Historial completo de cambios de ubicación y responsable.
- **Búsqueda Avanzada**: Filtros dinámicos por categoría, estado y ubicación (con coincidencia parcial).

### 2. Gestor de Discos
Herramienta de indexación para discos físicos (HDD, SSD, CD/DVD).
- **Escaneo Inteligente**: Capacidad de analizar directorios (profundidad 1) para registrar archivos y carpetas automáticamente.
- **Métricas de Almacenamiento**: Visualización de espacio usado vs. libre con indicadores visuales de ocupación.
- **Indexación de Contenido**: Listado de archivos con peso y fecha de modificación.
- **Filtros de Contenido**: Búsqueda por nombre de disco, tipo y espacio disponible.

### 3. Mantenimiento
Control preventivo y correctivo de los equipos.
- **Historial Técnico**: Registro detallado de intervenciones realizadas a cada dispositivo.
- **Programación**: Seguimiento de mantenimientos pendientes.

### 4. Dashboard
Panel de control con métricas en tiempo real.
- Estadísticas agregadas de inventario y estado de los discos.
- Accesos rápidos a las funciones principales.

---

## 🛠️ Stack Tecnológico
El proyecto utiliza una arquitectura desacoplada para mayor escalabilidad:

- **Backend**: Python 3.10+ / Django 4.2 / Django REST Framework.
- **Frontend**: React.js / Context API / Vanilla CSS (Modern UI con estética Neumórfica/Neon).
- **Base de Datos**: PostgreSQL.
- **Servicios API**: Comunicación asíncrona mediante `fetch` con manejo avanzado de errores.

---

## 🔧 Características Técnicas Destacadas
- **Validaciones Sincronizadas**: Retroalimentación instantánea desde el backend para códigos o seriales duplicados directamente en los campos del formulario.
- **Interfaz Adaptable**: Diseño responsivo con filas expandibles en móviles para una visualización óptima en tablets y celulares.
- **Filtrado Automático**: Búsqueda en tiempo real sin recargas de página innecesarias.
- **Configuración de Red**: Preparado para despliegue en red local (0.0.0.0) permitiendo el acceso desde cualquier dispositivo en la LAN.

---

## ⚙️ Guía de Instalación
Para información detallada sobre la configuración de la base de datos, entorno virtual y dependencias, consulte:
👉 **[GUIA_IMPLEMENTACION.md](./GUIA_IMPLEMENTACION.md)**

---

**Desarrollado para el Área de Sistemas - LA EMPRESA**

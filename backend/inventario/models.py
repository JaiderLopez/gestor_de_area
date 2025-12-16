from django.db import models
from django.utils import timezone

class Categoria(models.Model):
    """
    Categoría para agrupar dispositivos (ej: Portátil, Monitor, Impresora).
    """
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"


class Dispositivo(models.Model):
    """
    Representa un activo tecnológico de la empresa.
    """
    ESTADOS = [
        ('ACTIVO', 'Activo'),
        ('DISPONIBLE', 'Disponible'),
        ('EN_REPARACION', 'En Reparación'),
        ('DAÑADO', 'Dañado'),
        ('BAJA', 'De Baja'),
    ]

    codigo_inventario = models.CharField(max_length=50, unique=True, help_text="Código interno de inventario (Etiqueta)")
    serial = models.CharField(max_length=100, unique=True, help_text="Serial del fabricante", blank=True, null=True)
    marca = models.CharField(max_length=100)
    modelo = models.CharField(max_length=100)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT, related_name='dispositivos')
    
    # Ubicación y Responsable actuales (se actualizarán vía Movimientos, pero se guardan aquí para consulta rápida)
    ubicacion = models.CharField(max_length=150, help_text="Ubicación actual (ej: Oficina Gerencia)")
    responsable = models.CharField(max_length=150, help_text="Nombre de la persona responsable actual", blank=True, null=True)
    
    estado = models.CharField(max_length=20, choices=ESTADOS, default='DISPONIBLE')
    
    fecha_compra = models.DateField(blank=True, null=True)
    garantia_hasta = models.DateField(blank=True, null=True)
    
    especificaciones = models.TextField(blank=True, null=True, help_text="ram: 8gb, disco: ssd 256gb, etc.")
    
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.marca} {self.modelo} ({self.codigo_inventario})"

    class Meta:
        ordering = ['-fecha_registro']


class Movimiento(models.Model):
    """
    Historial de cambios de ubicación o responsable de un dispositivo.
    """
    TIPOS_MOVIMIENTO = [
        ('ASIGNACION', 'Asignación'),
        ('TRASLADO', 'Traslado'),
        ('DEVOLUCION', 'Devolución'),
        ('REPARACION', 'Envío a Reparación'),
        ('BAJA', 'Dar de Baja'),
    ]

    dispositivo = models.ForeignKey(Dispositivo, on_delete=models.CASCADE, related_name='movimientos')
    tipo_movimiento = models.CharField(max_length=20, choices=TIPOS_MOVIMIENTO)
    
    origen = models.CharField(max_length=150, help_text="Ubicación anterior")
    destino = models.CharField(max_length=150, help_text="Nueva ubicación")
    
    responsable = models.CharField(max_length=150, help_text="Persona que recibe el equipo", blank=True, null=True)
    
    fecha_movimiento = models.DateTimeField(default=timezone.now)
    observacion = models.TextField(blank=True, null=True)
    
    # Podríamos agregar un campo 'usuario_sistema' si tuviéramos tabla de usuarios autenticados
    # usuario_registro = models.ForeignKey(User, ...)

    def __str__(self):
        return f"{self.tipo_movimiento} - {self.dispositivo.codigo_inventario} - {self.fecha_movimiento.strftime('%Y-%m-%d')}"

    class Meta:
        ordering = ['-fecha_movimiento']

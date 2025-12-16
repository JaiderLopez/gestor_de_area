from django.db import models
from inventario.models import Dispositivo
from django.utils import timezone

class Mantenimiento(models.Model):
    TIPOS = [
        ('PREVENTIVO', 'Preventivo'),
        ('CORRECTIVO', 'Correctivo'),
    ]
    
    ESTADOS = [
        ('PENDIENTE', 'Pendiente'),
        ('EN_PROCESO', 'En Proceso'),
        ('FINALIZADO', 'Finalizado'),
        ('CANCELADO', 'Cancelado'),
    ]
    
    PRIORIDADES = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
    ]

    dispositivo = models.ForeignKey(Dispositivo, on_delete=models.CASCADE, related_name='mantenimientos')
    tipo = models.CharField(max_length=20, choices=TIPOS, default='PREVENTIVO')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='PENDIENTE')
    prioridad = models.CharField(max_length=10, choices=PRIORIDADES, default='MEDIA')
    
    fecha_programada = models.DateField(default=timezone.now, help_text="Fecha planeada para el mantenimiento")
    fecha_realizacion = models.DateTimeField(blank=True, null=True, help_text="Fecha real de ejecución")
    
    descripcion_falla = models.TextField(blank=True, null=True, help_text="Descripción del problema (Correctivo) o tareas a realizar (Preventivo)")
    acciones_realizadas = models.TextField(blank=True, null=True, help_text="Reporte técnico de lo realizado")
    
    costo = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Costo total del servicio/repuestos")
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tipo} - {self.dispositivo.codigo_inventario} - {self.fecha_programada}"

    class Meta:
        ordering = ['-fecha_programada']
        verbose_name = "Mantenimiento"
        verbose_name_plural = "Mantenimientos"

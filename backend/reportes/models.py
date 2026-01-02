from django.db import models
from django.utils import timezone

class Reporte(models.Model):
    TIPOS = [
        ('FALLA_EQUIPO', 'Falla de Equipo'),
        ('RED', 'Falla de Red/Internet'),
        ('SOFTWARE', 'Software / Programas'),
        ('IMPRESORA', 'Impresora / Escáner'),
        ('OTRO', 'Otro'),
    ]

    PRIORIDADES = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
    ]

    ESTADOS = [
        ('PENDIENTE', 'Pendiente'),
        ('EN_PROCESO', 'En Revisión'),
        ('RESUELTO', 'Resuelto'),
        ('DESCARTADO', 'Descartado'),
    ]

    solicitante = models.CharField(max_length=100, help_text="Nombre de quien reporta")
    area = models.CharField(max_length=100, blank=True, null=True, help_text="Área o Departamento (Opcional)")
    
    tipo = models.CharField(max_length=20, choices=TIPOS, default='OTRO')
    descripcion = models.TextField(help_text="Detalle del problema")
    
    evidencia = models.ImageField(upload_to='evidencias/', blank=True, null=True, help_text="Captura de pantalla o foto (Opcional)")
    
    prioridad = models.CharField(max_length=10, choices=PRIORIDADES, default='MEDIA')
    estado = models.CharField(max_length=20, choices=ESTADOS, default='PENDIENTE')
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_resolucion = models.DateTimeField(blank=True, null=True)
    
    solucion_tecnica = models.TextField(blank=True, null=True, help_text="Descripción de lo realizado para solucionar (Llenado por Admin)")

    def __str__(self):
        return f"{self.tipo} - {self.solicitante} ({self.estado})"

    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = "Reporte de Incidencia"
        verbose_name_plural = "Reportes de Incidencias"

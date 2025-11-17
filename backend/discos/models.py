from django.db import models

class Disco(models.Model):
    """
    Representa un disco físico de almacenamiento (HDD, SSD, CD, etc.).
    """
    # Opciones para el campo 'tipo'
    class TipoDisco(models.TextChoices):
        HDD = 'HDD', 'Disco Duro (HDD)'
        SSD = 'SSD', 'Unidad de Estado Sólido (SSD)'
        CD_DVD = 'CD/DVD', 'CD / DVD'
        OTRO = 'OTRO', 'Otro'

    nombre = models.CharField(
        max_length=100,
        unique=True,
        help_text="Nombre o identificador único para el disco (ej: 'Backup 2023')."
    )
    tipo = models.CharField(
        max_length=10,
        choices=TipoDisco.choices,
        default=TipoDisco.HDD,
        help_text="Tipo de disco."
    )
    tamanio_gb = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        help_text="Tamaño total del disco en Gigabytes (GB)."
    )
    descripcion = models.TextField(
        blank=True,
        help_text="Notas adicionales o descripción del contenido general del disco."
    )

    def __str__(self):
        return self.nombre

    class Meta:
        verbose_name = "Disco"
        verbose_name_plural = "Discos"
        ordering = ['nombre']

class ContenidoDisco(models.Model):
    """
    Representa un archivo o carpeta contenido dentro de un Disco.
    """
    disco = models.ForeignKey(
        Disco,
        on_delete=models.CASCADE,
        related_name='contenidos',
        help_text="El disco al que pertenece este contenido."
    )
    nombre = models.CharField(
        max_length=255,
        help_text="Nombre del archivo o carpeta."
    )
    fecha_modificacion = models.DateField(
        help_text="Fecha de última modificación del contenido."
    )
    peso_gb = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        help_text="Peso del contenido en Gigabytes (GB)."
    )

    def __str__(self):
        return f"{self.nombre} (en {self.disco.nombre})"

    class Meta:
        verbose_name = "Contenido de Disco"
        verbose_name_plural = "Contenidos de Discos"
        ordering = ['-fecha_modificacion']
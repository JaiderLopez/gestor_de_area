from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Movimiento

@receiver(post_save, sender=Movimiento)
def actualizar_dispositivo_al_mover(sender, instance, created, **kwargs):
    if created:
        dispositivo = instance.dispositivo
        
        # Actualizar campos del dispositivo basados en el movimiento
        if instance.destino:
             dispositivo.ubicacion = instance.destino
        
        if instance.responsable:
             dispositivo.responsable = instance.responsable
        
        # Lógica de estados según tipo de movimiento
        # ('ASIGNACION', 'Asignación'), ('TRASLADO', 'Traslado'), ('DEVOLUCION', 'Devolución'), ('REPARACION', 'Reparación'), ('BAJA', 'Baja')
        
        if instance.tipo_movimiento == 'ASIGNACION':
            dispositivo.estado = 'ACTIVO'
        elif instance.tipo_movimiento == 'DEVOLUCION':
            dispositivo.estado = 'DISPONIBLE'
            # En devolución, quizás el responsable se limpia? 
            # Depende de la lógica de negocio, asumiremos que se mantiene el registro del último o se limpia si se envía vacío.
            # Para simplificar, si es devolución y no se envía responsable, podríamos limpiarlo, pero el modelo de movimiento tiene responsable obligatorio? No, es opcional.
        elif instance.tipo_movimiento == 'REPARACION':
            dispositivo.estado = 'EN_REPARACION'
        elif instance.tipo_movimiento == 'BAJA':
            dispositivo.estado = 'BAJA'
            
        dispositivo.save()

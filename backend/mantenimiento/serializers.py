from rest_framework import serializers
from .models import Mantenimiento

class MantenimientoSerializer(serializers.ModelSerializer):
    dispositivo_codigo = serializers.CharField(source='dispositivo.codigo_inventario', read_only=True)
    dispositivo_modelo = serializers.CharField(source='dispositivo.modelo', read_only=True)
    dispositivo_categoria = serializers.CharField(source='dispositivo.categoria.nombre', read_only=True)

    class Meta:
        model = Mantenimiento
        fields = [
            'id', 
            'dispositivo', 'dispositivo_codigo', 'dispositivo_modelo', 'dispositivo_categoria',
            'tipo', 'estado', 'prioridad', 
            'fecha_programada', 'fecha_realizacion', 
            'descripcion_falla', 'acciones_realizadas', 
            'costo', 'fecha_creacion', 'fecha_actualizacion'
        ]

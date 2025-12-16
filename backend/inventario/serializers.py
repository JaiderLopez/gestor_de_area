from rest_framework import serializers
from .models import Categoria, Dispositivo, Movimiento

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'

class DispositivoSerializer(serializers.ModelSerializer):
    # Campos calculados o anidados para lectura
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Dispositivo
        fields = [
            'id', 'codigo_inventario', 'serial', 'marca', 'modelo',
            'categoria', 'categoria_nombre',
            'ubicacion', 'responsable', 'estado',
            'fecha_compra', 'garantia_hasta', 'especificaciones',
            'fecha_registro', 'fecha_actualizacion'
        ]

class MovimientoSerializer(serializers.ModelSerializer):
    dispositivo_codigo = serializers.CharField(source='dispositivo.codigo_inventario', read_only=True)
    dispositivo_modelo = serializers.CharField(source='dispositivo.modelo', read_only=True)

    class Meta:
        model = Movimiento
        fields = [
            'id', 'dispositivo', 'dispositivo_codigo', 'dispositivo_modelo',
            'tipo_movimiento', 'origen', 'destino',
            'responsable', 'fecha_movimiento', 'observacion'
        ]

from rest_framework import serializers
from .models import Disco, ContenidoDisco


class ContenidoDiscoSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo ContenidoDisco.
    """
    class Meta:
        model = ContenidoDisco
        fields = ['id', 'nombre', 'fecha_modificacion', 'peso_gb']


class DiscoSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Disco.
    Maneja la creación y actualización de Discos con sus Contenidos anidados.
    """
    contenidos = ContenidoDiscoSerializer(many=True, required=False)
    espacio_usado = serializers.SerializerMethodField()
    espacio_libre = serializers.SerializerMethodField()
    porcentaje_ocupado = serializers.SerializerMethodField()

    class Meta:
        model = Disco
        fields = ['id', 'nombre', 'tipo', 'tamanio_gb', 'descripcion', 'estado', 'contenidos', 'espacio_usado', 'espacio_libre', 'porcentaje_ocupado']

    def get_espacio_usado(self, obj):
        # Sumar el peso_gb de todos los contenidos asociados
        return sum(contenido.peso_gb for contenido in obj.contenidos.all())

    def get_espacio_libre(self, obj):
        usado = self.get_espacio_usado(obj)
        return obj.tamanio_gb - usado

    def get_porcentaje_ocupado(self, obj):
        if obj.tamanio_gb == 0:
            return 0
        usado = self.get_espacio_usado(obj)
        percentage = (usado / obj.tamanio_gb) * 100
        return round(percentage, 1)

    def create(self, validated_data):
        """
        Maneja la creación de un Disco y sus Contenidos anidados.
        """
        contenidos_data = validated_data.pop('contenidos', [])
        disco = Disco.objects.create(**validated_data)
        for contenido_data in contenidos_data:
            ContenidoDisco.objects.create(disco=disco, **contenido_data)
        return disco

    def update(self, instance, validated_data):
        """
        Maneja la actualización de un Disco y sus Contenidos anidados.
        """
        contenidos_data = validated_data.pop('contenidos', None)
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.tipo = validated_data.get('tipo', instance.tipo)
        instance.tamanio_gb = validated_data.get('tamanio_gb', instance.tamanio_gb)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.estado = validated_data.get('estado', instance.estado)
        instance.save()

        # Eliminar contenidos antiguos y crear los nuevos solo si se enviaron
        if contenidos_data is not None:
            instance.contenidos.all().delete()
            for contenido_data in contenidos_data:
                ContenidoDisco.objects.create(disco=instance, **contenido_data)
        
        return instance
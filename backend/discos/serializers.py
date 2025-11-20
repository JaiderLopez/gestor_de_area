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
    contenidos = ContenidoDiscoSerializer(many=True)

    class Meta:
        model = Disco
        fields = ['id', 'nombre', 'tipo', 'tamanio_gb', 'descripcion', 'contenidos']

    def create(self, validated_data):
        """
        Maneja la creación de un Disco y sus Contenidos anidados.
        """
        contenidos_data = validated_data.pop('contenidos')
        disco = Disco.objects.create(**validated_data)
        for contenido_data in contenidos_data:
            ContenidoDisco.objects.create(disco=disco, **contenido_data)
        return disco

    def update(self, instance, validated_data):
        """
        Maneja la actualización de un Disco y sus Contenidos anidados.
        """
        contenidos_data = validated_data.pop('contenidos')
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.tipo = validated_data.get('tipo', instance.tipo)
        instance.tamanio_gb = validated_data.get('tamanio_gb', instance.tamanio_gb)
        instance.descripcion = validated_data.get('descripcion', instance.descripcion)
        instance.save()

        # Eliminar contenidos antiguos y crear los nuevos.
        # Esta es una estrategia simple y robusta.
        instance.contenidos.all().delete()
        for contenido_data in contenidos_data:
            ContenidoDisco.objects.create(disco=instance, **contenido_data)
        
        return instance
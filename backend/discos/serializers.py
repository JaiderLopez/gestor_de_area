from rest_framework import serializers
from .models import Disco, ContenidoDisco


class DiscoSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Disco.
    Convierte las instancias del modelo Disco a formato JSON y viceversa.
    """
    contenidos = ContenidoDiscoSerializer(many=True, read_only=True)

    class Meta:
        model = Disco
        fields = ['id', 'nombre', 'tipo', 'tamanio_gb', 'descripcion', 'contenidos']


class ContenidoDiscoSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo ContenidoDisco.
    """
    disco = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ContenidoDisco
        fields = ['id', 'disco', 'nombre', 'fecha_modificacion', 'peso_gb']
from rest_framework import serializers
from .models import Reporte

class ReporteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reporte
        fields = '__all__'
        read_only_fields = ['fecha_creacion', 'fecha_resolucion']

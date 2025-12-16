from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Mantenimiento
from .serializers import MantenimientoSerializer

class MantenimientoViewSet(viewsets.ModelViewSet):
    queryset = Mantenimiento.objects.all().order_by('estado', 'fecha_programada')
    serializer_class = MantenimientoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'tipo', 'prioridad', 'dispositivo']
    search_fields = ['dispositivo__codigo_inventario', 'descripcion_falla', 'acciones_realizadas']
    ordering_fields = ['fecha_programada', 'prioridad', 'costo']

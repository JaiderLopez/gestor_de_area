from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Categoria, Dispositivo, Movimiento
from .serializers import CategoriaSerializer, DispositivoSerializer, MovimientoSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class DispositivoViewSet(viewsets.ModelViewSet):
    queryset = Dispositivo.objects.all()
    serializer_class = DispositivoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'estado', 'ubicacion']
    search_fields = ['codigo_inventario', 'serial', 'marca', 'modelo', 'responsable', 'ubicacion']
    ordering_fields = ['fecha_registro', 'marca']

    @action(detail=True, methods=['get'])
    def historial(self, request, pk=None):
        """
        Endpoint personalizado para obtener el historial de movimientos de un dispositivo.
        URL: /api/inventario/dispositivos/{pk}/historial/
        """
        dispositivo = self.get_object()
        movimientos = dispositivo.movimientos.all().order_by('-fecha_movimiento')
        serializer = MovimientoSerializer(movimientos, many=True)
        return Response(serializer.data)

class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all().order_by('-fecha_movimiento')
    serializer_class = MovimientoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['tipo_movimiento', 'dispositivo']
    search_fields = ['dispositivo__codigo_inventario', 'responsable', 'origen', 'destino']

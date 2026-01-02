from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.utils import timezone
from .models import Reporte
from .serializers import ReporteSerializer

class ReporteViewSet(viewsets.ModelViewSet):
    """
    ViewSet completo para gestión de reportes (Admin).
    Permite filtrar por estado, prioridad y tipo.
    """
    queryset = Reporte.objects.all()
    serializer_class = ReporteSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'prioridad', 'tipo']
    search_fields = ['solicitante', 'descripcion', 'area']
    ordering_fields = ['fecha_creacion', 'prioridad']

    def perform_update(self, serializer):
        # Si se marca como RESUELTO y no tiene fecha, asignarla automáticamente
        instance = serializer.save()
        if instance.estado == 'RESUELTO' and not instance.fecha_resolucion:
            instance.fecha_resolucion = timezone.now()
            instance.save()

class PublicReporteView(APIView):
    """
    Vista pública para crear reportes sin autenticación.
    Solo permite POST.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Forzar estado inicial
        data = request.data.copy()
        data['estado'] = 'PENDIENTE'
        
        serializer = ReporteSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReporteStatsView(APIView):
    """
    Estadísticas para el Dashboard.
    """
    def get(self, request):
        total = Reporte.objects.count()
        pendientes = Reporte.objects.filter(estado='PENDIENTE').count()
        en_proceso = Reporte.objects.filter(estado='EN_PROCESO').count()
        resueltos = Reporte.objects.filter(estado='RESUELTO').count()
        
        # Conteo por tipo
        por_tipo = Reporte.objects.values('tipo').annotate(count=Count('tipo')).order_by('-count')
        
        return Response({
            "total": total,
            "resumen_estados": {
                "pendientes": pendientes,
                "en_proceso": en_proceso,
                "resueltos": resueltos
            },
            "por_tipo": por_tipo
        })

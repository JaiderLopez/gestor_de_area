from rest_framework.decorators import api_view
from rest_framework.response import Response
from discos.models import Disco
from inventario.models import Dispositivo
from mantenimiento.models import Mantenimiento
from django.db.models import Count, Sum

@api_view(['GET'])
def dashboard_stats(request):
    # Discos
    discos_count = Disco.objects.count()
    
    # Inventario
    dispositivos_total = Dispositivo.objects.count()
    dispositivos_por_estado = Dispositivo.objects.values('estado').annotate(count=Count('estado'))
    
    # Mantenimiento
    mantenimientos_pendientes = Mantenimiento.objects.filter(estado='PENDIENTE').count()
    mantenimientos_proximos = Mantenimiento.objects.filter(estado='PENDIENTE').order_by('fecha_programada')[:5]
    
    # Serialize pending maintenance simply
    proximos_data = [{
        'id': m.id,
        'equipo': f"{m.dispositivo.codigo_inventario} - {m.dispositivo.marca}",
        'fecha': m.fecha_programada,
        'tipo': m.tipo,
        'prioridad': m.prioridad
    } for m in mantenimientos_proximos]

    data = {
        'discos': {
            'total': discos_count
        },
        'inventario': {
            'total': dispositivos_total,
            'estados': {item['estado']: item['count'] for item in dispositivos_por_estado}
        },
        'mantenimiento': {
            'pendientes': mantenimientos_pendientes,
            'proximos': proximos_data,
        }
    }
    
    return Response(data)

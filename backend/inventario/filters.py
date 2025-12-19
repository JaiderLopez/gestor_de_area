import django_filters
from .models import Dispositivo

class DispositivoFilter(django_filters.FilterSet):
    """
    Filtro personalizado para el modelo Dispositivo.
    """
    ubicacion = django_filters.CharFilter(lookup_expr='icontains', help_text="Filtrar por ubicación (contiene).")
    responsable = django_filters.CharFilter(lookup_expr='icontains', help_text="Filtrar por responsable (contiene).")
    
    class Meta:
        model = Dispositivo
        fields = ['categoria', 'estado', 'ubicacion', 'responsable']

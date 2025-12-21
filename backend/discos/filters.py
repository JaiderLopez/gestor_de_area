import django_filters
from .models import Disco, ContenidoDisco
from django.db.models import Sum, F # Import F for database expressions

class DiscoFilter(django_filters.FilterSet):
    """
    Filtro para el modelo Disco.
    Permite filtrar por nombre, tipo, descripción, contenido, fecha de contenido y espacio libre.
    """
    nombre = django_filters.CharFilter(lookup_expr='icontains', help_text="Filtrar por nombre del disco (contiene).")
    tipo = django_filters.CharFilter(lookup_expr='iexact', help_text="Filtrar por tipo de disco (exacto: HDD, SSD, CD/DVD).")
    descripcion = django_filters.CharFilter(lookup_expr='icontains', help_text="Filtrar por descripción del disco (contiene).")

    # Filtrar por nombre de contenido (de los ContenidoDisco relacionados)
    contenido_nombre = django_filters.CharFilter(
        field_name='contenidos__nombre',
        lookup_expr='icontains',
        help_text="Filtrar por nombre de contenido dentro del disco (contiene)."
    )
    # Filtrar por fecha de modificación de contenido (rango)
    contenido_fecha_desde = django_filters.DateFilter(
        field_name='contenidos__fecha_modificacion',
        lookup_expr='gte',
        help_text="Filtrar contenidos modificados desde esta fecha (YYYY-MM-DD)."
    )
    contenido_fecha_hasta = django_filters.DateFilter(
        field_name='contenidos__fecha_modificacion',
        lookup_expr='lte',
        help_text="Filtrar contenidos modificados hasta esta fecha (YYYY-MM-DD)."
    )

    # Filtrar por tamaño del disco (como proxy de espacio libre)
    tamanio_gb_min = django_filters.NumberFilter(
        field_name='tamanio_gb',
        lookup_expr='gte',
        help_text="Filtrar discos con tamaño mínimo en GB."
    )
    tamanio_gb_max = django_filters.NumberFilter(
        field_name='tamanio_gb',
        lookup_expr='lte',
        help_text="Filtrar discos con tamaño máximo en GB."
    )

    # Filtros por espacio libre
    espacio_libre_min = django_filters.NumberFilter(
        method='filter_espacio_libre',
        lookup_expr='gte',
        help_text="Filtrar discos con espacio libre mínimo en GB."
    )
    espacio_libre_max = django_filters.NumberFilter(
        method='filter_espacio_libre',
        lookup_expr='lte',
        help_text="Filtrar discos con espacio libre máximo en GB."
    )

    def filter_espacio_libre(self, queryset, name, value):
        # Anotar el queryset con el espacio usado y luego calcular el espacio libre
        queryset = queryset.annotate(
            espacio_usado=Sum('contenidos__peso_gb'),
            espacio_libre=F('tamanio_gb') - F('espacio_usado')
        ).filter(**{f'espacio_libre__{self.filters[name].lookup_expr}': value})
        return queryset
    
    # Filtro por estado
    estado = django_filters.CharFilter(
        lookup_expr='iexact',
        help_text="Filtrar por estado del disco (BUENO, EN_RIESGO, DANADO)."
    )

    class Meta:
        model = Disco
        fields = [
            'nombre', 'tipo', 'descripcion', 'estado',
            'contenido_nombre', 'contenido_fecha_desde', 'contenido_fecha_hasta',
            'tamanio_gb_min', 'tamanio_gb_max',
            'espacio_libre_min', 'espacio_libre_max'
        ]

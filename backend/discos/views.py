from rest_framework import viewsets, filters # Import filters
import django_filters.rest_framework # Import django_filters backend
from rest_framework.views import APIView # Import APIView
from rest_framework.response import Response # Import Response
from rest_framework import status # Import status for HTTP responses
import os # Import os module for file system operations
from datetime import datetime # Import datetime for date handling
from .models import Disco, ContenidoDisco
from .serializers import DiscoSerializer, ContenidoDiscoSerializer
from .filters import DiscoFilter # Import DiscoFilter


class DiscoViewSet(viewsets.ModelViewSet):
    """
    API endpoint que permite ver y editar los discos.
    Proporciona automáticamente las acciones `list`, `create`, `retrieve`,
    `update` y `destroy`.
    """
    queryset = Disco.objects.all().order_by('nombre')
    serializer_class = DiscoSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter] # Add filter backends
    filterset_class = DiscoFilter # Specify the filter class
    search_fields = ['nombre', 'descripcion', 'contenidos__nombre'] # Add search fields
    ordering_fields = ['nombre', 'tipo', 'tamanio_gb'] # Add ordering fields


class ContenidoDiscoViewSet(viewsets.ModelViewSet):
    """
    API endpoint para los contenidos de un disco específico.
    Filtra los contenidos basándose en el 'disco_pk' de la URL.
    """
    serializer_class = ContenidoDiscoSerializer

    def get_queryset(self):
        """
        Filtra el queryset para devolver solo los contenidos del disco
        especificado en la URL.
        """
        return ContenidoDisco.objects.filter(disco_id=self.kwargs['disco_pk'])


class DiscoScanView(APIView):
    """
    API endpoint para iniciar el escaneo de un disco.
    Recibe una ruta de directorio y devuelve su contenido (archivos/carpetas)
    en formato JSON sin guardarlo en la base de datos.
    """
    def get(self, request, *args, **kwargs):
        path_to_scan = request.query_params.get('path')

        if not path_to_scan:
            return Response(
                {"error": "Se requiere la 'path' del directorio a escanear como parámetro de consulta."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not os.path.exists(path_to_scan):
            return Response(
                {"error": f"La ruta '{path_to_scan}' no existe."},
                status=status.HTTP_404_NOT_FOUND
            )

        if not os.path.isdir(path_to_scan):
            return Response(
                {"error": f"La ruta '{path_to_scan}' no es un directorio válido."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            scanned_contents_data = []
            for item_name in os.listdir(path_to_scan):
                item_path = os.path.join(path_to_scan, item_name)
                
                if item_name.startswith('.') or item_name.startswith('$'):
                    continue

                try:
                    mod_timestamp = os.path.getmtime(item_path)
                    mod_date = datetime.fromtimestamp(mod_timestamp).date()
                    
                    if os.path.isfile(item_path):
                        size_bytes = os.path.getsize(item_path)
                        size_gb = round(size_bytes / (1024**3), 2)
                        
                        scanned_contents_data.append({
                            "nombre": item_name,
                            "fecha_modificacion": mod_date.strftime('%Y-%m-%d'),
                            "peso_gb": size_gb,
                        })
                    elif os.path.isdir(item_path):
                        scanned_contents_data.append({
                            "nombre": item_name,
                            "fecha_modificacion": mod_date.strftime('%Y-%m-%d'),
                            "peso_gb": 0.0, # El peso de las carpetas se puede calcular o dejar en 0
                        })
                except OSError:
                    # Ignorar archivos o carpetas a los que no se puede acceder
                    continue
            
            return Response(scanned_contents_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error al procesar el escaneo: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
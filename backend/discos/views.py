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
    hasta profundidad 1.
    """
    def post(self, request, *args, **kwargs):
        path_to_scan = request.data.get('path')
        disco_nombre = request.data.get('disco_nombre')
        disco_tipo = request.data.get('disco_tipo')
        disco_tamanio_gb = request.data.get('disco_tamanio_gb')

        if not all([path_to_scan, disco_nombre, disco_tipo, disco_tamanio_gb]):
            return Response(
                {"error": "Se requieren 'path', 'disco_nombre', 'disco_tipo' y 'disco_tamanio_gb'."},
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
            # Get or create Disco instance
            disco, created = Disco.objects.get_or_create(
                nombre=disco_nombre,
                defaults={
                    'tipo': disco_tipo,
                    'tamanio_gb': disco_tamanio_gb
                }
            )
            if not created:
                # If disco already exists, update its properties if necessary
                disco.tipo = disco_tipo
                disco.tamanio_gb = disco_tamanio_gb
                disco.save()
            
            # Clear existing contents for this disco before adding new ones
            # This ensures that if files were removed from the disk, they are also removed from the database
            ContenidoDisco.objects.filter(disco=disco).delete()

            scanned_contents_data = []
            for item_name in os.listdir(path_to_scan):
                item_path = os.path.join(path_to_scan, item_name)
                
                # Excluir directorios ocultos o de sistema si es necesario
                if item_name.startswith('.') or item_name.startswith('$'):
                    continue

                if os.path.isfile(item_path):
                    try:
                        size_bytes = os.path.getsize(item_path)
                        size_gb = round(size_bytes / (1024**3), 2) # Convert bytes to GB
                        mod_timestamp = os.path.getmtime(item_path)
                        mod_date = datetime.fromtimestamp(mod_timestamp).date() # Get date object
                        
                        ContenidoDisco.objects.create(
                            disco=disco,
                            nombre=item_name,
                            fecha_modificacion=mod_date,
                            peso_gb=size_gb
                        )
                        scanned_contents_data.append({
                            "nombre": item_name,
                            "fecha_modificacion": mod_date.strftime('%Y-%m-%d'),
                            "peso_gb": size_gb,
                            "es_carpeta": False
                        })
                    except OSError:
                        # Handle cases where file might be inaccessible
                        continue
                elif os.path.isdir(item_path):
                    try:
                        mod_timestamp = os.path.getmtime(item_path)
                        mod_date = datetime.fromtimestamp(mod_timestamp).date() # Get date object
                        
                        ContenidoDisco.objects.create(
                            disco=disco,
                            nombre=item_name,
                            fecha_modificacion=mod_date,
                            peso_gb=0.0 # Peso a ser agregado manualmente por el usuario
                        )
                        scanned_contents_data.append({
                            "nombre": item_name,
                            "fecha_modificacion": mod_date.strftime('%Y-%m-%d'),
                            "peso_gb": 0.0,
                            "es_carpeta": True
                        })
                    except OSError:
                        # Handle cases where directory might be inaccessible
                        continue
            
            # Serialize the updated Disco object with its new contents
            serializer = DiscoSerializer(disco)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error al procesar el escaneo del disco: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
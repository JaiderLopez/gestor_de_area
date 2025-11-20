import os
import shutil
import ctypes
from datetime import datetime

from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
import django_filters.rest_framework

from .models import Disco, ContenidoDisco
from .serializers import DiscoSerializer, ContenidoDiscoSerializer
from .filters import DiscoFilter


def get_windows_volume_info(path):
    """
    Obtiene el tamaño total y la etiqueta de un volumen en Windows usando ctypes.
    """
    if not isinstance(path, str):
        return None, None

    # Asegurarse de que la ruta sea la raíz de la unidad (ej: "C:\\")
    drive_root = os.path.splitdrive(path)[0] + os.path.sep
    
    # Para el nombre del volumen
    volume_name_buffer = ctypes.create_unicode_buffer(1024)
    ctypes.windll.kernel32.GetVolumeInformationW(
        ctypes.c_wchar_p(drive_root),
        volume_name_buffer,
        ctypes.sizeof(volume_name_buffer),
        None, None, None, None, 0
    )
    volume_name = volume_name_buffer.value

    # Para el tamaño del disco
    total_bytes = ctypes.c_ulonglong(0)
    ctypes.windll.kernel32.GetDiskFreeSpaceExW(
        ctypes.c_wchar_p(drive_root),
        None,
        ctypes.pointer(total_bytes),
        None
    )
    size_gb = round(total_bytes.value / (1024**3), 2)

    return volume_name, size_gb


class DiscoViewSet(viewsets.ModelViewSet):
    queryset = Disco.objects.all().order_by('nombre')
    serializer_class = DiscoSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DiscoFilter
    search_fields = ['nombre', 'descripcion', 'contenidos__nombre']
    ordering_fields = ['nombre', 'tipo', 'tamanio_gb']


class ContenidoDiscoViewSet(viewsets.ModelViewSet):
    serializer_class = ContenidoDiscoSerializer

    def get_queryset(self):
        return ContenidoDisco.objects.filter(disco_id=self.kwargs['disco_pk'])


class DiscoScanView(APIView):
    def get(self, request, *args, **kwargs):
        path_to_scan = request.query_params.get('path')

        if not path_to_scan:
            return Response({"error": "Se requiere la 'path' del directorio a escanear."}, status=status.HTTP_400_BAD_REQUEST)

        if len(path_to_scan) == 2 and path_to_scan[1] == ':':
            path_to_scan += os.path.sep

        if not os.path.exists(path_to_scan):
            return Response({"error": f"La ruta '{path_to_scan}' no existe."},
                status=status.HTTP_404_NOT_FOUND)

        if not os.path.isdir(path_to_scan):
            return Response({"error": f"La ruta '{path_to_scan}' no es un directorio válido."},
                status=status.HTTP_400_BAD_REQUEST)

        try:
            suggested_name = ""
            suggested_size_gb = 0

            if os.name == 'nt':
                # Usar el método de Windows para mayor precisión
                name, size = get_windows_volume_info(path_to_scan)
                suggested_name = name or os.path.basename(os.path.normpath(path_to_scan))
                suggested_size_gb = size
            else:
                # Método de respaldo para otros SO
                total_size_bytes = shutil.disk_usage(path_to_scan).total
                suggested_size_gb = round(total_size_bytes / (1024**3), 2)
                suggested_name = os.path.basename(os.path.normpath(path_to_scan))
                if not suggested_name:
                    suggested_name = path_to_scan.replace(os.path.sep, '')

            scanned_contents_data = []
            for item_name in os.listdir(path_to_scan):
                if item_name.startswith('.') or item_name.startswith('$'):
                    continue

                try:
                    item_path = os.path.join(path_to_scan, item_name)
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
                            "peso_gb": 0.0,
                        })
                except OSError:
                    continue
            
            response_data = {
                "contenidos": scanned_contents_data,
                "nombre_sugerido": suggested_name,
                "tamanio_gb_sugerido": suggested_size_gb
            }
            
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Error al procesar el escaneo: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
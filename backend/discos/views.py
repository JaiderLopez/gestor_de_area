import os
import shutil
from datetime import datetime

from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
import django_filters.rest_framework

from .models import Disco, ContenidoDisco
from .serializers import DiscoSerializer, ContenidoDiscoSerializer
from .filters import DiscoFilter


class DiscoViewSet(viewsets.ModelViewSet):
    queryset = Disco.objects.all().order_by('nombre').distinct()
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
        print(f"DEBUG: Intento de escaneo de ruta: '{path_to_scan}'")

        if not path_to_scan:
            return Response({"error": "Se requiere la 'path' del directorio a escanear."}, status=status.HTTP_400_BAD_REQUEST)

        # Normalización de rutas de Windows (ej: D: -> D:\)
        if len(path_to_scan) == 2 and path_to_scan[1] == ':':
            path_to_scan += os.path.sep
        
        # Eliminar comillas si el usuario las incluyó manualmente
        path_to_scan = path_to_scan.strip('"').strip("'")

        # Diagnóstico de visibilidad
        try:
            abs_path = os.path.abspath(path_to_scan)
            print(f"DEBUG: Ruta absoluta calculada: '{abs_path}'")
            
            if not os.path.exists(path_to_scan):
                import string
                drives = ['%s:\\' % d for d in string.ascii_uppercase if os.path.exists('%s:\\' % d)]
                error_msg = f"La ruta '{path_to_scan}' no existe para el servidor. Unidades detectadas: {', '.join(drives)}"
                print(f"DEBUG ERROR: {error_msg}")
                return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

            if not os.path.isdir(path_to_scan):
                error_msg = f"La ruta '{path_to_scan}' no es un directorio válido."
                return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            error_msg = f"Error de acceso a la ruta: {str(e)}"
            print(f"DEBUG ERROR: {error_msg}")
            return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # El nombre sugerido se sigue calculando a partir de la ruta
            suggested_name = os.path.basename(os.path.normpath(path_to_scan))
            if not suggested_name: # Caso para raíces de unidades como 'C:\'
                suggested_name = path_to_scan.replace(os.path.sep, '')
            
            # El tamaño del disco ya no se calcula automáticamente, se establece en 0.
            suggested_size_gb = 0.0

            scanned_contents_data = []
            # Se mantiene el escaneo del contenido del directorio
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


class ExportTemplateView(APIView):
    """
    Vista para descargar plantilla Excel vacía para importar discos.
    """
    def get(self, request):
        from django.http import HttpResponse
        from .utils import generate_template
        
        try:
            excel_file = generate_template()
            
            response = HttpResponse(
                excel_file.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename=plantilla_discos.xlsx'
            
            return response
        except Exception as e:
            return Response(
                {"error": f"Error al generar plantilla: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ImportDataView(APIView):
    """
    Vista para importar datos de discos desde archivo Excel.
    """
    def post(self, request):
        from .utils import parse_excel_import, validate_import_data
        from .models import Disco, ContenidoDisco
        from .serializers import DiscoSerializer
        
        if 'file' not in request.FILES:
            return Response(
                {"error": "No se recibió ningún archivo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['file']
        
        # Validar extensión
        if not file.name.endswith('.xlsx'):
            return Response(
                {"error": "El archivo debe ser un Excel (.xlsx)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Parsear archivo
            discos_data = parse_excel_import(file)
            
            # Validar estructura básica
            validation_errors = validate_import_data(discos_data)
            if validation_errors:
                return Response({
                    "success": False,
                    "created": 0,
                    "errors": validation_errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Procesar cada disco
            created_count = 0
            errors = []
            
            for idx, disco_data in enumerate(discos_data, start=2):
                try:
                    # Debug: Verificar si los contenidos están presentes
                    print(f"DEBUG - Procesando disco: {disco_data.get('nombre')}")
                    print(f"DEBUG - Contenidos recibidos: {len(disco_data.get('contenidos', []))} items")
                    
                    serializer = DiscoSerializer(data=disco_data)
                    if serializer.is_valid():
                        disco_instance = serializer.save()
                        print(f"DEBUG - Disco creado con ID: {disco_instance.id}")
                        print(f"DEBUG - Contenidos guardados: {disco_instance.contenidos.count()}")
                        created_count += 1
                    else:
                        # Agregar errores de validación del serializer
                        print(f"DEBUG - Errores de validación: {serializer.errors}")
                        for field, messages in serializer.errors.items():
                            errors.append({
                                'row': idx,
                                'sheet': 'Disco',
                                'field': field,
                                'message': ' '.join(messages) if isinstance(messages, list) else str(messages)
                            })
                except Exception as e:
                    print(f"DEBUG - Excepción al procesar disco: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    errors.append({
                        'row': idx,
                        'sheet': 'Disco',
                        'field': 'general',
                        'message': str(e)
                    })
            
            return Response({
                "success": len(errors) == 0,
                "created": created_count,
                "total": len(discos_data),
                "errors": errors
            }, status=status.HTTP_200_OK if len(errors) == 0 else status.HTTP_207_MULTI_STATUS)
            
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Error al procesar archivo: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
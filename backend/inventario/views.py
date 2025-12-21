from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Categoria, Dispositivo, Movimiento
from .serializers import CategoriaSerializer, DispositivoSerializer, MovimientoSerializer
from .filters import DispositivoFilter

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class DispositivoViewSet(viewsets.ModelViewSet):
    queryset = Dispositivo.objects.all()
    serializer_class = DispositivoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DispositivoFilter
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


class ExportInventoryTemplateView(APIView):
    """
    Vista para descargar plantilla Excel vacía para importar inventario.
    """
    def get(self, request):
        from django.http import HttpResponse
        from .utils import generate_inventory_template
        
        try:
            excel_file = generate_inventory_template()
            
            response = HttpResponse(
                excel_file.getvalue(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = 'attachment; filename=plantilla_inventario.xlsx'
            
            return response
        except Exception as e:
            return Response(
                {"error": f"Error al generar plantilla: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ImportInventoryDataView(APIView):
    """
    Vista para importar datos de inventario desde archivo Excel.
    """
    def post(self, request):
        from .utils import parse_inventory_import, validate_inventory_data
        from .models import Dispositivo, Categoria
        from .serializers import DispositivoSerializer
        
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
            devices_data = parse_inventory_import(file)
            
            # Validar estructura básica
            validation_errors = validate_inventory_data(devices_data)
            if validation_errors:
                return Response({
                    "success": False,
                    "created": 0,
                    "updated": 0,
                    "errors": validation_errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Procesar cada dispositivo
            created_count = 0
            updated_count = 0
            errors = []
            
            for idx, device_data in enumerate(devices_data, start=2):
                try:
                    # Resolver categoría por nombre
                    categoria_nombre = device_data.pop('categoria', None)
                    if not categoria_nombre:
                        errors.append({
                            'row': idx,
                            'sheet': 'Inventario',
                            'field': 'categoria',
                            'message': 'Categoría no especificada'
                        })
                        continue
                        
                    # Buscar o crear categoría
                    categoria, _ = Categoria.objects.get_or_create(
                        nombre__iexact=categoria_nombre,
                        defaults={'nombre': categoria_nombre}
                    )
                    
                    device_data['categoria'] = categoria.id
                    
                    # Verificar si existe por código de inventario
                    codigo = device_data.get('codigo_inventario')
                    existing_device = Dispositivo.objects.filter(codigo_inventario=codigo).first()
                    
                    if existing_device:
                        serializer = DispositivoSerializer(existing_device, data=device_data, partial=True)
                        action = 'updated'
                    else:
                        serializer = DispositivoSerializer(data=device_data)
                        action = 'created'
                    
                    if serializer.is_valid():
                        serializer.save()
                        if action == 'created':
                            created_count += 1
                        else:
                            updated_count += 1
                    else:
                        for field, messages in serializer.errors.items():
                            errors.append({
                                'row': idx,
                                'sheet': 'Inventario',
                                'field': field,
                                'message': ' '.join(messages) if isinstance(messages, list) else str(messages)
                            })
                            
                except Exception as e:
                    errors.append({
                        'row': idx,
                        'sheet': 'Inventario',
                        'field': 'general',
                        'message': str(e)
                    })
            
            return Response({
                "success": len(errors) == 0,
                "created": created_count,
                "updated": updated_count,
                "total": len(devices_data),
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

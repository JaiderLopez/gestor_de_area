from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiscoViewSet, ContenidoDiscoViewSet, DiscoScanView # Import DiscoScanView

# Se crea un router para registrar las vistas de la API.
router = DefaultRouter()
# Se registra el ViewSet de Disco bajo la ruta 'discos'.
# DRF generará automáticamente las URLs para las acciones CRUD (ej: /discos/, /discos/1/).
router.register(r'discos', DiscoViewSet, basename='disco')

# Definición manual de URLs anidadas para ContenidoDisco
# Esto permite rutas como /discos/{disco_pk}/contenidos/
# El 'disco_pk' estará disponible en los kwargs del ContenidoDiscoViewSet
disco_contenidos_list = ContenidoDiscoViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
disco_contenidos_detail = ContenidoDiscoViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# Las URLs de la API son determinadas automáticamente por el router,
# más las URLs anidadas que hemos definido manualmente.
urlpatterns = [
    path('', include(router.urls)),
    path('discos/<int:disco_pk>/contenidos/', disco_contenidos_list, name='disco-contenidos-list'),
    path('discos/<int:disco_pk>/contenidos/<int:pk>/', disco_contenidos_detail, name='disco-contenidos-detail'),
    path('discos/scan/', DiscoScanView.as_view(), name='disco-scan'), # New URL for scanning
]
from django.contrib import admin
from .models import Categoria, Dispositivo, Movimiento

@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'descripcion')
    search_fields = ('nombre',)

@admin.register(Dispositivo)
class DispositivoAdmin(admin.ModelAdmin):
    list_display = ('codigo_inventario', 'marca', 'modelo', 'categoria', 'estado', 'ubicacion', 'responsable')
    list_filter = ('categoria', 'estado', 'ubicacion')
    search_fields = ('codigo_inventario', 'serial', 'responsable', 'marca', 'modelo')

@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ('fecha_movimiento', 'dispositivo', 'tipo_movimiento', 'origen', 'destino', 'responsable')
    list_filter = ('tipo_movimiento', 'fecha_movimiento')
    date_hierarchy = 'fecha_movimiento'

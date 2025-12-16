from django.contrib import admin
from .models import Mantenimiento

@admin.register(Mantenimiento)
class MantenimientoAdmin(admin.ModelAdmin):
    list_display = ('id', 'dispositivo_info', 'tipo', 'estado', 'prioridad', 'fecha_programada', 'costo')
    list_filter = ('estado', 'tipo', 'prioridad', 'fecha_programada')
    search_fields = ('dispositivo__codigo_inventario', 'dispositivo__marca', 'descripcion_falla', 'acciones_realizadas')
    date_hierarchy = 'fecha_programada'
    
    def dispositivo_info(self, obj):
        return f"{obj.dispositivo.codigo_inventario} - {obj.dispositivo.marca}"
    dispositivo_info.short_description = "Dispositivo"

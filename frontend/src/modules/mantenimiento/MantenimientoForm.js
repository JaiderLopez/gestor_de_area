import React, { useState, useEffect, useContext } from 'react';
import { InventarioContext } from '../inventario/InventarioContext';
import './Mantenimiento.css';

const MantenimientoForm = ({ mantenimiento, onSave, onSuccess, ...props }) => {
    // Need devices list for selection on Create
    const { dispositivos, fetchDispositivos } = useContext(InventarioContext);

    // If we are opening this form from Inventory (pre-selected device), we might need to handle that via props too.
    // For now, assume standard usage.

    const [formData, setFormData] = useState({
        dispositivo: '',
        tipo: 'PREVENTIVO',
        estado: 'PENDIENTE',
        prioridad: 'MEDIA',
        fecha_programada: new Date().toISOString().split('T')[0],
        fecha_realizacion: '', // DateTime? Input type='datetime-local' usually needs format YYYY-MM-DDThh:mm
        descripcion_falla: '',
        acciones_realizadas: '',
        costo: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Load devices if empty? Or simple search?
        // Ideally we should have a searchable Select, but standard Select is fine for limited items.
        // We trigger a fetch just in case.
        fetchDispositivos('http://127.0.0.1:8000/api/inventario/dispositivos/');
    }, [fetchDispositivos]);

    useEffect(() => {
        if (mantenimiento) {
            setFormData({
                dispositivo: mantenimiento.dispositivo,
                tipo: mantenimiento.tipo || 'PREVENTIVO',
                estado: mantenimiento.estado || 'PENDIENTE',
                prioridad: mantenimiento.prioridad || 'MEDIA',
                fecha_programada: mantenimiento.fecha_programada || '',
                fecha_realizacion: mantenimiento.fecha_realizacion ? mantenimiento.fecha_realizacion.slice(0, 16) : '',
                descripcion_falla: mantenimiento.descripcion_falla || '',
                acciones_realizadas: mantenimiento.acciones_realizadas || '',
                costo: mantenimiento.costo || 0
            });
        } else if (props.defaultDispositivoId) {
            setFormData(prev => ({ ...prev, dispositivo: props.defaultDispositivoId }));
        }
    }, [mantenimiento, props.defaultDispositivoId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Sanitize dates
            const submissionData = { ...formData };
            if (!submissionData.fecha_realizacion) submissionData.fecha_realizacion = null;

            await onSave(submissionData);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            setError("Error al guardar mantenimiento.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="inventario-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-grid">
                <div className="form-group full-width">
                    <h3>Datos Básicos</h3>
                </div>

                <div className="form-group full-width">
                    <label>Dispositivo *</label>
                    <select
                        name="dispositivo"
                        value={formData.dispositivo}
                        onChange={handleChange}
                        disabled={!!mantenimiento} // Cannot change device once created usually
                        required
                        className="filter-select" // reuse style
                        style={{ width: '100%' }}
                    >
                        <option value="">Seleccione Equipo...</option>
                        {dispositivos.map(dev => (
                            <option key={dev.id} value={dev.id}>
                                {dev.codigo_inventario} - {dev.marca} {dev.modelo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Tipo</label>
                    <select name="tipo" value={formData.tipo} onChange={handleChange}>
                        <option value="PREVENTIVO">Preventivo</option>
                        <option value="CORRECTIVO">Correctivo</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Prioridad</label>
                    <select name="prioridad" value={formData.prioridad} onChange={handleChange}>
                        <option value="BAJA">Baja</option>
                        <option value="MEDIA">Media</option>
                        <option value="ALTA">Alta</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Estado</label>
                    <select name="estado" value={formData.estado} onChange={handleChange}>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="FINALIZADO">Finalizado</option>
                        <option value="CANCELADO">Cancelado</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Fecha Programada</label>
                    <input
                        type="date"
                        name="fecha_programada"
                        value={formData.fecha_programada}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group full-width">
                    <h3>Detalles Técnicos</h3>
                </div>

                <div className="form-group full-width">
                    <label>Descripción Falla / Tarea</label>
                    <textarea
                        name="descripcion_falla"
                        value={formData.descripcion_falla}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describa el problema o la tarea preventiva..."
                    />
                </div>

                <div className="form-group full-width">
                    <label>Acciones Realizadas</label>
                    <textarea
                        name="acciones_realizadas"
                        value={formData.acciones_realizadas}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Reporte técnico de solución..."
                    />
                </div>

                <div className="form-group">
                    <label>Fecha Realización</label>
                    <input
                        type="datetime-local"
                        name="fecha_realizacion"
                        value={formData.fecha_realizacion}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Costo Total ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        name="costo"
                        value={formData.costo}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Mantenimiento'}
                </button>
            </div>
        </form>
    );
};

export default MantenimientoForm;

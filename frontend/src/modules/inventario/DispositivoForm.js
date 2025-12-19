import React, { useState, useEffect, useContext } from 'react';
import { InventarioContext } from './InventarioContext';
import './Inventario.css';

const DispositivoForm = ({ dispositivo, onSave, onSuccess }) => {
    const { categorias, fetchCategorias } = useContext(InventarioContext);
    const [formData, setFormData] = useState({
        codigo_inventario: '',
        serial: '',
        marca: '',
        modelo: '',
        categoria: '',
        estado: 'ACTIVO',
        ubicacion: '',
        responsable: '',
        fecha_compra: '',
        garantia_hasta: '',
        especificaciones: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCategorias();
        if (dispositivo) {
            setFormData({
                codigo_inventario: dispositivo.codigo_inventario || '',
                serial: dispositivo.serial || '',
                marca: dispositivo.marca || '',
                modelo: dispositivo.modelo || '',
                categoria: dispositivo.categoria || '',
                estado: dispositivo.estado || 'ACTIVO',
                ubicacion: dispositivo.ubicacion || '',
                responsable: dispositivo.responsable || '',
                fecha_compra: dispositivo.fecha_compra || '',
                garantia_hasta: dispositivo.garantia_hasta || '',
                especificaciones: dispositivo.especificaciones || ''
            });
        }
    }, [dispositivo, fetchCategorias]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic Validation
        if (!formData.codigo_inventario || !formData.marca || !formData.categoria) {
            setError("Por favor completa los campos obligatorios (*)");
            setLoading(false);
            return;
        }

        const sanitizedData = {
            ...formData,
            fecha_compra: formData.fecha_compra === '' ? null : formData.fecha_compra,
            garantia_hasta: formData.garantia_hasta === '' ? null : formData.garantia_hasta
        };

        try {
            await onSave(sanitizedData);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            if (err.data && typeof err.data === 'object' && !err.data.error) {
                const fieldErrors = {};
                Object.keys(err.data).forEach(key => {
                    if (Array.isArray(err.data[key])) {
                        fieldErrors[key] = err.data[key].join(' ');
                    } else {
                        fieldErrors[key] = err.data[key];
                    }
                });
                setErrors(fieldErrors);
                setError("Por favor corrige los errores resaltados.");
            } else {
                setError(err.message || "Error al guardar. Verifica que el código o serial no estén duplicados.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="inventario-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="form-grid">
                <div className="form-group full-width">
                    <h3>Información Principal</h3>
                </div>

                <div className="form-group">
                    <label>Código Inventario *</label>
                    <input
                        type="text"
                        name="codigo_inventario"
                        value={formData.codigo_inventario}
                        onChange={handleChange}
                        placeholder="Ej: LP-IT-001"
                        required
                        disabled={!!dispositivo} // Optional: block editing unique code
                        className={errors.codigo_inventario ? 'input-error' : ''}
                    />
                    {errors.codigo_inventario && <span className="error-text">{errors.codigo_inventario}</span>}
                </div>

                <div className="form-group">
                    <label>Serial (Fabricante)</label>
                    <input
                        type="text"
                        name="serial"
                        value={formData.serial}
                        onChange={handleChange}
                        placeholder="S/N..."
                        className={errors.serial ? 'input-error' : ''}
                    />
                    {errors.serial && <span className="error-text">{errors.serial}</span>}
                </div>

                <div className="form-group">
                    <label>Categoría *</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} required>
                        <option value="">Seleccionar...</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Estado</label>
                    <select name="estado" value={formData.estado} onChange={handleChange}>
                        <option value="ACTIVO">Activo</option>
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="EN_REPARACION">En Reparación</option>
                        <option value="DAÑADO">Dañado</option>
                        <option value="BAJA">De Baja</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Marca *</label>
                    <input
                        type="text"
                        name="marca"
                        value={formData.marca}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Modelo *</label>
                    <input
                        type="text"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group full-width">
                    <h3 className="section-title">Ubicación y Garantía</h3>
                </div>

                {/* Note: In the future, Ubicacion/Responsable changes might trigger Movements */}
                <div className="form-group">
                    <label>Ubicación Actual</label>
                    <input
                        type="text"
                        name="ubicacion"
                        value={formData.ubicacion}
                        onChange={handleChange}
                        placeholder="Ej: Oficina 101"
                    />
                </div>

                <div className="form-group">
                    <label>Responsable</label>
                    <input
                        type="text"
                        name="responsable"
                        value={formData.responsable}
                        onChange={handleChange}
                        placeholder="Ej: Juan Perez"
                    />
                </div>

                <div className="form-group">
                    <label>Fecha de Compra</label>
                    <input
                        type="date"
                        name="fecha_compra"
                        value={formData.fecha_compra}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label>Garantía Hasta</label>
                    <input
                        type="date"
                        name="garantia_hasta"
                        value={formData.garantia_hasta}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group full-width">
                    <label>Especificaciones Técnicas</label>
                    <textarea
                        name="especificaciones"
                        value={formData.especificaciones}
                        onChange={handleChange}
                        rows="4"
                        placeholder="RAM, Procesador, Disco Duro, etc..."
                    ></textarea>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar Dispositivo'}
                </button>
            </div>
        </form>
    );
};

export default DispositivoForm;

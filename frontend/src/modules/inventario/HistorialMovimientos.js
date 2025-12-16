import React, { useEffect, useState, useContext } from 'react';
import { InventarioContext } from './InventarioContext';
import './Inventario.css';

const HistorialMovimientos = ({ dispositivo }) => {
    const { fetchHistorial } = useContext(InventarioContext);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadHistorial = async () => {
            setLoading(true);
            try {
                const data = await fetchHistorial(dispositivo.id);
                setHistorial(data);
            } catch (err) {
                setError("Error al cargar el historial.");
            } finally {
                setLoading(false);
            }
        };

        if (dispositivo) {
            loadHistorial();
        }
    }, [dispositivo, fetchHistorial]);

    if (loading) return <div className="p-4 text-center">Cargando historial...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (historial.length === 0) return <div className="p-4 text-center">No hay movimientos registrados para este equipo.</div>;

    return (
        <div className="historial-container">
            <div className="historial-header-info">
                <h3>{dispositivo.marca} {dispositivo.modelo}</h3>
                <span className="badge badge-light">{dispositivo.codigo_inventario}</span>
            </div>

            <div className="timeline">
                {historial.map((mov, index) => (
                    <div className="timeline-item" key={mov.id}>
                        <div className="timeline-icon">
                            {mov.tipo_movimiento === 'ASIGNACION' && '👤'}
                            {mov.tipo_movimiento === 'TRASLADO' && '📍'}
                            {mov.tipo_movimiento === 'DEVOLUCION' && '↩️'}
                            {mov.tipo_movimiento === 'REPARACION' && '🔧'}
                            {mov.tipo_movimiento === 'BAJA' && '🗑️'}
                            {!['ASIGNACION', 'TRASLADO', 'DEVOLUCION', 'REPARACION', 'BAJA'].includes(mov.tipo_movimiento) && '•'}
                        </div>
                        <div className="timeline-content">
                            <div className="timeline-header">
                                <span className="timeline-type">{mov.tipo_movimiento}</span>
                                <span className="timeline-date">
                                    {new Date(mov.fecha_movimiento).toLocaleString()}
                                </span>
                            </div>
                            <div className="timeline-body">
                                <div className="timeline-row">
                                    <span>Origen:</span> <strong>{mov.origen}</strong>
                                </div>
                                <div className="timeline-row">
                                    <span>Destino:</span> <strong>{mov.destino}</strong>
                                </div>
                                {mov.responsable && (
                                    <div className="timeline-row">
                                        <span>Responsable:</span> <strong>{mov.responsable}</strong>
                                    </div>
                                )}
                                {mov.observacion && (
                                    <div className="timeline-note">
                                        "{mov.observacion}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistorialMovimientos;

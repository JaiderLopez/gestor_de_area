import React, { useState, useEffect } from 'react';
import { getDiscos } from '../../services/api';
import Modal from '../../components/common/Modal';
import { API_BASE_URL } from '../../services/api';
import './Discos.css';

const MigrationModal = ({ isOpen, onClose, contenido, discoOrigenId, onMigrate }) => {
    const [discos, setDiscos] = useState([]);
    const [selectedDiscoId, setSelectedDiscoId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadDiscos();
        }
    }, [isOpen]);

    const loadDiscos = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getDiscos(`${API_BASE_URL}/discos/`);
            // Filtrar el disco actual
            const discosDisponibles = (data.results || data).filter(d => d.id !== discoOrigenId);
            setDiscos(discosDisponibles);
        } catch (err) {
            setError('Error al cargar los discos disponibles.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (!selectedDiscoId) {
            setError('Por favor, seleccione un disco destino.');
            return;
        }
        onMigrate(selectedDiscoId);
    };

    const handleDiscoSelect = (discoId) => {
        setSelectedDiscoId(discoId);
        setError('');
    };

    const getEspacioLibre = (disco) => {
        return disco.espacio_libre || 0;
    };

    const tieneEspacioSuficiente = (disco) => {
        const espacioLibre = getEspacioLibre(disco);
        return espacioLibre >= (contenido?.peso_gb || 0);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Migrar Contenido" size="large">
            <div className="migration-modal-content">
                <div className="migration-info">
                    <h4>Contenido a migrar:</h4>
                    <div className="content-info-card">
                        <p><strong>Nombre:</strong> {contenido?.nombre}</p>
                        <p><strong>Tamaño:</strong> {contenido?.peso_gb} GB</p>
                        <p><strong>Fecha:</strong> {contenido?.fecha_modificacion}</p>
                    </div>
                </div>

                <div className="disco-selection">
                    <h4>Seleccione el disco destino:</h4>
                    {loading && <p className="loading-message">Cargando discos...</p>}
                    {error && <p className="error-message">{error}</p>}

                    {!loading && discos.length === 0 && (
                        <p className="no-content-message">No hay otros discos disponibles.</p>
                    )}

                    {!loading && discos.length > 0 && (
                        <div className="disco-list">
                            {discos.map(disco => {
                                const espacioLibre = getEspacioLibre(disco);
                                const suficiente = tieneEspacioSuficiente(disco);

                                return (
                                    <div
                                        key={disco.id}
                                        className={`disco-option ${selectedDiscoId === disco.id ? 'selected' : ''} ${!suficiente ? 'insufficient' : ''}`}
                                        onClick={() => suficiente && handleDiscoSelect(disco.id)}
                                        style={{ cursor: suficiente ? 'pointer' : 'not-allowed' }}
                                    >
                                        <div className="disco-option-header">
                                            <h5>{disco.nombre}</h5>
                                            <span className={`disco-type-badge ${disco.tipo.toLowerCase()}`}>{disco.tipo}</span>
                                        </div>
                                        <div className="disco-option-details">
                                            <p><strong>Tamaño:</strong> {disco.tamanio_gb} GB</p>
                                            <p><strong>Espacio libre:</strong> {espacioLibre.toFixed(2)} GB</p>
                                            <p><strong>Ocupado:</strong> {disco.porcentaje_ocupado}%</p>
                                        </div>
                                        {!suficiente && (
                                            <div className="insufficient-warning">
                                                ⚠️ Espacio insuficiente
                                            </div>
                                        )}
                                        {selectedDiscoId === disco.id && (
                                            <div className="selected-indicator">✓ Seleccionado</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="migration-modal-actions">
                    <button onClick={onClose} className="btn-cancel">
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="btn-confirm"
                        disabled={!selectedDiscoId || loading}
                    >
                        Confirmar Migración
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default MigrationModal;

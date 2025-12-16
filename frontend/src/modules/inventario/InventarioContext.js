import React, { createContext, useState, useCallback } from 'react';
import {
    getDispositivos as apiGetDispositivos,
    getCategorias as apiGetCategorias,
    createDispositivo as apiCreateDispositivo,
    updateDispositivo as apiUpdateDispositivo,
    getMovimientos as apiGetMovimientos,
    createMovimiento as apiCreateMovimiento,
    getHistorial as apiGetHistorial
} from '../../services/api';

export const InventarioContext = createContext();

export const InventarioProvider = ({ children }) => {
    const [dispositivos, setDispositivos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nextPage, setNextPage] = useState(null);

    // Fetch Dispositivos
    const fetchDispositivos = useCallback(async (url, isNewQuery = false) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiGetDispositivos(url);
            if (isNewQuery) {
                setDispositivos(data.results || data);
            } else {
                setDispositivos(prev => [...prev, ...(data.results || data)]);
            }
            setNextPage(data.next);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Categorias
    const fetchCategorias = useCallback(async () => {
        try {
            const data = await apiGetCategorias();
            setCategorias(data.results || data);
        } catch (err) {
            console.error("Error cargando categorías:", err);
        }
    }, []);

    // Create Dispositivo
    const addDispositivo = async (data) => {
        setLoading(true);
        try {
            const response = await apiCreateDispositivo(data);
            setDispositivos(prev => [response, ...prev]);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update Dispositivo
    const updateDispositivo = async (id, data) => {
        setLoading(true);
        try {
            const response = await apiUpdateDispositivo(id, data);
            setDispositivos(prev => prev.map(d => d.id === id ? response : d));
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Create Movimiento
    const createMovimiento = async (data) => {
        setLoading(true);
        try {
            const response = await apiCreateMovimiento(data);
            // Update local device state to reflect movement immediately
            setDispositivos(prev => prev.map(d => {
                if (d.id === data.dispositivo) {
                    return {
                        ...d,
                        ubicacion: data.destino,
                        responsable: data.responsable || d.responsable,
                        estado: (data.tipo_movimiento === 'ASIGNACION' ? 'ACTIVO' :
                            data.tipo_movimiento === 'DEVOLUCION' ? 'DISPONIBLE' :
                                data.tipo_movimiento === 'REPARACION' ? 'EN_REPARACION' :
                                    data.tipo_movimiento === 'BAJA' ? 'BAJA' : d.estado)
                    };
                }
                return d;
            }));
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchHistorial = async (id) => {
        try {
            return await apiGetHistorial(id);
        } catch (err) {
            throw err;
        }
    };

    return (
        <InventarioContext.Provider value={{
            dispositivos,
            categorias,
            loading,
            error,
            nextPage,
            fetchDispositivos,
            fetchCategorias,
            addDispositivo,
            updateDispositivo,
            createMovimiento,
            fetchHistorial
        }}>
            {children}
        </InventarioContext.Provider>
    );
};

import React, { createContext, useState, useCallback } from 'react';
import {
    getMantenimientos as apiGetMantenimientos,
    createMantenimiento as apiCreateMantenimiento,
    updateMantenimiento as apiUpdateMantenimiento
} from '../../services/api';

export const MantenimientoContext = createContext();

export const MantenimientoProvider = ({ children }) => {
    const [mantenimientos, setMantenimientos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [nextPage, setNextPage] = useState(null);

    const fetchMantenimientos = useCallback(async (url, isNewQuery = false) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiGetMantenimientos(url);
            if (isNewQuery) {
                setMantenimientos(data.results || data);
            } else {
                setMantenimientos(prev => [...prev, ...(data.results || data)]);
            }
            setNextPage(data.next);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const addMantenimiento = async (data) => {
        setLoading(true);
        try {
            const response = await apiCreateMantenimiento(data);
            setMantenimientos(prev => [response, ...prev]);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateMantenimiento = async (id, data) => {
        setLoading(true);
        try {
            const response = await apiUpdateMantenimiento(id, data);
            setMantenimientos(prev => prev.map(m => m.id === id ? response : m));
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return (
        <MantenimientoContext.Provider value={{
            mantenimientos,
            loading,
            error,
            nextPage,
            fetchMantenimientos,
            addMantenimiento,
            updateMantenimiento
        }}>
            {children}
        </MantenimientoContext.Provider>
    );
};

import React, { createContext, useState, useCallback } from 'react';
import { getDiscos, addDisco as apiAddDisco, updateDisco as apiUpdateDisco, deleteDisco as apiDeleteDisco } from '../../services/api';

export const DiscoContext = createContext();

export const DiscoProvider = ({ children }) => {
  const [discos, setDiscos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);

  const fetchDiscos = useCallback(async (url, isNewQuery = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDiscos(url);
      if (isNewQuery) {
        setDiscos(data.results);
      } else {
        setDiscos(prevDiscos => [...prevDiscos, ...data.results]);
      }
      setNextPage(data.next);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDisco = async (disco) => {
    try {
      const newData = await apiAddDisco(disco);
      setDiscos(prev => [...prev, newData]);
      return newData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateDisco = async (id, disco) => {
    try {
      const updatedData = await apiUpdateDisco(id, disco);
      setDiscos(prev => prev.map(d => (d.id === id ? updatedData : d)));
      return updatedData;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const deleteDisco = async (id) => {
    try {
      await apiDeleteDisco(id);
      setDiscos(prev => prev.filter(disco => disco.id !== id));
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return (
    <DiscoContext.Provider value={{ discos, loading, error, nextPage, fetchDiscos, addDisco, updateDisco, deleteDisco }}>
      {children}
    </DiscoContext.Provider>
  );
};

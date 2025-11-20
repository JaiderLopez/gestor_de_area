import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Obtenemos el tema guardado o usamos 'light' por defecto
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  useEffect(() => {
    // Aplicamos la clase al body para que los estilos CSS reaccionen
    const bodyClass = document.body.classList;
    bodyClass.remove('light-mode', 'dark-mode');
    bodyClass.add(`${theme}-mode`);
    
    // Guardamos la preferencia del usuario
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

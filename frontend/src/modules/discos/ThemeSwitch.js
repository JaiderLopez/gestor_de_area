import React from 'react';
import { useTheme } from '../../ThemeContext';
import './ThemeSwitch.css';

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-switch-container">
      <span className="theme-icon">{theme === 'dark' ? '🌙' : '☀️'}</span>
      <label className="theme-switch" htmlFor="theme-switch-input">
        <input
          id="theme-switch-input"
          type="checkbox"
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default ThemeSwitch;

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Action types
const ADD_ALERT = 'ADD_ALERT';
const REMOVE_ALERT = 'REMOVE_ALERT';
const CLEAR_ALERTS = 'CLEAR_ALERTS';
const MARK_AS_READ = 'MARK_AS_READ';

// Initial state
const initialState = {
  alerts: JSON.parse(localStorage.getItem('phishingAlerts') || '[]'),
  unreadCount: 0,
};

// Reducer
const alertReducer = (state, action) => {
  switch (action.type) {
    case ADD_ALERT:
      const newAlert = {
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      };
      
      // Prevent duplicate alerts for the same content
      const existingAlert = state.alerts.find(
        alert => alert.content === newAlert.content && 
                 alert.type === newAlert.type &&
                 new Date(alert.timestamp).getTime() > Date.now() - 60000 // Within last minute
      );
      
      if (existingAlert) {
        return state;
      }
      
      const updatedAlerts = [newAlert, ...state.alerts].slice(0, 100); // Keep only last 100 alerts
      return {
        ...state,
        alerts: updatedAlerts,
        unreadCount: state.unreadCount + 1,
      };

    case REMOVE_ALERT:
      const filteredAlerts = state.alerts.filter(alert => alert.id !== action.payload);
      const removedAlert = state.alerts.find(alert => alert.id === action.payload);
      return {
        ...state,
        alerts: filteredAlerts,
        unreadCount: removedAlert && !removedAlert.read ? state.unreadCount - 1 : state.unreadCount,
      };

    case CLEAR_ALERTS:
      return {
        ...state,
        alerts: [],
        unreadCount: 0,
      };

    case MARK_AS_READ:
      const readAlerts = state.alerts.map(alert =>
        alert.id === action.payload ? { ...alert, read: true } : alert
      );
      const wasUnread = state.alerts.find(alert => alert.id === action.payload && !alert.read);
      return {
        ...state,
        alerts: readAlerts,
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      };

    default:
      return state;
  }
};

// Context
const AlertContext = createContext();

// Provider
export const AlertProvider = ({ children }) => {
  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Persist alerts to localStorage
  useEffect(() => {
    localStorage.setItem('phishingAlerts', JSON.stringify(state.alerts));
  }, [state.alerts]);

  // Actions
  const addAlert = (alert) => {
    dispatch({ type: ADD_ALERT, payload: alert });
  };

  const removeAlert = (alertId) => {
    dispatch({ type: REMOVE_ALERT, payload: alertId });
  };

  const clearAlerts = () => {
    dispatch({ type: CLEAR_ALERTS });
  };

  const markAsRead = (alertId) => {
    dispatch({ type: MARK_AS_READ, payload: alertId });
  };

  // Auto-cleanup old alerts (older than 30 days)
  useEffect(() => {
    const cleanup = () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentAlerts = state.alerts.filter(
        alert => new Date(alert.timestamp) > thirtyDaysAgo
      );
      
      if (recentAlerts.length < state.alerts.length) {
        dispatch({ type: CLEAR_ALERTS });
        recentAlerts.forEach(alert => dispatch({ type: ADD_ALERT, payload: alert }));
      }
    };

    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000); // Run daily
    return () => clearInterval(interval);
  }, [state.alerts]);

  const value = {
    alerts: state.alerts,
    unreadCount: state.unreadCount,
    addAlert,
    removeAlert,
    clearAlerts,
    markAsRead,
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

// Hook
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Utility functions for creating different types of alerts
export const createPhishingAlert = (content, type, riskLevel, details = {}) => ({
  type: 'phishing_detected',
  title: `Phishing ${type} Detected`,
  content,
  riskLevel,
  severity: riskLevel === 'critical' ? 'critical' : riskLevel === 'high' ? 'high' : 'medium',
  details,
});

export const createSecurityAlert = (title, content, severity = 'medium', details = {}) => ({
  type: 'security_warning',
  title,
  content,
  severity,
  details,
});

export const createSystemAlert = (title, content, type = 'info', details = {}) => ({
  type: 'system_notification',
  title,
  content,
  severity: type,
  details,
});

export default AlertContext;
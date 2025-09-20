import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, ExternalLink } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const AlertNotification = () => {
  const { alerts, removeAlert, markAsRead } = useAlert();
  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [autoDismiss, setAutoDismiss] = useState(true);
  const [dismissTimeout, setDismissTimeout] = useState(5000);

  useEffect(() => {
    // Filter for unread, high-priority alerts that should show as notifications
    const newAlerts = alerts.filter(alert => 
      !alert.read && 
      !visibleAlerts.find(v => v.id === alert.id) &&
      (alert.severity === 'critical' || alert.severity === 'high' || alert.type === 'phishing_detected')
    );

    if (newAlerts.length > 0) {
      setVisibleAlerts(prev => [...prev, ...newAlerts]);
      
      // Auto-dismiss after timeout
      if (autoDismiss) {
        newAlerts.forEach(alert => {
          setTimeout(() => {
            dismissNotification(alert.id);
          }, dismissTimeout);
        });
      }
    }
  }, [alerts, visibleAlerts, autoDismiss, dismissTimeout, markAsRead]);

  const dismissNotification = (alertId) => {
    setVisibleAlerts(prev => prev.filter(alert => alert.id !== alertId));
    markAsRead(alertId);
  };

  const getNotificationIcon = (type, severity) => {
    switch (type) {
      case 'phishing_detected':
        return <AlertTriangle className="notification-icon notification-icon-warning" />;
      case 'security_warning':
        return <AlertTriangle className="notification-icon notification-icon-warning" />;
      case 'system_notification':
        switch (severity) {
          case 'success':
            return <CheckCircle className="notification-icon notification-icon-success" />;
          case 'error':
            return <AlertTriangle className="notification-icon notification-icon-error" />;
          default:
            return <Info className="notification-icon notification-icon-info" />;
        }
      default:
        return <Info className="notification-icon notification-icon-info" />;
    }
  };

  const getNotificationClass = (severity) => {
    let baseClass = 'alert-notification';
    
    switch (severity) {
      case 'critical':
        return `${baseClass} notification-critical`;
      case 'high':
        return `${baseClass} notification-high`;
      case 'medium':
        return `${baseClass} notification-medium`;
      case 'low':
      case 'success':
        return `${baseClass} notification-low`;
      default:
        return `${baseClass} notification-info`;
    }
  };

  const handleNotificationAction = (alert, action) => {
    switch (action) {
      case 'dismiss':
        dismissNotification(alert.id);
        break;
      case 'learn_more':
        // Navigate to educational content or detailed view
        console.log('Learn more about:', alert);
        dismissNotification(alert.id);
        break;
      case 'report':
        // Handle report action
        console.log('Reporting:', alert);
        dismissNotification(alert.id);
        break;
      default:
        break;
    }
  };

  const playNotificationSound = () => {
    // Create audio context for notification sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Audio notification failed:', error);
    }
  };

  useEffect(() => {
    // Play notification sound for critical/high alerts
    const criticalAlerts = visibleAlerts.filter(alert => 
      alert.severity === 'critical' || alert.type === 'phishing_detected'
    );
    
    if (criticalAlerts.length > 0) {
      playNotificationSound();
    }
  }, [visibleAlerts]);

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className="alert-notifications-container">
      {visibleAlerts.map((alert) => (
        <div key={alert.id} className={getNotificationClass(alert.severity)}>
          <div className="notification-header">
            <div className="notification-icon-wrapper">
              {getNotificationIcon(alert.type, alert.severity)}
            </div>
            <div className="notification-content">
              <div className="notification-title">{alert.title}</div>
              <div className="notification-timestamp">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <button
              className="notification-close"
              onClick={() => handleNotificationAction(alert, 'dismiss')}
              title="Dismiss notification"
            >
              <X />
            </button>
          </div>
          
          <div className="notification-body">
            <p className="notification-message">{alert.content}</p>
            
            {alert.riskLevel && (
              <div className="notification-risk-level">
                <span className={`risk-indicator risk-${alert.riskLevel}`}>
                  {alert.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            )}
          </div>
          
          <div className="notification-footer">
            <div className="notification-actions">
              {alert.type === 'phishing_detected' && (
                <button
                  className="notification-action-btn notification-action-danger"
                  onClick={() => handleNotificationAction(alert, 'report')}
                >
                  Report Phishing
                </button>
              )}
              <button
                className="notification-action-btn notification-action-primary"
                onClick={() => handleNotificationAction(alert, 'learn_more')}
              >
                Learn More
                <ExternalLink size={12} />
              </button>
              <button
                className="notification-action-btn notification-action-secondary"
                onClick={() => handleNotificationAction(alert, 'dismiss')}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertNotification;
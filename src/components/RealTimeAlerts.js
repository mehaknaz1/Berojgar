import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, ExternalLink, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

const RealTimeAlerts = () => {
  const { alerts, removeAlert, clearAlerts, markAsRead, unreadCount } = useAlert();
  const [filter, setFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const getAlertIcon = (type, severity) => {
    switch (type) {
      case 'phishing_detected':
        return <AlertTriangle className="alert-icon" />;
      case 'security_warning':
        return <AlertTriangle className="alert-icon" />;
      case 'system_notification':
        switch (severity) {
          case 'success':
            return <CheckCircle className="alert-icon" />;
          case 'error':
            return <AlertTriangle className="alert-icon" />;
          default:
            return <Info className="alert-icon" />;
        }
      default:
        return <Info className="alert-icon" />;
    }
  };

  const getAlertClass = (severity, read) => {
    let baseClass = 'alert-item';
    if (!read) baseClass += ' unread';
    
    switch (severity) {
      case 'critical':
        return `${baseClass} alert-critical`;
      case 'high':
        return `${baseClass} alert-high`;
      case 'medium':
        return `${baseClass} alert-medium`;
      case 'low':
      case 'success':
        return `${baseClass} alert-low`;
      default:
        return `${baseClass} alert-info`;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const filteredAlerts = alerts.filter(alert => {
    if (showUnreadOnly && alert.read) return false;
    if (filter === 'all') return true;
    if (filter === 'phishing') return alert.type === 'phishing_detected';
    if (filter === 'security') return alert.type === 'security_warning';
    if (filter === 'system') return alert.type === 'system_notification';
    if (filter === 'critical') return alert.severity === 'critical';
    if (filter === 'high') return alert.severity === 'high';
    return true;
  });

  const handleAlertAction = (alert, action) => {
    switch (action) {
      case 'dismiss':
        removeAlert(alert.id);
        break;
      case 'mark_read':
        markAsRead(alert.id);
        break;
      case 'report':
        // Handle report action
        console.log('Reporting alert:', alert);
        break;
      case 'learn_more':
        // Handle learn more action
        console.log('Learn more about:', alert);
        break;
      default:
        break;
    }
  };

  const exportAlerts = () => {
    const dataStr = JSON.stringify(filteredAlerts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phishing-alerts-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="real-time-alerts">
      <div className="card mb-4">
        <div className="card-header">
          <h1 className="card-title">
            <Bell /> Real-Time Alerts
          </h1>
          <div className="alert-stats">
            <span className="unread-count">
              {unreadCount > 0 && (
                <span className="badge badge-danger">{unreadCount}</span>
              )}
            </span>
          </div>
        </div>
        
        <div className="alert-controls">
          <div className="filter-group">
            <select 
              className="form-select" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Alerts</option>
              <option value="phishing">Phishing</option>
              <option value="security">Security</option>
              <option value="system">System</option>
              <option value="critical">Critical</option>
              <option value="high">High Priority</option>
            </select>
            
            <button
              className={`btn btn-sm ${showUnreadOnly ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? <EyeOff /> : <Eye />} 
              {showUnreadOnly ? 'Show All' : 'Unread Only'}
            </button>
            
          </div>
          
          <div className="action-group">
            <button className="btn btn-secondary btn-sm" onClick={exportAlerts}>
              Export
            </button>
            <button className="btn btn-danger btn-sm" onClick={clearAlerts}>
              <Trash2 /> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="alerts-container">
        {filteredAlerts.length === 0 ? (
          <div className="card">
            <div className="text-center py-5">
              <Bell size={48} className="text-muted mb-3" />
              <h4>No Alerts</h4>
              <p className="text-muted">
                {showUnreadOnly ? 'No unread alerts' : 'No alerts to display'}
              </p>
              {alerts.length === 0 && (
                <p className="text-muted">
                  When phishing attempts are detected, they will appear here.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="alerts-list">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className={getAlertClass(alert.severity, alert.read)}>
                <div className="alert-header">
                  <div className="alert-icon-wrapper">
                    {getAlertIcon(alert.type, alert.severity)}
                  </div>
                  <div className="alert-content">
                    <div className="alert-title">
                      {alert.title}
                      {!alert.read && <span className="unread-indicator"></span>}
                    </div>
                    <div className="alert-timestamp">
                      {formatTimestamp(alert.timestamp)}
                    </div>
                  </div>
                  <div className="alert-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => !alert.read && handleAlertAction(alert, 'mark_read')}
                      title={alert.read ? 'Already read' : 'Mark as read'}
                      disabled={alert.read}
                    >
                      {alert.read ? <Eye /> : <EyeOff />}
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAlertAction(alert, 'learn_more')}
                      title="Learn more"
                    >
                      <ExternalLink />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleAlertAction(alert, 'dismiss')}
                      title="Dismiss alert"
                    >
                      <X />
                    </button>
                  </div>
                </div>
                
                <div className="alert-body">
                  <p className="alert-description">{alert.content}</p>
                  
                  {alert.details && Object.keys(alert.details).length > 0 && (
                    <div className="alert-details">
                      <strong>Details:</strong>
                      <ul>
                        {Object.entries(alert.details).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {alert.riskLevel && (
                    <div className="alert-risk-level">
                      <span className={`risk-indicator risk-${alert.riskLevel}`}>
                        {alert.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="alert-footer">
                  <div className="alert-tags">
                    <span className="alert-tag">{alert.type.replace('_', ' ')}</span>
                    <span className={`alert-tag alert-severity-${alert.severity}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="alert-quick-actions">
                    {alert.type === 'phishing_detected' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleAlertAction(alert, 'report')}
                      >
                        Report Phishing
                      </button>
                    )}
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAlertAction(alert, 'learn_more')}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Statistics */}
      {alerts.length > 0 && (
        <div className="card mt-4">
          <div className="card-header">
            <h3>Alert Statistics</h3>
          </div>
          <div className="alert-stats-grid">
            <div className="stat-item">
              <div className="stat-number">{alerts.length}</div>
              <div className="stat-label">Total Alerts</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{unreadCount}</div>
              <div className="stat-label">Unread</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {alerts.filter(a => a.severity === 'critical').length}
              </div>
              <div className="stat-label">Critical</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">
                {alerts.filter(a => a.type === 'phishing_detected').length}
              </div>
              <div className="stat-label">Phishing</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeAlerts;
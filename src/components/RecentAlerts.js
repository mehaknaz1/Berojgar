import React from 'react';
import { AlertTriangle, Shield, Clock, ExternalLink } from 'lucide-react';

const RecentAlerts = ({ alerts }) => {
  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'low':
        return <Shield className="w-5 h-5 text-blue-500" />;
      default:
        return <Shield className="w-5 h-5 text-green-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-green-50 text-green-800 border-green-200';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffInHours = Math.floor((now - alertTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const mockAlerts = alerts || [
    {
      id: 1,
      type: 'email',
      severity: 'high',
      title: 'Suspicious email from "paypal-security"',
      description: 'Fake PayPal security alert requesting account verification',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      source: 'Email'
    },
    {
      id: 2,
      type: 'url',
      severity: 'medium',
      title: 'Suspicious URL detected',
      description: 'URL shortening service redirecting to phishing site',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      source: 'Web'
    },
    {
      id: 3,
      type: 'image',
      severity: 'low',
      title: 'Brand logo detected in screenshot',
      description: 'Potential brand impersonation in uploaded image',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      source: 'Image'
    }
  ];

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
        <a href="/alerts" className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
          View all
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
      
      <div className="space-y-3">
        {mockAlerts.map((alert) => (
          <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                {getAlertIcon(alert.severity)}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{alert.title}</h4>
                  <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
                <p className="text-sm mt-1">{alert.description}</p>
                <div className="flex items-center mt-2">
                  <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                    {alert.source}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAlerts;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, FileText, Image, Mail, BookOpen, BarChart3 } from 'lucide-react';
import StatCard from './StatCard';
import QuickAction from './QuickAction';
import RecentAlerts from './RecentAlerts';
import { useAlert } from '../contexts/AlertContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    safeContent: 0,
    accuracyRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { alerts } = useAlert();

  useEffect(() => {
    // Load dashboard statistics from localStorage or API
    const loadStats = () => {
      try {
        const savedStats = localStorage.getItem('phishingStats');
        if (savedStats) {
          setStats(JSON.parse(savedStats));
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const quickActions = [
    {
      title: 'Analyze Text',
      description: 'Paste suspicious text messages or content',
      icon: FileText,
      color: 'blue',
      link: '/text-analyzer'
    },
    {
      title: 'Analyze Image',
      description: 'Upload screenshots or suspicious images',
      icon: Image,
      color: 'green',
      link: '/image-analyzer'
    },
    {
      title: 'Analyze Email',
      description: 'Check email content for phishing indicators',
      icon: Mail,
      color: 'purple',
      link: '/email-analyzer'
    },
    {
      title: 'Learn Security',
      description: 'Educational content and best practices',
      icon: BookOpen,
      color: 'orange',
      link: '/education'
    }
  ];

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="text-center">
          <div className="loading"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h1 className="card-title">Welcome to Anti-Phishing Assistant</h1>
          <div className="status-indicator">
            <span className="status-dot status-active"></span>
            <span>System Online</span>
          </div>
        </div>
        <p className="text-secondary">
          Protect yourself from phishing attacks with our AI-powered detection system. 
          Analyze text messages, images, and emails for suspicious content.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="dashboard-grid mb-4">
        <StatCard
          title="Total Scans"
          value={stats.totalScans}
          icon={BarChart3}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Threats Detected"
          value={stats.threatsDetected}
          icon={AlertTriangle}
          color="red"
          trend="-5%"
        />
        <StatCard
          title="Safe Content"
          value={stats.safeContent}
          icon={CheckCircle}
          color="green"
          trend="+8%"
        />
        <StatCard
          title="Accuracy Rate"
          value={`${stats.accuracyRate}%`}
          icon={Shield}
          color="purple"
          trend="+2%"
        />
      </div>

      {/* Quick Actions */}
      <div className="card mb-4">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="dashboard-grid">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Alerts</h2>
            <Link to="/alerts" className="btn btn-primary btn-sm">
              View All Alerts
            </Link>
          </div>
          <RecentAlerts alerts={alerts.slice(0, 5)} />
        </div>
      )}

      {/* Safety Tips */}
      <div className="card mt-4">
        <div className="card-header">
          <h2 className="card-title">💡 Quick Safety Tips</h2>
        </div>
        <div className="safety-tips">
          <div className="tip-item">
            <strong>Check the sender:</strong> Verify email addresses and phone numbers before responding.
          </div>
          <div className="tip-item">
            <strong>Look for urgency:</strong> Be suspicious of messages that create urgency or fear.
          </div>
          <div className="tip-item">
            <strong>Don't click links:</strong> Hover over links to see the actual destination.
          </div>
          <div className="tip-item">
            <strong>Check for typos:</strong> Legitimate companies rarely have spelling errors.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import React from 'react';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon, trend, trendValue, color = 'blue' }) => {
  const iconComponents = {
    shield: Shield,
    alert: AlertTriangle,
    check: CheckCircle,
    clock: Clock
  };

  const IconComponent = iconComponents[icon] || Shield;
  
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600'
  };

  return (
    <div className={`card ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className={`w-4 h-4 ${trendColors.up}`} />
              ) : (
                <TrendingDown className={`w-4 h-4 ${trendColors.down}`} />
              )}
              <span className={`text-sm ml-1 ${trendColors[trend]}`}>
                {trendValue}%
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <IconComponent className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
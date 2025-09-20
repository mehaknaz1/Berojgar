import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Image, Globe, Bell, BookOpen, Settings } from 'lucide-react';

const QuickAction = ({ title, description, icon, link, color = 'blue' }) => {
  const iconComponents = {
    text: FileText,
    image: Image,
    globe: Globe,
    bell: Bell,
    book: BookOpen,
    settings: Settings
  };

  const IconComponent = iconComponents[icon] || FileText;
  
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    yellow: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
    red: 'bg-red-50 text-red-600 hover:bg-red-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100'
  };

  return (
    <Link to={link} className={`card ${colorClasses[color]} transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-4">
          <IconComponent className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default QuickAction;
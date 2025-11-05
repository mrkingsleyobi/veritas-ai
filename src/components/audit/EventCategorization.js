import React, { useState } from 'react';

const EventCategorization = ({ selectedCategory, onCategoryChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    { id: 'all', name: 'All Events', count: 1245, color: 'gray' },
    { id: 'USER_LOGIN', name: 'User Authentication', count: 320, color: 'blue' },
    { id: 'FILE_ACCESS', name: 'File Access', count: 280, color: 'green' },
    { id: 'DATA_MODIFICATION', name: 'Data Changes', count: 195, color: 'orange' },
    { id: 'SYSTEM_UPDATE', name: 'System Updates', count: 150, color: 'purple' },
    { id: 'SECURITY_ALERT', name: 'Security Events', count: 120, color: 'red' },
    { id: 'API_CALL', name: 'API Calls', count: 95, color: 'indigo' },
    { id: 'PERMISSION_CHANGE', name: 'Permission Changes', count: 85, color: 'yellow' }
  ];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="event-categorization">
      <div className="category-header">
        <h4>Event Categories</h4>
        <button onClick={toggleExpand} className="expand-toggle">
          {isExpanded ? 'Show Less' : 'Show All'}
        </button>
      </div>

      <div className="category-list">
        {(isExpanded ? categories : categories.slice(0, 5)).map(category => (
          <div
            key={category.id}
            className={`category-item ${selectedCategory === category.id ? 'selected' : ''}`}
            onClick={() => onCategoryChange(selectedCategory === category.id ? '' : category.id)}
          >
            <div className="category-info">
              <span className={`category-color ${category.color}`}></span>
              <span className="category-name">{category.name}</span>
            </div>
            <span className="category-count">{category.count}</span>
          </div>
        ))}
      </div>

      <div className="category-tags">
        <h5>Quick Filters:</h5>
        <div className="tag-list">
          <span
            className={`tag ${selectedCategory === 'security' ? 'active' : ''}`}
            onClick={() => onCategoryChange(selectedCategory === 'security' ? '' : 'security')}
          >
            Security
          </span>
          <span
            className={`tag ${selectedCategory === 'user' ? 'active' : ''}`}
            onClick={() => onCategoryChange(selectedCategory === 'user' ? '' : 'user')}
          >
            User Activity
          </span>
          <span
            className={`tag ${selectedCategory === 'system' ? 'active' : ''}`}
            onClick={() => onCategoryChange(selectedCategory === 'system' ? '' : 'system')}
          >
            System
          </span>
          <span
            className={`tag ${selectedCategory === 'data' ? 'active' : ''}`}
            onClick={() => onCategoryChange(selectedCategory === 'data' ? '' : 'data')}
          >
            Data
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCategorization;
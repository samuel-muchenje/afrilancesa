import React from 'react';
import AdvancedSearch from './components/AdvancedSearch';

const BrowseJobs = ({ user, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Browse Jobs 💼
          </h1>
          <p className="text-gray-400">
            Find the perfect opportunities with our advanced search and filtering system
          </p>
        </div>

        {/* Advanced Search Component */}
        <AdvancedSearch searchType="jobs" />
      </div>
    </div>
  );
};

export default BrowseJobs;
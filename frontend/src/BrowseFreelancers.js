import React from 'react';
import AdvancedSearch from './components/AdvancedSearch';

const BrowseFreelancers = ({ user, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Browse Freelancers 👥
          </h1>
          <p className="text-gray-400">
            Discover talented South African freelancers with advanced search and filtering
          </p>
        </div>

        {/* Advanced Search Component */}
        <AdvancedSearch searchType="users" />
      </div>
    </div>
  );
};

export default BrowseFreelancers;
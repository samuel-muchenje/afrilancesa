import React, { useState, useEffect } from 'react';
import AdvancedSearch from './components/AdvancedSearch';
import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BrowseFreelancers = ({ user, onNavigate }) => {
  const [searchCategory, setSearchCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Parse URL parameters if any
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const search = urlParams.get('search');
    
    if (category) {
      setSearchCategory(category);
    }
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Back to Home Button */}
      <div className="container mx-auto px-6 pt-6">
        <Button
          variant="ghost"
          onClick={() => onNavigate('landing')}
          className="text-gray-300 hover:text-yellow-400 hover:bg-white/5 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Browse Freelancers 👥
          </h1>
          <p className="text-gray-400">
            Discover talented South African freelancers with advanced search and filtering
          </p>
          {searchCategory && (
            <p className="text-yellow-400 mt-2">
              Showing freelancers in: <span className="font-semibold">{searchCategory}</span>
            </p>
          )}
          {searchQuery && (
            <p className="text-green-400 mt-2">
              Search results for: <span className="font-semibold">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Advanced Search Component */}
        <AdvancedSearch 
          searchType="users" 
          initialCategory={searchCategory}
          initialSearch={searchQuery}
        />
      </div>
    </div>
  );
};

export default BrowseFreelancers;
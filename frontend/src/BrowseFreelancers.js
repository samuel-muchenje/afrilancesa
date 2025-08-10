import React, { useState, useEffect } from 'react';
import AdvancedPortfolioSearch from './components/AdvancedPortfolioSearch';
import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BrowseFreelancers = ({ user, onNavigate, initialCategory = '', initialSearch = '' }) => {
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
            Browse Freelancer Portfolios 🎨
          </h1>
          <p className="text-gray-400">
            Discover talented South African freelancers with enhanced portfolio search
          </p>
          {initialCategory && (
            <p className="text-yellow-400 mt-2">
              Showing freelancers in: <span className="font-semibold">{initialCategory}</span>
            </p>
          )}
          {initialSearch && (
            <p className="text-green-400 mt-2">
              Search results for: <span className="font-semibold">"{initialSearch}"</span>
            </p>
          )}
        </div>

        {/* Advanced Portfolio Search Component */}
        <AdvancedPortfolioSearch 
          onNavigate={onNavigate}
          initialQuery={initialSearch}
          initialCategory={initialCategory}
        />
      </div>
    </div>
  );
};
};

export default BrowseFreelancers;
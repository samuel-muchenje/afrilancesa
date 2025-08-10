import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { 
  ArrowLeft, MessageCircle, User, Share2, 
  Star, MapPin, Clock, Award, ExternalLink
} from 'lucide-react';
import PortfolioShowcase from './components/PortfolioShowcase';

const FreelancerPortfolio = ({ onNavigate, currentPage }) => {
  const [freelancerId, setFreelancerId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract freelancer ID from currentPage parameter
    // Expected format: "freelancer-portfolio/[freelancer-id]"
    if (currentPage && currentPage.startsWith('freelancer-portfolio/')) {
      const id = currentPage.split('/')[1];
      setFreelancerId(id);
    }
    
    setLoading(false);
  }, [currentPage]);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('browse-freelancers');
    } else {
      window.history.back();
    }
  };

  const handleContact = () => {
    // For now, just navigate back to browse page
    // In a full implementation, this would open messaging or contact modal
    if (onNavigate) {
      onNavigate('browse-freelancers');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this freelancer portfolio',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Portfolio link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-20 bg-gray-700 rounded mb-4"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!freelancerId) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Portfolio Not Found</h3>
              <p className="text-gray-400 mb-6">
                The freelancer portfolio you're looking for could not be found.
              </p>
              <Button
                onClick={handleBack}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Browse
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={handleBack}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Browse
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Portfolio
            </Button>
            
            <Button
              onClick={handleContact}
              className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Freelancer
            </Button>
          </div>
        </div>

        {/* Portfolio Showcase */}
        <PortfolioShowcase freelancerId={freelancerId} isPreview={false} />
        
        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-yellow-400/10 to-green-500/10 border-yellow-400/20 mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to work with this freelancer?
            </h3>
            <p className="text-gray-300 mb-6">
              Get in touch to discuss your project requirements and start collaboration.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button
                onClick={handleContact}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate && onNavigate('browse-freelancers')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Browse More Freelancers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerPortfolio;
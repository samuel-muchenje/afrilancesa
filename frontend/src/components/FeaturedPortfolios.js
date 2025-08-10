import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  User, Star, Eye, ArrowRight, Award, CheckCircle,
  Image, Video, FileText, TrendingUp, Users
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FeaturedPortfolios = ({ limit = 6, showHeader = true, onNavigate }) => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedPortfolios();
  }, [limit]);

  const fetchFeaturedPortfolios = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/featured?limit=${limit}`);
      
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data.featured_portfolios || []);
      } else {
        setError('Failed to load featured portfolios');
      }
    } catch (error) {
      console.error('Error fetching featured portfolios:', error);
      setError('Error loading portfolios');
    } finally {
      setLoading(false);
    }
  };

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-600" />);
    }

    return stars;
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-3 h-3" />;
    if (fileType?.startsWith('video/')) return <Video className="w-3 h-3" />;
    if (fileType?.includes('pdf') || fileType?.includes('document')) return <FileText className="w-3 h-3" />;
    return <FileText className="w-3 h-3" />;
  };

  const handleViewPortfolio = (freelancerId) => {
    if (onNavigate) {
      onNavigate(`freelancer-portfolio/${freelancerId}`);
    } else {
      // Fallback navigation
      window.location.href = `#freelancer-portfolio/${freelancerId}`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {showHeader && (
          <div className="text-center">
            <div className="h-8 bg-gray-700 rounded w-64 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
                <div className="h-20 bg-gray-700 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-700 rounded w-16"></div>
                  <div className="h-3 bg-gray-700 rounded w-12"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || portfolios.length === 0) {
    return (
      <div className="text-center py-12">
        {showHeader && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Featured Portfolios</h2>
            <p className="text-gray-400">Discover talented South African freelancers</p>
          </div>
        )}
        
        <Card className="bg-gray-800 border-gray-700 max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Featured Portfolios</h3>
            <p className="text-gray-400">{error || 'No portfolios available at the moment'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Featured Portfolios</h2>
          <p className="text-gray-400">Discover talented South African freelancers with outstanding work</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((freelancer) => (
          <Card key={freelancer.id} className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6">
              {/* Freelancer Header */}
              <div className="flex items-center space-x-3 mb-4">
                {freelancer.profile_picture ? (
                  <img
                    src={`${API_BASE}/uploads/profile_pictures/${freelancer.profile_picture.filename}`}
                    alt={freelancer.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400/50"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                      {freelancer.full_name}
                    </h3>
                    {freelancer.is_verified && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  
                  {freelancer.profile?.profession && (
                    <p className="text-gray-400 text-sm">{freelancer.profile.profession}</p>
                  )}
                  
                  {freelancer.profile?.rating && (
                    <div className="flex items-center mt-1">
                      {renderRating(freelancer.profile.rating)}
                      <span className="text-gray-400 text-xs ml-1">
                        ({freelancer.profile.rating.toFixed(1)})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Portfolio Preview */}
              <div className="mb-4">
                {freelancer.project_gallery?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {freelancer.project_gallery.slice(0, 2).map((project, index) => (
                      <div key={index} className="aspect-video bg-gray-700 rounded-lg overflow-hidden">
                        {project.file_info?.content_type?.startsWith('image/') ? (
                          <img
                            src={`${API_BASE}/uploads/project_gallery/${project.file_info.filename}`}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getFileIcon(project.file_info?.content_type)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : freelancer.portfolio_files?.length > 0 ? (
                  <div className="flex items-center justify-center h-20 bg-gray-700 rounded-lg mb-3">
                    <div className="text-center">
                      {getFileIcon(freelancer.portfolio_files[0]?.content_type)}
                      <p className="text-gray-400 text-xs mt-1">
                        {freelancer.portfolio_files.length} files
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-20 bg-gray-700 rounded-lg mb-3">
                    <div className="text-center">
                      <Award className="w-6 h-6 text-gray-500 mx-auto" />
                      <p className="text-gray-500 text-xs mt-1">Portfolio</p>
                    </div>
                  </div>
                )}

                {/* Skills Preview */}
                {freelancer.profile?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {freelancer.profile.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {skill}
                      </Badge>
                    ))}
                    {freelancer.profile.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                        +{freelancer.profile.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Portfolio Stats */}
              <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center">
                    <Award className="w-3 h-3 mr-1" />
                    {(freelancer.project_gallery?.length || 0)} projects
                  </span>
                  <span className="flex items-center">
                    <FileText className="w-3 h-3 mr-1" />
                    {(freelancer.portfolio_files?.length || 0)} files
                  </span>
                </div>
                
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>{Math.round(freelancer.portfolio_score || 0)} score</span>
                </div>
              </div>

              {/* Hourly Rate */}
              {freelancer.profile?.hourly_rate && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">Hourly Rate</span>
                  <span className="text-green-400 font-semibold">
                    R{freelancer.profile.hourly_rate}/hr
                  </span>
                </div>
              )}

              {/* View Portfolio Button */}
              <Button
                onClick={() => handleViewPortfolio(freelancer.id)}
                className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold group"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Portfolio
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Button */}
      {portfolios.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => onNavigate && onNavigate('browse-freelancers')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            View All Freelancers
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeaturedPortfolios;
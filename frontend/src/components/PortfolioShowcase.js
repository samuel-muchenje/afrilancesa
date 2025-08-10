import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  User, Star, Calendar, Eye, ExternalLink, Download, 
  Image, Video, FileText, Award, TrendingUp, Activity,
  Briefcase, Code, MapPin, Clock, CheckCircle
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PortfolioShowcase = ({ freelancerId, isPreview = false }) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (freelancerId) {
      fetchPortfolioData();
    }
  }, [freelancerId]);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/showcase/${freelancerId}`);
      
      if (response.ok) {
        const data = await response.json();
        setPortfolioData(data);
      } else {
        setError('Failed to load portfolio data');
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setError('Error loading portfolio');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType?.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType?.includes('pdf') || fileType?.includes('document')) return <FileText className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating || 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-600" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
    );
  }

  if (error || !portfolioData) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Portfolio Not Found</h3>
          <p className="text-gray-400">{error || 'Unable to load portfolio data'}</p>
        </CardContent>
      </Card>
    );
  }

  const { freelancer, portfolio_stats, technology_breakdown, portfolio_files, project_gallery, recent_activity } = portfolioData;

  return (
    <div className="space-y-6">
      {/* Freelancer Header */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {freelancer.profile_picture ? (
                <img
                  src={`${API_BASE}/uploads/profile_pictures/${freelancer.profile_picture.filename}`}
                  alt={freelancer.full_name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-yellow-400"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-white">{freelancer.full_name}</h1>
                  {freelancer.is_verified && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>
                
                {freelancer.profile?.profession && (
                  <p className="text-yellow-400 font-medium mb-2">{freelancer.profile.profession}</p>
                )}
                
                {freelancer.profile?.bio && (
                  <p className="text-gray-300 mb-3">{freelancer.profile.bio}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  {freelancer.profile?.location && (
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {freelancer.profile.location}
                    </span>
                  )}
                  
                  {freelancer.profile?.rating && (
                    <div className="flex items-center">
                      {renderRating(freelancer.profile.rating)}
                      <span className="ml-2">({freelancer.profile.rating.toFixed(1)})</span>
                    </div>
                  )}
                  
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {formatDate(freelancer.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            {freelancer.profile?.hourly_rate && (
              <div className="text-right">
                <p className="text-gray-400 text-sm">Hourly Rate</p>
                <p className="text-2xl font-bold text-green-400">
                  R{freelancer.profile.hourly_rate}/hr
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <Briefcase className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{portfolio_stats.total_portfolio_files}</p>
            <p className="text-gray-400 text-sm">Portfolio Files</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{portfolio_stats.total_projects}</p>
            <p className="text-gray-400 text-sm">Projects</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <Code className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{portfolio_stats.total_technologies}</p>
            <p className="text-gray-400 text-sm">Technologies</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{portfolio_stats.portfolio_completion}%</p>
            <p className="text-gray-400 text-sm">Completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Skills & Technologies */}
      {freelancer.profile?.skills?.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Code className="w-5 h-5 mr-2" />
              Skills & Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {freelancer.profile.skills.map((skill, index) => (
                <Badge key={index} className="bg-gray-700 text-gray-300 hover:bg-gray-600">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technology Breakdown */}
      {technology_breakdown?.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Technology Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {technology_breakdown.map((tech, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-white font-medium">{tech.name}</span>
                  <Badge variant="secondary">{tech.count} projects</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Gallery Preview */}
      {project_gallery?.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Project Gallery ({project_gallery.length})
              </div>
              {!isPreview && (
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                  View All Projects
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(isPreview ? project_gallery.slice(0, 3) : project_gallery).map((project) => (
                <div key={project.id} className="bg-gray-700 rounded-lg overflow-hidden">
                  {/* Project Media */}
                  <div className="aspect-video bg-gray-600 flex items-center justify-center">
                    {project.file_info?.content_type?.startsWith('image/') ? (
                      <img
                        src={`${API_BASE}/uploads/project_gallery/${project.file_info.filename}`}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : project.file_info?.content_type?.startsWith('video/') ? (
                      <video
                        src={`${API_BASE}/uploads/project_gallery/${project.file_info.filename}`}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <div className="text-center">
                        {getFileIcon(project.file_info?.content_type)}
                        <p className="text-gray-400 text-sm mt-2">
                          {project.file_info?.original_name}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Project Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-300 text-sm mb-3 line-clamp-2">{project.description}</p>
                    
                    {project.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">
                        {formatDate(project.created_at)}
                      </span>
                      {project.project_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(project.project_url, '_blank')}
                          className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {recent_activity?.length > 0 && !isPreview && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent_activity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  {getFileIcon(activity.content_type || activity.file_info?.content_type)}
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {activity.title || activity.original_name || 'Uploaded file'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {formatDate(activity.uploaded_at)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type || 'file'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortfolioShowcase;
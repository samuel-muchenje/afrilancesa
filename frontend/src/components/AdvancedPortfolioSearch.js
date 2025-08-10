import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Search, Filter, X, User, Star, MapPin, CheckCircle, 
  Award, FileText, TrendingUp, ChevronLeft, ChevronRight,
  SlidersHorizontal, Eye, ArrowRight
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdvancedPortfolioSearch = ({ onNavigate, initialQuery = '', initialCategory = '' }) => {
  const [searchParams, setSearchParams] = useState({
    query: initialQuery,
    categories: initialCategory ? [initialCategory] : [],
    technologies: [],
    min_projects: 0,
    min_rating: 0,
    location: '',
    verified_only: false,
    page: 1,
    limit: 12
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter options
  const categories = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 
    'Digital Marketing', 'Content Writing', 'Data Science',
    'DevOps', 'Graphic Design', 'Video Production', 'Consulting'
  ];

  const technologies = [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'JavaScript',
    'PHP', 'Java', 'C#', 'Django', 'Express.js', 'MongoDB', 'MySQL',
    'AWS', 'Azure', 'Docker', 'HTML5', 'CSS3', 'Bootstrap', 'Tailwind CSS'
  ];

  const locations = [
    'Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Pietermaritzburg', 'Nelspruit', 'Kimberley'
  ];

  useEffect(() => {
    if (searchParams.query || searchParams.categories.length > 0 || searchParams.technologies.length > 0) {
      handleSearch();
    }
  }, [searchParams.page]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/search/advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchParams)
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.portfolios || []);
        setPagination(data.pagination || {});
      } else {
        setResults([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page on new search
    }));
  };

  const addFilter = (field, value) => {
    if (!searchParams[field].includes(value)) {
      handleInputChange(field, [...searchParams[field], value]);
    }
  };

  const removeFilter = (field, value) => {
    handleInputChange(field, searchParams[field].filter(item => item !== value));
  };

  const clearAllFilters = () => {
    setSearchParams({
      query: '',
      categories: [],
      technologies: [],
      min_projects: 0,
      min_rating: 0,
      location: '',
      verified_only: false,
      page: 1,
      limit: 12
    });
    setResults([]);
    setPagination({});
  };

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />);
    }
    
    const remainingStars = 5 - fullStars;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-600" />);
    }
    
    return stars;
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const handleViewPortfolio = (freelancerId) => {
    if (onNavigate) {
      onNavigate(`freelancer-portfolio/${freelancerId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Search className="w-6 h-6 mr-2" />
              Portfolio Search
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Main Search Bar */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, skills, or project descriptions..."
                  value={searchParams.query}
                  onChange={(e) => handleInputChange('query', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
              >
                Search
              </Button>
              {(searchParams.query || searchParams.categories.length > 0 || searchParams.technologies.length > 0) && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {(searchParams.categories.length > 0 || searchParams.technologies.length > 0 || 
              searchParams.location || searchParams.verified_only || searchParams.min_projects > 0 || 
              searchParams.min_rating > 0) && (
              <div className="flex flex-wrap gap-2">
                {searchParams.categories.map(category => (
                  <Badge key={category} className="bg-blue-600 text-white pr-1">
                    {category}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter('categories', category)}
                      className="ml-1 h-4 w-4 p-0 hover:bg-blue-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                
                {searchParams.technologies.map(tech => (
                  <Badge key={tech} className="bg-green-600 text-white pr-1">
                    {tech}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter('technologies', tech)}
                      className="ml-1 h-4 w-4 p-0 hover:bg-green-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
                
                {searchParams.location && (
                  <Badge className="bg-purple-600 text-white pr-1">
                    📍 {searchParams.location}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInputChange('location', '')}
                      className="ml-1 h-4 w-4 p-0 hover:bg-purple-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                
                {searchParams.verified_only && (
                  <Badge className="bg-yellow-600 text-white pr-1">
                    ✓ Verified Only
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInputChange('verified_only', false)}
                      className="ml-1 h-4 w-4 p-0 hover:bg-yellow-700"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={searchParams.categories.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      searchParams.categories.includes(category)
                        ? removeFilter('categories', category)
                        : addFilter('categories', category)
                    }
                    className={
                      searchParams.categories.includes(category)
                        ? "bg-blue-600 text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Technologies</label>
              <div className="flex flex-wrap gap-2">
                {technologies.map(tech => (
                  <Button
                    key={tech}
                    variant={searchParams.technologies.includes(tech) ? "default" : "outline"}
                    size="sm"
                    onClick={() => 
                      searchParams.technologies.includes(tech)
                        ? removeFilter('technologies', tech)
                        : addFilter('technologies', tech)
                    }
                    className={
                      searchParams.technologies.includes(tech)
                        ? "bg-green-600 text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }
                  >
                    {tech}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location and Additional Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Location</label>
                <select
                  value={searchParams.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Any Location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Minimum Projects</label>
                <select
                  value={searchParams.min_projects}
                  onChange={(e) => handleInputChange('min_projects', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value={0}>Any Number</option>
                  <option value={1}>1+ Projects</option>
                  <option value={3}>3+ Projects</option>
                  <option value={5}>5+ Projects</option>
                  <option value={10}>10+ Projects</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Minimum Rating</label>
                <select
                  value={searchParams.min_rating}
                  onChange={(e) => handleInputChange('min_rating', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={3}>3+ Stars</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                </select>
              </div>
            </div>

            {/* Verification Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="verified_only"
                checked={searchParams.verified_only}
                onChange={(e) => handleInputChange('verified_only', e.target.checked)}
                className="w-4 h-4 text-yellow-600 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
              />
              <label htmlFor="verified_only" className="text-gray-300">
                Show only verified freelancers
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(searchParams.limit)].map((_, i) => (
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
      ) : results.length > 0 ? (
        <div className="space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              {pagination.total} portfolios found
            </h3>
            <div className="text-gray-400 text-sm">
              Page {pagination.page} of {pagination.pages}
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((freelancer) => (
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
                      
                      <div className="flex items-center space-x-2 mt-1">
                        {freelancer.profile?.rating && (
                          <div className="flex items-center">
                            {renderRating(freelancer.profile.rating)}
                            <span className="text-gray-400 text-xs ml-1">
                              ({freelancer.profile.rating.toFixed(1)})
                            </span>
                          </div>
                        )}
                        
                        {freelancer.profile?.location && (
                          <span className="text-gray-400 text-xs flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {freelancer.profile.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Award className="w-3 h-3 mr-1" />
                        {freelancer.project_count || 0} projects
                      </span>
                      <span className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        {(freelancer.portfolio_files?.length || 0)} files
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>{Math.round(freelancer.portfolio_score || 0)}</span>
                    </div>
                  </div>

                  {/* Skills Preview */}
                  {freelancer.profile?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {freelancer.profile.skills.slice(0, 4).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                          {skill}
                        </Badge>
                      ))}
                      {freelancer.profile.skills.length > 4 && (
                        <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                          +{freelancer.profile.skills.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}

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

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const pageNum = Math.max(1, pagination.page - 2) + i;
                  if (pageNum > pagination.pages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        pageNum === pagination.page
                          ? "bg-yellow-600 text-black"
                          : "border-gray-600 text-gray-300 hover:bg-gray-700"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ) : searchParams.query || searchParams.categories.length > 0 || searchParams.technologies.length > 0 ? (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Portfolios Found</h3>
            <p className="text-gray-400 mb-4">
              No freelancers match your current search criteria. Try adjusting your filters.
            </p>
            <Button
              onClick={clearAllFilters}
              className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Search for Portfolios</h3>
            <p className="text-gray-400">
              Use the search bar above to find talented South African freelancers
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedPortfolioSearch;
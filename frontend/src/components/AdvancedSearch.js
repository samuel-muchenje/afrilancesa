import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Search, Filter, MapPin, DollarSign, Calendar, Star,
  Briefcase, User, Clock, Award, TrendingUp, RefreshCw,
  ChevronDown, ChevronUp, SlidersHorizontal, X
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdvancedSearch = ({ searchType = 'jobs', initialCategory = '', initialSearch = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  // Job search filters
  const [jobFilters, setJobFilters] = useState({
    category: 'all',
    budget_min: '',
    budget_max: '',
    budget_type: 'all',
    skills: [],
    location: '',
    posted_within_days: null,
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  // User search filters  
  const [userFilters, setUserFilters] = useState({
    role: 'freelancer',
    skills: [],
    min_rating: null,
    max_hourly_rate: '',
    min_hourly_rate: '',
    location: '',
    is_verified: null,
    availability: 'all',
    sort_by: 'rating',
    sort_order: 'desc'
  });

  const categories = [
    'ICT & Digital Work', 'Construction & Engineering', 'Creative & Media',
    'Admin & Office Support', 'Health & Wellness', 'Beauty & Fashion',
    'Logistics & Labour', 'Education & Training', 'Home & Domestic Services'
  ];

  const skillOptions = [
    'React', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
    'PHP', 'Laravel', 'Vue.js', 'Angular', 'MongoDB',
    'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL',
    'UI/UX Design', 'Figma', 'Photoshop', 'Illustrator'
  ];

  useEffect(() => {
    performSearch();
  }, []);

  const performSearch = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      let searchData = { query: searchQuery };

      if (searchType === 'jobs') {
        endpoint = '/api/search/jobs/advanced';
        searchData = { ...jobFilters, query: searchQuery };
      } else if (searchType === 'users') {
        endpoint = '/api/search/users/advanced'; 
        searchData = { ...userFilters, query: searchQuery };
      }

      const response = await fetch(`${API_BASE}${endpoint}?skip=${(page-1)*20}&limit=20`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(searchData)
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data[searchType] || []);
        setPagination({
          page: data.page || 1,
          pages: data.pages || 1,
          total: data.total || 0
        });
        setActiveFilters(data.filters_applied || {});
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    if (searchType === 'jobs') {
      setJobFilters({
        category: 'all',
        budget_min: '',
        budget_max: '',
        budget_type: 'all',
        skills: [],
        location: '',
        posted_within_days: null,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
    } else {
      setUserFilters({
        role: 'freelancer',
        skills: [],
        min_rating: null,
        max_hourly_rate: '',
        min_hourly_rate: '',
        location: '',
        is_verified: null,
        availability: 'all',
        sort_by: 'rating',
        sort_order: 'desc'
      });
    }
  };

  const addSkill = (skill, filters, setFilters) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skill, filters, setFilters) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const renderJobFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
        <select
          value={jobFilters.category}
          onChange={(e) => setJobFilters(prev => ({ ...prev, category: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Budget Range</label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={jobFilters.budget_min}
            onChange={(e) => setJobFilters(prev => ({ ...prev, budget_min: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="number"
            placeholder="Max"
            value={jobFilters.budget_max}
            onChange={(e) => setJobFilters(prev => ({ ...prev, budget_max: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Budget Type</label>
        <select
          value={jobFilters.budget_type}
          onChange={(e) => setJobFilters(prev => ({ ...prev, budget_type: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="all">All Types</option>
          <option value="fixed">Fixed Price</option>
          <option value="hourly">Hourly Rate</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          placeholder="City, Country"
          value={jobFilters.location}
          onChange={(e) => setJobFilters(prev => ({ ...prev, location: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Posted Within</label>
        <select
          value={jobFilters.posted_within_days || ''}
          onChange={(e) => setJobFilters(prev => ({ 
            ...prev, 
            posted_within_days: e.target.value ? parseInt(e.target.value) : null 
          }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">Any Time</option>
          <option value="1">Last 24 Hours</option>
          <option value="7">Last Week</option>
          <option value="30">Last Month</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Sort By</label>
        <div className="flex space-x-2">
          <select
            value={jobFilters.sort_by}
            onChange={(e) => setJobFilters(prev => ({ ...prev, sort_by: e.target.value }))}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="created_at">Date Posted</option>
            <option value="budget">Budget</option>
            <option value="title">Title</option>
          </select>
          <select
            value={jobFilters.sort_order}
            onChange={(e) => setJobFilters(prev => ({ ...prev, sort_order: e.target.value }))}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderUserFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
        <select
          value={userFilters.role}
          onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="all">All Roles</option>
          <option value="freelancer">Freelancers</option>
          <option value="client">Clients</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Minimum Rating</label>
        <select
          value={userFilters.min_rating || ''}
          onChange={(e) => setUserFilters(prev => ({ 
            ...prev, 
            min_rating: e.target.value ? parseFloat(e.target.value) : null 
          }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
          <option value="3.5">3.5+ Stars</option>
          <option value="3.0">3.0+ Stars</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Hourly Rate Range</label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={userFilters.min_hourly_rate}
            onChange={(e) => setUserFilters(prev => ({ ...prev, min_hourly_rate: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <input
            type="number"
            placeholder="Max"
            value={userFilters.max_hourly_rate}
            onChange={(e) => setUserFilters(prev => ({ ...prev, max_hourly_rate: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Location</label>
        <input
          type="text"
          placeholder="City, Country"
          value={userFilters.location}
          onChange={(e) => setUserFilters(prev => ({ ...prev, location: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Verification Status</label>
        <select
          value={userFilters.is_verified === null ? '' : userFilters.is_verified.toString()}
          onChange={(e) => setUserFilters(prev => ({ 
            ...prev, 
            is_verified: e.target.value === '' ? null : e.target.value === 'true'
          }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="">All Users</option>
          <option value="true">Verified Only</option>
          <option value="false">Unverified Only</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">Availability</label>
        <select
          value={userFilters.availability}
          onChange={(e) => setUserFilters(prev => ({ ...prev, availability: e.target.value }))}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="all">All</option>
          <option value="Available">Available</option>
          <option value="Busy">Busy</option>
          <option value="Unavailable">Unavailable</option>
        </select>
      </div>
    </div>
  );

  const renderSkillsFilter = (filters, setFilters) => (
    <div className="col-span-full">
      <label className="block text-gray-300 text-sm font-medium mb-2">Skills</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {filters.skills.map(skill => (
          <Badge
            key={skill}
            variant="default"
            className="bg-yellow-600 text-white cursor-pointer hover:bg-yellow-700"
            onClick={() => removeSkill(skill, filters, setFilters)}
          >
            {skill} <X className="w-3 h-3 ml-1" />
          </Badge>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {skillOptions.filter(skill => !filters.skills.includes(skill)).slice(0, 10).map(skill => (
          <Button
            key={skill}
            size="sm"
            variant="outline"
            className="text-xs border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={() => addSkill(skill, filters, setFilters)}
          >
            + {skill}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderJobResults = () => (
    <div className="space-y-4">
      {results.map((job) => (
        <Card key={job.id} className="dashboard-card hover:bg-gray-800/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                  <Badge variant="outline">{job.category}</Badge>
                  <Badge variant={job.budget_type === 'fixed' ? 'default' : 'secondary'}>
                    {job.budget_type}
                  </Badge>
                </div>
                
                <p className="text-gray-400 text-sm mb-3 line-clamp-3">{job.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {formatCurrency(job.budget)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  {job.client_info && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {job.client_info.name} ({job.client_info.rating || 0}★)
                    </div>
                  )}
                </div>

                {job.requirements && job.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.requirements.slice(0, 5).map((req, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                    {job.requirements.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.requirements.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                  View Job
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderUserResults = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {results.map((user) => (
        <Card key={user.id} className="dashboard-card hover:bg-gray-800/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gray-600 text-white text-lg">
                  {user.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">{user.full_name}</h3>
                  <Badge variant={user.role === 'freelancer' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  {user.is_verified && <Award className="w-4 h-4 text-yellow-400" />}
                </div>
                
                {user.profile?.profession && (
                  <p className="text-yellow-400 font-medium mb-2">{user.profile.profession}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                  {user.rating && (
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-400" />
                      {user.rating} ({user.total_reviews || 0})
                    </div>
                  )}
                  {user.profile?.hourly_rate && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatCurrency(user.profile.hourly_rate)}/hr
                    </div>
                  )}
                  {user.profile?.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {user.profile.location}
                    </div>
                  )}
                </div>

                {user.profile?.bio && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{user.profile.bio}</p>
                )}

                {user.profile?.skills && user.profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {user.profile.skills.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {user.profile.skills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{user.profile.skills.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="dashboard-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <Button onClick={() => performSearch()} className="bg-yellow-600 hover:bg-yellow-700">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600 text-gray-300"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Advanced Filters
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={clearFilters}
                className="border-gray-600 text-gray-300"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {searchType === 'jobs' ? renderJobFilters() : renderUserFilters()}
              {renderSkillsFilter(
                searchType === 'jobs' ? jobFilters : userFilters,
                searchType === 'jobs' ? setJobFilters : setUserFilters
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button onClick={() => performSearch()} className="bg-yellow-600 hover:bg-yellow-700">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              {searchType === 'jobs' ? <Briefcase className="w-5 h-5 mr-2" /> : <User className="w-5 h-5 mr-2" />}
              Search Results ({pagination.total} {searchType})
            </div>
            <Button
              size="sm"
              onClick={() => performSearch(pagination.page)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-700 h-24 rounded"></div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              {searchType === 'jobs' ? renderJobResults() : renderUserResults()}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-gray-400 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => performSearch(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => performSearch(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              {searchType === 'jobs' ? <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" /> : <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
              <p className="text-gray-400 text-lg mb-2">No {searchType} found</p>
              <p className="text-gray-500 text-sm">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSearch;
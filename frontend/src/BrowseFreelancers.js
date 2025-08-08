import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { ArrowLeft, Search, Filter, Star, MapPin, Clock, DollarSign, User, Eye, MessageCircle } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const BrowseFreelancers = ({ onNavigate }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [rateFilter, setRateFilter] = useState('all');

  const categories = [
    'All Skills',
    'Full-Stack Development',
    'Digital Marketing', 
    'Graphic Design',
    'Content Writing',
    'Mobile Development',
    'UX/UI Design',
    'Construction Management',
    'Financial Consulting',
    'Project Management'
  ];

  useEffect(() => {
    fetchFreelancers();
  }, []);

  useEffect(() => {
    filterFreelancers();
  }, [freelancers, searchTerm, selectedSkill, rateFilter]);

  const fetchFreelancers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/freelancers/public`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch freelancers');
      }
      
      const data = await response.json();
      setFreelancers(data);
      
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  };

  const filterFreelancers = () => {
    let filtered = [...freelancers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(freelancer =>
        freelancer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.profile?.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.profile?.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        freelancer.profile?.skills?.some(skill => 
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Skill filter
    if (selectedSkill !== 'all' && selectedSkill !== 'All Skills') {
      filtered = filtered.filter(freelancer => 
        freelancer.profile?.profession?.includes(selectedSkill) ||
        freelancer.profile?.skills?.some(skill => 
          skill.toLowerCase().includes(selectedSkill.toLowerCase())
        )
      );
    }

    // Rate filter
    if (rateFilter !== 'all') {
      filtered = filtered.filter(freelancer => {
        const rate = freelancer.profile?.hourly_rate || 0;
        if (rateFilter === 'low') return rate < 600;
        if (rateFilter === 'medium') return rate >= 600 && rate < 1000;
        if (rateFilter === 'high') return rate >= 1000;
        return true;
      });
    }

    setFilteredFreelancers(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getRateBadgeColor = (rate) => {
    if (rate < 600) return 'bg-orange-500/20 text-orange-400';
    if (rate < 1000) return 'bg-blue-500/20 text-blue-400';
    return 'bg-green-500/20 text-green-400';
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => onNavigate('/')}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <img 
              src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
              alt="Afrilance" 
              className="h-8 w-auto afrilance-logo"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate('login')}
              className="text-white hover:text-yellow-400 hover:bg-white/5"
            >
              Sign In
            </Button>
            <Button
              onClick={() => onNavigate('register')}
              className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Browse Freelancers</h1>
            <p className="text-gray-300">
              {loading ? 'Loading freelancers...' : `${filteredFreelancers.length} verified professionals available`}
            </p>
          </div>

          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search freelancers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Skills</label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Skills</option>
                    {categories.slice(1).map((skill, index) => (
                      <option key={index} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>

                {/* Hourly Rate */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Hourly Rate</label>
                  <select
                    value={rateFilter}
                    onChange={(e) => setRateFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Rates</option>
                    <option value="low">Under R600/hr</option>
                    <option value="medium">R600 - R1,000/hr</option>
                    <option value="high">Above R1,000/hr</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedSkill('all');
                      setRateFilter('all');
                    }}
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Freelancers Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading freelancers...</p>
            </div>
          ) : filteredFreelancers.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-12">
                <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Freelancers Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || selectedSkill !== 'all' || rateFilter !== 'all'
                    ? 'Try adjusting your filters to see more freelancers.'
                    : 'No freelancers are currently available. Check back later!'
                  }
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSkill('all');
                    setRateFilter('all');
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredFreelancers.map((freelancer) => (
                <Card key={freelancer.id} className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={freelancer.profile?.profile_image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                        alt={freelancer.full_name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">{freelancer.full_name}</h3>
                          {freelancer.is_verified && (
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400">{freelancer.profile?.profession || 'Professional'}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-yellow-400 ml-1">{freelancer.profile?.rating || 4.5}</span>
                          <span className="text-gray-500 ml-2">({freelancer.profile?.total_reviews || 0} reviews)</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-4 line-clamp-3">
                      {freelancer.profile?.bio || 'Professional freelancer with expertise in various domains.'}
                    </p>

                    {/* Skills */}
                    {freelancer.profile?.skills && freelancer.profile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {freelancer.profile.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} className="bg-gray-700 text-gray-300 text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.profile.skills.length > 3 && (
                          <Badge className="bg-gray-700 text-gray-300 text-xs">
                            +{freelancer.profile.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {freelancer.profile?.location || 'South Africa'}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {freelancer.profile?.availability || 'Available'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className={`${getRateBadgeColor(freelancer.profile?.hourly_rate || 500)}`}>
                          {formatCurrency(freelancer.profile?.hourly_rate || 500)}/hr
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNavigate('login')}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onNavigate('register')}
                          className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseFreelancers;
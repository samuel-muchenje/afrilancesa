import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { ArrowLeft, Search, Filter, MapPin, Clock, DollarSign, Briefcase, Eye } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const BrowseJobs = ({ onNavigate, category = null }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [budgetFilter, setBudgetFilter] = useState('all');

  const categories = [
    'All Categories',
    'ICT & Digital Work',
    'Construction & Engineering', 
    'Creative & Media',
    'Admin & Office Support',
    'Health & Wellness',
    'Beauty & Fashion',
    'Logistics & Labour',
    'Education & Training',
    'Home & Domestic Services'
  ];

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, selectedCategory, budgetFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/jobs`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const data = await response.json();
      setJobs(data);
      
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all' && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // Budget filter
    if (budgetFilter !== 'all') {
      filtered = filtered.filter(job => {
        if (budgetFilter === 'low') return job.budget < 5000;
        if (budgetFilter === 'medium') return job.budget >= 5000 && job.budget < 15000;
        if (budgetFilter === 'high') return job.budget >= 15000;
        return true;
      });
    }

    setFilteredJobs(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBudgetBadgeColor = (budget) => {
    if (budget < 5000) return 'bg-orange-500/20 text-orange-400';
    if (budget < 15000) return 'bg-blue-500/20 text-blue-400';
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
              onClick={() => onNavigate('landing')}
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
            <h1 className="text-4xl font-bold text-white mb-4">
              {selectedCategory && selectedCategory !== 'all' && selectedCategory !== 'All Categories' 
                ? `${selectedCategory} Jobs` 
                : 'Browse All Jobs'
              }
            </h1>
            <p className="text-gray-300">
              {loading ? 'Loading jobs...' : `${filteredJobs.length} jobs available`}
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
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.slice(1).map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Budget</label>
                  <select
                    value={budgetFilter}
                    onChange={(e) => setBudgetFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Budgets</option>
                    <option value="low">Under R5,000</option>
                    <option value="medium">R5,000 - R15,000</option>
                    <option value="high">Above R15,000</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setBudgetFilter('all');
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

          {/* Jobs List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Jobs Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || selectedCategory !== 'all' || budgetFilter !== 'all'
                    ? 'Try adjusting your filters to see more jobs.'
                    : 'No jobs are currently available. Check back later!'
                  }
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setBudgetFilter('all');
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
                            <p className="text-gray-300 mb-3 line-clamp-2">{job.description}</p>
                          </div>
                          <Badge className={`ml-4 ${getBudgetBadgeColor(job.budget)}`}>
                            {formatCurrency(job.budget)}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {job.category}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Posted {formatDate(job.created_at)}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {job.budget_type === 'fixed' ? 'Fixed Price' : 'Hourly'}
                          </span>
                        </div>

                        {/* Skills */}
                        {job.requirements && job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.requirements.slice(0, 5).map((skill, index) => (
                              <Badge 
                                key={index} 
                                className="bg-gray-700 text-gray-300 text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {job.requirements.length > 5 && (
                              <Badge className="bg-gray-700 text-gray-300 text-xs">
                                +{job.requirements.length - 5} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="lg:ml-6 mt-4 lg:mt-0">
                        <Button
                          onClick={() => onNavigate('login')}
                          className="w-full lg:w-auto bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-6"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <p className="text-xs text-gray-500 mt-2 text-center lg:text-left">
                          Sign in to apply
                        </p>
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

export default BrowseJobs;
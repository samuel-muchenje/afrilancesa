import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import FileUpload from './components/FileUpload';
import FileGallery from './components/FileGallery';
import { 
  Briefcase, DollarSign, Star, Clock, Users, TrendingUp, 
  MessageCircle, Settings, LogOut, CheckCircle, AlertTriangle,
  FileText, Award, Calendar, Search, Filter, Eye, Edit,
  Upload, Plus, BookOpen, Target, ChevronRight, Mail,
  Phone, MapPin, Globe, Heart, ExternalLink, Wallet,
  CreditCard, ArrowUpRight, ArrowDownLeft, History, Camera,
  File, Image, FolderOpen
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FreelancerDashboard = ({ user, onNavigate, onLogout }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState({
    activeApplications: 0,
    completedJobs: 0,
    totalEarnings: 0,
    rating: 4.8,
    profileViews: 0
  });
  
  const [recentJobs, setRecentJobs] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Search and filter states
  const [jobSearch, setJobSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  
  // Profile management states
  const [profileForm, setProfileForm] = useState({
    skills: user?.profile?.skills || [],
    experience: user?.profile?.experience || '',
    hourly_rate: user?.profile?.hourly_rate || '',
    bio: user?.profile?.bio || '',
    portfolio_links: user?.profile?.portfolio_links || []
  });
  
  // Application form
  const [applicationForm, setApplicationForm] = useState({
    proposal: '',
    bid_amount: ''
  });

  // Wallet management states
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [transactionHistory, setTransactionHistory] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    if (currentTab === 'jobs') {
      fetchAvailableJobs();
    } else if (currentTab === 'applications') {
      fetchMyApplications();
    } else if (currentTab === 'wallet') {
      fetchWallet();
    }
  }, [currentTab]);

  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers,
        ...options
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Request failed');
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent job applications
      const jobsData = await apiCall('/api/jobs/my');
      setRecentJobs(jobsData.slice(0, 5));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        activeApplications: jobsData.filter(job => job.status === 'pending').length,
        completedJobs: jobsData.filter(job => job.status === 'completed').length
      }));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableJobs = async () => {
    try {
      setJobsLoading(true);
      const jobsData = await apiCall('/api/jobs');
      setAvailableJobs(jobsData);
    } catch (error) {
      console.error('Error fetching available jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      setJobsLoading(true);
      const applicationsData = await apiCall('/api/jobs/my');
      setMyApplications(applicationsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const applyToJob = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      await apiCall(`/api/jobs/${selectedJob.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({
          job_id: selectedJob.id,
          proposal: applicationForm.proposal,
          bid_amount: parseFloat(applicationForm.bid_amount)
        })
      });

      alert('Application submitted successfully!');
      setApplicationForm({ proposal: '', bid_amount: '' });
      setSelectedJob(null);
      fetchAvailableJobs();
      fetchDashboardData();
    } catch (error) {
      alert(error.message);
    }
  };

  const updateProfile = async () => {
    try {
      const profileData = {
        skills: typeof profileForm.skills === 'string' 
          ? profileForm.skills.split(',').map(s => s.trim()).filter(s => s)
          : profileForm.skills,
        experience: profileForm.experience,
        hourly_rate: parseFloat(profileForm.hourly_rate),
        bio: profileForm.bio,
        portfolio_links: typeof profileForm.portfolio_links === 'string'
          ? profileForm.portfolio_links.split(',').map(s => s.trim()).filter(s => s)
          : profileForm.portfolio_links
      };

      await apiCall('/api/freelancer/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      alert('Profile updated successfully!');
      // Update user object
      const updatedUser = { ...user, profile: profileData, profile_completed: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      alert(error.message);
    }
  };

  const getVerificationStatus = () => {
    if (user.is_verified) {
      return {
        status: 'verified',
        icon: <CheckCircle className="w-4 h-4 text-green-400" />,
        text: 'Verified Freelancer',
        color: 'text-green-400'
      };
    } else if (user.id_document) {
      return {
        status: 'pending',
        icon: <Clock className="w-4 h-4 text-yellow-400" />,
        text: 'Verification Pending',
        color: 'text-yellow-400'
      };
    } else {
      return {
        status: 'unverified',
        icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
        text: 'Verification Required',
        color: 'text-red-400'
      };
    }
  };

  // Wallet management functions
  const fetchWallet = async () => {
    try {
      setWalletLoading(true);
      const walletData = await apiCall('/api/wallet');
      setWallet(walletData);
      
      // Also fetch transaction history
      const transactionsData = await apiCall('/api/wallet/transactions');
      setTransactionHistory(transactionsData.transactions || []);
      
    } catch (error) {
      console.error('Error fetching wallet:', error);
      // Don't show error if wallet doesn't exist - this is expected for new users
    } finally {
      setWalletLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }

    if (parseFloat(withdrawAmount) > wallet.available_balance) {
      alert('Insufficient available balance');
      return;
    }

    try {
      await apiCall('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount)
        })
      });

      // Refresh wallet data
      await fetchWallet();
      setWithdrawAmount('');
      setShowWithdrawDialog(false);
      alert('Withdrawal processed successfully!');
      
    } catch (error) {
      alert(`Withdrawal failed: ${error.message}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    return type === 'Credit' ? 
      <ArrowUpRight className="w-4 h-4 text-green-400" /> : 
      <ArrowDownLeft className="w-4 h-4 text-red-400" />;
  };

  const getTransactionColor = (type) => {
    return type === 'Credit' ? 'text-green-400' : 'text-red-400';
  };

  const filteredJobs = availableJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                         job.description.toLowerCase().includes(jobSearch.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || job.category === categoryFilter;
    
    const matchesBudget = budgetFilter === 'all' || 
                         (budgetFilter === 'low' && job.budget < 5000) ||
                         (budgetFilter === 'medium' && job.budget >= 5000 && job.budget < 15000) ||
                         (budgetFilter === 'high' && job.budget >= 15000);
    
    return matchesSearch && matchesCategory && matchesBudget;
  });

  const jobCategories = [...new Set(availableJobs.map(job => job.category))];

  const verification = getVerificationStatus();

  const TabNavigation = () => (
    <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg mb-6">
      {[
        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
        { id: 'jobs', label: 'Browse Jobs', icon: Search },
        { id: 'applications', label: 'My Applications', icon: FileText },
        { id: 'wallet', label: 'Wallet', icon: Wallet },
        { id: 'profile', label: 'Profile', icon: Users },
        { id: 'earnings', label: 'Earnings', icon: DollarSign }
      ].map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              currentTab === tab.id
                ? 'bg-gradient-to-r from-yellow-400 to-green-500 text-black font-semibold'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="dashboard-modern">
      {/* Navigation */}
      <nav className="dashboard-nav sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <img 
                src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/1hnbql0v_5.png" 
                alt="Afrilance" 
                className="afrilance-icon"
              />
              <span className="text-xl font-bold text-white tracking-tight">AFRILANCE</span>
            </div>
            <Badge className="bg-green-600 text-white">Freelancer</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-yellow-400 hover:bg-white/5"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-yellow-400 hover:bg-white/5"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-green-500 text-black font-semibold">
                  {user?.full_name?.charAt(0) || 'F'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-white">{user?.full_name}</div>
                <div className="text-xs text-gray-400 flex items-center">
                  {verification.icon}
                  <span className={`ml-1 ${verification.color}`}>{verification.text}</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onLogout}
                className="text-gray-300 hover:text-red-400 hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400">
            {user.is_verified 
              ? "You're all set to apply for jobs and grow your freelance business." 
              : "Complete your verification to start applying for premium jobs."
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation />

        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <>
            {/* Verification Alert */}
            {!user.is_verified && (
              <Card className="dashboard-card mb-6 border-yellow-500/20 bg-yellow-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">Verification Required</h3>
                      <p className="text-gray-300 text-sm mt-1">
                        Upload your ID document to get verified and access premium job opportunities.
                      </p>
                      <Button 
                        className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-black"
                        size="sm"
                        onClick={() => setCurrentTab('profile')}
                      >
                        Complete Verification
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Applications</p>
                      <p className="text-2xl font-bold text-white">{stats.activeApplications}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Completed Jobs</p>
                      <p className="text-2xl font-bold text-white">{stats.completedJobs}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Earnings</p>
                      <p className="text-2xl font-bold text-white">R{stats.totalEarnings.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Rating</p>
                      <p className="text-2xl font-bold text-white flex items-center">
                        {stats.rating}
                        <Star className="w-4 h-4 text-yellow-400 ml-1 fill-current" />
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Profile Views</p>
                      <p className="text-2xl font-bold text-white">{stats.profileViews}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Job Applications */}
              <div className="lg:col-span-2">
                <Card className="dashboard-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Recent Job Applications
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentTab('applications')}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse bg-gray-700 h-16 rounded"></div>
                        ))}
                      </div>
                    ) : recentJobs.length > 0 ? (
                      <div className="space-y-4">
                        {recentJobs.map((job, index) => (
                          <div key={index} className="border border-gray-700 rounded-lg p-4 hover:border-yellow-400/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-white font-semibold">{job.title}</h3>
                              <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
                            </div>
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">{job.description}</p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                R{job.budget}
                              </span>
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {job.applications_count} applications
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(job.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-white font-medium mb-2">No applications yet</h3>
                        <p className="text-gray-400 mb-4">Start browsing jobs and submit your first proposal</p>
                        <Button 
                          className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black"
                          onClick={() => setCurrentTab('jobs')}
                        >
                          Browse Jobs
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Profile */}
              <div className="space-y-6">
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                      onClick={() => setCurrentTab('jobs')}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => setCurrentTab('profile')}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => setCurrentTab('applications')}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      My Applications
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => setCurrentTab('wallet')}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      My Wallet
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Messages
                    </Button>
                  </CardContent>
                </Card>

                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white">This Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Jobs Applied</span>
                        <span className="text-white font-medium">3</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Profile Views</span>
                        <span className="text-white font-medium">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Messages</span>
                        <span className="text-white font-medium">5</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Earnings</span>
                        <span className="text-green-400 font-medium">R2,400</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Completion */}
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Profile Completion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Overall Progress</span>
                        <span className="text-white font-medium">
                          {user.profile_completed ? '100%' : '60%'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-yellow-400 to-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: user.profile_completed ? '100%' : '60%' }}
                        ></div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Basic Info</span>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Skills & Experience</span>
                          {user.profile_completed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Verification</span>
                          {user.is_verified ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </div>
                      {!user.profile_completed && (
                        <Button 
                          size="sm"
                          className="w-full mt-3 bg-yellow-400 hover:bg-yellow-500 text-black"
                          onClick={() => setCurrentTab('profile')}
                        >
                          Complete Profile
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {/* Jobs Tab - Browse Available Jobs */}
        {currentTab === 'jobs' && (
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search jobs..."
                      value={jobSearch}
                      onChange={(e) => setJobSearch(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Categories</option>
                    {jobCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    value={budgetFilter}
                    onChange={(e) => setBudgetFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Budgets</option>
                    <option value="low">Under R5,000</option>
                    <option value="medium">R5,000 - R15,000</option>
                    <option value="high">R15,000+</option>
                  </select>

                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">
                      {filteredJobs.length} of {availableJobs.length} jobs
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Jobs List */}
            {jobsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="dashboard-card animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-700 rounded mb-4"></div>
                      <div className="h-16 bg-gray-700 rounded mb-4"></div>
                      <div className="flex space-x-4">
                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                        <div className="h-4 bg-gray-700 rounded w-20"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="dashboard-card hover:border-yellow-400/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
                          <Badge variant="secondary" className="mb-3">{job.category}</Badge>
                          <p className="text-gray-300 mb-4 leading-relaxed">{job.description}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-400 mb-4">
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              R{job.budget?.toLocaleString()} ({job.budget_type})
                            </span>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {job.applications_count} proposals
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {job.requirements && job.requirements.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.requirements.map((req, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <p className="text-sm text-gray-500 mb-4">
                            Posted by: <span className="text-gray-400">{job.client_name}</span>
                          </p>
                        </div>

                        <div className="ml-6 flex flex-col space-y-2">
                          <Button
                            onClick={() => {
                              setSelectedJob(job);
                              setApplicationForm({ proposal: '', bid_amount: '' });
                            }}
                            className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                            disabled={!user.can_bid}
                          >
                            Apply Now
                          </Button>
                          
                          {!user.can_bid && (
                            <p className="text-xs text-red-400 text-center">
                              Verification required
                            </p>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="dashboard-card">
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No jobs found</h3>
                  <p className="text-gray-400 mb-4">
                    Try adjusting your search criteria or check back later for new opportunities.
                  </p>
                  <Button
                    onClick={() => {
                      setJobSearch('');
                      setCategoryFilter('all');
                      setBudgetFilter('all');
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {currentTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Applications</h2>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary">{myApplications.length} Total Applications</Badge>
                <Button
                  onClick={() => setCurrentTab('jobs')}
                  className="bg-gradient-to-r from-yellow-400 to-green-500 text-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Apply to New Jobs
                </Button>
              </div>
            </div>

            {jobsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="dashboard-card animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-700 rounded mb-4"></div>
                      <div className="h-16 bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : myApplications.length > 0 ? (
              <div className="space-y-4">
                {myApplications.map((application, index) => (
                  <Card key={index} className="dashboard-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">{application.title}</h3>
                          <div className="flex items-center space-x-4 mb-3">
                            <Badge variant={application.status === 'open' ? 'default' : 'secondary'}>
                              {application.status}
                            </Badge>
                            <span className="text-sm text-gray-400">
                              Applied {new Date(application.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-300 mb-4">{application.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Budget:</span>
                              <p className="text-white font-medium">R{application.budget?.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">My Bid:</span>
                              <p className="text-white font-medium">R{application.bid_amount?.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Applications:</span>
                              <p className="text-white font-medium">{application.applications_count}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <p className={`font-medium ${
                                application.status === 'open' ? 'text-green-400' : 
                                application.status === 'closed' ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {application.status === 'open' ? 'Active' : 
                                 application.status === 'closed' ? 'Closed' : 'In Review'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-6 flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Message Client
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="dashboard-card">
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No applications yet</h3>
                  <p className="text-gray-400 mb-6">
                    Start browsing available jobs and submit your first application to begin your freelancing journey.
                  </p>
                  <Button
                    onClick={() => setCurrentTab('jobs')}
                    className="bg-gradient-to-r from-yellow-400 to-green-500 text-black"
                  >
                    Browse Available Jobs
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {currentTab === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Profile Management</h2>
              <div className="flex items-center space-x-2">
                {verification.icon}
                <span className={`font-medium ${verification.color}`}>
                  {verification.text}
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name
                        </label>
                        <Input
                          value={user.full_name}
                          disabled
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <Input
                          value={user.email}
                          disabled
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Skills (comma-separated)
                      </label>
                      <Input
                        value={Array.isArray(profileForm.skills) 
                          ? profileForm.skills.join(', ') 
                          : profileForm.skills}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, skills: e.target.value }))}
                        placeholder="e.g., React, Node.js, Python, Web Design"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hourly Rate (R)
                      </label>
                      <Input
                        type="number"
                        value={profileForm.hourly_rate}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                        placeholder="500"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Professional Bio
                      </label>
                      <Textarea
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell clients about your experience, expertise, and what makes you unique..."
                        rows={4}
                        className="bg-gray-800 border-gray-600 text-white resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Experience Level
                      </label>
                      <select
                        value={profileForm.experience}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="">Select experience level</option>
                        <option value="beginner">Beginner (0-1 years)</option>
                        <option value="intermediate">Intermediate (2-4 years)</option>
                        <option value="expert">Expert (5+ years)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Portfolio Links (comma-separated)
                      </label>
                      <Input
                        value={Array.isArray(profileForm.portfolio_links) 
                          ? profileForm.portfolio_links.join(', ') 
                          : profileForm.portfolio_links}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, portfolio_links: e.target.value }))}
                        placeholder="https://myportfolio.com, https://github.com/username"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

                    <Button
                      onClick={updateProfile}
                      className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Summary & Verification */}
              <div className="space-y-6">
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Profile Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <Avatar className="h-20 w-20 mx-auto mb-3">
                        <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-green-500 text-black text-2xl font-bold">
                          {user?.full_name?.charAt(0) || 'F'}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-white font-semibold">{user.full_name}</h3>
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        {verification.icon}
                        <span className={`text-sm ${verification.color}`}>
                          {verification.text}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Hourly Rate:</span>
                        <span className="text-white">
                          R{profileForm.hourly_rate || 'Not set'}/hr
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Experience:</span>
                        <span className="text-white capitalize">
                          {profileForm.experience || 'Not set'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Skills:</span>
                        <span className="text-white">
                          {(Array.isArray(profileForm.skills) 
                            ? profileForm.skills 
                            : profileForm.skills.split(',').map(s => s.trim())
                          ).length || 0} skills
                        </span>
                      </div>
                    </div>

                    {profileForm.skills && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(profileForm.skills) 
                            ? profileForm.skills 
                            : profileForm.skills.split(',').map(s => s.trim())
                          ).slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Verification Status */}
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Email Verified</span>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Profile Complete</span>
                        {user.profile_completed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">ID Document</span>
                        {user.is_verified ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : user.id_document ? (
                          <Clock className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </div>

                    {!user.is_verified && (
                      <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
                        <p className="text-yellow-400 text-sm mb-3">
                          {user.id_document 
                            ? 'Your ID document is under review.'
                            : 'Upload your ID document to get verified.'
                          }
                        </p>
                        {!user.id_document && (
                          <Button
                            size="sm"
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload ID Document
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Member Since:</span>
                        <span className="text-white">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Jobs Applied:</span>
                        <span className="text-white">{stats.activeApplications}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Success Rate:</span>
                        <span className="text-green-400">85%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Tab */}
        {currentTab === 'wallet' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Wallet</h2>
              <Button 
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                onClick={() => setShowWithdrawDialog(true)}
                disabled={!wallet || wallet.available_balance <= 0}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Withdraw Funds
              </Button>
            </div>

            {walletLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading wallet...</p>
              </div>
            ) : wallet ? (
              <>
                {/* Wallet Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="dashboard-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Available Balance</p>
                          <p className="text-3xl font-bold text-green-400">{formatCurrency(wallet.available_balance)}</p>
                          <p className="text-gray-300 text-sm">Ready to withdraw</p>
                        </div>
                        <Wallet className="w-10 h-10 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dashboard-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Escrow Balance</p>
                          <p className="text-3xl font-bold text-yellow-400">{formatCurrency(wallet.escrow_balance)}</p>
                          <p className="text-gray-300 text-sm">Held for active projects</p>
                        </div>
                        <CreditCard className="w-10 h-10 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Total Wallet Value */}
                <Card className="dashboard-card">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm">Total Wallet Value</p>
                      <p className="text-4xl font-bold text-white">
                        {formatCurrency(wallet.available_balance + wallet.escrow_balance)}
                      </p>
                      <p className="text-gray-300 text-sm mt-2">
                        Available + Escrow balances
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction History */}
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <History className="w-5 h-5 mr-2" />
                      Transaction History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactionHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No transactions yet</p>
                        <p className="text-gray-500 text-sm">Your transaction history will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactionHistory.slice(0, 10).map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center space-x-3">
                              {getTransactionIcon(transaction.type)}
                              <div>
                                <p className="text-white font-medium">{transaction.note}</p>
                                <p className="text-gray-400 text-sm">
                                  {new Date(transaction.date).toLocaleDateString('en-ZA', {
                                    year: 'numeric',
                                    month: 'short', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                                {transaction.type === 'Credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-gray-400 text-sm capitalize">{transaction.type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="dashboard-card">
                <CardContent className="p-6 text-center">
                  <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Wallet not available</p>
                  <p className="text-gray-500 text-sm">Only freelancers have wallets</p>
                </CardContent>
              </Card>
            )}

            {/* Withdraw Dialog */}
            <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Withdraw Funds</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Available Balance</p>
                    <p className="text-2xl font-bold text-green-400">
                      {wallet && formatCurrency(wallet.available_balance)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Withdrawal Amount</label>
                    <Input
                      type="number"
                      placeholder="Enter amount in ZAR"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      max={wallet?.available_balance || 0}
                      min="0"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowWithdrawDialog(false)}
                      className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                      disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Earnings Tab */}
        {currentTab === 'earnings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Earnings Overview</h2>
              <div className="flex items-center space-x-4">
                <select className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>This Year</option>
                  <option>All Time</option>
                </select>
              </div>
            </div>

            {/* Earnings Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Earnings</p>
                      <p className="text-3xl font-bold text-white">R{stats.totalEarnings.toLocaleString()}</p>
                      <p className="text-green-400 text-sm">+12% from last month</p>
                    </div>
                    <DollarSign className="w-10 h-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">This Month</p>
                      <p className="text-3xl font-bold text-white">R2,400</p>
                      <p className="text-yellow-400 text-sm">3 projects</p>
                    </div>
                    <Calendar className="w-10 h-10 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Average Per Job</p>
                      <p className="text-3xl font-bold text-white">R800</p>
                      <p className="text-blue-400 text-sm">Based on 15 jobs</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Success Rate</p>
                      <p className="text-3xl font-bold text-white">85%</p>
                      <p className="text-green-400 text-sm">17 of 20 applications</p>
                    </div>
                    <Target className="w-10 h-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings Chart Placeholder */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-white">Earnings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border border-gray-700 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Earnings chart visualization</p>
                    <p className="text-gray-500 text-sm">Charts integration coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Payments */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { project: "E-commerce Website", amount: 1200, date: "2025-01-05", status: "Completed" },
                    { project: "Mobile App UI/UX", amount: 800, date: "2024-12-28", status: "Completed" },
                    { project: "Database Optimization", amount: 400, date: "2024-12-20", status: "Pending" }
                  ].map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div>
                        <h4 className="text-white font-medium">{payment.project}</h4>
                        <p className="text-gray-400 text-sm">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">R{payment.amount.toLocaleString()}</p>
                        <Badge variant={payment.status === 'Completed' ? 'default' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Job Application Modal */}
      {selectedJob && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Apply to: {selectedJob.title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={applyToJob} className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Job Details:</h4>
                <p className="text-gray-300 text-sm mb-3">{selectedJob.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Budget:</span>
                    <p className="text-white font-medium">
                      R{selectedJob.budget?.toLocaleString()} ({selectedJob.budget_type})
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Applications:</span>
                    <p className="text-white font-medium">{selectedJob.applications_count} proposals</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Proposal *
                </label>
                <Textarea
                  placeholder="Explain why you're the perfect fit for this project. Highlight your relevant experience and how you'll approach the work..."
                  value={applicationForm.proposal}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, proposal: e.target.value }))}
                  rows={6}
                  className="bg-gray-800 border-gray-600 text-white resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Bid Amount (R) *
                </label>
                <Input
                  type="number"
                  placeholder="Enter your bid amount"
                  value={applicationForm.bid_amount}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, bid_amount: e.target.value }))}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  Recommended: R{Math.round(selectedJob.budget * 0.8)?.toLocaleString()} - R{selectedJob.budget?.toLocaleString()}
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedJob(null)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FreelancerDashboard;
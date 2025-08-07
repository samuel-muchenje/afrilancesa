import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { 
  Plus, Briefcase, Users, DollarSign, Clock, TrendingUp, Search, Filter,
  MessageCircle, Settings, LogOut, CheckCircle, Star, Eye, Edit, X,
  FileText, Award, Calendar, ChevronRight, MapPin, Globe, Mail,
  Phone, ExternalLink, Target, BarChart3, Heart, Send, Trash2
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ClientDashboard = ({ user, onNavigate, onLogout }) => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    completedProjects: 0,
    totalSpent: 0,
    avgProjectRating: 4.7
  });
  
  const [recentJobs, setRecentJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  
  // Search and filter states
  const [jobSearch, setJobSearch] = useState('');
  const [freelancerSearch, setFreelancerSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  
  // Job posting form
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    budget_type: 'fixed',
    requirements: ''
  });

  useEffect(() => {
    fetchDashboardData();
    if (currentTab === 'jobs') {
      fetchMyJobs();
    } else if (currentTab === 'freelancers') {
      fetchFreelancers();
    } else if (currentTab === 'contracts') {
      fetchContracts();
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
      
      // Fetch posted jobs
      const jobsData = await apiCall('/api/jobs/my');
      setRecentJobs(jobsData.slice(0, 5));
      
      const activeJobs = jobsData.filter(job => job.status === 'open').length;
      const totalApplications = jobsData.reduce((sum, job) => sum + job.applications_count, 0);
      
      setStats(prev => ({
        ...prev,
        activeJobs,
        totalApplications
      }));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.full_name.toLowerCase().includes(freelancerSearch.toLowerCase()) ||
                         freelancer.profile?.skills?.some(skill => 
                           skill.toLowerCase().includes(freelancerSearch.toLowerCase()));
    
    const matchesSkill = skillFilter === 'all' || 
                        freelancer.profile?.skills?.some(skill => 
                          skill.toLowerCase().includes(skillFilter.toLowerCase()));
    
    const matchesExperience = experienceFilter === 'all' || 
                             freelancer.profile?.experience === experienceFilter;
    
    return matchesSearch && matchesSkill && matchesExperience;
  });

  const allSkills = [...new Set(freelancers.flatMap(f => f.profile?.skills || []))];

  const TabNavigation = () => (
    <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg mb-6">
      {[
        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
        { id: 'post-job', label: 'Post Job', icon: Plus },
        { id: 'jobs', label: 'My Jobs', icon: Briefcase },
        { id: 'freelancers', label: 'Find Freelancers', icon: Users },
        { id: 'projects', label: 'Projects', icon: Target }
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

  const fetchMyJobs = async () => {
    try {
      setJobsLoading(true);
      const jobsData = await apiCall('/api/jobs/my');
      setMyJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchFreelancers = async () => {
    try {
      setJobsLoading(true);
      // For now, we'll simulate freelancer data since we need to get verified users
      // In a real implementation, this would be an admin endpoint to get freelancers
      const mockFreelancers = [
        {
          id: '1',
          full_name: 'Thabo Mthembu',
          email: 'thabo@freelance.co.za',
          profile: {
            skills: ['React', 'Node.js', 'MongoDB'],
            experience: 'expert',
            hourly_rate: 850,
            bio: 'Full-stack developer with 6 years of experience in modern web technologies.'
          },
          rating: 4.9,
          completedJobs: 45,
          isVerified: true
        },
        {
          id: '2', 
          full_name: 'Nomsa Dlamini',
          email: 'nomsa@design.co.za',
          profile: {
            skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite'],
            experience: 'intermediate',
            hourly_rate: 650,
            bio: 'Creative UI/UX designer passionate about creating beautiful, user-friendly interfaces.'
          },
          rating: 4.8,
          completedJobs: 32,
          isVerified: true
        }
      ];
      setFreelancers(mockFreelancers);
    } catch (error) {
      console.error('Error fetching freelancers:', error);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchJobApplications = async (jobId) => {
    try {
      const applications = await apiCall(`/api/jobs/${jobId}/applications`);
      setJobApplications(applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const createJob = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...jobForm,
        budget: parseFloat(jobForm.budget),
        requirements: jobForm.requirements.split(',').map(req => req.trim()).filter(req => req)
      };

      await apiCall('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
      });

      alert('Job posted successfully!');
      setJobForm({
        title: '',
        description: '',
        category: '',
        budget: '',
        budget_type: 'fixed',
        requirements: ''
      });
      fetchDashboardData();
      fetchMyJobs();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

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
            <Badge className="bg-blue-600 text-white">Client</Badge>
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
                <AvatarFallback className="bg-gradient-to-r from-blue-400 to-green-500 text-black font-semibold">
                  {user?.full_name?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-white">{user?.full_name}</div>
                <div className="text-xs text-gray-400">Verified Client</div>
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
            Welcome back, {user?.full_name?.split(' ')[0]}! 🎯
          </h1>
          <p className="text-gray-400">
            Manage your projects, review applications, and find the perfect freelancers for your needs.
          </p>
        </div>

        {/* Tab Navigation */}
        <TabNavigation />

        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <>
            {/* Quick Action Banner */}
            <Card className="dashboard-card mb-6 bg-gradient-to-r from-yellow-400/10 to-green-500/10 border-yellow-400/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Ready to start your next project?</h3>
                    <p className="text-gray-300">Post a job and connect with skilled South African freelancers</p>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-6"
                    onClick={() => setCurrentTab('post-job')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Jobs</p>
                      <p className="text-2xl font-bold text-white">{stats.activeJobs}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Applications</p>
                      <p className="text-2xl font-bold text-white">{stats.totalApplications}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Completed Projects</p>
                      <p className="text-2xl font-bold text-white">{stats.completedProjects}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Invested</p>
                      <p className="text-2xl font-bold text-white">R{stats.totalSpent.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="dashboard-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Avg. Rating</p>
                      <p className="text-2xl font-bold text-white flex items-center">
                        {stats.avgProjectRating}
                        <Star className="w-4 h-4 text-yellow-400 ml-1 fill-current" />
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Posted Jobs */}
              <div className="lg:col-span-2">
                <Card className="dashboard-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Your Posted Jobs
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentTab('jobs')}
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
                          <div key={i} className="animate-pulse bg-gray-700 h-20 rounded"></div>
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
                            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{job.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  R{job.budget?.toLocaleString()}
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
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                onClick={() => {
                                  setSelectedJob(job);
                                  fetchJobApplications(job.id);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-white font-medium mb-2">No jobs posted yet</h3>
                        <p className="text-gray-400 mb-4">Start by posting your first job and find talented freelancers</p>
                        <Button 
                          className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black"
                          onClick={() => setCurrentTab('post-job')}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Post Your First Job
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions & Activity */}
              <div className="space-y-6">
                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                      onClick={() => setCurrentTab('post-job')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post New Job
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => setCurrentTab('freelancers')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Browse Freelancers
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => setCurrentTab('jobs')}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      My Jobs
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
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white">New application received</p>
                          <p className="text-gray-400 text-xs">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white">Job "Website Design" posted</p>
                          <p className="text-gray-400 text-xs">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-white">Message from freelancer</p>
                          <p className="text-gray-400 text-xs">2 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="dashboard-card">
                  <CardHeader>
                    <CardTitle className="text-white">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Jobs Posted</span>
                        <span className="text-white font-medium">2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Applications Received</span>
                        <span className="text-white font-medium">15</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Projects Completed</span>
                        <span className="text-white font-medium">1</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Amount Spent</span>
                        <span className="text-green-400 font-medium">R2,500</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            </div>
          </>
        )}

        {/* Post Job Tab */}
        {currentTab === 'post-job' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Post a New Job</h2>
              <p className="text-gray-400">Create a detailed job posting to attract the best freelancers</p>
            </div>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createJob} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Job Title *
                      </label>
                      <Input
                        placeholder="e.g., Full Stack Developer for E-commerce Website"
                        value={jobForm.title}
                        onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category *
                      </label>
                      <select
                        value={jobForm.category}
                        onChange={(e) => setJobForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile Development">Mobile Development</option>
                        <option value="Design">Design</option>
                        <option value="Writing">Writing</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Budget Type *
                      </label>
                      <select
                        value={jobForm.budget_type}
                        onChange={(e) => setJobForm(prev => ({ ...prev, budget_type: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Budget (R) *
                      </label>
                      <Input
                        type="number"
                        placeholder="5000"
                        value={jobForm.budget}
                        onChange={(e) => setJobForm(prev => ({ ...prev, budget: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                      <p className="text-gray-400 text-xs mt-1">
                        {jobForm.budget_type === 'hourly' ? 'Maximum hourly rate' : 'Total project budget'}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Job Description *
                      </label>
                      <Textarea
                        placeholder="Describe your project in detail. Include what you're looking for, project goals, timeline, and any specific requirements..."
                        value={jobForm.description}
                        onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={6}
                        className="bg-gray-800 border-gray-600 text-white resize-none"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Required Skills (comma-separated)
                      </label>
                      <Input
                        placeholder="e.g., React, Node.js, MongoDB, API Integration"
                        value={jobForm.requirements}
                        onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      <p className="text-gray-400 text-xs mt-1">
                        List the key skills and technologies needed for this project
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Job Posting Preview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Title:</span>
                        <span className="text-white">{jobForm.title || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white">{jobForm.category || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Budget:</span>
                        <span className="text-white">
                          {jobForm.budget ? `R${parseFloat(jobForm.budget).toLocaleString()} (${jobForm.budget_type})` : 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab('dashboard')}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                          Posting...
                        </div>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Post Job
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
        {/* My Jobs Tab */}
        {currentTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">My Posted Jobs</h2>
              <Button
                onClick={() => setCurrentTab('post-job')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
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
            ) : myJobs.length > 0 ? (
              <div className="space-y-4">
                {myJobs.map((job) => (
                  <Card key={job.id} className="dashboard-card">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-white">{job.title}</h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
                              <Badge variant="outline">{job.category}</Badge>
                            </div>
                          </div>
                          
                          <p className="text-gray-300 mb-4 leading-relaxed">{job.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <span className="text-gray-400">Budget:</span>
                              <p className="text-white font-medium">
                                R{job.budget?.toLocaleString()} ({job.budget_type})
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">Applications:</span>
                              <p className="text-white font-medium">{job.applications_count}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Posted:</span>
                              <p className="text-white font-medium">
                                {new Date(job.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <p className={`font-medium ${
                                job.status === 'open' ? 'text-green-400' : 
                                job.status === 'closed' ? 'text-red-400' : 'text-yellow-400'
                              }`}>
                                {job.status === 'open' ? 'Active' : 
                                 job.status === 'closed' ? 'Closed' : 'In Progress'}
                              </p>
                            </div>
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
                        </div>
                        
                        <div className="ml-6 flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                            onClick={() => {
                              setSelectedJob(job);
                              fetchJobApplications(job.id);
                            }}
                          >
                            <Users className="w-4 h-4 mr-1" />
                            View Applications ({job.applications_count})
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Job
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-300 hover:bg-red-800/20"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Close Job
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
                  <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-white font-medium mb-2">No jobs posted yet</h3>
                  <p className="text-gray-400 mb-6">
                    Create your first job posting to start connecting with talented freelancers.
                  </p>
                  <Button
                    onClick={() => setCurrentTab('post-job')}
                    className="bg-gradient-to-r from-yellow-400 to-green-500 text-black"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Find Freelancers Tab */}
        {currentTab === 'freelancers' && (
          <div className="space-y-6">
            {/* Search and Filter Controls */}
            <Card className="dashboard-card">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search freelancers..."
                      value={freelancerSearch}
                      onChange={(e) => setFreelancerSearch(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  
                  <select
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Skills</option>
                    {allSkills.map(skill => (
                      <option key={skill} value={skill.toLowerCase()}>{skill}</option>
                    ))}
                  </select>

                  <select
                    value={experienceFilter}
                    onChange={(e) => setExperienceFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="all">All Experience</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>

                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">
                      {filteredFreelancers.length} freelancers
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Freelancers List */}
            {jobsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="dashboard-card animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-20 bg-gray-700 rounded mb-4"></div>
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFreelancers.map((freelancer) => (
                  <Card key={freelancer.id} className="dashboard-card hover:border-yellow-400/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-green-500 text-black text-xl font-bold">
                            {freelancer.full_name?.charAt(0) || 'F'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg">{freelancer.full_name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${
                                    i < Math.floor(freelancer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                  }`} 
                                />
                              ))}
                              <span className="text-yellow-400 text-sm ml-1">{freelancer.rating}</span>
                            </div>
                            {freelancer.isVerified && (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                        {freelancer.profile?.bio || 'No bio available'}
                      </p>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Hourly Rate:</span>
                          <span className="text-white font-semibold">R{freelancer.profile?.hourly_rate}/hr</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Experience:</span>
                          <span className="text-white capitalize">{freelancer.profile?.experience}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Jobs Completed:</span>
                          <span className="text-white">{freelancer.completedJobs}</span>
                        </div>
                      </div>

                      {freelancer.profile?.skills && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {freelancer.profile.skills.slice(0, 4).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {freelancer.profile.skills.length > 4 && (
                              <Badge variant="outline" className="text-xs text-gray-400">
                                +{freelancer.profile.skills.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                          onClick={() => setSelectedFreelancer(freelancer)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {currentTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Project Management</h2>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <Card className="dashboard-card">
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">Project Management</h3>
                <p className="text-gray-400 mb-6">
                  Track hired freelancers, manage project milestones, and oversee deliverables.
                </p>
                <p className="text-gray-500 text-sm">
                  This feature is coming soon. You'll be able to manage all your active projects from here.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Job Applications Modal */}
        {selectedJob && (
          <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
            <DialogContent className="max-w-4xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Applications for: {selectedJob.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {jobApplications.length > 0 ? (
                  jobApplications.map((application, index) => (
                    <Card key={index} className="bg-gray-800 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-green-500 text-black">
                              {application.freelancer_name?.charAt(0) || 'F'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-semibold">
                                {application.freelancer_name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-green-400 font-bold">
                                  R{application.bid_amount?.toLocaleString()}
                                </span>
                                <Badge variant="outline">
                                  {application.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm mb-3">
                              {application.proposal}
                            </p>
                            <div className="flex space-x-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Accept
                              </Button>
                              <Button size="sm" variant="outline" className="border-gray-600">
                                Message
                              </Button>
                              <Button size="sm" variant="outline" className="border-gray-600">
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No applications received yet</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Freelancer Profile Modal */}
        {selectedFreelancer && (
          <Dialog open={!!selectedFreelancer} onOpenChange={() => setSelectedFreelancer(null)}>
            <DialogContent className="max-w-3xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {selectedFreelancer.full_name}'s Profile
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-green-500 text-black text-3xl font-bold">
                      {selectedFreelancer.full_name?.charAt(0) || 'F'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedFreelancer.full_name}
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${
                              i < Math.floor(selectedFreelancer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                            }`} 
                          />
                        ))}
                        <span className="text-yellow-400 ml-2">{selectedFreelancer.rating}</span>
                      </div>
                      <span className="text-green-400 font-semibold">
                        R{selectedFreelancer.profile?.hourly_rate}/hr
                      </span>
                      {selectedFreelancer.isVerified && (
                        <div className="flex items-center text-green-400">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">About</h4>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedFreelancer.profile?.bio || 'No bio available'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Experience</h4>
                    <p className="text-gray-300 capitalize">
                      {selectedFreelancer.profile?.experience || 'Not specified'}
                    </p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Jobs Completed</h4>
                    <p className="text-gray-300">{selectedFreelancer.completedJobs}</p>
                  </div>
                </div>

                {selectedFreelancer.profile?.skills && (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedFreelancer.profile.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Add to Favorites
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};
      </div>
    </div>
  );
};

export default ClientDashboard;
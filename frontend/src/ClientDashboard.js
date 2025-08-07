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
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch posted jobs
      const jobsResponse = await fetch(`${API_BASE}/api/jobs/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setRecentJobs(jobsData.slice(0, 5));
        
        const activeJobs = jobsData.filter(job => job.status === 'open').length;
        const totalApplications = jobsData.reduce((sum, job) => sum + job.applications_count, 0);
        
        setStats(prev => ({
          ...prev,
          activeJobs,
          totalApplications
        }));
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
                onClick={() => onNavigate('post-job')}
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
                    size="sm"
                    className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black"
                    onClick={() => onNavigate('post-job')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New Job
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
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => onNavigate('jobs')}
                    >
                      View All Jobs
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No jobs posted yet</h3>
                    <p className="text-gray-400 mb-4">Start by posting your first job and find talented freelancers</p>
                    <Button 
                      className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black"
                      onClick={() => onNavigate('post-job')}
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
                  onClick={() => onNavigate('post-job')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => onNavigate('browse-freelancers')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Browse Freelancers
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => onNavigate('messages')}
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
                    <span className="text-white font-medium">R2,500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
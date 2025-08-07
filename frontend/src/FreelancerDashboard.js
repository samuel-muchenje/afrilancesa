import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { 
  Briefcase, DollarSign, Star, Clock, Users, TrendingUp, 
  MessageCircle, Settings, LogOut, CheckCircle, AlertTriangle,
  FileText, Award, Calendar
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FreelancerDashboard = ({ user, onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    activeApplications: 0,
    completedJobs: 0,
    totalEarnings: 0,
    rating: 4.8,
    profileViews: 0
  });
  
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch recent job applications
      const jobsResponse = await fetch(`${API_BASE}/api/jobs/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setRecentJobs(jobsData.slice(0, 5)); // Show only recent 5
        setStats(prev => ({
          ...prev,
          activeApplications: jobsData.filter(job => job.status === 'pending').length
        }));
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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

  const verification = getVerificationStatus();

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

        {/* Verification Alert */}
        {!user.is_verified && (
          <Card className="dashboard-card mb-6 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-1" />
                <div>
                  <h3 className="text-white font-semibold">Verification Required</h3>
                  <p className="text-gray-300 text-sm mt-1">
                    Upload your ID document to get verified and access premium job opportunities.
                  </p>
                  <Button 
                    className="mt-3 bg-yellow-400 hover:bg-yellow-500 text-black"
                    size="sm"
                    onClick={() => onNavigate('profile')}
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
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Recent Job Applications
                </CardTitle>
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
                          <span>R{job.budget}</span>
                          <span>{job.applications_count} applications</span>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      onClick={() => onNavigate('jobs')}
                    >
                      View All Applications
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No applications yet</h3>
                    <p className="text-gray-400 mb-4">Start browsing jobs and submit your first proposal</p>
                    <Button 
                      className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black"
                      onClick={() => onNavigate('jobs')}
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
                  onClick={() => onNavigate('jobs')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => onNavigate('profile')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Edit Profile
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
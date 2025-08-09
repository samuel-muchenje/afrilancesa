import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Input } from './components/ui/input';
import { 
  Users, Briefcase, DollarSign, AlertTriangle, CheckCircle, X,
  Shield, Settings, LogOut, TrendingUp, Clock, Search,
  FileText, Star, MessageCircle, Calendar, BarChart3
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminDashboard = ({ user, onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFreelancers: 0,
    totalClients: 0,
    pendingVerifications: 0,
    pendingAdmins: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalRevenue: 0,
    supportTickets: 0
  });
  
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all users (admin only)
      const usersResponse = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        
        const totalUsers = usersData.length;
        const totalFreelancers = usersData.filter(u => u.role === 'freelancer').length;
        const totalClients = usersData.filter(u => u.role === 'client').length;
        const pendingVerifications = usersData.filter(u => 
          u.role === 'freelancer' && !u.is_verified && u.id_document
        ).length;
        
        // Filter pending admin requests
        const pendingAdminRequests = usersData.filter(u => 
          u.role === 'admin' && 
          !u.admin_approved
        );
        
        setPendingUsers(usersData.filter(u => 
          u.role === 'freelancer' && !u.is_verified && u.id_document
        ).slice(0, 10));
        
        setPendingAdmins(pendingAdminRequests);
        
        setStats(prev => ({
          ...prev,
          totalUsers,
          totalFreelancers,
          totalClients,
          pendingVerifications,
          pendingAdmins: pendingAdminRequests.length
        }));
      }
      
      // Fetch jobs data
      const jobsResponse = await fetch(`${API_BASE}/api/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setStats(prev => ({
          ...prev,
          totalJobs: jobsData.length,
          activeJobs: jobsData.filter(job => job.status === 'open').length
        }));
      }
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, approve) => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(`${API_BASE}/api/admin/verify-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: userId,
          verification_status: approve
        })
      });
      
      // Refresh data
      fetchAdminData();
      
    } catch (error) {
      console.error('Error verifying user:', error);
      alert('Error processing verification');
    }
  };

  const handleAdminApproval = async (userId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/approve-admin/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: status,
          admin_notes: notes
        })
      });

      if (response.ok) {
        // Refresh admin data
        fetchAdminData();
        alert(`Admin request ${status} successfully!`);
      } else {
        const error = await response.json();
        throw new Error(error.detail || `Failed to ${status} admin request`);
      }
    } catch (error) {
      console.error('Admin approval error:', error);
      alert(`Error: ${error.message}`);
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
            <Badge className="bg-red-600 text-white">Admin</Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search users, jobs..." 
                className="pl-10 bg-gray-800 border-gray-600 text-white w-64"
              />
            </div>
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
                <AvatarFallback className="bg-gradient-to-r from-red-400 to-pink-500 text-black font-semibold">
                  {user?.full_name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-white">{user?.full_name}</div>
                <div className="text-xs text-gray-400 flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Access
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
            Admin Dashboard 🛡️
          </h1>
          <p className="text-gray-400">
            Platform overview, user management, and system administration
          </p>
        </div>

        {/* Alert for pending verifications */}
        {stats.pendingVerifications > 0 && (
          <Card className="dashboard-card mb-6 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <h3 className="text-white font-semibold">
                      {stats.pendingVerifications} Pending Verifications
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Freelancers waiting for ID document verification
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentTab('verifications')}
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                >
                  Review Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alert for pending admin requests */}
        {stats.pendingAdmins > 0 && (
          <Card className="dashboard-card mb-6 border-red-500/20 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-red-400" />
                  <div>
                    <h3 className="text-white font-semibold">
                      {stats.pendingAdmins} Pending Admin Requests
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Admin access requests requiring approval from sam@afrilance.co.za
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentTab('admin-requests')}
                  className="border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  Review Requests
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500">
                    {stats.totalFreelancers} freelancers, {stats.totalClients} clients
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Jobs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalJobs}</p>
                  <p className="text-xs text-gray-500">
                    {stats.activeJobs} active
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending Verifications</p>
                  <p className="text-2xl font-bold text-white">{stats.pendingVerifications}</p>
                  <p className="text-xs text-gray-500">
                    Require review
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Platform Revenue</p>
                  <p className="text-2xl font-bold text-white">R{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    This month
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Verifications */}
          <div className="lg:col-span-2">
            <Card className="dashboard-card" id="verifications">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Pending Freelancer Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-700 h-16 rounded"></div>
                    ))}
                  </div>
                ) : pendingUsers.length > 0 ? (
                  <div className="space-y-4">
                    {pendingUsers.map((pendingUser, index) => (
                      <div key={index} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className="bg-gray-600 text-white">
                                {pendingUser.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-white font-semibold">{pendingUser.full_name}</h3>
                              <p className="text-gray-400 text-sm">{pendingUser.email}</p>
                              <p className="text-gray-500 text-xs">
                                Registered: {new Date(pendingUser.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleVerifyUser(pendingUser.id, true)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleVerifyUser(pendingUser.id, false)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">All caught up!</h3>
                    <p className="text-gray-400">No pending verifications at the moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Admin Tools & Stats */}
          <div className="space-y-6">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-white">Admin Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white"
                  onClick={() => onNavigate('user-management')}
                >
                  <Users className="w-4 h-4 mr-2" />
                  User Management
                </Button>
                <Button 
                  className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white"
                  onClick={() => onNavigate('job-management')}
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Job Management
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => onNavigate('analytics')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => onNavigate('support-tickets')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Support Tickets
                </Button>
              </CardContent>
            </Card>

            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-white">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Database</span>
                    <Badge className="bg-green-600 text-white">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Email Service</span>
                    <Badge className="bg-green-600 text-white">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">File Storage</span>
                    <Badge className="bg-green-600 text-white">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Payment System</span>
                    <Badge className="bg-yellow-600 text-white">Pending</Badge>
                  </div>
                </div>
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
                      <p className="text-white">New user registered</p>
                      <p className="text-gray-400 text-xs">30 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white">Job posted by client</p>
                      <p className="text-gray-400 text-xs">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-white">Verification completed</p>
                      <p className="text-gray-400 text-xs">2 hours ago</p>
                    </div>
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

export default AdminDashboard;
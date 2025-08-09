import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { 
  Users, Shield, TrendingUp, DollarSign, Briefcase, 
  MessageSquare, Settings, LogOut, CheckCircle, XCircle,
  AlertTriangle, Clock, Eye, FileText, UserPlus, Zap, Activity
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminDashboard = ({ user, onNavigate, onLogout }) => {
  // Stats state
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
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, isVerified, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/verify-user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: isVerified ? 'approved' : 'rejected',
          reason: reason,
          admin_notes: reason
        })
      });

      if (response.ok) {
        // Refresh data
        fetchAdminData();
        alert(`User ${isVerified ? 'approved' : 'rejected'} successfully!`);
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert(`Error: ${error.message}`);
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

  const renderDashboardTab = () => (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Platform Overview */}
      <div className="lg:col-span-2">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Total Active Users</span>
                <span className="text-white font-semibold">{stats.totalUsers}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Verified Freelancers</span>
                <span className="text-green-400 font-semibold">{stats.totalFreelancers - stats.pendingVerifications}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-300">Active Clients</span>
                <span className="text-blue-400 font-semibold">{stats.totalClients}</span>
              </div>
              {stats.pendingVerifications > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-lg">
                  <span className="text-yellow-300">Pending Verifications</span>
                  <span className="text-yellow-400 font-semibold">{stats.pendingVerifications}</span>
                </div>
              )}
              {stats.pendingAdmins > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-600/20 border border-red-600/40 rounded-lg">
                  <span className="text-red-300">Pending Admin Requests</span>
                  <span className="text-red-400 font-semibold">{stats.pendingAdmins}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pendingVerifications > 0 && (
                <Button 
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={() => setCurrentTab('verifications')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Review {stats.pendingVerifications} Verifications
                </Button>
              )}
              {stats.pendingAdmins > 0 && (
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setCurrentTab('admin-requests')}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Review {stats.pendingAdmins} Admin Requests
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => setCurrentTab('users')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => setCurrentTab('activity')}
              >
                <Activity className="w-4 h-4 mr-2" />
                View Activity Log
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVerificationsTab = () => (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Pending Freelancer Verifications ({stats.pendingVerifications})
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
                          onClick={() => {
                            const reason = prompt('Reason for rejection (optional):');
                            handleVerifyUser(pendingUser.id, false, reason || '');
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No pending verifications</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Verification Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-green-600/20 border border-green-600/40 rounded-lg">
                <p className="text-green-300 font-medium">✅ Approve If:</p>
                <ul className="text-green-200 text-xs mt-2 space-y-1">
                  <li>• Clear, readable ID document</li>
                  <li>• All corners visible</li>
                  <li>• Name matches profile</li>
                  <li>• South African ID or valid documents</li>
                </ul>
              </div>
              <div className="p-3 bg-red-600/20 border border-red-600/40 rounded-lg">
                <p className="text-red-300 font-medium">❌ Reject If:</p>
                <ul className="text-red-200 text-xs mt-2 space-y-1">
                  <li>• Blurry or unclear image</li>
                  <li>• Information doesn't match</li>
                  <li>• Invalid or expired document</li>
                  <li>• Suspicious or altered document</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdminRequestsTab = () => (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Pending Admin Access Requests ({stats.pendingAdmins})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-700 h-20 rounded"></div>
                ))}
              </div>
            ) : pendingAdmins.length > 0 ? (
              <div className="space-y-4">
                {pendingAdmins.map((adminRequest, index) => (
                  <div key={index} className="border border-red-500/30 bg-red-500/5 rounded-lg p-4">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">{adminRequest.full_name}</h3>
                            <p className="text-gray-400 text-sm">{adminRequest.email}</p>
                            <p className="text-gray-500 text-xs">
                              Department: {adminRequest.department || 'Not specified'}
                            </p>
                            <p className="text-gray-500 text-xs">
                              Requested: {new Date(adminRequest.admin_request_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {adminRequest.admin_request_reason && (
                        <div className="bg-gray-700 rounded-lg p-3">
                          <p className="text-gray-300 text-sm">
                            <strong>Reason for admin access:</strong>
                          </p>
                          <p className="text-gray-300 text-sm mt-1 italic">
                            "{adminRequest.admin_request_reason}"
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            const notes = prompt('Admin approval notes (optional):');
                            handleAdminApproval(adminRequest.id, 'approved', notes || '');
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve Admin Access
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const notes = prompt('Reason for rejection:');
                            if (notes) {
                              handleAdminApproval(adminRequest.id, 'rejected', notes);
                            }
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject Request
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No pending admin requests</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Security Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-red-600/20 border border-red-600/40 rounded-lg">
                <p className="text-red-300 font-medium">⚠️ Security Checklist:</p>
                <ul className="text-red-200 text-xs mt-2 space-y-1">
                  <li>• Verify requester is Afrilance employee</li>
                  <li>• Confirm role requires admin access</li>
                  <li>• Check with HR/Management if unsure</li>
                  <li>• Review reason for access request</li>
                </ul>
              </div>
              <div className="p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-lg">
                <p className="text-yellow-300 font-medium">📧 Email Domain:</p>
                <p className="text-yellow-200 text-xs mt-1">
                  Only @afrilance.co.za emails can request admin access. All approvals are logged and monitored.
                </p>
              </div>
              <div className="p-3 bg-blue-600/20 border border-blue-600/40 rounded-lg">
                <p className="text-blue-300 font-medium">📞 Contact:</p>
                <p className="text-blue-200 text-xs mt-1">
                  For verification questions, contact sam@afrilance.co.za
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            User management features coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivityTab = () => (
    <div>
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white">Admin login from sam@afrilance.co.za</p>
                <p className="text-gray-400 text-xs">Just now</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white">Freelancer verification approved</p>
                <p className="text-gray-400 text-xs">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white">New user registration</p>
                <p className="text-gray-400 text-xs">15 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="dashboard-modern">
      {/* Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
                alt="Afrilance" 
                className="h-8 w-auto"
              />
              <Badge className="bg-red-600 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Admin Portal
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-700 text-white text-sm">
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
            Platform oversight, user verification, and system administration
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
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-green-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Freelancers</p>
                  <p className="text-2xl font-bold text-white">{stats.totalFreelancers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-purple-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Clients</p>
                  <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-400" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">Revenue</p>
                  <p className="text-2xl font-bold text-white">R{stats.totalRevenue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'verifications', label: `Verifications (${stats.pendingVerifications})`, icon: Shield },
              { id: 'admin-requests', label: `Admin Requests (${stats.pendingAdmins})`, icon: UserPlus },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'activity', label: 'Activity Log', icon: Activity }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    currentTab === tab.id
                      ? 'bg-yellow-400 text-black'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {currentTab === 'dashboard' && renderDashboardTab()}
        {currentTab === 'verifications' && renderVerificationsTab()}
        {currentTab === 'admin-requests' && renderAdminRequestsTab()}
        {currentTab === 'users' && renderUsersTab()}
        {currentTab === 'activity' && renderActivityTab()}
      </div>
    </div>
  );
};

export default AdminDashboard;
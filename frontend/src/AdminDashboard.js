import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import RevenueMonitoring from './components/RevenueMonitoring';
import AdvancedSearch from './components/AdvancedSearch';
import { 
  Users, Shield, TrendingUp, DollarSign, Briefcase, 
  MessageSquare, Settings, LogOut, CheckCircle, XCircle,
  AlertTriangle, Clock, Eye, FileText, UserPlus, Zap, Activity,
  Search, Filter, Ban, RefreshCw, Send, Mail, Calendar,
  BarChart3, PieChart, TrendingDown, UserCheck, UserX,
  HelpCircle, MessageCircle, ArrowUp, ArrowDown
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

  // Enhanced stats state
  const [enhancedStats, setEnhancedStats] = useState(null);
  
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('dashboard');

  // User management state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersPagination, setUsersPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Support tickets state
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [ticketStatusFilter, setTicketStatusFilter] = useState('all');
  const [supportPagination, setSupportPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Activity log state
  const [activityLog, setActivityLog] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    fetchAdminData();
    fetchEnhancedStats();
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

  const fetchEnhancedStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEnhancedStats(data);
      }
    } catch (error) {
      console.error('Error fetching enhanced stats:', error);
    }
  };

  const fetchUsers = async (page = 1) => {
    setUsersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const skip = (page - 1) * 20;
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: '20',
        q: searchQuery,
        role: roleFilter,
        status: statusFilter
      });

      const response = await fetch(`${API_BASE}/api/admin/users/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsersList(data.users);
        setUsersPagination({
          page: data.page,
          pages: data.pages,
          total: data.total
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchSupportTickets = async (page = 1) => {
    setSupportLoading(true);
    try {
      const token = localStorage.getItem('token');
      const skip = (page - 1) * 20;
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: '20',
        status: ticketStatusFilter
      });

      const response = await fetch(`${API_BASE}/api/admin/support-tickets?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSupportTickets(data.tickets);
        setSupportPagination({
          page: data.page,
          pages: data.pages,
          total: data.total
        });
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    } finally {
      setSupportLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    setActivityLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/activity-log`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivityLog(data.activities);
      }
    } catch (error) {
      console.error('Error fetching activity log:', error);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleSuspendUser = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        fetchUsers(usersPagination.page); // Refresh current page
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateTicket = async (ticketId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/support-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Ticket updated successfully');
        fetchSupportTickets(supportPagination.page); // Refresh current page
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update ticket');
      }
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert(`Error: ${error.message}`);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="w-4 h-4" />;
      case 'job_posted':
        return <Briefcase className="w-4 h-4" />;
      case 'support_ticket':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_registration':
        return 'text-green-400';
      case 'job_posted':
        return 'text-blue-400';
      case 'support_ticket':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const renderEnhancedDashboardTab = () => (
    <div className="space-y-6">
      {/* Enhanced Stats Cards */}
      {enhancedStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-white">{enhancedStats.users?.total || 0}</p>
                  <div className="text-xs text-green-400 flex items-center mt-1">
                    <ArrowUp className="w-3 h-3 mr-1" />
                    +{enhancedStats.users?.new_this_month || 0} this month
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Active Jobs</p>
                  <p className="text-2xl font-bold text-white">{enhancedStats.jobs?.active || 0}</p>
                  <div className="text-xs text-blue-400 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {enhancedStats.jobs?.total || 0} total jobs
                  </div>
                </div>
                <Briefcase className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Platform Revenue</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(enhancedStats.revenue?.total_platform || 0)}
                  </p>
                  <div className="text-xs text-yellow-400 flex items-center mt-1">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {formatCurrency(enhancedStats.revenue?.escrow_balance || 0)} in escrow
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Support Tickets</p>
                  <p className="text-2xl font-bold text-white">{enhancedStats.support?.open_tickets || 0}</p>
                  <div className="text-xs text-red-400 flex items-center mt-1">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {enhancedStats.support?.total_tickets || 0} total tickets
                  </div>
                </div>
                <HelpCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Platform Overview and Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Platform Overview */}
        <div className="lg:col-span-2">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Platform Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enhancedStats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Freelancers</span>
                      <span className="text-green-400 font-semibold">{enhancedStats.users?.freelancers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Clients</span>
                      <span className="text-blue-400 font-semibold">{enhancedStats.users?.clients || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Verified Users</span>
                      <span className="text-yellow-400 font-semibold">{enhancedStats.users?.verified_freelancers || 0}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Contracts</span>
                      <span className="text-purple-400 font-semibold">{enhancedStats.contracts?.total || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">In Progress</span>
                      <span className="text-orange-400 font-semibold">{enhancedStats.contracts?.in_progress || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Completed</span>
                      <span className="text-green-400 font-semibold">{enhancedStats.contracts?.completed || 0}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              )}
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
                  onClick={() => {
                    setCurrentTab('users');
                    fetchUsers();
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    setCurrentTab('support');
                    fetchSupportTickets();
                  }}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Support Tickets
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => {
                    setCurrentTab('activity');
                    fetchActivityLog();
                  }}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  View Activity Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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

  // Load users when tab is first opened
  useEffect(() => {
    if (currentTab === 'users' && usersList.length === 0) {
      fetchUsers();
    }
  }, [currentTab]);

  const renderUsersTab = () => {
    return (
      <div className="space-y-6">
        {/* Search and Filters */}
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all">All Roles</option>
                  <option value="freelancer">Freelancers</option>
                  <option value="client">Clients</option>
                  <option value="admin">Admins</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="suspended">Suspended</option>
                </select>
                <Button onClick={() => fetchUsers()} className="bg-yellow-600 hover:bg-yellow-700">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              User Management ({usersPagination.total} users)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-700 h-16 rounded"></div>
                ))}
              </div>
            ) : usersList.length > 0 ? (
              <>
                <div className="space-y-3">
                  {usersList.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className={`text-white ${
                            user.is_suspended ? 'bg-red-600' : 
                            user.is_verified ? 'bg-green-600' : 'bg-gray-600'
                          }`}>
                            {user.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold">{user.full_name}</h3>
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'freelancer' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            {user.is_verified && <UserCheck className="w-4 h-4 text-green-400" />}
                            {user.is_suspended && <Ban className="w-4 h-4 text-red-400" />}
                          </div>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                          <p className="text-gray-500 text-xs">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`border-gray-600 ${
                            user.is_suspended 
                              ? 'text-green-400 hover:bg-green-600/20' 
                              : 'text-red-400 hover:bg-red-600/20'
                          }`}
                          onClick={() => handleSuspendUser(user.id, user.is_suspended)}
                        >
                          {user.is_suspended ? (
                            <>
                              <UserCheck className="w-4 h-4 mr-1" />
                              Unsuspend
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 mr-1" />
                              Suspend
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {usersPagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-gray-400 text-sm">
                      Page {usersPagination.page} of {usersPagination.pages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={usersPagination.page === 1}
                        onClick={() => fetchUsers(usersPagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={usersPagination.page === usersPagination.pages}
                        onClick={() => fetchUsers(usersPagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-center py-8">No users found</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderSupportTab = () => {
    // Load support tickets when tab is first opened
    useEffect(() => {
      if (currentTab === 'support' && supportTickets.length === 0) {
        fetchSupportTickets();
      }
    }, [currentTab]);

    return (
      <div className="space-y-6">
        {/* Support Filters */}
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <select
                value={ticketStatusFilter}
                onChange={(e) => {
                  setTicketStatusFilter(e.target.value);
                  fetchSupportTickets();
                }}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">All Tickets</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <Button onClick={() => fetchSupportTickets()} className="bg-yellow-600 hover:bg-yellow-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Support Tickets ({supportPagination.total} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supportLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-700 h-24 rounded"></div>
                ))}
              </div>
            ) : supportTickets.length > 0 ? (
              <>
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-white font-semibold">{ticket.name}</h3>
                            <Badge variant={
                              ticket.status === 'resolved' ? 'default' :
                              ticket.status === 'in_progress' ? 'secondary' :
                              'destructive'
                            }>
                              {ticket.status}
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">{ticket.email}</p>
                          <p className="text-gray-300 text-sm">{ticket.message}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            Created: {new Date(ticket.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <select
                            value={ticket.status}
                            onChange={(e) => handleUpdateTicket(ticket.id, { status: e.target.value })}
                            className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-gray-600 text-gray-300"
                            onClick={() => {
                              const reply = prompt('Enter your reply to this ticket:');
                              if (reply) {
                                handleUpdateTicket(ticket.id, { admin_reply: reply });
                              }
                            }}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                      
                      {ticket.admin_replies && ticket.admin_replies.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-600">
                          <p className="text-gray-400 text-xs mb-2">Admin Replies:</p>
                          {ticket.admin_replies.map((reply, idx) => (
                            <div key={idx} className="bg-gray-700/50 rounded p-2 mb-2">
                              <p className="text-gray-300 text-sm">{reply.message}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                {new Date(reply.replied_at).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {supportPagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-gray-400 text-sm">
                      Page {supportPagination.page} of {supportPagination.pages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={supportPagination.page === 1}
                        onClick={() => fetchSupportTickets(supportPagination.page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={supportPagination.page === supportPagination.pages}
                        onClick={() => fetchSupportTickets(supportPagination.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-400 text-center py-8">No support tickets found</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderActivityTab = () => {
    // Load activity log when tab is first opened
    useEffect(() => {
      if (currentTab === 'activity' && activityLog.length === 0) {
        fetchActivityLog();
      }
    }, [currentTab]);

    return (
      <div>
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Activity Log
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={fetchActivityLog}
                className="border-gray-600 text-gray-300"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-700 h-12 rounded"></div>
                ))}
              </div>
            ) : activityLog.length > 0 ? (
              <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
                {activityLog.map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 hover:bg-gray-700/50 rounded-lg">
                    <div className={`${getActivityColor(activity.type)} flex-shrink-0 mt-1`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{activity.description}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRevenueTab = () => {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Revenue Analytics 💰</h2>
          <p className="text-gray-400">
            Comprehensive revenue monitoring, commission tracking, and platform analytics
          </p>
        </div>
        <RevenueMonitoring />
      </div>
    );
  };

  const renderAdvancedSearchTab = () => {
    const [searchType, setSearchType] = useState('jobs');

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Advanced Search 🔍</h2>
          <p className="text-gray-400 mb-4">
            Powerful search tools for jobs, users, and transactions with advanced filtering
          </p>
          
          {/* Search Type Selector */}
          <div className="flex space-x-2 mb-6">
            <Button
              variant={searchType === 'jobs' ? 'default' : 'outline'}
              onClick={() => setSearchType('jobs')}
              className={searchType === 'jobs' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-gray-600 text-gray-300'}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Search Jobs
            </Button>
            <Button
              variant={searchType === 'users' ? 'default' : 'outline'}
              onClick={() => setSearchType('users')}
              className={searchType === 'users' ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-gray-600 text-gray-300'}
            >
              <Users className="w-4 h-4 mr-2" />
              Search Users
            </Button>
          </div>
        </div>
        
        <AdvancedSearch searchType={searchType} />
      </div>
    );
  };

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

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'verifications', label: `Verifications (${stats.pendingVerifications})`, icon: Shield },
              { id: 'admin-requests', label: `Admin Requests (${stats.pendingAdmins})`, icon: UserPlus },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'support', label: 'Support Tickets', icon: HelpCircle },
              { id: 'activity', label: 'Activity Log', icon: Activity },
              { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign },
              { id: 'search', label: 'Advanced Search', icon: Search }
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
        {currentTab === 'dashboard' && renderEnhancedDashboardTab()}
        {currentTab === 'verifications' && renderVerificationsTab()}
        {currentTab === 'admin-requests' && renderAdminRequestsTab()}
        {currentTab === 'users' && renderUsersTab()}
        {currentTab === 'support' && renderSupportTab()}
        {currentTab === 'activity' && renderActivityTab()}
        {currentTab === 'revenue' && renderRevenueTab()}
        {currentTab === 'search' && renderAdvancedSearchTab()}
      </div>
    </div>
  );
};

export default AdminDashboard;
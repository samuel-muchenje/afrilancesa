import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { 
  MessageCircle, HelpCircle, Briefcase, Users, Star, MapPin, Clock, DollarSign, 
  Send, LogOut, User, Plus, Shield, Smartphone, Globe, CreditCard, Play,
  ChevronLeft, ChevronRight, ArrowRight, Check, Quote
} from 'lucide-react';
import ModernLanding from './ModernLanding';
import Register from './Register';
import Login from './Login';
import FreelancerProfileSetup from './FreelancerProfileSetup';
import PostJob from './PostJob';
import FreelancerDashboard from './FreelancerDashboard';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';
import About from './About';
import Contact from './Contact';
import BrowseJobs from './BrowseJobs';
import BrowseFreelancers from './BrowseFreelancers';
import HowItWorks from './HowItWorks';
import Enterprise from './Enterprise';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Ensure no modals auto-open on landing page
  useEffect(() => {
    if (currentPage === 'landing') {
      setSelectedJob(null);
    }
  }, [currentPage]);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Auth forms
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'freelancer'
  });

  // Job form
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    budget_type: 'fixed',
    requirements: ''
  });

  // Application form
  const [applicationForm, setApplicationForm] = useState({
    proposal: '',
    bid_amount: ''
  });

  // Profile form
  const [profileForm, setProfileForm] = useState({
    skills: '',
    experience: '',
    hourly_rate: '',
    bio: '',
    portfolio_links: ''
  });

  // Support form
  const [supportForm, setSupportForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Update navigation for role-based landing
  const handleLandingNavigation = (page) => {
    if (page === 'login' || page === 'register') {
      setCurrentPage(page);
    } else {
      setCurrentPage('landing');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setCurrentPage('dashboard');
    }
  }, []);

  useEffect(() => {
    if (user && currentPage === 'jobs') {
      fetchJobs();
    }
    if (user && currentPage === 'dashboard') {
      fetchMyJobs();
    }
  }, [user, currentPage]);

  const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers,
        signal: controller.signal,
        ...options
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = 'An error occurred';
        try {
          const error = await response.json();
          errorDetail = error.detail || errorDetail;
        } catch (e) {
          errorDetail = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorDetail);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = authMode === 'login' ? '/api/login' : '/api/register';
      const data = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(authForm)
      });

      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setCurrentPage('dashboard');
        setAuthForm({ email: '', password: '', full_name: '', phone: '', role: 'freelancer' });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert(`${authMode === 'login' ? 'Login' : 'Registration'} failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('landing');
  };

  const fetchJobs = async () => {
    try {
      const data = await apiCall('/api/jobs');
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const data = await apiCall('/api/jobs/my');
      setMyJobs(data);
    } catch (error) {
      console.error('Error fetching my jobs:', error);
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
      fetchMyJobs();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    setLoading(true);
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
      fetchJobs();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        skills: profileForm.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        experience: profileForm.experience,
        hourly_rate: parseFloat(profileForm.hourly_rate),
        bio: profileForm.bio,
        portfolio_links: profileForm.portfolio_links.split(',').map(link => link.trim()).filter(link => link)
      };

      await apiCall('/api/freelancer/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      alert('Profile updated successfully!');
      const updatedUser = { ...user, profile_completed: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitSupport = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall('/api/support', {
        method: 'POST',
        body: JSON.stringify(supportForm)
      });

      alert('Support ticket submitted successfully! We\'ll get back to you soon.');
      setSupportForm({ name: '', email: '', message: '' });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobApplications = async (jobId) => {
    try {
      const data = await apiCall(`/api/jobs/${jobId}/applications`);
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedJob) return;

    try {
      await apiCall('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          job_id: selectedJob.id,
          receiver_id: user.role === 'client' ? selectedJob.freelancer_id : selectedJob.client_id,
          content: newMessage
        })
      });

      setNewMessage('');
      fetchMessages(selectedJob.id);
    } catch (error) {
      alert(error.message);
    }
  };

  const fetchMessages = async (jobId) => {
    try {
      const data = await apiCall(`/api/messages/${jobId}`);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Handle register page navigation
  const handleRegisterNavigation = (destination) => {
    if (destination === 'login') {
      setCurrentPage('login');
    } else if (destination === 'landing') {
      setCurrentPage('landing');
    }
  };

  // Handle login page navigation
  const handleLoginNavigation = (destination) => {
    if (destination === 'register') {
      setCurrentPage('register');
    } else if (destination === 'landing') {
      setCurrentPage('landing');
    }
  };

  // Handle successful login
  const handleLoginSuccess = (userData, role) => {
    setUser(userData);
    
    // Redirect based on role to appropriate dashboard
    if (role === 'freelancer') {
      setCurrentPage('freelancer-dashboard');
    } else if (role === 'client') {
      setCurrentPage('client-dashboard');
    } else if (role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('dashboard');
    }
  };

  // Handle successful registration
  const handleRegisterSuccess = (userData, role) => {
    setUser(userData);
    
    // Redirect based on role
    if (role === 'freelancer') {
      setCurrentPage('freelancer-profile-setup');
    } else if (role === 'client') {
      setCurrentPage('post-job');
    } else {
      setCurrentPage('dashboard');
    }
  };

  // Handle profile setup completion
  const handleProfileSetupComplete = () => {
    setCurrentPage('dashboard');
  };

  // Handle post job completion
  const handlePostJobComplete = () => {
    setCurrentPage('dashboard');
  };

  // Modern Landing Page - Default when not logged in or explicitly set to 'landing'
  if (currentPage === 'landing' || (!user && !['login', 'register', 'freelancer-profile-setup', 'post-job', 'about', 'contact', 'browse-jobs', 'browse-freelancers', 'how-it-works', 'enterprise'].includes(currentPage))) {
    return (
      <ModernLanding 
        setCurrentPage={handleLandingNavigation}
        setAuthMode={setAuthMode}
        setAuthForm={setAuthForm}
        submitSupport={submitSupport}
        supportForm={supportForm}
        setSupportForm={setSupportForm}
        loading={loading}
      />
    );
  }

  // Login Page
  if (currentPage === 'login') {
    return (
      <Login
        onNavigate={handleLoginNavigation}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  // Register Page
  if (currentPage === 'register') {
    return (
      <Register
        onNavigate={handleRegisterNavigation}
        onRegisterSuccess={handleRegisterSuccess}
      />
    );
  }

  // Freelancer Profile Setup Page
  if (currentPage === 'freelancer-profile-setup') {
    return (
      <FreelancerProfileSetup
        onComplete={handleProfileSetupComplete}
        user={user}
      />
    );
  }

  // Post Job Page
  if (currentPage === 'post-job') {
    return (
      <PostJob
        onComplete={handlePostJobComplete}
        user={user}
      />
    );
  }

  // Role-based Dashboards
  if (currentPage === 'freelancer-dashboard') {
    return (
      <FreelancerDashboard
        user={user}
        onNavigate={setCurrentPage}
        onLogout={logout}
      />
    );
  }

  if (currentPage === 'client-dashboard') {
    return (
      <ClientDashboard
        user={user}
        onNavigate={setCurrentPage}
        onLogout={logout}
      />
    );
  }

  if (currentPage === 'admin-dashboard') {
    return (
      <AdminDashboard
        user={user}
        onNavigate={setCurrentPage}
        onLogout={logout}
      />
    );
  }

  // About Page
  if (currentPage === 'about') {
    return (
      <About onNavigate={setCurrentPage} />
    );
  }

  // Contact Page
  if (currentPage === 'contact') {
    return (
      <Contact onNavigate={setCurrentPage} />
    );
  }

  // Browse Jobs Page
  if (currentPage === 'browse-jobs') {
    return (
      <BrowseJobs onNavigate={setCurrentPage} />
    );
  }

  // Browse Freelancers Page
  if (currentPage === 'browse-freelancers') {
    return (
      <BrowseFreelancers onNavigate={setCurrentPage} />
    );
  }

  // How It Works Page
  if (currentPage === 'how-it-works') {
    return (
      <HowItWorks onNavigate={setCurrentPage} />
    );
  }

  // Enterprise Page
  if (currentPage === 'enterprise') {
    return (
      <Enterprise onNavigate={setCurrentPage} />
    );
  }

  // Main Dashboard
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
            <div className="flex space-x-4">
              <Button
                variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('dashboard')}
                className={currentPage === 'dashboard' ? 'bg-gradient-to-r from-yellow-400 to-green-500 text-black font-semibold' : 'text-gray-300 hover:text-white hover:bg-white/5'}
              >
                Dashboard
              </Button>
              <Button
                variant={currentPage === 'jobs' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('jobs')}
                className={currentPage === 'jobs' ? 'bg-gradient-to-r from-yellow-400 to-green-500 text-black font-semibold' : 'text-gray-300 hover:text-white hover:bg-white/5'}
              >
                {user?.role === 'client' ? 'Browse Freelancers' : 'Browse Jobs'}
              </Button>
              <Button
                variant={currentPage === 'profile' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('profile')}
                className={currentPage === 'profile' ? 'bg-gradient-to-r from-yellow-400 to-green-500 text-black font-semibold' : 'text-gray-300 hover:text-white hover:bg-white/5'}
              >
                Profile
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage('messages')}
              className="text-gray-300 hover:text-yellow-400 hover:bg-white/5"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-yellow-400 hover:bg-white/5">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/90 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Contact Support</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitSupport} className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    value={supportForm.name}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, name: e.target.value }))}
                    className="auth-input"
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={supportForm.email}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                    className="auth-input"
                    required
                  />
                  <Textarea
                    placeholder="How can we help?"
                    value={supportForm.message}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                    className="auth-input resize-none"
                    required
                  />
                  <Button type="submit" className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold btn-glow" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-green-500 text-black font-semibold">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-white">{user?.full_name}</span>
              <Button variant="ghost" size="icon" onClick={logout} className="text-gray-300 hover:text-red-400 hover:bg-white/5">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {currentPage === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.full_name}!
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'client' ? 'Manage your projects and find talented freelancers' : 'Discover new opportunities and manage your applications'}
              </p>
            </div>

            {user?.role === 'client' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plus className="mr-2 w-5 h-5" />
                    Post a New Job
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createJob} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Job Title"
                        value={jobForm.title}
                        onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                      <Input
                        placeholder="Category (e.g., Web Development, Design)"
                        value={jobForm.category}
                        onChange={(e) => setJobForm(prev => ({ ...prev, category: e.target.value }))}
                        required
                      />
                    </div>
                    <Textarea
                      placeholder="Job Description"
                      value={jobForm.description}
                      onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Budget (R)"
                        value={jobForm.budget}
                        onChange={(e) => setJobForm(prev => ({ ...prev, budget: e.target.value }))}
                        required
                      />
                      <select
                        value={jobForm.budget_type}
                        onChange={(e) => setJobForm(prev => ({ ...prev, budget_type: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="fixed">Fixed Price</option>
                        <option value="hourly">Hourly Rate</option>
                      </select>
                    </div>
                    <Textarea
                      placeholder="Requirements (comma-separated)"
                      value={jobForm.requirements}
                      onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                      rows={2}
                    />
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? 'Posting...' : 'Post Job'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>
                  {user?.role === 'client' ? 'Your Posted Jobs' : 'Your Applications'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myJobs.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    {user?.role === 'client' ? 'No jobs posted yet.' : 'No applications yet.'}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {myJobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              <p className="text-gray-600 text-sm mb-2">{job.description.substring(0, 150)}...</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  R{job.budget}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {new Date(job.created_at).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {job.applications_count} applications
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
                              {user?.role === 'client' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedJob(job);
                                    fetchJobApplications(job.id);
                                  }}
                                >
                                  View Applications
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'jobs' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === 'client' ? 'Browse Freelancers' : 'Available Jobs'}
            </h1>
            
            <div className="grid gap-6">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                        <p className="text-gray-600 mb-4">{job.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <Badge variant="secondary">{job.category}</Badge>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            R{job.budget} ({job.budget_type})
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {job.applications_count} proposals
                          </span>
                        </div>
                        {job.requirements && job.requirements.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.requirements.map((req, index) => (
                              <Badge key={index} variant="outline">{req}</Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-gray-500">Posted by: {job.client_name}</p>
                      </div>
                      {user?.role === 'freelancer' && (
                        <Button
                          onClick={() => {
                            setSelectedJob(job);
                            setApplicationForm({ proposal: '', bid_amount: '' });
                          }}
                          className="bg-green-600 hover:bg-green-700 ml-4"
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'profile' && user?.role === 'freelancer' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 w-5 h-5" />
                  Complete Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={updateProfile} className="space-y-4">
                  <Textarea
                    placeholder="Skills (comma-separated, e.g., React, Node.js, Python)"
                    value={profileForm.skills}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, skills: e.target.value }))}
                    required
                  />
                  <Textarea
                    placeholder="Experience Description"
                    value={profileForm.experience}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                    rows={3}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Hourly Rate (R)"
                    value={profileForm.hourly_rate}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    required
                  />
                  <Textarea
                    placeholder="Professional Bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    required
                  />
                  <Textarea
                    placeholder="Portfolio Links (comma-separated)"
                    value={profileForm.portfolio_links}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, portfolio_links: e.target.value }))}
                    rows={2}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Job Application Modal - Only show when NOT on landing page */}
      {selectedJob && user?.role === 'freelancer' && currentPage !== 'landing' && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Apply to: {selectedJob.title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={applyToJob} className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Job Details:</h4>
                <p className="text-gray-600 text-sm mb-4">{selectedJob.description}</p>
                <p className="text-sm text-gray-500">Budget: R{selectedJob.budget} ({selectedJob.budget_type})</p>
              </div>
              <Textarea
                placeholder="Write your proposal here..."
                value={applicationForm.proposal}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, proposal: e.target.value }))}
                rows={6}
                required
              />
              <Input
                type="number"
                placeholder="Your bid amount (R)"
                value={applicationForm.bid_amount}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, bid_amount: e.target.value }))}
                required
              />
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedJob(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Applications Modal - Only show when NOT on landing page */}
      {selectedJob && user?.role === 'client' && applications.length > 0 && currentPage !== 'landing' && (
        <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Applications for: {selectedJob.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{app.freelancer_name}</h4>
                        <p className="text-sm text-gray-500">Bid: R{app.bid_amount}</p>
                      </div>
                      <Badge variant={app.status === 'pending' ? 'secondary' : 'default'}>
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{app.proposal}</p>
                    {app.freelancer_profile && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium mb-2">Freelancer Profile:</h5>
                        {app.freelancer_profile.skills && (
                          <div className="mb-2">
                            <span className="text-sm font-medium">Skills: </span>
                            {app.freelancer_profile.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="mr-1">{skill}</Badge>
                            ))}
                          </div>
                        )}
                        <p className="text-sm text-gray-600">{app.freelancer_profile.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default App;
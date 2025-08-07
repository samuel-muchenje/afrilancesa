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
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Categories with real images
const categories = [
  {
    title: "ICT & Digital Work",
    image: "https://images.unsplash.com/photo-1622295023576-e4fb6e9e8ba2",
    count: "2,500+ freelancers"
  },
  {
    title: "Construction & Engineering", 
    image: "https://images.unsplash.com/photo-1489514354504-1653aa90e34e",
    count: "1,800+ freelancers"
  },
  {
    title: "Creative & Media",
    image: "https://images.unsplash.com/photo-1628682814461-c4461c974211",
    count: "3,200+ freelancers"
  },
  {
    title: "Admin & Office Support",
    image: "https://images.unsplash.com/photo-1573496799515-eebbb63814f2",
    count: "1,900+ freelancers"
  },
  {
    title: "Health & Wellness",
    image: "https://images.unsplash.com/photo-1666887360361-d4e8487f0026",
    count: "950+ freelancers"
  },
  {
    title: "Beauty & Fashion",
    image: "https://images.unsplash.com/photo-1602728114068-25257aedd285",
    count: "1,200+ freelancers"
  },
  {
    title: "Logistics & Labour",
    image: "https://images.unsplash.com/photo-1599984280836-d48d3eedee0b",
    count: "2,100+ freelancers"
  },
  {
    title: "Education & Training",
    image: "https://images.unsplash.com/photo-1667844141324-61585c18b0df",
    count: "1,500+ freelancers"
  },
  {
    title: "Home & Domestic Services",
    image: "https://images.pexels.com/photos/6969943/pexels-photo-6969943.jpeg",
    count: "800+ freelancers"
  }
];

// Featured freelancers
const featuredFreelancers = [
  {
    name: "Thabo Mthembu",
    profession: "Full-Stack Developer",
    image: "https://images.unsplash.com/photo-1622295023576-e4fb6e9e8ba2",
    rating: 4.9,
    tagline: "I build fast, scalable web apps",
    price: "R500",
    reviews: 127
  },
  {
    name: "Nomsa Dlamini",
    profession: "Digital Marketing Expert",
    image: "https://images.unsplash.com/photo-1623013736455-1b8d79cc0b5f",
    rating: 4.8,
    tagline: "Grow your business online",
    price: "R350",
    reviews: 98
  },
  {
    name: "Sipho Ngubane",
    profession: "Construction Project Manager",
    image: "https://images.unsplash.com/photo-1489514354504-1653aa90e34e",
    rating: 4.9,
    tagline: "Quality builds, on time delivery",
    price: "R800",
    reviews: 156
  },
  {
    name: "Keabetswe Mokoena",
    profession: "Graphic Designer",
    image: "https://images.unsplash.com/photo-1628682814461-c4461c974211",
    rating: 4.7,
    tagline: "Creative designs that convert",
    price: "R300",
    reviews: 89
  },
  {
    name: "Lindiwe Zulu",
    profession: "Healthcare Consultant",
    image: "https://images.unsplash.com/photo-1666887360476-7eaa054d1abd",
    rating: 4.9,
    tagline: "Professional healthcare advice",
    price: "R450",
    reviews: 203
  }
];

// Testimonials
const testimonials = [
  {
    name: "David Chen",
    role: "Small Business Owner",
    image: "https://images.unsplash.com/photo-1581368076903-c20fee986735",
    quote: "Found an amazing web developer through Afrilance. My online sales increased by 300% in just 3 months!"
  },
  {
    name: "Sarah Williams",
    role: "Marketing Manager",
    image: "https://images.unsplash.com/photo-1551693886-e05efa0d1216",
    quote: "The quality of freelancers on Afrilance is incredible. Always professional, always delivering on time."
  },
  {
    name: "Mandla Sibeko",
    role: "Civil Engineer",
    image: "https://images.unsplash.com/photo-1552392820-6653a945a7b4",
    quote: "As a freelancer, Afrilance connected me with clients I never would have reached. Game changer for my business."
  }
];

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentFreelancerIndex, setCurrentFreelancerIndex] = useState(0);

  // Auth forms
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    full_name: '',
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
        setAuthForm({ email: '', password: '', full_name: '', role: 'freelancer' });
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

  // Modern Landing Page Component
  if (currentPage === 'landing') {
    return (
      <div className="modern-landing">
        {/* Navigation */}
        <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-lg border-b border-gray-800 z-50">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-green-500 rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">AFRILANCE</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setCurrentPage('auth')}
                className="text-white hover:text-yellow-400 hover:bg-white/5"
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  setAuthMode('register');
                  setCurrentPage('auth');
                }}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-6"
              >
                Get Started
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="hero-section min-h-screen bg-black flex items-center relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="floating-shape shape-1"></div>
            <div className="floating-shape shape-2"></div>
            <div className="floating-shape shape-3"></div>
          </div>
          
          <div className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="text-left">
              <div className="mb-6">
                <span className="text-yellow-400 font-semibold text-lg tracking-wider">INTRODUCING</span>
              </div>
              <h1 className="hero-title text-white mb-8">
                SA'S FIRST<br />
                FREE LANCING<br />
                <span className="text-gradient">TOOL</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                The future of freelance in Africa starts here
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthForm(prev => ({ ...prev, role: 'client' }));
                    setCurrentPage('auth');
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-bold px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all"
                >
                  Start Hiring
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthForm(prev => ({ ...prev, role: 'freelancer' }));
                    setCurrentPage('auth');
                  }}
                  className="border-2 border-white/30 text-white hover:bg-white/5 hover:border-yellow-400 px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all"
                >
                  Join as a Freelancer
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="animated-graphic">
                <svg viewBox="0 0 400 400" className="w-full h-auto">
                  <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F6E96B" />
                      <stop offset="25%" stopColor="#BEDC74" />
                      <stop offset="50%" stopColor="#A2CA71" />
                      <stop offset="100%" stopColor="#387F39" />
                    </linearGradient>
                  </defs>
                  <path className="floating-path" d="M100,200 Q200,100 300,200 T500,200" stroke="url(#gradient1)" strokeWidth="8" fill="none" opacity="0.6" />
                  <path className="floating-path delay-1" d="M80,220 Q180,120 280,220 T480,220" stroke="url(#gradient1)" strokeWidth="6" fill="none" opacity="0.4" />
                  <path className="floating-path delay-2" d="M120,180 Q220,80 320,180 T520,180" stroke="url(#gradient1)" strokeWidth="4" fill="none" opacity="0.3" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Categories Section */}
        <section className="py-20 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Find Talent Across All Industries</h2>
              <p className="text-xl text-gray-300">Real professionals, real results</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="category-card relative h-64 rounded-2xl overflow-hidden cursor-pointer group transform hover:scale-105 transition-all duration-300"
                  style={{
                    backgroundImage: `linear-gradient(45deg, rgba(0,0,0,0.7), rgba(56,127,57,0.3)), url(${category.image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                    <p className="text-yellow-400 text-sm">{category.count}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Freelancers */}
        <section className="py-20 bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Featured Freelancers</h2>
              <p className="text-xl text-gray-300">Talent you can trust</p>
            </div>
            <div className="relative">
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {featuredFreelancers.map((freelancer, index) => (
                  <div key={index} className="flex-shrink-0 w-80">
                    <Card className="bg-black/50 border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <img
                            src={freelancer.image}
                            alt={freelancer.name}
                            className="w-16 h-16 rounded-full object-cover mr-4"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-white">{freelancer.name}</h3>
                            <p className="text-gray-400">{freelancer.profession}</p>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-yellow-400 ml-1">{freelancer.rating}</span>
                              <span className="text-gray-500 ml-2">({freelancer.reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-4 italic">"{freelancer.tagline}"</p>
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 font-semibold">From {freelancer.price}/hr</span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                            onClick={() => {
                              setAuthMode('register');
                              setAuthForm(prev => ({ ...prev, role: 'client' }));
                              setCurrentPage('auth');
                            }}
                          >
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

  if (currentPage === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold text-green-800">Afrilance</span>
            </div>
            <CardTitle className="text-2xl text-green-800">
              {authMode === 'login' ? 'Welcome Back' : 'Join Afrilance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <Input
                    placeholder="Full Name"
                    value={authForm.full_name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, full_name: e.target.value }))}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="freelancer"
                          checked={authForm.role === 'freelancer'}
                          onChange={(e) => setAuthForm(prev => ({ ...prev, role: e.target.value }))}
                          className="mr-2"
                        />
                        Freelancer
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="client"
                          checked={authForm.role === 'client'}
                          onChange={(e) => setAuthForm(prev => ({ ...prev, role: e.target.value }))}
                          className="mr-2"
                        />
                        Client
                      </label>
                    </div>
                  </div>
                </>
              )}
              <Input
                type="email"
                placeholder="Email"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={loading}
              >
                {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
              </Button>
            </form>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="text-green-600 hover:underline"
              >
                {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage('landing')}
                className="text-gray-600"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-xl font-bold text-green-800">Afrilance</span>
            </div>
            <div className="flex space-x-4">
              <Button
                variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('dashboard')}
                className={currentPage === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-600'}
              >
                Dashboard
              </Button>
              <Button
                variant={currentPage === 'jobs' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('jobs')}
                className={currentPage === 'jobs' ? 'bg-green-600 text-white' : 'text-gray-600'}
              >
                {user?.role === 'client' ? 'Browse Freelancers' : 'Browse Jobs'}
              </Button>
              <Button
                variant={currentPage === 'profile' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('profile')}
                className={currentPage === 'profile' ? 'bg-green-600 text-white' : 'text-gray-600'}
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
              className="text-gray-600 hover:text-green-600"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-green-600">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Contact Support</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitSupport} className="space-y-4">
                  <Input
                    placeholder="Your Name"
                    value={supportForm.name}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={supportForm.email}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                  <Textarea
                    placeholder="How can we help?"
                    value={supportForm.message}
                    onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <div className="flex items-center space-x-2">
              <Avatar>
                <AvatarFallback className="bg-green-100 text-green-600">
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{user?.full_name}</span>
              <Button variant="ghost" size="icon" onClick={logout} className="text-gray-600 hover:text-red-600">
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

      {/* Job Application Modal */}
      {selectedJob && user?.role === 'freelancer' && (
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

      {/* Applications Modal */}
      {selectedJob && user?.role === 'client' && applications.length > 0 && (
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
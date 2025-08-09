import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { 
  Shield, Smartphone, Globe, CreditCard, Play, Star, Quote,
  CheckCircle, Users, Briefcase, ArrowRight, X, Search
} from 'lucide-react';

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

// Testimonials
const testimonials = [
  {
    name: "Pieter van der Merwe",
    role: "CEO, Cape Town Logistics",
    image: "https://images.unsplash.com/photo-1581368076903-c20fee986735?w=150&h=150&fit=crop&crop=face",
    quote: "Found an exceptional mobile app developer through Afrilance. Our delivery tracking system increased efficiency by 40% and customer satisfaction is at an all-time high."
  },
  {
    name: "Priya Patel",
    role: "Marketing Director, Durban Tourism",
    image: "https://images.unsplash.com/photo-1551693886-e05efa0d1216?w=150&h=150&fit=crop&crop=face",
    quote: "The digital marketing specialist we hired through Afrilance transformed our online presence. Tourist inquiries increased by 250% in just 6 months."
  },
  {
    name: "Lebohang Motsepe",
    role: "Founder, Johannesburg Tech Hub",
    image: "https://images.unsplash.com/photo-1552392820-6653a945a7b4?w=150&h=150&fit=crop&crop=face",
    quote: "As a client, Afrilance connected me with top-tier South African developers. The quality and professionalism exceeded all expectations."
  },
  {
    name: "Amara Okafor",
    role: "Restaurant Owner, Lagos",
    image: "https://images.unsplash.com/photo-1594736797933-d0201ba2fe65?w=150&h=150&fit=crop&crop=face",
    quote: "The graphic designer I hired created an amazing brand identity for my restaurant. Revenue increased by 180% after our rebrand launch."
  }
];

const ModernLanding = ({ 
  setCurrentPage, 
  setAuthMode, 
  setAuthForm, 
  submitSupport, 
  supportForm, 
  setSupportForm, 
  loading 
}) => {
  const [ctaBarVisible, setCtaBarVisible] = useState(false); // Start hidden by default
  const [featuredFreelancers, setFeaturedFreelancers] = useState([]);
  const [loadingFreelancers, setLoadingFreelancers] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Add search query state
  const [categoryCounts, setCategoryCounts] = useState({}); // Add category counts state
  
  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  // Fetch featured freelancers on component mount
  useEffect(() => {
    fetchFeaturedFreelancers();
  }, []);
  
  const fetchFeaturedFreelancers = async () => {
    try {
      setLoadingFreelancers(true);
      const response = await fetch(`${API_BASE}/api/freelancers/featured`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured freelancers');
      }
      
      const data = await response.json();
      setFeaturedFreelancers(data);
      
    } catch (error) {
      console.error('Error fetching featured freelancers:', error);
      // Fallback to static data if API fails
      setFeaturedFreelancers([
        {
          id: "fallback-1",
          full_name: "Thabo Mthembu", 
          profile: {
            profession: "Full-Stack Developer",
            hourly_rate: 850,
            bio: "Building scalable web applications for South African startups and enterprises",
            rating: 4.9,
            total_reviews: 127,
            profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
          }
        }
      ]);
    } finally {
      setLoadingFreelancers(false);
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  // Handle search functionality
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setCurrentPage(`browse-freelancers-search-${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle category navigation
  const handleCategoryClick = (category) => {
    const categorySlug = category.title.replace(/\s+/g, '-').toLowerCase();
    setCurrentPage(`browse-freelancers-${categorySlug}`);
  };
  return (
    <div className="modern-landing">
      {/* Animated Background Effects */}
      <div className="floating-shapes">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
        <div className="floating-shape shape-6"></div>
      </div>
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
              alt="Afrilance" 
              className="h-10 w-auto afrilance-logo"
            />
          </div>
          
          {/* Center - Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search freelancers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('for-freelancers')}
              className="text-white hover:text-yellow-400 hover:bg-white/5"
            >
              For Freelancers
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('admin')}
              className="text-white hover:text-red-400 hover:bg-white/5"
            >
              Admin
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage('login')}
              className="text-white hover:text-yellow-400 hover:bg-white/5"
            >
              Sign In
            </Button>
            <Button
              onClick={() => {
                setCurrentPage('register');
              }}
              className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-6"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="hero-section min-h-screen bg-black flex items-center relative overflow-hidden pt-20 animated-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-left">
            <div className="mb-6">
              <span className="text-yellow-400 font-semibold text-lg tracking-wider pulse-animation">INTRODUCING</span>
            </div>
            <h1 className="hero-title text-white mb-8">
              SA'S FIRST<br />
              FREE LANCING<br />
              <span className="gradient-text">TOOL</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              The future of freelance in Africa starts here
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => {
                  setCurrentPage('register');
                }}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-bold px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all btn-glow glow"
              >
                Start Hiring
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setCurrentPage('register');
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
          <div className="text-center mb-16 section-animate">
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
                onClick={() => handleCategoryClick(category)}
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
          <div className="text-center mb-16 section-animate">
            <h2 className="text-4xl font-bold text-white mb-6">Featured Freelancers</h2>
            <p className="text-xl text-gray-300">Talent you can trust</p>
          </div>
          <div className="relative">
            {loadingFreelancers ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading featured freelancers...</p>
              </div>
            ) : (
              <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
                {featuredFreelancers.map((freelancer, index) => (
                  <div key={freelancer.id || index} className="flex-shrink-0 w-80">
                    <Card className="bg-black/50 border-gray-700 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20 card-hover-effect">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <img
                            src={freelancer.profile?.profile_image || freelancer.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                            alt={freelancer.full_name || freelancer.name}
                            className="w-16 h-16 rounded-full object-cover mr-4"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face";
                            }}
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-white">{freelancer.full_name || freelancer.name}</h3>
                            <p className="text-gray-400">{freelancer.profile?.profession || freelancer.profession}</p>
                            <div className="flex items-center mt-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-yellow-400 ml-1">{freelancer.profile?.rating || freelancer.rating}</span>
                              <span className="text-gray-500 ml-2">({freelancer.profile?.total_reviews || freelancer.reviews} reviews)</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-4 italic">"{freelancer.profile?.bio || freelancer.tagline}"</p>
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 font-semibold">
                            From {formatCurrency(freelancer.profile?.hourly_rate || parseInt(freelancer.price?.replace('R', '')) || 500)}/hr
                          </span>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold btn-glow"
                            onClick={() => setCurrentPage('register')}
                          >
                            View Profile
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-black how-it-works-bg">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 section-animate">
            <h2 className="text-4xl font-bold text-white mb-6">How Afrilance Works</h2>
            <p className="text-xl text-gray-300">Simple steps to success</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16">
            {/* For Clients */}
            <div className="section-animate">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">For Clients</h3>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center font-bold text-black">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Post a Job or Browse Services</h4>
                    <p className="text-gray-300">Describe your project and let talented freelancers come to you, or browse our service marketplace.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center font-bold text-black">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Choose a Verified Freelancer</h4>
                    <p className="text-gray-300">Review proposals, check ratings and portfolios, then select the perfect freelancer for your project.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center font-bold text-black">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Pay via Escrow & Track Progress</h4>
                    <p className="text-gray-300">Your payment is protected until work is completed to your satisfaction. Track progress in real-time.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Freelancers */}
            <div className="section-animate">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">For Freelancers</h3>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-400 rounded-full flex items-center justify-center font-bold text-black">1</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Set up a Verified Profile</h4>
                    <p className="text-gray-300">Showcase your skills, experience, and portfolio. Get verified to build trust with potential clients.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-400 rounded-full flex items-center justify-center font-bold text-black">2</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Apply for Jobs or List Fixed Services</h4>
                    <p className="text-gray-300">Browse thousands of projects or create service listings for clients to purchase directly.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-400 rounded-full flex items-center justify-center font-bold text-black">3</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Get Paid Securely</h4>
                    <p className="text-gray-300">Complete your work and get paid through our secure payment system. Build your reputation with every project.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Afrilance Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 section-animate">
            <h2 className="text-4xl font-bold text-white mb-6">Why Afrilance</h2>
            <p className="text-xl text-gray-300">Built for Africa</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center benefit-card">
              <div className="mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1666887360476-7eaa054d1abd" 
                  alt="Verified Talent" 
                  className="benefit-image w-full mx-auto"
                />
              </div>
              <div className="flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-green-400 mr-3" />
                <h3 className="text-xl font-bold text-white">Verified Talent</h3>
              </div>
              <p className="text-gray-300">Every freelancer undergoes thorough verification including ID checks and skill assessments.</p>
            </div>

            <div className="text-center benefit-card">
              <div className="mb-6">
                <img 
                  src="https://images.pexels.com/photos/6969943/pexels-photo-6969943.jpeg" 
                  alt="Safe Payments" 
                  className="benefit-image w-full mx-auto"
                />
              </div>
              <div className="flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-yellow-400 mr-3" />
                <h3 className="text-xl font-bold text-white">Safe Payments via Escrow</h3>
              </div>
              <p className="text-gray-300">Your money is protected with our escrow system and mobile money integration.</p>
            </div>

            <div className="text-center benefit-card">
              <div className="mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1599984280836-d48d3eedee0b" 
                  alt="Mobile Platform" 
                  className="benefit-image w-full mx-auto"
                />
              </div>
              <div className="flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8 text-green-400 mr-3" />
                <h3 className="text-xl font-bold text-white">Mobile-Friendly Platform</h3>
              </div>
              <p className="text-gray-300">Work on the go with our mobile-optimized platform designed for African connectivity.</p>
            </div>

            <div className="text-center benefit-card">
              <div className="mb-6">
                <img 
                  src="https://images.unsplash.com/photo-1628682814461-c4461c974211" 
                  alt="All Industries" 
                  className="benefit-image w-full mx-auto"
                />
              </div>
              <div className="flex items-center justify-center mb-4">
                <Globe className="w-8 h-8 text-yellow-400 mr-3" />
                <h3 className="text-xl font-bold text-white">All Industries Welcome</h3>
              </div>
              <p className="text-gray-300">From tech to construction, creative to domestic - we support all types of freelance work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 section-animate">
            <h2 className="text-4xl font-bold text-white mb-6">What Our Community Says</h2>
            <p className="text-xl text-gray-300">Real stories from real users</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card p-6">
                <Quote className="w-8 h-8 text-yellow-400 mb-4" />
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Promo */}
      <section className="py-20 bg-gray-900 mobile-app-bg">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 section-animate">
            <h2 className="text-4xl font-bold text-white mb-6">Take Afrilance Everywhere</h2>
            <p className="text-xl text-gray-300">Download our mobile app for on-the-go freelancing</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Manage Projects On-the-Go</h3>
                  <p className="text-gray-300">Stay connected with clients and manage your freelance business from anywhere.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Instant Notifications</h3>
                  <p className="text-gray-300">Get notified immediately when new opportunities match your skills.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="w-6 h-6 text-green-400 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Offline Capability</h3>
                  <p className="text-gray-300">Work on your profiles and proposals even when connectivity is limited.</p>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-6">
                <Button
                  className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-6 py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Get it on Google Play
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-3"
                  disabled
                >
                  Coming Soon on iOS
                </Button>
              </div>
            </div>
            
            <div className="flex justify-center space-x-8">
              <div className="phone-mockup p-4 w-48">
                <div className="bg-gray-800 rounded-2xl h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <p className="text-white text-sm">Freelancer Dashboard</p>
                  </div>
                </div>
              </div>
              <div className="phone-mockup p-4 w-48">
                <div className="bg-gray-800 rounded-2xl h-96 flex items-center justify-center">
                  <div className="text-center">
                    <Briefcase className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-white text-sm">Client Interface</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Form */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 section-animate">
              <h2 className="text-4xl font-bold text-white mb-6">Get Support</h2>
              <p className="text-xl text-gray-300">We're here to help you succeed</p>
            </div>
            <Card className="bg-black/50 border-gray-700">
              <CardContent className="p-8">
                <form onSubmit={submitSupport} className="space-y-6">
                  <div>
                    <Input
                      placeholder="Your Name"
                      value={supportForm.name}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, name: e.target.value }))}
                      className="auth-input"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={supportForm.email}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                      className="auth-input"
                      required
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="How can we help you?"
                      value={supportForm.message}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="auth-input resize-none"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold py-3 btn-glow"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sticky CTA Footer */}
      {ctaBarVisible && (
        <div className="sticky-cta">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white font-semibold">Ready to Find Africa's Best Freelancers or Start Selling Your Skills?</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={() => {
                      setCurrentPage('register');
                    }}
                    className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                  >
                    Hire Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentPage('register');
                    }}
                    className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                  >
                    Join Afrilance
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCtaBarVisible(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/10 ml-4"
                  title="Close this notification"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer-modern py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
                  alt="Afrilance" 
                  className="h-12 w-auto afrilance-logo"
                />
              </div>
              <p className="text-gray-400 mb-4">Connecting Africa's talent with opportunities worldwide.</p>
              <div className="flex space-x-4">
                {/* Social media icons would go here */}
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentPage('about')} className="footer-link text-left hover:text-yellow-400 transition-colors">About</button></li>
                <li><button onClick={() => setCurrentPage('careers')} className="footer-link text-left hover:text-yellow-400 transition-colors">Careers</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="footer-link text-left hover:text-yellow-400 transition-colors">Contact</button></li>
                <li><button onClick={() => setCurrentPage('press')} className="footer-link text-left hover:text-yellow-400 transition-colors">Press</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">For Freelancers</h3>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentPage('how-to-join')} className="footer-link text-left hover:text-yellow-400 transition-colors">How to Join</button></li>
                <li><button onClick={() => setCurrentPage('create-profile')} className="footer-link text-left hover:text-yellow-400 transition-colors">Create a Profile</button></li>
                <li><button onClick={() => setCurrentPage('get-verified')} className="footer-link text-left hover:text-yellow-400 transition-colors">Get Verified</button></li>
                <li><button onClick={() => setCurrentPage('success-stories')} className="footer-link text-left hover:text-yellow-400 transition-colors">Success Stories</button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">For Clients</h3>
              <ul className="space-y-2">
                <li><button onClick={() => setCurrentPage('how-it-works')} className="footer-link text-left hover:text-yellow-400 transition-colors">How It Works</button></li>
                <li><button onClick={() => setCurrentPage('browse-freelancers')} className="footer-link text-left hover:text-yellow-400 transition-colors">Browse Freelancers</button></li>
                <li><button onClick={() => setCurrentPage('contact')} className="footer-link text-left hover:text-yellow-400 transition-colors">Support</button></li>
                <li><button onClick={() => setCurrentPage('enterprise')} className="footer-link text-left hover:text-yellow-400 transition-colors">Enterprise</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2025 Afrilance. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <button onClick={() => setCurrentPage('contact')} className="footer-link text-sm">Privacy Policy</button>
                <button onClick={() => setCurrentPage('contact')} className="footer-link text-sm">Terms of Service</button>
                <button onClick={() => setCurrentPage('contact')} className="footer-link text-sm">Cookie Policy</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLanding;
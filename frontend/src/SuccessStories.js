import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ArrowLeft, Star, Trophy, TrendingUp, Users, Quote, Calendar, MapPin, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

const SuccessStories = ({ onNavigate }) => {
  const featuredStories = [
    {
      name: "Thabo Mthembu",
      profession: "Full-Stack Developer",
      location: "Cape Town, SA",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      totalEarnings: "R850,000",
      projectsCompleted: 127,
      joinDate: "March 2023",
      specialization: "React & Node.js Development",
      story: "I was working a 9-5 job earning R25,000 per month when I discovered Afrilance. Within 6 months, I was earning more than my full-time salary just from freelancing. Now I run my own development agency and employ 3 other developers.",
      achievements: [
        "Increased income by 300% in first year",
        "Built long-term relationships with 15+ clients",
        "Top-rated developer for 8 consecutive months",
        "Featured in Afrilance success showcase"
      ],
      testimonial: "Afrilance gave me the platform to showcase my skills to premium clients. The verification process built trust, and the escrow system gave me confidence in getting paid.",
      beforeAfter: {
        before: "R25,000/month • 9-5 employee • Limited growth opportunities",
        after: "R70,000+/month • Business owner • Complete work flexibility"
      }
    },
    {
      name: "Naledi Motaung",
      profession: "Digital Marketing Specialist",
      location: "Johannesburg, SA",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b5da8fb2?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      totalEarnings: "R620,000",
      projectsCompleted: 89,
      joinDate: "June 2023",
      specialization: "Social Media & Content Marketing",
      story: "As a single mother, I needed flexible work that paid well. Afrilance allowed me to work from home while caring for my daughter. I've grown from basic social media management to full marketing strategy consulting.",
      achievements: [
        "Grew client base from 0 to 25+ recurring clients",
        "Achieved 98% client satisfaction rate",
        "Specialized in e-commerce marketing with 400% ROI",
        "Mentored 12 new freelancers on the platform"
      ],
      testimonial: "The flexibility to work around my family schedule while earning excellent income has been life-changing. Afrilance's client matching system helped me find my ideal clients.",
      beforeAfter: {
        before: "Unemployed • Looking for flexible work • R0 income",
        after: "R45,000+/month • 25+ clients • Work-life balance achieved"
      }
    },
    {
      name: "Sipho Ndlovu",
      profession: "Graphic Designer & Illustrator",
      location: "Durban, SA",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      totalEarnings: "R490,000",
      projectsCompleted: 156,
      joinDate: "January 2023",
      specialization: "Brand Identity & Logo Design",
      story: "I started freelancing as a side hustle while studying. Now I'm a full-time designer working with international brands. Afrilance helped me build a portfolio and gain the confidence to charge premium rates.",
      achievements: [
        "Designed logos for 50+ South African businesses",
        "Created brand identities for 3 international companies",
        "Won 'Designer of the Month' 4 times",
        "Built passive income through design templates"
      ],
      testimonial: "The platform's portfolio showcase feature was crucial for attracting high-end clients. I went from R500 logos to R15,000 brand identity packages in just 8 months.",
      beforeAfter: {
        before: "Student • R500/logo • No professional experience",
        after: "Professional designer • R15,000/project • International clients"
      }
    }
  ];

  const quickWins = [
    {
      name: "Amara Johnson",
      profession: "Content Writer",
      timeToSuccess: "2 weeks",
      achievement: "First R5,000 project within 14 days of joining",
      tip: "Completed all skill assessments and had detailed portfolio samples ready"
    },
    {
      name: "Marcus van der Merwe",
      profession: "Data Analyst",
      timeToSuccess: "1 month",
      achievement: "Secured R15,000 monthly retainer client",
      tip: "Focused on niche specialization in financial data analysis"
    },
    {
      name: "Fatima Al-Rashid", 
      profession: "Social Media Manager",
      timeToSuccess: "3 weeks",
      achievement: "Built recurring revenue of R12,000/month",
      tip: "Offered package deals instead of hourly rates for social media management"
    },
    {
      name: "David Khoza",
      profession: "Mobile App Developer",
      timeToSuccess: "6 weeks",
      achievement: "Completed R45,000 app development project",
      tip: "Created detailed project proposals with mockups and technical specifications"
    }
  ];

  const successMetrics = [
    {
      metric: "Average Income Increase",
      value: "185%",
      description: "within first 12 months",
      icon: TrendingUp
    },
    {
      metric: "Client Satisfaction Rate",
      value: "96%",
      description: "across all verified freelancers",
      icon: Star
    },
    {
      metric: "Project Success Rate",
      value: "94%",
      description: "completed successfully",
      icon: CheckCircle
    },
    {
      metric: "Time to First Project",
      value: "8 days",
      description: "average for verified freelancers",
      icon: Calendar
    }
  ];

  const categories = [
    { category: "Development", avgEarnings: "R65,000/month", topEarner: "R125,000/month" },
    { category: "Design", avgEarnings: "R42,000/month", topEarner: "R89,000/month" },
    { category: "Marketing", avgEarnings: "R38,000/month", topEarner: "R78,000/month" },
    { category: "Writing", avgEarnings: "R28,000/month", topEarner: "R65,000/month" },
    { category: "Data Analysis", avgEarnings: "R55,000/month", topEarner: "R98,000/month" },
    { category: "Consulting", avgEarnings: "R72,000/month", topEarner: "R150,000/month" }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => onNavigate('for-freelancers')}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to For Freelancers
            </Button>
            <img 
              src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
              alt="Afrilance" 
              className="h-8 w-auto afrilance-logo"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate('login')}
              className="text-white hover:text-yellow-400 hover:bg-white/5"
            >
              Sign In
            </Button>
            <Button
              onClick={() => onNavigate('register')}
              className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-6"
            >
              Start Your Story
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="bg-purple-400/10 text-purple-400 border-purple-400/20 px-4 py-2 text-sm font-medium mb-6">
              SUCCESS STORIES
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              Real People, <span className="text-gradient">Real Success</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Discover how South African freelancers are building successful careers, 
              increasing their income, and achieving work-life balance on Afrilance.
            </p>
          </div>

          {/* Success Metrics */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            {successMetrics.map((metric, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <metric.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{metric.value}</h3>
                  <p className="text-gray-300 font-medium">{metric.metric}</p>
                  <p className="text-gray-400 text-sm mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Featured Success Stories */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Featured Success Stories</h2>
              <p className="text-gray-300">Meet some of our most successful freelancers and learn from their journeys.</p>
            </div>

            <div className="space-y-12">
              {featuredStories.map((story, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Profile Section */}
                      <div className="text-center lg:text-left">
                        <img
                          src={story.avatar}
                          alt={story.name}
                          className="w-32 h-32 rounded-full mx-auto lg:mx-0 mb-6 object-cover"
                        />
                        <h3 className="text-2xl font-bold text-white mb-2">{story.name}</h3>
                        <p className="text-yellow-400 font-medium mb-1">{story.profession}</p>
                        <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-400 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{story.location}</span>
                        </div>
                        
                        {/* Stats */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <span className="text-gray-300">Rating</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-white font-semibold">{story.rating}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <span className="text-gray-300">Total Earned</span>
                            <span className="text-green-400 font-semibold">{story.totalEarnings}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <span className="text-gray-300">Projects</span>
                            <span className="text-blue-400 font-semibold">{story.projectsCompleted}</span>
                          </div>
                        </div>

                        <Badge className="bg-purple-400/10 text-purple-400 border-purple-400/20">
                          Joined {story.joinDate}
                        </Badge>
                      </div>

                      {/* Story Content */}
                      <div className="lg:col-span-2">
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-white mb-3">Specialization</h4>
                          <p className="text-gray-300">{story.specialization}</p>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-white mb-3">Success Story</h4>
                          <p className="text-gray-300 leading-relaxed">{story.story}</p>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-white mb-3">Key Achievements</h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {story.achievements.map((achievement, achIndex) => (
                              <div key={achIndex} className="flex items-start space-x-2">
                                <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1" />
                                <span className="text-gray-300 text-sm">{achievement}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-white mb-3">Before vs After</h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-lg">
                              <h5 className="text-red-400 font-medium mb-2">Before Afrilance</h5>
                              <p className="text-gray-300 text-sm">{story.beforeAfter.before}</p>
                            </div>
                            <div className="p-4 bg-green-400/10 border border-green-400/20 rounded-lg">
                              <h5 className="text-green-400 font-medium mb-2">After Afrilance</h5>
                              <p className="text-gray-300 text-sm">{story.beforeAfter.after}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 bg-gray-700 rounded-lg relative">
                          <Quote className="w-8 h-8 text-yellow-400 absolute top-4 left-4" />
                          <blockquote className="text-white italic pl-12 pr-4">
                            "{story.testimonial}"
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Wins */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Quick Success Stories</h2>
              <p className="text-gray-300">See how fast some freelancers found success on Afrilance.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {quickWins.map((win, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{win.name}</h3>
                        <p className="text-yellow-400 text-sm mb-3">{win.profession}</p>
                        <div className="mb-3">
                          <span className="text-green-400 font-semibold">{win.timeToSuccess}</span>
                          <span className="text-gray-300"> to {win.achievement}</span>
                        </div>
                        <div className="p-3 bg-gray-700 rounded-lg">
                          <p className="text-gray-300 text-sm"><strong>Success Tip:</strong> {win.tip}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Earnings by Category */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Earnings by Category</h2>
              <p className="text-gray-300">See average monthly earnings across different freelance categories.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Briefcase className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-4">{cat.category}</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-400 text-sm">Average Monthly</p>
                          <p className="text-2xl font-bold text-green-400">{cat.avgEarnings}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Top Performer</p>
                          <p className="text-lg font-semibold text-yellow-400">{cat.topEarner}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Your Success Story Starts Here</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful South African freelancers who are building their careers 
              and achieving financial freedom on Afrilance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-semibold px-8 py-4 text-lg"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('how-to-join')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
              >
                Learn How to Join
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-4 text-gray-400">
              <Users className="w-5 h-5" />
              <span className="text-sm">Join 15,000+ successful freelancers already earning on Afrilance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
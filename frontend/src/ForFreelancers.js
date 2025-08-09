import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ArrowLeft, Users, Briefcase, Star, Trophy, TrendingUp, Zap, Shield, Globe, ArrowRight, CheckCircle } from 'lucide-react';

const ForFreelancers = ({ onNavigate }) => {
  const benefits = [
    {
      icon: Briefcase,
      title: "Quality Projects",
      description: "Access to verified South African businesses and premium project opportunities.",
      highlight: "5,000+ active projects"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Escrow protection ensures you get paid for completed work, every time.",
      highlight: "100% payment protection"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Career",
      description: "Build your reputation, expand your network, and increase your earning potential.",
      highlight: "Average 40% income increase"
    },
    {
      icon: Star,
      title: "Professional Recognition",
      description: "Get verified, build ratings, and become a top-rated freelancer in South Africa.",
      highlight: "Verified professional status"
    }
  ];

  const stats = [
    { number: "15,000+", label: "Active Freelancers", icon: Users },
    { number: "R2.5M+", label: "Monthly Earnings", icon: TrendingUp },
    { number: "98%", label: "Success Rate", icon: Trophy },
    { number: "4.8/5", label: "Average Rating", icon: Star }
  ];

  const steps = [
    {
      number: "01",
      title: "Join the Platform",
      description: "Sign up and create your freelancer account in under 5 minutes.",
      action: "Get Started",
      actionType: "primary"
    },
    {
      number: "02", 
      title: "Complete Your Profile",
      description: "Showcase your skills, experience, and portfolio to attract quality clients.",
      action: "Learn How",
      actionType: "secondary"
    },
    {
      number: "03",
      title: "Get Verified",
      description: "Submit your ID and get verified to access premium projects and higher rates.",
      action: "Start Verification",
      actionType: "secondary"
    },
    {
      number: "04",
      title: "Start Earning",
      description: "Apply for projects, deliver great work, and build your reputation.",
      action: "Browse Projects",
      actionType: "primary"
    }
  ];

  const handleStepAction = (step) => {
    switch(step.title) {
      case "Join the Platform":
        onNavigate('register');
        break;
      case "Complete Your Profile":
        onNavigate('create-profile');
        break;
      case "Get Verified":
        onNavigate('get-verified');
        break;
      case "Start Earning":
        onNavigate('browse-jobs');
        break;
      default:
        onNavigate('register');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => onNavigate('landing')}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
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
              Join Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="mb-6">
              <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 px-4 py-2 text-sm font-medium">
                FOR FREELANCERS
              </Badge>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6">
              Your <span className="text-gradient">Freelance Career</span><br />
              Starts Here
            </h1>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Join South Africa's fastest-growing freelance community. Connect with premium clients, 
              build your reputation, and earn more doing what you love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-4 text-lg"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('success-stories')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
              >
                See Success Stories
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-500 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-black" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{stat.number}</h3>
                  <p className="text-gray-300">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Benefits */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Why Choose Afrilance?</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                We've built the perfect platform for South African freelancers to thrive and succeed.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-6 h-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                        <p className="text-gray-300 mb-4">{benefit.description}</p>
                        <div className="bg-gray-700 rounded-lg px-4 py-2 inline-block">
                          <span className="text-yellow-400 font-semibold">{benefit.highlight}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">How to Get Started</h2>
              <p className="text-xl text-gray-300">
                Four simple steps to launch your successful freelance career on Afrilance.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-bold text-black">{step.number}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
                    <p className="text-gray-300 mb-6">{step.description}</p>
                    <Button
                      onClick={() => handleStepAction(step)}
                      className={step.actionType === 'primary' 
                        ? "bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold w-full"
                        : "bg-gray-700 hover:bg-gray-600 text-white w-full"
                      }
                    >
                      {step.action}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Explore More</h2>
              <p className="text-gray-300">Get detailed information about each step of your freelance journey.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-colors cursor-pointer" onClick={() => onNavigate('how-to-join')}>
                <CardContent className="p-6 text-center">
                  <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">How to Join</h3>
                  <p className="text-gray-300 mb-4">Step-by-step guide to joining Afrilance and setting up your account.</p>
                  <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300">
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-colors cursor-pointer" onClick={() => onNavigate('create-profile')}>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">Create a Profile</h3>
                  <p className="text-gray-300 mb-4">Tips and best practices for creating a compelling freelancer profile.</p>
                  <Button variant="ghost" className="text-green-400 hover:text-green-300">
                    Get Started <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-colors cursor-pointer" onClick={() => onNavigate('get-verified')}>
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">Get Verified</h3>
                  <p className="text-gray-300 mb-4">Understand the verification process and unlock premium opportunities.</p>
                  <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                    Start Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-yellow-400/10 to-green-500/10 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Freelance Journey?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful South African freelancers who are already building their careers on Afrilance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-4 text-lg"
              >
                Join as a Freelancer
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('browse-jobs')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
              >
                Browse Available Jobs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForFreelancers;
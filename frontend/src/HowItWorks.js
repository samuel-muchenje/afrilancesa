import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { ArrowLeft, UserPlus, FileText, Search, Handshake, DollarSign, Star } from 'lucide-react';

const HowItWorks = ({ onNavigate }) => {
  const freelancerSteps = [
    {
      icon: UserPlus,
      title: "Sign Up & Verify",
      description: "Create your profile and upload your ID for verification. This ensures trust and quality on our platform."
    },
    {
      icon: FileText,
      title: "Complete Your Profile",
      description: "Add your skills, experience, portfolio, and set your rates to showcase your expertise."
    },
    {
      icon: Search,
      title: "Browse & Apply",
      description: "Find jobs that match your skills and submit proposals with your bid and timeline."
    },
    {
      icon: Handshake,
      title: "Get Hired",
      description: "Communicate with clients, agree on terms, and start working on approved projects."
    },
    {
      icon: DollarSign,
      title: "Get Paid",
      description: "Complete the work, get paid through our secure payment system, and build your reputation."
    }
  ];

  const clientSteps = [
    {
      icon: UserPlus,
      title: "Create Account",
      description: "Sign up for free and tell us about your business and project needs."
    },
    {
      icon: FileText,
      title: "Post Your Job",
      description: "Describe your project, set your budget, timeline, and required skills."
    },
    {
      icon: Search,
      title: "Review Proposals",
      description: "Get proposals from verified freelancers and review their profiles and portfolios."
    },
    {
      icon: Handshake,
      title: "Hire & Collaborate",
      description: "Choose the best freelancer, communicate requirements, and track progress."
    },
    {
      icon: Star,
      title: "Review & Repeat",
      description: "Rate your experience and hire the same freelancer for future projects."
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => onNavigate('/')}
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
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">How Afrilance Works</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Whether you're looking to hire talent or offer your services, Afrilance makes it simple and secure.
            </p>
          </div>

          {/* For Freelancers */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">For Freelancers</h2>
              <p className="text-gray-300">Start earning with your skills in 5 simple steps</p>
            </div>

            <div className="grid md:grid-cols-5 gap-8">
              {freelancerSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <Card className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-all duration-300 mb-4">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full mx-auto mb-4">
                        <step.icon className="w-8 h-8 text-black" />
                      </div>
                      <div className="text-yellow-400 font-bold text-sm mb-2">STEP {index + 1}</div>
                      <h3 className="text-white font-semibold text-lg mb-3">{step.title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-3"
              >
                Start as a Freelancer
              </Button>
            </div>
          </div>

          {/* For Clients */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">For Clients</h2>
              <p className="text-gray-300">Find and hire top talent in 5 easy steps</p>
            </div>

            <div className="grid md:grid-cols-5 gap-8">
              {clientSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <Card className="bg-gray-800 border-gray-700 hover:border-green-400/50 transition-all duration-300 mb-4">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-green-400 font-bold text-sm mb-2">STEP {index + 1}</div>
                      <h3 className="text-white font-semibold text-lg mb-3">{step.title}</h3>
                      <p className="text-gray-300 text-sm leading-relaxed">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold px-8 py-3"
              >
                Start Hiring
              </Button>
            </div>
          </div>

          {/* Why Choose Afrilance */}
          <div className="bg-gray-900/50 rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose Afrilance?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserPlus className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">Verified Professionals</h3>
                <p className="text-gray-300">Every freelancer is ID verified and skills-tested for quality assurance.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">Secure Payments</h3>
                <p className="text-gray-300">Escrow protection ensures freelancers get paid and clients get quality work.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-semibold text-xl mb-4">Local Focus</h3>
                <p className="text-gray-300">Supporting South African talent and connecting local businesses with skilled professionals.</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of South Africans already using Afrilance to grow their careers and businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-3"
              >
                Join as a Freelancer
              </Button>
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold px-8 py-3"
              >
                Start Hiring
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
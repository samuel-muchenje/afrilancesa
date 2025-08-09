import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ArrowLeft, CheckCircle, Clock, User, FileText, Shield, Star, ArrowRight, AlertCircle, Mail, Phone, IdCard } from 'lucide-react';

const HowToJoin = ({ onNavigate }) => {
  const joinSteps = [
    {
      step: 1,
      title: "Create Your Account",
      duration: "2 minutes",
      icon: User,
      description: "Sign up with your email and create a secure password. Choose 'Freelancer' as your account type.",
      requirements: [
        "Valid email address",
        "Strong password (8+ characters)",
        "Full name as per ID document",
        "South African phone number"
      ],
      action: "Sign Up Now",
      actionOnClick: () => onNavigate('register')
    },
    {
      step: 2,
      title: "Complete Basic Information",
      duration: "5 minutes",
      icon: FileText,
      description: "Fill in your personal details, location, and basic contact information to set up your profile foundation.",
      requirements: [
        "Full name and location",
        "Professional phone number",
        "Brief professional headline",
        "Preferred work categories"
      ],
      action: "Continue Setup",
      actionOnClick: () => onNavigate('register')
    },
    {
      step: 3,
      title: "Upload ID Document",
      duration: "3 minutes",
      icon: IdCard,
      description: "Upload a clear photo of your South African ID document for identity verification. This ensures platform security.",
      requirements: [
        "South African ID document",
        "Clear, readable photo",
        "All corners visible",
        "PDF or image format (max 5MB)"
      ],
      action: "Learn About Verification",
      actionOnClick: () => onNavigate('get-verified')
    },
    {
      step: 4,
      title: "Build Your Profile",
      duration: "15-30 minutes",
      icon: Star,
      description: "Create a compelling profile with your skills, experience, portfolio, and professional information.",
      requirements: [
        "Professional profile photo",
        "Skills and expertise list",
        "Work experience details",
        "Portfolio samples (optional but recommended)"
      ],
      action: "Profile Guide",
      actionOnClick: () => onNavigate('create-profile')
    },
    {
      step: 5,
      title: "Wait for Verification",
      duration: "24-48 hours",
      icon: Shield,
      description: "Our verification team at sam@afrilance.co.za reviews your documents and profile. You'll receive an email once verification is complete.",
      requirements: [
        "Valid ID document submitted",
        "Complete profile information",
        "Patience during review process",
        "Check email for updates from verification team"
      ],
      action: "Verification Status",
      actionOnClick: () => onNavigate('login')
    }
  ];

  const tips = [
    {
      icon: CheckCircle,
      title: "Use Your Real Information",
      description: "Always use your real name and authentic information. This builds trust with clients and ensures smooth payments."
    },
    {
      icon: Clock,
      title: "Complete Your Profile ASAP",
      description: "Profiles with complete information and photos get 5x more project invitations than incomplete ones."
    },
    {
      icon: Star,
      title: "Add Portfolio Samples",
      description: "Upload examples of your best work. Visual portfolios increase your chances of getting hired by 300%."
    },
    {
      icon: Mail,
      title: "Professional Communication",
      description: "Use a professional email address and maintain professional communication throughout the process."
    }
  ];

  const faqs = [
    {
      question: "How long does the joining process take?",
      answer: "The initial signup takes about 10 minutes. However, full verification can take 24-48 hours as our team manually reviews each application to ensure quality and security."
    },
    {
      question: "What documents do I need to join?",
      answer: "You need a valid South African ID document (green barcoded ID or smart ID card). International freelancers may need additional documentation - contact our support team for details."
    },
    {
      question: "Is there a fee to join Afrilance?",
      answer: "No, joining Afrilance is completely free. We only charge a small service fee (10%) when you successfully complete paid projects."
    },
    {
      question: "Can I start applying for jobs immediately?",
      answer: "You can browse jobs immediately after creating your account, but you'll need to complete verification before you can apply for most premium projects."
    },
    {
      question: "What if my verification is rejected?",
      answer: "If verification is rejected, we'll send you an email explaining the reason and steps to resolve any issues. Common issues include unclear ID photos or incomplete information. You can contact sam@afrilance.co.za for additional assistance."
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
              Join Now
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="bg-green-400/10 text-green-400 border-green-400/20 px-4 py-2 text-sm font-medium mb-6">
              STEP-BY-STEP GUIDE
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">How to Join Afrilance</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Follow our simple 5-step process to become a verified freelancer and start earning 
              with South Africa's premier freelance platform.
            </p>
            <div className="flex items-center justify-center space-x-4 text-gray-400">
              <Clock className="w-5 h-5" />
              <span>Total time: 30-45 minutes + verification wait</span>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-8 mb-20">
            {joinSteps.map((step, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Step Number and Icon */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-black">{step.step}</span>
                      </div>
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-yellow-400" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                        <h3 className="text-2xl font-semibold text-white">{step.title}</h3>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{step.duration}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-300 mb-6">{step.description}</p>

                      {/* Requirements */}
                      <div className="mb-6">
                        <h4 className="text-white font-medium mb-3">Requirements:</h4>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {step.requirements.map((req, reqIndex) => (
                            <div key={reqIndex} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                              <span className="text-gray-300 text-sm">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={step.actionOnClick}
                        variant={step.step === 1 ? "default" : "outline"}
                        className={step.step === 1 
                          ? "bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                          : "border-gray-600 text-gray-300 hover:bg-gray-700"
                        }
                      >
                        {step.action}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tips Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Pro Tips for Success</h2>
              <p className="text-gray-300">Follow these tips to maximize your chances of success on Afrilance.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {tips.map((tip, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <tip.icon className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">{tip.title}</h3>
                        <p className="text-gray-300">{tip.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-300">Get answers to common questions about joining Afrilance.</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-gray-300">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-yellow-400/10 to-green-500/10 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of successful South African freelancers earning with Afrilance today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-4 text-lg"
              >
                Start Your Application
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('success-stories')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
              >
                Read Success Stories
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-4 text-gray-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Need help? Contact our verification team at sam@afrilance.co.za</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToJoin;
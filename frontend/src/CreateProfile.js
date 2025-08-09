import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ArrowLeft, User, Camera, FileText, Star, Trophy, Link, CheckCircle, AlertTriangle, ArrowRight, Zap, Target, Award } from 'lucide-react';

const CreateProfile = ({ onNavigate }) => {
  const profileSections = [
    {
      title: "Profile Photo & Basic Info",
      icon: User,
      priority: "Essential",
      priorityColor: "text-red-400",
      description: "Your first impression matters. A professional photo increases your hire rate by 300%.",
      checklist: [
        "Professional headshot photo",
        "Clear, well-lit image",
        "Appropriate business attire",
        "Friendly, confident expression",
        "Full name as per ID document",
        "Professional headline (e.g., 'Expert React Developer')"
      ],
      tips: [
        "Use a plain background",
        "Look directly at the camera",
        "Smile naturally",
        "Avoid filters or heavy editing"
      ]
    },
    {
      title: "Skills & Expertise",
      icon: Zap,
      priority: "Essential", 
      priorityColor: "text-red-400",
      description: "List your skills strategically. Clients search by skills, so choose wisely.",
      checklist: [
        "5-10 most relevant skills",
        "Mix of technical and soft skills",
        "Industry-specific tools/software",
        "Proficiency levels indicated",
        "Keywords clients search for",
        "Certifications and qualifications"
      ],
      tips: [
        "Research job postings for skill keywords",
        "Update skills based on market demand",
        "Be honest about proficiency levels",
        "Include both hard and soft skills"
      ]
    },
    {
      title: "Professional Experience",
      icon: FileText,
      priority: "Important",
      priorityColor: "text-yellow-400",
      description: "Showcase your work history and achievements. Quantify your impact where possible.",
      checklist: [
        "Previous job titles and companies",
        "Employment dates and duration",
        "Key responsibilities and achievements",
        "Quantified results (e.g., 'Increased sales by 25%')",
        "Relevant education background",
        "Professional development courses"
      ],
      tips: [
        "Use action verbs (achieved, managed, created)",
        "Focus on results and impact",
        "Tailor experience to your target clients",
        "Keep descriptions concise but informative"
      ]
    },
    {
      title: "Portfolio & Work Samples",
      icon: Trophy,
      priority: "Critical",
      priorityColor: "text-green-400",
      description: "Show, don't tell. A strong portfolio can be the deciding factor for clients.",
      checklist: [
        "3-5 of your best work samples",
        "Variety of project types",
        "Clear project descriptions",
        "Your role and contribution explained",
        "Results and client feedback",
        "High-quality images/screenshots"
      ],
      tips: [
        "Quality over quantity",
        "Include case studies with process",
        "Show before/after comparisons",
        "Get permission to showcase client work"
      ]
    },
    {
      title: "Pricing & Availability",
      icon: Target,
      priority: "Important",
      priorityColor: "text-yellow-400",
      description: "Set competitive rates and clear availability to attract the right clients.",
      checklist: [
        "Competitive hourly rate research",
        "Clear availability schedule",
        "Response time expectations",
        "Preferred project types/sizes",
        "Payment terms preferences",
        "Minimum project requirements"
      ],
      tips: [
        "Research competitor pricing",
        "Start slightly lower, increase with reviews",
        "Be clear about what's included",
        "Consider project-based vs hourly pricing"
      ]
    },
    {
      title: "Profile Description & Bio",
      icon: FileText,
      priority: "Essential",
      priorityColor: "text-red-400",
      description: "Your elevator pitch in writing. This is where you sell yourself to potential clients.",
      checklist: [
        "Clear, engaging opening statement",
        "Your unique value proposition",
        "Specific services you offer",
        "Years of experience highlighted",
        "Notable achievements or clients",
        "Call-to-action for clients"
      ],
      tips: [
        "Write in first person",
        "Address client pain points",
        "Use keywords naturally",
        "Keep it concise but comprehensive"
      ]
    }
  ];

  const profileTips = [
    {
      icon: CheckCircle,
      title: "Complete All Sections",
      description: "Profiles with 100% completion get 5x more views and 3x more project invitations."
    },
    {
      icon: Star,
      title: "Use Keywords Strategically",
      description: "Research job postings in your field and include relevant keywords in your profile naturally."
    },
    {
      icon: Award,
      title: "Show Your Personality",
      description: "Clients want to work with people they like. Let your professional personality shine through."
    },
    {
      icon: Target,
      title: "Target Your Ideal Client",
      description: "Write your profile for your ideal client type. Speak their language and address their needs."
    }
  ];

  const commonMistakes = [
    {
      mistake: "Generic Profile Description",
      fix: "Customize your bio for your specific niche and target clients."
    },
    {
      mistake: "Poor Quality Photos",
      fix: "Invest in a professional headshot or take a high-quality selfie with good lighting."
    },
    {
      mistake: "Overloading with Skills",
      fix: "Focus on 5-10 core skills rather than listing everything you've ever done."
    },
    {
      mistake: "No Portfolio Samples",
      fix: "Always include work samples, even if you need to create mock projects."
    },
    {
      mistake: "Vague Experience Descriptions",
      fix: "Use specific examples and quantify your achievements wherever possible."
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
              Create Profile
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge className="bg-blue-400/10 text-blue-400 border-blue-400/20 px-4 py-2 text-sm font-medium mb-6">
              PROFILE CREATION GUIDE
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">Create a Winning Profile</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Your profile is your digital storefront. Learn how to create a compelling profile that 
              attracts high-quality clients and wins more projects.
            </p>
            <div className="flex items-center justify-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>Win 3x more projects</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-green-400" />
                <span>Get higher rates</span>
              </div>
            </div>
          </div>

          {/* Profile Sections */}
          <div className="space-y-8 mb-20">
            {profileSections.map((section, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8">
                    {/* Icon and Priority */}
                    <div className="flex items-center space-x-4 lg:flex-col lg:items-center lg:space-x-0 lg:space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center">
                        <section.icon className="w-8 h-8 text-black" />
                      </div>
                      <Badge className={`${section.priorityColor} bg-transparent border-current`}>
                        {section.priority}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-white mb-4">{section.title}</h3>
                      <p className="text-gray-300 mb-6">{section.description}</p>

                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Checklist */}
                        <div>
                          <h4 className="text-white font-medium mb-4">Essential Elements:</h4>
                          <div className="space-y-2">
                            {section.checklist.map((item, itemIndex) => (
                              <div key={itemIndex} className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tips */}
                        <div>
                          <h4 className="text-white font-medium mb-4">Pro Tips:</h4>
                          <div className="space-y-2">
                            {section.tips.map((tip, tipIndex) => (
                              <div key={tipIndex} className="flex items-center space-x-2">
                                <Star className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                <span className="text-gray-300 text-sm">{tip}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Profile Tips */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Profile Success Tips</h2>
              <p className="text-gray-300">Follow these proven strategies to create a profile that converts visitors into clients.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {profileTips.map((tip, index) => (
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

          {/* Common Mistakes */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Common Mistakes to Avoid</h2>
              <p className="text-gray-300">Learn from others' mistakes and avoid these common profile pitfalls.</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {commonMistakes.map((item, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">❌ {item.mistake}</h3>
                        <p className="text-gray-300">✅ <strong>Fix:</strong> {item.fix}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Steps */}
          <div className="mb-20">
            <Card className="bg-gradient-to-r from-yellow-400/5 to-green-500/5 border-yellow-400/20">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Ready to Build Your Profile?</h2>
                  <p className="text-gray-300">Follow these steps to create your winning freelancer profile.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="bg-gray-800 border-gray-700 text-center cursor-pointer hover:border-yellow-400/50 transition-colors" onClick={() => onNavigate('register')}>
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-black">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">Sign Up</h3>
                      <p className="text-gray-300 mb-4">Create your Afrilance account and choose freelancer profile.</p>
                      <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300">
                        Get Started <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 text-center cursor-pointer hover:border-green-400/50 transition-colors" onClick={() => onNavigate('get-verified')}>
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-white">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">Get Verified</h3>
                      <p className="text-gray-300 mb-4">Complete identity verification to unlock premium features.</p>
                      <Button variant="ghost" className="text-green-400 hover:text-green-300">
                        Learn More <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700 text-center cursor-pointer hover:border-blue-400/50 transition-colors" onClick={() => onNavigate('browse-jobs')}>
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-white">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-3">Start Earning</h3>
                      <p className="text-gray-300 mb-4">Browse available projects and submit your first proposals.</p>
                      <Button variant="ghost" className="text-blue-400 hover:text-blue-300">
                        Browse Jobs <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-yellow-400/10 to-green-500/10 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Create Your Profile Today</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start building your professional presence on South Africa's leading freelance platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-4 text-lg"
              >
                Start Building Profile
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('success-stories')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
              >
                See Success Examples
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
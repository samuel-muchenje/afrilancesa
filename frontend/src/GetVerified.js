import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { ArrowLeft, Shield, CheckCircle, Clock, IdCard, Camera, FileText, Star, AlertTriangle, Award, Users, TrendingUp, ArrowRight } from 'lucide-react';

const GetVerified = ({ onNavigate }) => {
  const verificationSteps = [
    {
      step: 1,
      title: "Upload ID Document",
      icon: IdCard,
      description: "Provide a clear photo of your South African ID document for identity verification.",
      requirements: [
        "South African green barcoded ID or Smart ID card",
        "Clear, high-resolution photo or scan",
        "All four corners visible",
        "Text must be clearly readable",
        "File format: JPG, PNG, or PDF",
        "Maximum file size: 5MB"
      ],
      tips: [
        "Use good lighting, avoid shadows",
        "Place ID on a flat, contrasting surface",
        "Ensure no glare or reflections",
        "Take photo straight-on, not at an angle"
      ]
    },
    {
      step: 2,
      title: "Profile Review",
      icon: FileText,
      description: "Our team reviews your profile information to ensure accuracy and completeness.",
      requirements: [
        "Complete profile information",
        "Professional profile photo uploaded",
        "Skills and experience details filled",
        "Contact information verified",
        "Bio and description completed",
        "All required fields populated"
      ],
      tips: [
        "Double-check all information for accuracy",
        "Use a professional email address",
        "Ensure phone number is current",
        "Write a compelling profile description"
      ]
    },
    {
      step: 3,
      title: "Skills Assessment (Optional)",
      icon: Award,
      description: "Complete skills tests to showcase your expertise and boost your profile ranking.",
      requirements: [
        "Available for major skill categories",
        "Multiple-choice and practical questions",
        "Time-limited assessments",
        "Can retake after 30 days",
        "Results displayed on profile",
        "Improves search ranking"
      ],
      tips: [
        "Take tests in your strongest skills first",
        "Prepare by reviewing relevant materials",
        "Read questions carefully",
        "Take breaks between multiple tests"
      ]
    },
    {
      step: 4,
      title: "Verification Approval",
      icon: CheckCircle,
      description: "Receive your verification badge and unlock premium platform features.",
      requirements: [
        "Valid ID document verification",
        "Complete profile information",
        "No red flags in background check",
        "Email and phone verification complete",
        "Terms of service acceptance",
        "Community guidelines acknowledgment"
      ],
      tips: [
        "Check your email regularly for updates",
        "Respond promptly to any verification requests",
        "Keep your profile information current",
        "Maintain professional communication"
      ]
    }
  ];

  const verificationBenefits = [
    {
      icon: Shield,
      title: "Trusted Professional Status",
      description: "Display the verified badge on your profile to build instant trust with clients.",
      impact: "300% more profile views"
    },
    {
      icon: Star,
      title: "Premium Project Access",
      description: "Access high-value projects that are only available to verified freelancers.",
      impact: "Average 50% higher project values"
    },
    {
      icon: TrendingUp,
      title: "Higher Search Ranking",
      description: "Verified profiles appear first in search results and get more visibility.",
      impact: "5x more client invitations"
    },
    {
      icon: Users,
      title: "Direct Client Communication",
      description: "Unlock unlimited messaging and direct contact with potential clients.",
      impact: "Faster project acquisition"
    }
  ];

  const documentTypes = [
    {
      type: "South African Green Barcoded ID",
      accepted: true,
      notes: "Most common form of SA ID - fully accepted"
    },
    {
      type: "South African Smart ID Card",
      accepted: true,
      notes: "New format SA ID card - fully accepted"
    },
    {
      type: "South African Passport",
      accepted: true,
      notes: "Accepted with proof of SA residency"
    },
    {
      type: "Foreign Passport + Work Permit",
      accepted: true,
      notes: "For international freelancers with SA work authorization"
    },
    {
      type: "Driver's License Only",
      accepted: false,
      notes: "Not sufficient for identity verification"
    },
    {
      type: "Bank Statements",
      accepted: false,
      notes: "Not accepted as primary ID document"
    }
  ];

  const faqs = [
    {
      question: "How long does verification take?",
      answer: "Standard verification takes 24-48 hours during business days. Peak periods may take up to 72 hours. You'll receive email updates throughout the process."
    },
    {
      question: "What if my ID document is rejected?",
      answer: "We'll send you specific feedback on why the document was rejected and what needs to be corrected. Common issues include poor image quality, missing corners, or glare. You can resubmit immediately after addressing the issues."
    },
    {
      question: "Can international freelancers get verified?",
      answer: "Yes! International freelancers can get verified by providing a valid passport and proof of legal work authorization in South Africa (work permit, visa, etc.)."
    },
    {
      question: "Is verification free?",
      answer: "Yes, identity verification is completely free. We believe in making our platform accessible to all qualified freelancers."
    },
    {
      question: "What happens if I lose my verified status?",
      answer: "Verified status can only be revoked for serious violations of our terms of service. If this happens, you'll be notified with specific reasons and given an opportunity to appeal."
    },
    {
      question: "Do I need to reverify periodically?",
      answer: "No, verification is typically permanent. However, we may request updated documents if there are significant changes to your profile or after extended periods of inactivity."
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
              Get Verified
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
              VERIFICATION PROCESS
            </Badge>
            <h1 className="text-5xl font-bold text-white mb-6">
              Get <span className="text-gradient">Verified</span> Today
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Become a trusted, verified freelancer on Afrilance. Unlock premium features, 
              higher-paying projects, and build credibility with clients.
            </p>
            <div className="flex items-center justify-center space-x-6 text-gray-400">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>24-48 hours processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>100% secure & private</span>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Why Get Verified?</h2>
              <p className="text-gray-300">Verified freelancers earn more, get better projects, and build stronger client relationships.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {verificationBenefits.map((benefit, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 hover:border-green-400/50 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                        <p className="text-gray-300 mb-4">{benefit.description}</p>
                        <div className="bg-green-400/10 rounded-lg px-4 py-2 inline-block">
                          <span className="text-green-400 font-semibold">{benefit.impact}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Verification Steps */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Verification Process</h2>
              <p className="text-gray-300">Follow these simple steps to get your verified freelancer status.</p>
            </div>

            <div className="space-y-8">
              {verificationSteps.map((step, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8">
                      {/* Step Number and Icon */}
                      <div className="flex items-center space-x-4 lg:flex-col lg:items-center lg:space-x-0 lg:space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{step.step}</span>
                        </div>
                        <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-green-400" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                        <p className="text-gray-300 mb-6">{step.description}</p>

                        <div className="grid lg:grid-cols-2 gap-8">
                          {/* Requirements */}
                          <div>
                            <h4 className="text-white font-medium mb-4">Requirements:</h4>
                            <div className="space-y-2">
                              {step.requirements.map((req, reqIndex) => (
                                <div key={reqIndex} className="flex items-center space-x-2">
                                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  <span className="text-gray-300 text-sm">{req}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tips */}
                          <div>
                            <h4 className="text-white font-medium mb-4">Pro Tips:</h4>
                            <div className="space-y-2">
                              {step.tips.map((tip, tipIndex) => (
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
          </div>

          {/* Accepted Documents */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Accepted Documents</h2>
              <p className="text-gray-300">Make sure you have one of these valid identification documents ready.</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid gap-4">
                {documentTypes.map((doc, index) => (
                  <Card key={index} className={`bg-gray-800 ${doc.accepted ? 'border-green-400/30' : 'border-red-400/30'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            doc.accepted ? 'bg-green-400/20' : 'bg-red-400/20'
                          }`}>
                            {doc.accepted ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{doc.type}</h3>
                            <p className={`text-sm ${doc.accepted ? 'text-gray-300' : 'text-red-400'}`}>
                              {doc.notes}
                            </p>
                          </div>
                        </div>
                        <Badge className={doc.accepted ? 'bg-green-400/10 text-green-400 border-green-400/20' : 'bg-red-400/10 text-red-400 border-red-400/20'}>
                          {doc.accepted ? 'Accepted' : 'Not Accepted'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-300">Get answers to common questions about the verification process.</p>
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
          <div className="bg-gradient-to-r from-green-400/10 to-blue-500/10 rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Verified?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of verified freelancers earning more on Afrilance. 
              Start your verification process today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('register')}
                className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-semibold px-8 py-4 text-lg"
              >
                Start Verification Process
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('success-stories')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
              >
                See Verified Success Stories
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-4 text-gray-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Need help with verification? Contact support@afrilance.co.za</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetVerified;
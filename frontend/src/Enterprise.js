import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { ArrowLeft, Users, Shield, Globe, Headphones, Zap, BarChart3, CheckCircle, Star } from 'lucide-react';

const Enterprise = ({ onNavigate }) => {
  const features = [
    {
      icon: Users,
      title: "Dedicated Account Manager",
      description: "Get personal support from our enterprise team to ensure smooth project execution and scaling."
    },
    {
      icon: Shield,
      title: "Advanced Security & Compliance",
      description: "Enterprise-grade security with SOC 2 compliance, data encryption, and custom NDAs."
    },
    {
      icon: Globe,
      title: "Global Talent Pool",
      description: "Access to our full network of 15,000+ verified South African professionals across all industries."
    },
    {
      icon: Headphones,
      title: "Priority Support",
      description: "24/7 priority support with guaranteed response times and dedicated success managers."
    },
    {
      icon: Zap,
      title: "Custom Workflows",
      description: "Tailored processes, custom integrations, and automated reporting to fit your business needs."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Detailed insights, performance metrics, and custom reporting to track your project success."
    }
  ];

  const plans = [
    {
      name: "Team",
      price: "Contact for pricing",
      description: "Perfect for growing businesses",
      features: [
        "Up to 50 active projects",
        "Dedicated account manager",
        "Priority freelancer matching",
        "Advanced reporting",
        "Team collaboration tools",
        "Custom payment terms"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom pricing",
      description: "For large organizations",
      features: [
        "Unlimited projects",
        "White-label solutions",
        "API integrations",
        "Custom security protocols",
        "On-site training",
        "SLA guarantees",
        "Bulk freelancer procurement",
        "Custom contract templates"
      ]
    }
  ];

  const testimonials = [
    {
      company: "Shoprite Holdings",
      spokesperson: "David Mitchell",
      role: "Head of Digital Transformation",
      quote: "Afrilance Enterprise has been instrumental in scaling our digital initiatives across Africa. Their verified talent pool and dedicated support have exceeded expectations.",
      logo: "🛒"
    },
    {
      company: "Standard Bank",
      spokesperson: "Sarah Nkomo",
      role: "Chief Technology Officer",
      quote: "The enterprise platform's security features and compliance standards give us confidence in working with external talent for sensitive projects.",
      logo: "🏦"
    },
    {
      company: "MTN Group",
      spokesperson: "Ahmed Hassan",
      role: "VP of Innovation",
      quote: "We've successfully completed over 200 projects through Afrilance Enterprise, with consistent quality and reliable delivery timelines.",
      logo: "📡"
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
              onClick={() => onNavigate('contact')}
              className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-6"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-white mb-6">
              Afrilance <span className="text-gradient">Enterprise</span>
            </h1>
            <p className="text-2xl text-gray-300 max-w-4xl mx-auto mb-8">
              Scale your business with Africa's largest network of verified professionals. 
              Purpose-built for enterprises and growing teams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('contact')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-4 text-lg"
              >
                Schedule a Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('contact')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
              >
                Contact Sales
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="p-6">
                <h3 className="text-4xl font-bold text-yellow-400 mb-2">500+</h3>
                <p className="text-gray-300">Enterprise Clients</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="p-6">
                <h3 className="text-4xl font-bold text-green-400 mb-2">98%</h3>
                <p className="text-gray-300">Project Success Rate</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="p-6">
                <h3 className="text-4xl font-bold text-blue-400 mb-2">50,000+</h3>
                <p className="text-gray-300">Projects Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="p-6">
                <h3 className="text-4xl font-bold text-red-400 mb-2">24/7</h3>
                <p className="text-gray-300">Support Available</p>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Enterprise Features</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to scale your business with confidence and security.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-green-500 rounded-lg flex items-center justify-center mr-4">
                        <feature.icon className="w-6 h-6 text-black" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                    </div>
                    <p className="text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Enterprise Plans</h2>
              <p className="text-xl text-gray-300">
                Flexible solutions that grow with your business needs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {plans.map((plan, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                    <p className="text-gray-300 mb-4">{plan.description}</p>
                    <div className="text-3xl font-bold text-yellow-400">{plan.price}</div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold"
                      onClick={() => onNavigate('contact')}
                    >
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Testimonials */}
          <div className="mb-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">Trusted by Leading Companies</h2>
              <p className="text-xl text-gray-300">
                See how enterprises across Africa are scaling with Afrilance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="text-3xl mr-4">{testimonial.logo}</div>
                      <div>
                        <h4 className="text-white font-semibold">{testimonial.company}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                    <div className="text-sm text-gray-400">
                      <p className="font-semibold text-white">{testimonial.spokesperson}</p>
                      <p>{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-yellow-400/10 to-green-500/10 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Scale Your Business?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of enterprises already using Afrilance to access Africa's top talent and accelerate their growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => onNavigate('contact')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-4 text-lg"
              >
                Schedule a Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate('contact')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-4 text-lg"
              >
                Download Brochure
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enterprise;
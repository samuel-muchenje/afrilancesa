import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { ArrowLeft, Users, MapPin, Clock, ChevronRight, Globe, Code, Briefcase, Heart } from 'lucide-react';

const Careers = ({ onNavigate }) => {
  const jobOpenings = [
    {
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "Cape Town, South Africa",
      type: "Full-time",
      description: "Join our core engineering team to build the future of freelancing in Africa. Work with React, Node.js, and modern web technologies.",
      requirements: [
        "5+ years of full-stack development experience",
        "Strong proficiency in React, Node.js, and MongoDB",
        "Experience with cloud platforms (AWS/GCP)",
        "Passion for creating exceptional user experiences"
      ]
    },
    {
      title: "Product Marketing Manager",
      department: "Marketing",
      location: "Johannesburg, South Africa",
      type: "Full-time",
      description: "Lead our marketing efforts to connect with freelancers and clients across Africa. Shape our brand story and growth strategy.",
      requirements: [
        "3+ years of product marketing experience",
        "Experience in B2B and marketplace platforms",
        "Strong understanding of African markets",
        "Creative storytelling and content creation skills"
      ]
    },
    {
      title: "Senior Business Development Manager",
      department: "Business Development",
      location: "Lagos, Nigeria",
      type: "Full-time",
      description: "Expand Afrilance's presence across Africa. Build partnerships and drive business growth in key markets.",
      requirements: [
        "5+ years in business development or sales",
        "Experience in African markets",
        "Strong network in tech/business communities",
        "Entrepreneurial mindset and growth-focused approach"
      ]
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote (Africa)",
      type: "Full-time",
      description: "Design beautiful, intuitive experiences for our growing community of freelancers and clients across Africa.",
      requirements: [
        "3+ years of product design experience",
        "Strong portfolio of web and mobile designs",
        "Experience with design systems and user research",
        "Understanding of African user needs and contexts"
      ]
    }
  ];

  const benefits = [
    {
      icon: Globe,
      title: "Remote-First Culture",
      description: "Work from anywhere in Africa with flexible hours and a distributed team"
    },
    {
      icon: Heart,
      title: "Meaningful Mission",
      description: "Help unlock Africa's potential by connecting talented professionals with opportunities"
    },
    {
      icon: Users,
      title: "Learning & Growth",
      description: "Continuous learning budget, mentorship programs, and career development opportunities"
    },
    {
      icon: Briefcase,
      title: "Competitive Package",
      description: "Competitive salary, equity options, health insurance, and annual bonus program"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative">
      {/* Animated Background Effects */}
      <div className="floating-shapes">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
        <div className="floating-shape shape-6"></div>
      </div>
      
      {/* Back Navigation */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          onClick={() => onNavigate('landing')}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="relative z-10 pt-20 pb-12">
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join the <span className="gradient-text">Afrilance</span> Team
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Help us build the future of work in Africa. Join a passionate team committed to 
              unlocking the continent's incredible talent and connecting it with global opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-3 glow">
                View Open Positions
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
                Learn About Our Culture
              </Button>
            </div>
          </div>

          {/* Why Join Afrilance */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Why Join Afrilance?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <benefit.icon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-3">{benefit.title}</h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Open Positions</h2>
            <div className="space-y-6">
              {jobOpenings.map((job, index) => (
                <Card key={index} className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{job.title}</h3>
                        <div className="flex items-center gap-4 text-gray-400 text-sm">
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {job.department}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                        Apply Now
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{job.description}</p>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Key Requirements:</h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        {job.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start">
                            <span className="text-yellow-400 mr-2">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Company Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-gray-400">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">15+</div>
              <div className="text-gray-400">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">100%</div>
              <div className="text-gray-400">Remote-First</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">2020</div>
              <div className="text-gray-400">Founded</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Mission?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Don't see a perfect match? We're always looking for exceptional talent. 
              Send us your resume and tell us how you'd like to contribute to Afrilance's growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => onNavigate('contact')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-3 glow"
              >
                Get in Touch
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onNavigate('about')}
                className="border-white text-white hover:bg-white hover:text-black px-8 py-3"
              >
                Learn More About Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Careers;
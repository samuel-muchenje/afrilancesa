import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { ArrowLeft, Calendar, Download, ExternalLink, Award, TrendingUp, Globe, Users } from 'lucide-react';

const Press = ({ onNavigate }) => {
  const pressReleases = [
    {
      date: "December 15, 2024",
      title: "Afrilance Secures $5M Series A to Expand Across Africa",
      excerpt: "Leading South African freelance platform raises funding to accelerate growth and verification processes across the continent.",
      category: "Funding",
      link: "#"
    },
    {
      date: "November 8, 2024", 
      title: "Afrilance Launches Advanced Verification System for Freelancers",
      excerpt: "New identity verification and skills assessment system ensures quality and trust on the platform.",
      category: "Product",
      link: "#"
    },
    {
      date: "October 22, 2024",
      title: "Afrilance Partners with Major African Universities",
      excerpt: "Strategic partnerships with leading institutions to provide students and graduates with freelance opportunities.",
      category: "Partnerships",
      link: "#"
    },
    {
      date: "September 5, 2024",
      title: "Afrilance Reaches 50,000+ Verified Freelancers Milestone",
      excerpt: "Platform celebrates significant growth in verified talent across South Africa and neighboring countries.",
      category: "Milestone",
      link: "#"
    }
  ];

  const mediaKit = [
    {
      title: "Company Logo Pack",
      description: "High-resolution Afrilance logos in various formats",
      file: "afrilance-logo-pack.zip",
      size: "2.1 MB"
    },
    {
      title: "Executive Photos",
      description: "Professional headshots of our leadership team",
      file: "executive-photos.zip", 
      size: "8.7 MB"
    },
    {
      title: "Brand Guidelines", 
      description: "Complete brand identity and usage guidelines",
      file: "afrilance-brand-guidelines.pdf",
      size: "3.2 MB"
    },
    {
      title: "Company Fact Sheet",
      description: "Key statistics and company information",
      file: "afrilance-fact-sheet.pdf",
      size: "1.4 MB"
    }
  ];

  const awards = [
    {
      year: "2024",
      award: "African Tech Excellence Awards",
      category: "Best Freelance Platform"
    },
    {
      year: "2024", 
      award: "South African Startup Awards",
      category: "Rising Star"
    },
    {
      year: "2023",
      award: "Cape Town Innovation Hub",
      category: "Emerging Technology"
    }
  ];

  const keyStats = [
    { icon: Users, value: "50,000+", label: "Verified Freelancers" },
    { icon: Globe, value: "15+", label: "Countries Served" },
    { icon: TrendingUp, value: "200%", label: "YoY Growth" },
    { icon: Award, value: "95%", label: "Client Satisfaction" }
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
              Press & <span className="gradient-text">Media</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Latest news, press releases, and media resources about Afrilance and our mission 
              to connect Africa's talent with global opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => onNavigate('contact')}
                className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-3 glow"
              >
                Media Inquiries
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-3">
                Download Media Kit
              </Button>
            </div>
          </div>

          {/* Key Statistics */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {keyStats.map((stat, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <stat.icon className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Press Releases */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Recent Press Releases</h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <Card key={index} className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="flex items-center text-gray-400 text-sm">
                            <Calendar className="w-4 h-4 mr-1" />
                            {release.date}
                          </span>
                          <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-medium">
                            {release.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-3">{release.title}</h3>
                        <p className="text-gray-300 mb-4">{release.excerpt}</p>
                      </div>
                      <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black ml-4">
                        Read More
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Media Kit */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Media Kit & Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mediaKit.map((item, index) => (
                <Card key={index} className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                        <span className="text-xs text-gray-500">{item.size}</span>
                      </div>
                      <Button className="bg-yellow-400 text-black hover:bg-yellow-500 ml-4">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Awards & Recognition */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">Awards & Recognition</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {awards.map((award, index) => (
                <Card key={index} className="bg-gray-900 border-gray-700 hover:border-yellow-400 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Award className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <div className="text-lg font-semibold text-white mb-2">{award.award}</div>
                    <div className="text-gray-300 mb-2">{award.category}</div>
                    <div className="text-sm text-yellow-400 font-medium">{award.year}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-12 border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Media Inquiries</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              For press inquiries, interview requests, or additional information about Afrilance, 
              please contact our media team.
            </p>
            <div className="space-y-4 mb-8">
              <div className="text-gray-300">
                <strong className="text-white">Press Contact:</strong> press@afrilance.co.za
              </div>
              <div className="text-gray-300">
                <strong className="text-white">Media Relations:</strong> Sam Thabo, Head of Communications
              </div>
              <div className="text-gray-300">
                <strong className="text-white">Phone:</strong> 012 943 6048
              </div>
            </div>
            <Button 
              onClick={() => onNavigate('contact')}
              className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold px-8 py-3 glow"
            >
              Contact Press Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Press;
import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { ArrowLeft, Users, Globe, Award, Heart } from 'lucide-react';

const About = ({ onNavigate }) => {
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
            <h1 className="text-5xl font-bold text-white mb-6">About Afrilance</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We're building the future of freelance work in Africa, connecting verified South African talent with opportunities worldwide.
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">15,000+</h3>
                <p className="text-gray-400">Verified Freelancers</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="p-6">
                <Globe className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">50+</h3>
                <p className="text-gray-400">Countries Served</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="p-6">
                <Award className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">100,000+</h3>
                <p className="text-gray-400">Projects Completed</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700 text-center">
              <CardContent className="p-6">
                <Heart className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-white mb-2">4.8/5</h3>
                <p className="text-gray-400">Average Rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Mission */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 mb-4">
                At Afrilance, we believe that Africa is home to some of the world's most talented professionals. Our mission is to connect this incredible talent with opportunities that matter.
              </p>
              <p className="text-gray-300 mb-4">
                We're more than just a freelance platform – we're building a community that empowers African professionals to showcase their skills on a global stage while providing clients with access to world-class talent.
              </p>
              <p className="text-gray-300">
                Every freelancer on our platform is verified, ensuring quality and trust for both freelancers and clients.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Why Choose Afrilance?</h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <p className="text-gray-300"><strong className="text-white">Verified Talent:</strong> Every freelancer undergoes our rigorous verification process</p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <p className="text-gray-300"><strong className="text-white">Local Focus:</strong> Supporting South African professionals and businesses</p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <p className="text-gray-300"><strong className="text-white">Global Reach:</strong> Connecting local talent with international opportunities</p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                  <p className="text-gray-300"><strong className="text-white">Secure Platform:</strong> Built-in payment protection and dispute resolution</p>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Join the Afrilance Community?</h2>
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
                variant="outline"
                onClick={() => onNavigate('register')}
                className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3"
              >
                Hire Talent
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
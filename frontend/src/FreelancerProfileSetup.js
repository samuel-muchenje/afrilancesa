import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Progress } from './components/ui/progress';
import { 
  User, Briefcase, DollarSign, FileText, Plus, X, CheckCircle, 
  Clock, AlertTriangle, Upload, Globe, Star, ChevronRight,
  Target, Award, Zap, TrendingUp
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const FreelancerProfileSetup = ({ onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState({
    skills: [],
    experience: '',
    experience_level: 'intermediate',
    hourly_rate: '',
    bio: '',
    portfolio_links: [],
    specializations: [],
    languages: ['English'],
    availability: 'full-time'
  });
  
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentLink, setCurrentLink] = useState('');
  const [currentSpecialization, setCurrentSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check verification status
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: user?.is_verified || false,
    documentSubmitted: user?.id_document ? true : false
  });

  // Popular skills suggestions
  const popularSkills = [
    'React', 'Node.js', 'Python', 'JavaScript', 'PHP', 'WordPress',
    'Graphic Design', 'UI/UX Design', 'Digital Marketing', 'Content Writing',
    'Data Analysis', 'Mobile Development', 'SEO', 'Video Editing'
  ];

  // Steps configuration
  const steps = [
    { title: 'Skills & Expertise', icon: Briefcase, description: 'What you excel at' },
    { title: 'Experience & Rate', icon: DollarSign, description: 'Your background & pricing' },
    { title: 'Professional Profile', icon: User, description: 'Bio & portfolio' },
    { title: 'Final Details', icon: CheckCircle, description: 'Complete your setup' }
  ];

  const calculateProgress = () => {
    const totalFields = 7;
    let completedFields = 0;
    
    if (profileData.skills.length > 0) completedFields++;
    if (profileData.experience.trim()) completedFields++;
    if (profileData.hourly_rate) completedFields++;
    if (profileData.bio.trim()) completedFields++;
    if (profileData.experience_level) completedFields++;
    if (profileData.availability) completedFields++;
    if (profileData.languages.length > 0) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const addSkill = (skill = null) => {
    const skillToAdd = skill || currentSkill.trim();
    if (skillToAdd && !profileData.skills.includes(skillToAdd)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skillToAdd]
      }));
      if (!skill) setCurrentSkill('');
    }
  };

  const addSpecialization = () => {
    if (currentSpecialization.trim() && !profileData.specializations.includes(currentSpecialization.trim())) {
      setProfileData(prev => ({
        ...prev,
        specializations: [...prev.specializations, currentSpecialization.trim()]
      }));
      setCurrentSpecialization('');
    }
  };

  const removeSpecialization = (specToRemove) => {
    setProfileData(prev => ({
      ...prev,
      specializations: prev.specializations.filter(spec => spec !== specToRemove)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addPortfolioLink = () => {
    if (currentLink.trim() && !profileData.portfolio_links.includes(currentLink.trim())) {
      // Validate URL
      try {
        new URL(currentLink.trim());
        setProfileData(prev => ({
          ...prev,
          portfolio_links: [...prev.portfolio_links, currentLink.trim()]
        }));
        setCurrentLink('');
      } catch (e) {
        setError('Please enter a valid URL (e.g., https://example.com)');
      }
    }
  };

  const removePortfolioLink = (linkToRemove) => {
    setProfileData(prev => ({
      ...prev,
      portfolio_links: prev.portfolio_links.filter(link => link !== linkToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (profileData.skills.length === 0) {
        throw new Error('Please add at least one skill');
      }
      if (!profileData.experience.trim()) {
        throw new Error('Please describe your experience');
      }
      if (!profileData.hourly_rate || profileData.hourly_rate <= 0) {
        throw new Error('Please enter a valid hourly rate');
      }
      if (!profileData.bio.trim()) {
        throw new Error('Please write a professional bio');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE}/api/freelancer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skills: profileData.skills,
          experience: profileData.experience,
          hourly_rate: parseFloat(profileData.hourly_rate),
          bio: profileData.bio,
          portfolio_links: profileData.portfolio_links
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save profile');
      }

      setSuccess('Profile saved successfully!');
      
      // Update user data
      const updatedUser = { ...user, profile_completed: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
            alt="Afrilance" 
            className="h-12 w-auto mx-auto mb-6 afrilance-logo"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Freelancer Profile</h1>
          <p className="text-gray-400">Stand out to potential clients with a detailed profile</p>
        </div>

        {/* Verification Status */}
        <Card className="auth-card mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              {verificationStatus.isVerified ? (
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              ) : verificationStatus.documentSubmitted ? (
                <Clock className="w-5 h-5 text-yellow-400 mr-2" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              )}
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationStatus.isVerified ? (
              <div className="flex items-center text-green-400">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span>Verified - You can apply to jobs!</span>
              </div>
            ) : verificationStatus.documentSubmitted ? (
              <div className="flex items-center text-yellow-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>Document submitted - Pending admin verification</span>
              </div>
            ) : (
              <div className="text-red-400">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span>ID document required</span>
                </div>
                <p className="text-sm text-gray-400">
                  You'll need to upload your ID document for verification before applying to jobs.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="auth-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="bg-red-900/20 border-red-500/50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-900/20 border-green-500/50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
              )}

              {/* Skills */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Skills *
                </Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      placeholder="Add a skill (e.g., React, Python, Graphic Design)"
                      className="auth-input"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <Badge key={index} className="bg-green-600 text-white pr-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-red-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {profileData.skills.length === 0 && (
                    <p className="text-gray-400 text-sm">Add your key skills to attract relevant clients</p>
                  )}
                </div>
              </div>

              {/* Experience */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <User className="w-4 h-4 mr-2" />
                  Experience Description *
                </Label>
                <Textarea
                  name="experience"
                  value={profileData.experience}
                  onChange={handleInputChange}
                  placeholder="Describe your professional experience, previous projects, and achievements..."
                  className="auth-input resize-none"
                  rows={4}
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  {profileData.experience.length}/500 characters
                </p>
              </div>

              {/* Hourly Rate */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Hourly Rate (ZAR) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">R</span>
                  <Input
                    name="hourly_rate"
                    type="number"
                    min="50"
                    max="5000"
                    step="10"
                    value={profileData.hourly_rate}
                    onChange={handleInputChange}
                    placeholder="250"
                    className="auth-input pl-8"
                    required
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Set a competitive rate. You can always adjust this later.
                </p>
              </div>

              {/* Bio */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Professional Bio *
                </Label>
                <Textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  placeholder="Write a compelling bio that showcases your expertise and what makes you unique..."
                  className="auth-input resize-none"
                  rows={5}
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  {profileData.bio.length}/1000 characters
                </p>
              </div>

              {/* Portfolio Links */}
              <div>
                <Label className="text-white text-sm font-medium mb-2 block">
                  Portfolio Links (Optional)
                </Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={currentLink}
                      onChange={(e) => setCurrentLink(e.target.value)}
                      placeholder="https://yourportfolio.com or https://github.com/username"
                      className="auth-input"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPortfolioLink())}
                    />
                    <Button
                      type="button"
                      onClick={addPortfolioLink}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-4"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {profileData.portfolio_links.length > 0 && (
                    <div className="space-y-2">
                      {profileData.portfolio_links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-400 hover:underline text-sm truncate flex-1 mr-2"
                          >
                            {link}
                          </a>
                          <button
                            type="button"
                            onClick={() => removePortfolioLink(link)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold py-3 btn-glow"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                    Saving Profile...
                  </div>
                ) : (
                  'Complete Profile & Continue'
                )}
              </Button>

              <div className="text-center">
                <p className="text-gray-400 text-sm">
                  You can always update your profile later from your dashboard
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerProfileSetup;
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

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return profileData.skills.length > 0;
      case 1:
        return profileData.experience.trim() && profileData.hourly_rate > 0;
      case 2:
        return profileData.bio.trim().length >= 50;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Comprehensive validation
      if (profileData.skills.length === 0) {
        throw new Error('Please add at least one skill');
      }
      if (!profileData.experience.trim()) {
        throw new Error('Please describe your experience');
      }
      if (!profileData.hourly_rate || profileData.hourly_rate <= 0) {
        throw new Error('Please enter a valid hourly rate');
      }
      if (profileData.bio.trim().length < 50) {
        throw new Error('Professional bio must be at least 50 characters');
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
          experience_level: profileData.experience_level,
          hourly_rate: parseFloat(profileData.hourly_rate),
          bio: profileData.bio,
          portfolio_links: profileData.portfolio_links,
          specializations: profileData.specializations,
          languages: profileData.languages,
          availability: profileData.availability
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save profile');
      }

      setSuccess('Profile saved successfully! Welcome to Afrilance!');
      
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
      <div className="max-w-3xl mx-auto">
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

        {/* Progress Bar */}
        <Card className="auth-card mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400">Profile Completion</div>
              <div className="text-sm text-white font-semibold">{calculateProgress()}%</div>
            </div>
            <Progress value={calculateProgress()} className="h-2 mb-4" />
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep || calculateProgress() === 100;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isActive ? 'bg-yellow-400 text-black' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div className={`text-xs text-center ${
                      isActive ? 'text-white font-semibold' : 'text-gray-400'
                    }`}>
                      <div>{step.title}</div>
                      <div className="text-gray-500">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                <p className="text-sm text-gray-400 mb-3">
                  You'll need to upload your ID document for verification before applying to jobs.
                </p>
                <Button
                  size="sm"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload ID Document
                </Button>
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

              {/* Step 1: Skills & Expertise */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Briefcase className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Skills & Expertise</h2>
                    <p className="text-gray-400">What services can you provide to clients?</p>
                  </div>

                  {/* Skills */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-3">
                      <Star className="w-4 h-4 mr-2" />
                      Your Skills *
                    </Label>
                    
                    {/* Popular Skills */}
                    <div className="mb-4">
                      <p className="text-gray-400 text-sm mb-2">Popular skills (click to add):</p>
                      <div className="flex flex-wrap gap-2">
                        {popularSkills.filter(skill => !profileData.skills.includes(skill)).slice(0, 8).map((skill, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSkill(skill)}
                            className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {skill}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          value={currentSkill}
                          onChange={(e) => setCurrentSkill(e.target.value)}
                          placeholder="Add a custom skill"
                          className="auth-input"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        />
                        <Button
                          type="button"
                          onClick={() => addSkill()}
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
                      <p className="text-gray-400 text-xs">
                        {profileData.skills.length}/10 skills added
                      </p>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Target className="w-4 h-4 mr-2" />
                      Specializations (Optional)
                    </Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          value={currentSpecialization}
                          onChange={(e) => setCurrentSpecialization(e.target.value)}
                          placeholder="e.g., E-commerce websites, Mobile app design"
                          className="auth-input"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                        />
                        <Button
                          type="button"
                          onClick={addSpecialization}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {profileData.specializations.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {profileData.specializations.map((spec, index) => (
                            <Badge key={index} className="bg-blue-600 text-white pr-1">
                              {spec}
                              <button
                                type="button"
                                onClick={() => removeSpecialization(spec)}
                                className="ml-2 hover:text-red-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Experience & Rate */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <DollarSign className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Experience & Pricing</h2>
                    <p className="text-gray-400">Tell us about your background and set your rate</p>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Award className="w-4 h-4 mr-2" />
                      Experience Level *
                    </Label>
                    <select
                      name="experience_level"
                      value={profileData.experience_level}
                      onChange={handleInputChange}
                      className="w-full auth-input"
                      required
                    >
                      <option value="beginner">Beginner (0-2 years)</option>
                      <option value="intermediate">Intermediate (2-5 years)</option>
                      <option value="expert">Expert (5+ years)</option>
                    </select>
                  </div>

                  {/* Experience Description */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Experience Description *
                    </Label>
                    <Textarea
                      name="experience"
                      value={profileData.experience}
                      onChange={handleInputChange}
                      placeholder="Describe your professional experience, key projects, and notable achievements..."
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
                    <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Suggested rates:</span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1">
                        <span className="text-gray-500">Beginner: R50-150/hr</span>
                        <span className="text-gray-500">Intermediate: R150-400/hr</span>
                        <span className="text-gray-500">Expert: R400+/hr</span>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      Availability *
                    </Label>
                    <select
                      name="availability"
                      value={profileData.availability}
                      onChange={handleInputChange}
                      className="w-full auth-input"
                      required
                    >
                      <option value="full-time">Full-time (40+ hours/week)</option>
                      <option value="part-time">Part-time (20-39 hours/week)</option>
                      <option value="weekends">Weekends only</option>
                      <option value="project-based">Project-based</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Step 3: Professional Profile */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <User className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Professional Profile</h2>
                    <p className="text-gray-400">Create your compelling professional story</p>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2" />
                      Professional Bio * (minimum 50 characters)
                    </Label>
                    <Textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      placeholder="Write a compelling bio that showcases your expertise, personality, and what makes you unique. Mention your passion, key achievements, and what clients can expect when working with you..."
                      className="auth-input resize-none"
                      rows={6}
                      required
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-400 text-xs">
                        {profileData.bio.length}/1000 characters
                      </p>
                      <p className={`text-xs ${profileData.bio.length >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                        {profileData.bio.length >= 50 ? '✓ Minimum met' : `${50 - profileData.bio.length} more needed`}
                      </p>
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Globe className="w-4 h-4 mr-2" />
                      Languages
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.languages.map((lang, index) => (
                        <Badge key={index} className="bg-purple-600 text-white">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-gray-400 text-xs mt-1">
                      Language selection will be enhanced in future updates
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
                </div>
              )}

              {/* Step 4: Final Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Ready to Get Started!</h2>
                    <p className="text-gray-400">Review your profile and complete setup</p>
                  </div>

                  {/* Profile Preview */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Profile Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full flex items-center justify-center text-black text-2xl font-bold">
                          {user?.full_name?.charAt(0) || 'F'}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{user?.full_name}</h3>
                          <p className="text-yellow-400">R{profileData.hourly_rate}/hour • {profileData.experience_level}</p>
                          <p className="text-gray-400 text-sm">{profileData.availability}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-2">Skills ({profileData.skills.length})</h4>
                        <div className="flex flex-wrap gap-1">
                          {profileData.skills.slice(0, 8).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {profileData.skills.length > 8 && (
                            <Badge variant="outline" className="text-xs text-gray-400">
                              +{profileData.skills.length - 8} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium mb-2">Bio</h4>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {profileData.bio.substring(0, 200)}{profileData.bio.length > 200 && '...'}
                        </p>
                      </div>

                      <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                        <div className="flex items-center text-green-400 mb-2">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          <span className="font-medium">Profile Strength: Strong</span>
                        </div>
                        <p className="text-green-300 text-sm">
                          Your profile is well-optimized to attract quality clients!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Previous
                  </Button>
                )}

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold ml-auto"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold py-3 btn-glow ml-auto"
                    disabled={loading || !validateStep(currentStep)}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                        Saving Profile...
                      </div>
                    ) : (
                      'Complete Profile & Start Freelancing!'
                    )}
                  </Button>
                )}
              </div>

              {currentStep === steps.length - 1 && (
                <div className="text-center">
                  <p className="text-gray-400 text-sm">
                    You can always update your profile later from your dashboard
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelancerProfileSetup;
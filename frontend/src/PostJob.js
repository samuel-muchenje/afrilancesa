import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Progress } from './components/ui/progress';
import { 
  Briefcase, DollarSign, FileText, Plus, X, CheckCircle, AlertTriangle, 
  Clock, Users, MapPin, Calendar, Target, Zap, Eye, TrendingUp,
  ChevronRight, Globe, Star
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PostJob = ({ onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    budget_type: 'fixed',
    requirements: [],
    timeline: '',
    experience_required: 'intermediate',
    location_preference: 'remote',
    project_duration: '',
    additional_info: ''
  });

  const [currentRequirement, setCurrentRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Web Development',
    'Mobile Development', 
    'UI/UX Design',
    'Graphic Design',
    'Digital Marketing',
    'Content Writing',
    'Data Analysis',
    'SEO Services',
    'Video Editing',
    'Photography',
    'Translation',
    'Virtual Assistant',
    'Other'
  ];

  // Steps configuration
  const steps = [
    { title: 'Job Basics', icon: FileText, description: 'Title, category & description' },
    { title: 'Budget & Timeline', icon: DollarSign, description: 'Pricing & project schedule' },
    { title: 'Requirements', icon: Target, description: 'Skills & experience needed' },
    { title: 'Review & Post', icon: CheckCircle, description: 'Final review & publish' }
  ];

  const calculateProgress = () => {
    const totalFields = 6;
    let completedFields = 0;
    
    if (jobData.title.trim()) completedFields++;
    if (jobData.description.trim()) completedFields++;
    if (jobData.category) completedFields++;
    if (jobData.budget) completedFields++;
    if (jobData.timeline) completedFields++;
    if (jobData.experience_required) completedFields++;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return jobData.title.trim() && jobData.description.trim() && jobData.category;
      case 1:
        return jobData.budget > 0 && jobData.timeline;
      case 2:
        return jobData.experience_required && jobData.location_preference;
      case 3:
        return true;
      default:
        return false;
    }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const addRequirement = () => {
    if (currentRequirement.trim() && !jobData.requirements.includes(currentRequirement.trim())) {
      setJobData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }));
      setCurrentRequirement('');
    }
  };

  const removeRequirement = (reqToRemove) => {
    setJobData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(req => req !== reqToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Comprehensive validation
      if (!jobData.title.trim()) {
        throw new Error('Please enter a job title');
      }
      if (jobData.title.length < 10) {
        throw new Error('Job title should be at least 10 characters');
      }
      if (!jobData.description.trim()) {
        throw new Error('Please provide a job description');
      }
      if (jobData.description.length < 50) {
        throw new Error('Job description should be at least 50 characters');
      }
      if (!jobData.category) {
        throw new Error('Please select a category');
      }
      if (!jobData.budget || jobData.budget <= 0) {
        throw new Error('Please enter a valid budget');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: jobData.title,
          description: jobData.description,
          category: jobData.category,
          budget: parseFloat(jobData.budget),
          budget_type: jobData.budget_type,
          requirements: jobData.requirements,
          timeline: jobData.timeline,
          experience_required: jobData.experience_required,
          location_preference: jobData.location_preference,
          project_duration: jobData.project_duration,
          additional_info: jobData.additional_info
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to post job');
      }

      const result = await response.json();
      setSuccess('🎉 Job posted successfully! Freelancers can now apply and you\'ll start receiving proposals soon.');

      setTimeout(() => {
        onComplete(result);
      }, 3000);

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
          <h1 className="text-3xl font-bold text-white mb-2">Post Your Job</h1>
          <p className="text-gray-400">Find the perfect freelancer for your project</p>
        </div>

        {/* Progress Bar */}
        <Card className="auth-card mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400">Job Posting Progress</div>
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
                      {isCompleted && index < currentStep ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
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

        {/* Welcome Message */}
        <Card className="auth-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 rounded-full p-2">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Welcome to Afrilance, {user?.full_name}! 🚀</h3>
                <p className="text-gray-400 text-sm mt-1">
                  As a verified client, you can post jobs immediately and receive proposals from talented South African freelancers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="auth-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
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

              {/* Step 1: Job Basics */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <FileText className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Job Basics</h2>
                    <p className="text-gray-400">Let's start with the fundamental details of your project</p>
                  </div>

                  {/* Job Title */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Star className="w-4 h-4 mr-2" />
                      Job Title * (minimum 10 characters)
                    </Label>
                    <Input
                      name="title"
                      value={jobData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Build a Modern E-commerce Website with React"
                      className="auth-input"
                      required
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-400 text-xs">
                        {jobData.title.length}/100 characters
                      </p>
                      <p className={`text-xs ${jobData.title.length >= 10 ? 'text-green-400' : 'text-red-400'}`}>
                        {jobData.title.length >= 10 ? '✓ Minimum met' : `${10 - jobData.title.length} more needed`}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Project Category *
                    </Label>
                    <select
                      name="category"
                      value={jobData.category}
                      onChange={handleInputChange}
                      className="w-full auth-input"
                      required
                    >
                      <option value="">Select the most relevant category</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category} className="bg-gray-800">
                          {category}
                        </option>
                      ))}
                    </select>
                    <p className="text-gray-400 text-xs mt-1">
                      Choose the category that best describes your project
                    </p>
                  </div>

                  {/* Job Description */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <FileText className="w-4 h-4 mr-2" />
                      Project Description * (minimum 50 characters)
                    </Label>
                    <Textarea
                      name="description"
                      value={jobData.description}
                      onChange={handleInputChange}
                      placeholder="Describe your project in detail. Include:
• What you need accomplished
• Your goals and expectations
• Any specific requirements or preferences
• Key deliverables you're looking for
• Any examples or references that might help"
                      className="auth-input resize-none"
                      rows={8}
                      required
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-gray-400 text-xs">
                        {jobData.description.length}/2000 characters
                      </p>
                      <p className={`text-xs ${jobData.description.length >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                        {jobData.description.length >= 50 ? '✓ Minimum met' : `${50 - jobData.description.length} more needed`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Budget & Timeline */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <DollarSign className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Budget & Timeline</h2>
                    <p className="text-gray-400">Set your budget and project timeline</p>
                  </div>

                  {/* Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white text-sm font-medium flex items-center mb-2">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Budget (ZAR) *
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">R</span>
                        <Input
                          name="budget"
                          type="number"
                          min="100"
                          step="50"
                          value={jobData.budget}
                          onChange={handleInputChange}
                          placeholder="2500"
                          className="auth-input pl-8"
                          required
                        />
                      </div>
                      <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Small projects:</span>
                            <span className="text-gray-300">R500 - R2,500</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Medium projects:</span>
                            <span className="text-gray-300">R2,500 - R10,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Large projects:</span>
                            <span className="text-gray-300">R10,000+</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white text-sm font-medium flex items-center mb-2">
                        <Clock className="w-4 h-4 mr-2" />
                        Budget Type *
                      </Label>
                      <select
                        name="budget_type"
                        value={jobData.budget_type}
                        onChange={handleInputChange}
                        className="w-full auth-input"
                        required
                      >
                        <option value="fixed" className="bg-gray-800">Fixed Price Project</option>
                        <option value="hourly" className="bg-gray-800">Hourly Rate (Max)</option>
                      </select>
                      <p className="text-gray-400 text-xs mt-1">
                        {jobData.budget_type === 'fixed' 
                          ? 'Total budget for the entire project'
                          : 'Maximum hourly rate you\'re willing to pay'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      Project Timeline *
                    </Label>
                    <select
                      name="timeline"
                      value={jobData.timeline}
                      onChange={handleInputChange}
                      className="w-full auth-input"
                      required
                    >
                      <option value="">Select expected timeline</option>
                      <option value="asap" className="bg-gray-800">ASAP (Rush job)</option>
                      <option value="1-week" className="bg-gray-800">Within 1 week</option>
                      <option value="2-weeks" className="bg-gray-800">Within 2 weeks</option>
                      <option value="1-month" className="bg-gray-800">Within 1 month</option>
                      <option value="2-months" className="bg-gray-800">Within 2 months</option>
                      <option value="3-months+" className="bg-gray-800">3+ months</option>
                      <option value="flexible" className="bg-gray-800">Flexible timeline</option>
                    </select>
                  </div>

                  {/* Project Duration */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-centers mb-2">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Expected Duration (Optional)
                    </Label>
                    <Input
                      name="project_duration"
                      value={jobData.project_duration}
                      onChange={handleInputChange}
                      placeholder="e.g., 2-3 weeks of work, ongoing project, one-time task"
                      className="auth-input"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Requirements */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Target className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Requirements & Preferences</h2>
                    <p className="text-gray-400">Specify what you're looking for in a freelancer</p>
                  </div>

                  {/* Experience Required */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Users className="w-4 h-4 mr-2" />
                      Experience Level *
                    </Label>
                    <select
                      name="experience_required"
                      value={jobData.experience_required}
                      onChange={handleInputChange}
                      className="w-full auth-input"
                      required
                    >
                      <option value="beginner" className="bg-gray-800">Beginner (0-2 years) - Budget friendly</option>
                      <option value="intermediate" className="bg-gray-800">Intermediate (2-5 years) - Good balance</option>
                      <option value="expert" className="bg-gray-800">Expert (5+ years) - Premium quality</option>
                    </select>
                  </div>

                  {/* Location Preference */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      Location Preference *
                    </Label>
                    <select
                      name="location_preference"
                      value={jobData.location_preference}
                      onChange={handleInputChange}
                      className="w-full auth-input"
                      required
                    >
                      <option value="remote" className="bg-gray-800">Remote work (anywhere in SA)</option>
                      <option value="local-cape-town" className="bg-gray-800">Cape Town area preferred</option>
                      <option value="local-johannesburg" className="bg-gray-800">Johannesburg area preferred</option>
                      <option value="local-durban" className="bg-gray-800">Durban area preferred</option>
                      <option value="local-other" className="bg-gray-800">Other specific location</option>
                    </select>
                  </div>

                  {/* Requirements */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Zap className="w-4 h-4 mr-2" />
                      Specific Requirements (Optional)
                    </Label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          value={currentRequirement}
                          onChange={(e) => setCurrentRequirement(e.target.value)}
                          placeholder="e.g., Portfolio required, 3+ years React experience, Available for meetings"
                          className="auth-input"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                        />
                        <Button
                          type="button"
                          onClick={addRequirement}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {jobData.requirements.map((req, index) => (
                          <Badge key={index} className="bg-green-600 text-white pr-1">
                            {req}
                            <button
                              type="button"
                              onClick={() => removeRequirement(req)}
                              className="ml-2 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-gray-400 text-xs">
                        Add specific skills, tools, or qualifications you need
                      </p>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div>
                    <Label className="text-white text-sm font-medium flex items-center mb-2">
                      <Globe className="w-4 h-4 mr-2" />
                      Additional Information (Optional)
                    </Label>
                    <Textarea
                      name="additional_info"
                      value={jobData.additional_info}
                      onChange={handleInputChange}
                      placeholder="Any additional details, special instructions, or questions for potential freelancers..."
                      className="auth-input resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review & Post */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Review & Post Your Job</h2>
                    <p className="text-gray-400">Double-check everything looks good before posting</p>
                  </div>

                  {/* Job Preview */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between">
                        <span>Job Preview</span>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          Ready to Post
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{jobData.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <span className="flex items-center">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {jobData.category}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            R{jobData.budget} ({jobData.budget_type})
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {jobData.timeline}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                          {jobData.description.substring(0, 300)}{jobData.description.length > 300 && '...'}
                        </p>
                        
                        {jobData.requirements.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-white font-medium mb-2">Requirements:</h4>
                            <div className="flex flex-wrap gap-1">
                              {jobData.requirements.map((req, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Experience:</span>
                            <p className="text-white capitalize">{jobData.experience_required}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Location:</span>
                            <p className="text-white capitalize">{jobData.location_preference.replace('-', ' ')}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
                        <div className="flex items-center text-green-400 mb-2">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          <span className="font-medium">Job Quality: Excellent</span>
                        </div>
                        <p className="text-green-300 text-sm">
                          Your job posting is well-detailed and likely to attract quality freelancers!
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-900/20 border-blue-600/30">
                    <CardContent className="p-4">
                      <h4 className="text-blue-400 font-medium mb-2">What happens next?</h4>
                      <ul className="text-blue-300 text-sm space-y-1">
                        <li>✓ Your job will be posted and visible to qualified freelancers</li>
                        <li>✓ Freelancers will submit proposals with their approach and pricing</li>
                        <li>✓ You can review proposals, check portfolios, and communicate with candidates</li>
                        <li>✓ Choose the best freelancer and start your project</li>
                      </ul>
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
                        Posting Job...
                      </div>
                    ) : (
                      '🚀 Post Job & Find Freelancers!'
                    )}
                  </Button>
                )}
              </div>

              {currentStep === steps.length - 1 && !success && (
                <div className="text-center space-y-2">
                  <p className="text-gray-400 text-sm">
                    After posting, qualified freelancers will submit proposals for your review
                  </p>
                  <button
                    type="button"
                    onClick={() => onComplete()}
                    className="text-yellow-400 hover:underline text-sm"
                  >
                    Skip for now - Go to dashboard
                  </button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;
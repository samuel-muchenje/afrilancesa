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
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
            alt="Afrilance" 
            className="h-12 w-auto mx-auto mb-6 afrilance-logo"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Post Your First Job</h1>
          <p className="text-gray-400">Find the perfect freelancer for your project</p>
        </div>

        {/* Welcome Message */}
        <Card className="auth-card mb-6">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-green-600 rounded-full p-2">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Welcome to Afrilance, {user?.full_name}!</h3>
                <p className="text-gray-400 text-sm mt-1">
                  As a verified client, you can immediately post jobs and receive proposals from talented South African freelancers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="auth-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Job Details
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

              {/* Job Title */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Job Title *
                </Label>
                <Input
                  name="title"
                  value={jobData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Website Development for Small Business"
                  className="auth-input"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Category *
                </Label>
                <select
                  name="category"
                  value={jobData.category}
                  onChange={handleInputChange}
                  className="w-full auth-input"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category} className="bg-gray-800">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Description */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Job Description *
                </Label>
                <Textarea
                  name="description"
                  value={jobData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project in detail. Include what you need, your expectations, timeline, and any specific requirements..."
                  className="auth-input resize-none"
                  rows={6}
                  required
                />
                <p className="text-gray-400 text-xs mt-1">
                  {jobData.description.length}/2000 characters
                </p>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-2 gap-4">
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
                    <option value="fixed" className="bg-gray-800">Fixed Price</option>
                    <option value="hourly" className="bg-gray-800">Hourly Rate</option>
                  </select>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <Users className="w-4 h-4 mr-2" />
                  Requirements (Optional)
                </Label>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <Input
                      value={currentRequirement}
                      onChange={(e) => setCurrentRequirement(e.target.value)}
                      placeholder="Add a requirement (e.g., 3+ years experience, Portfolio required)"
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
                  {jobData.requirements.length === 0 && (
                    <p className="text-gray-400 text-sm">Add specific requirements to attract qualified freelancers</p>
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
                    Posting Job...
                  </div>
                ) : (
                  'Post Job & Find Freelancers'
                )}
              </Button>

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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostJob;
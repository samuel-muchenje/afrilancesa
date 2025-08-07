import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Register = ({ onNavigate, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'freelancer'
  });
  
  const [idDocument, setIdDocument] = useState(null);
  const [idConfirmed, setIdConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPEG, PNG, or PDF files only.');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Maximum size is 5MB.');
        return;
      }

      setIdDocument(file);
      setError('');
    }
  };

  const uploadIdDocument = async (userId, token) => {
    if (!idDocument) return;

    const formData = new FormData();
    formData.append('file', idDocument);

    try {
      const response = await fetch(`${API_BASE}/api/upload-id-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload ID document');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
        throw new Error('Please fill in all required fields');
      }

      // Validate freelancer-specific requirements
      if (formData.role === 'freelancer') {
        if (!idDocument) {
          throw new Error('ID document is required for freelancers');
        }
        if (!idConfirmed) {
          throw new Error('Please confirm that your ID document is valid');
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password strength
      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Register user
      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      
      // Store user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Upload ID document if freelancer
      if (formData.role === 'freelancer' && idDocument) {
        setUploadProgress(50);
        try {
          await uploadIdDocument(data.user.id, data.token);
          setUploadProgress(100);
        } catch (uploadError) {
          console.error('ID upload failed:', uploadError);
          // Don't fail registration if upload fails, just show warning
          setError('Registration successful, but ID upload failed. You can upload it later from your profile.');
          setTimeout(() => {
            onRegisterSuccess(data.user, formData.role);
          }, 2000);
          return;
        }
      }

      // Success - redirect based on role
      setTimeout(() => {
        onRegisterSuccess(data.user, formData.role);
      }, 1000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
            alt="Afrilance" 
            className="h-12 w-auto mx-auto mb-6 afrilance-logo"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Afrilance Account</h1>
          <p className="text-gray-400">Join South Africa's premier freelance platform</p>
        </div>

        <Card className="auth-card">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="bg-red-900/20 border-red-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              {/* Full Name */}
              <div>
                <Label className="text-white text-sm font-medium">Full Name *</Label>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="auth-input mt-1"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label className="text-white text-sm font-medium">Email Address *</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="auth-input mt-1"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <Label className="text-white text-sm font-medium">Phone Number *</Label>
                <Input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+27 123 456 789"
                  className="auth-input mt-1"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label className="text-white text-sm font-medium">Password *</Label>
                <div className="relative mt-1">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className="auth-input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded ${
                            i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                    </p>
                  </div>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <Label className="text-white text-sm font-medium">I am a *</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'freelancer' 
                      ? 'border-yellow-400 bg-yellow-400/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="freelancer"
                      checked={formData.role === 'freelancer'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-white font-medium">Freelancer</div>
                      <div className="text-gray-400 text-xs">Offer services</div>
                    </div>
                  </label>
                  
                  <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.role === 'client' 
                      ? 'border-green-400 bg-green-400/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="client"
                      checked={formData.role === 'client'}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-white font-medium">Client</div>
                      <div className="text-gray-400 text-xs">Hire talent</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Freelancer-specific fields */}
              {formData.role === 'freelancer' && (
                <div className="space-y-4 p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-lg">
                  <h3 className="text-white font-medium flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-yellow-400" />
                    Freelancer Verification
                  </h3>
                  
                  {/* ID Document Upload */}
                  <div>
                    <Label className="text-white text-sm font-medium">Upload ID Document *</Label>
                    <p className="text-gray-400 text-xs mb-2">
                      Upload a clear photo of your South African ID, passport, or driver's license (JPEG, PNG, PDF - Max 5MB)
                    </p>
                    
                    <div className="mt-2">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        id="id-document"
                        required
                      />
                      <label
                        htmlFor="id-document"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors bg-gray-900/50"
                      >
                        {idDocument ? (
                          <div className="text-center">
                            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <p className="text-white font-medium">{idDocument.name}</p>
                            <p className="text-gray-400 text-sm">
                              {(idDocument.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-white font-medium">Click to upload ID document</p>
                            <p className="text-gray-400 text-sm">JPEG, PNG, PDF up to 5MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>

                  {/* ID Confirmation Checkbox */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="id-confirm"
                      checked={idConfirmed}
                      onChange={(e) => setIdConfirmed(e.target.checked)}
                      className="mt-1 accent-yellow-400"
                      required
                    />
                    <label htmlFor="id-confirm" className="text-white text-sm">
                      I confirm this is a valid South African identification document and 
                      I understand that providing false information may result in account suspension.
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold py-3 btn-glow"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                    {formData.role === 'freelancer' && idDocument ? 'Creating Account & Uploading ID...' : 'Creating Account...'}
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Footer Links */}
              <div className="text-center space-y-2">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="text-yellow-400 hover:underline font-medium"
                  >
                    Sign in here
                  </button>
                </p>
                
                <button
                  type="button"
                  onClick={() => onNavigate('landing')}
                  className="flex items-center justify-center text-gray-400 hover:text-white transition-colors mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
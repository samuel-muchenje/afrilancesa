import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Mail, Lock } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const Login = ({ onNavigate, onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.email || !formData.password) {
        throw new Error('Please enter both email and password');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Make login request
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Validate response
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      // Store user session
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Success - redirect based on role
      onLoginSuccess(data.user, data.user.role);

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBasedWelcomeText = () => {
    const email = formData.email.toLowerCase();
    
    // Simple role detection based on email patterns (just for UI hints)
    if (email.includes('admin') || email.includes('support')) {
      return 'Access your admin dashboard';
    } else if (email.includes('hire') || email.includes('client') || email.includes('business')) {
      return 'Find talented freelancers for your projects';
    } else {
      return 'Access your freelancer dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
      {/* Animated Background Effects */}
      <div className="floating-shapes">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        <div className="floating-shape shape-4"></div>
        <div className="floating-shape shape-5"></div>
        <div className="floating-shape shape-6"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
            alt="Afrilance" 
            className="h-12 w-auto mx-auto mb-6 afrilance-logo"
          />
          <h1 className="text-3xl font-bold text-white mb-2">Login to Afrilance</h1>
          <p className="text-gray-400">Welcome back to South Africa's premier freelance platform</p>
          {formData.email && (
            <p className="text-yellow-400 text-sm mt-2">{getRoleBasedWelcomeText()}</p>
          )}
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

              {/* Email */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address *
                </Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="auth-input"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <Label className="text-white text-sm font-medium flex items-center mb-2">
                  <Lock className="w-4 h-4 mr-2" />
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="auth-input pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-300">
                  <input
                    type="checkbox"
                    className="mr-2 accent-yellow-400"
                    defaultChecked
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  className="text-sm text-yellow-400 hover:underline"
                  onClick={() => {
                    // Could implement forgot password later
                    alert('Please contact support if you forgot your password');
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold py-3 btn-glow"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In to Afrilance'
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-black px-2 text-gray-400">New to Afrilance?</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">
                  Join thousands of South African freelancers and clients
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigate('register')}
                  className="w-full border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400"
                >
                  Create Your Account
                </Button>
              </div>

              {/* Footer Links */}
              <div className="text-center mt-6">
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

        {/* Role-based Login Hints */}
        <div className="mt-8 text-center">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-white font-medium mb-3">Quick Login Hints</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="text-center">
                <div className="text-green-400 font-medium">Freelancers</div>
                <div className="text-gray-400">Access your profile & jobs</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-medium">Clients</div>
                <div className="text-gray-400">Manage projects & hire talent</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-medium">Admins</div>
                <div className="text-gray-400">Platform management tools</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
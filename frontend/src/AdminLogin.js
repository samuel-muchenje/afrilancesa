import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Alert, AlertDescription } from './components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Eye, EyeOff, AlertCircle, ArrowLeft, Mail, Lock, Shield, UserPlus, CheckCircle } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const AdminLogin = ({ onNavigate, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  // Registration request state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    department: '',
    reason: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateAfrilanceDomain = (email) => {
    return email.toLowerCase().endsWith('@afrilance.co.za');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!loginData.email || !loginData.password) {
        throw new Error('Please enter both email and password');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate Afrilance domain for admin login
      if (!validateAfrilanceDomain(loginData.email)) {
        throw new Error('Admin access is restricted to @afrilance.co.za email addresses');
      }

      // Make login request
      const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Check if user is actually an admin
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Check if admin account is approved
      if (!data.user.admin_approved) {
        throw new Error('Your admin account is pending approval. Please contact sam@afrilance.co.za');
      }

      // Store user data and token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call success callback
      onLoginSuccess(data.user, data.user.role);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      const requiredFields = ['email', 'password', 'confirmPassword', 'full_name', 'phone', 'department', 'reason'];
      for (const field of requiredFields) {
        if (!registerData[field]) {
          throw new Error(`Please fill in ${field.replace('_', ' ')}`);
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate Afrilance domain
      if (!validateAfrilanceDomain(registerData.email)) {
        throw new Error('Admin requests are only accepted from @afrilance.co.za email addresses');
      }

      // Validate password match
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate password strength
      if (registerData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Make admin registration request
      const response = await fetch(`${API_BASE}/api/admin/register-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
          full_name: registerData.full_name,
          phone: registerData.phone,
          department: registerData.department,
          reason: registerData.reason
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration request failed');
      }

      setSuccess('Admin access request submitted successfully! You will receive an email once your request is reviewed by sam@afrilance.co.za');
      
      // Clear form
      setRegisterData({
        email: '',
        password: '',
        confirmPassword: '',
        full_name: '',
        phone: '',
        department: '',
        reason: ''
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="https://customer-assets.emergentagent.com/job_sa-freelancers/artifacts/n2pyrvrg_4.png" 
              alt="Afrilance" 
              className="h-12 w-auto"
            />
            <Shield className="w-8 h-8 text-yellow-400 ml-3" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Secure access for Afrilance administrators</p>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('landing')}
                className="text-gray-400 hover:text-white p-0 h-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="login" className="data-[state=active]:bg-gray-700">
                  <Lock className="w-4 h-4 mr-2" />
                  Admin Login
                </TabsTrigger>
                <TabsTrigger value="request" className="data-[state=active]:bg-gray-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Request Access
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-200">Admin Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@afrilance.co.za"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="pl-10 bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-200">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="bg-red-900/50 border-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-black font-semibold py-3"
                  >
                    {loading ? 'Signing In...' : 'Sign In to Admin Portal'}
                  </Button>
                </form>

                <div className="text-center pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Need admin access? <button 
                      onClick={() => setActiveTab('request')} 
                      className="text-yellow-400 hover:text-yellow-300 underline"
                    >
                      Request Access
                    </button>
                  </p>
                </div>
              </TabsContent>

              {/* Request Access Tab */}
              <TabsContent value="request" className="space-y-4 mt-6">
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="text-blue-200 font-medium">Admin Access Requirements</h3>
                      <p className="text-blue-300 text-sm mt-1">
                        Only @afrilance.co.za email addresses can request admin access. 
                        All requests are reviewed by sam@afrilance.co.za
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRegisterRequest} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-gray-200">Email Address *</Label>
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        placeholder="your.name@afrilance.co.za"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-gray-200">Full Name *</Label>
                      <Input
                        id="reg-name"
                        name="full_name"
                        type="text"
                        placeholder="Your Full Name"
                        value={registerData.full_name}
                        onChange={handleRegisterChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-phone" className="text-gray-200">Phone Number *</Label>
                      <Input
                        id="reg-phone"
                        name="phone"
                        type="tel"
                        placeholder="012 XXX XXXX"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-department" className="text-gray-200">Department/Role *</Label>
                      <Input
                        id="reg-department"
                        name="department"
                        type="text"
                        placeholder="e.g., Customer Support, Operations, Management"
                        value={registerData.department}
                        onChange={handleRegisterChange}
                        className="bg-gray-800 border-gray-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-gray-200">Password *</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={registerData.password}
                          onChange={handleRegisterChange}
                          className="pr-10 bg-gray-800 border-gray-600 text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-confirm" className="text-gray-200">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="reg-confirm"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={registerData.confirmPassword}
                          onChange={handleRegisterChange}
                          className="pr-10 bg-gray-800 border-gray-600 text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-reason" className="text-gray-200">Reason for Admin Access *</Label>
                      <textarea
                        id="reg-reason"
                        name="reason"
                        placeholder="Please explain why you need admin access and your role at Afrilance..."
                        value={registerData.reason}
                        onChange={handleRegisterChange}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert className="bg-red-900/50 border-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-200">{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="bg-green-900/50 border-green-500">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-200">{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                  >
                    {loading ? 'Submitting Request...' : 'Request Admin Access'}
                  </Button>
                </form>

                <div className="text-center pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Already have admin access? <button 
                      onClick={() => setActiveTab('login')} 
                      className="text-yellow-400 hover:text-yellow-300 underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2025 Afrilance. Admin portal access is restricted and monitored.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
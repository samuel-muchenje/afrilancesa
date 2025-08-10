import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, FileText, Image, Video, Award, Clock, 
  CheckCircle, AlertTriangle, Lightbulb, Activity,
  Download, Eye, Target, Users, Star
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const PortfolioAnalytics = ({ freelancerId, token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (freelancerId && token) {
      fetchAnalytics();
    }
  }, [freelancerId, token]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/portfolio/analytics/${freelancerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        setError('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatStorage = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes;
    if (mb < 1) return `${(mb * 1024).toFixed(0)} KB`;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  // Colors for charts
  const COLORS = {
    primary: '#FBBF24', // yellow-400
    secondary: '#10B981', // green-500
    accent: '#8B5CF6', // purple-500
    info: '#3B82F6', // blue-500
    success: '#059669', // green-600
    warning: '#F59E0B', // amber-500
    error: '#DC2626' // red-600
  };

  const PIE_COLORS = ['#FBBF24', '#10B981', '#8B5CF6', '#3B82F6'];

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-32 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Analytics Unavailable</h3>
          <p className="text-gray-400">{error || 'Unable to load analytics data'}</p>
        </CardContent>
      </Card>
    );
  }

  const { overview, file_breakdown, project_analytics, storage_usage, recommendations } = analytics;

  // Prepare chart data
  const fileBreakdownData = [
    { name: 'Images', value: file_breakdown.images, color: COLORS.primary },
    { name: 'Videos', value: file_breakdown.videos, color: COLORS.secondary },
    { name: 'Documents', value: file_breakdown.documents, color: COLORS.accent },
    { name: 'Other', value: file_breakdown.other, color: COLORS.info }
  ].filter(item => item.value > 0);

  const technologyData = Object.entries(project_analytics.most_used_technologies || {})
    .slice(0, 8)
    .map(([tech, count]) => ({ name: tech, count }));

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 border-yellow-400/20">
          <CardContent className="p-6 text-center">
            <FileText className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{overview.total_files}</p>
            <p className="text-gray-400 text-sm">Portfolio Files</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-400/10 to-green-600/10 border-green-400/20">
          <CardContent className="p-6 text-center">
            <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{overview.total_projects}</p>
            <p className="text-gray-400 text-sm">Projects</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-400/10 to-blue-600/10 border-blue-400/20">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              {overview.verification_status ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-red-400" />
              )}
            </div>
            <p className="text-sm text-white font-medium">
              {overview.verification_status ? 'Verified' : 'Not Verified'}
            </p>
            <p className="text-gray-400 text-xs">Account Status</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-400/10 to-purple-600/10 border-purple-400/20">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">{formatDate(overview.account_created)}</p>
            <p className="text-gray-400 text-xs">Member Since</p>
          </CardContent>
        </Card>
      </div>

      {/* File Breakdown Chart */}
      {fileBreakdownData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Image className="w-5 h-5 mr-2" />
              File Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fileBreakdownData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {fileBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-3">
                {fileBreakdownData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      ></div>
                      <span className="text-white">{item.name}</span>
                    </div>
                    <Badge variant="secondary">{item.value} files</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technology Usage */}
      {technologyData.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Most Used Technologies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technologyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                  />
                  <Bar dataKey="count" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Insights */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Project Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{project_analytics.projects_with_urls}</p>
              <p className="text-gray-400 text-sm">Projects with Live URLs</p>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {project_analytics.avg_technologies_per_project?.toFixed(1) || 0}
              </p>
              <p className="text-gray-400 text-sm">Avg Technologies/Project</p>
            </div>
            
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {formatStorage(storage_usage.total_storage_mb)}
              </p>
              <p className="text-gray-400 text-sm">Total Storage Used</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations?.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
              Recommendations for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolio Completion Progress */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Portfolio Completion Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className={`w-5 h-5 ${overview.verification_status ? 'text-green-400' : 'text-gray-600'}`} />
                <span className="text-white">Account Verification</span>
              </div>
              <Badge className={overview.verification_status ? 'bg-green-600' : 'bg-gray-600'}>
                {overview.verification_status ? 'Complete' : 'Pending'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className={`w-5 h-5 ${overview.profile_completion ? 'text-green-400' : 'text-gray-600'}`} />
                <span className="text-white">Profile Completion</span>
              </div>
              <Badge className={overview.profile_completion ? 'bg-green-600' : 'bg-gray-600'}>
                {overview.profile_completion ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className={`w-5 h-5 ${overview.total_files > 0 ? 'text-green-400' : 'text-gray-600'}`} />
                <span className="text-white">Portfolio Files Uploaded</span>
              </div>
              <Badge className={overview.total_files > 0 ? 'bg-green-600' : 'bg-gray-600'}>
                {overview.total_files} files
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className={`w-5 h-5 ${overview.total_projects > 0 ? 'text-green-400' : 'text-gray-600'}`} />
                <span className="text-white">Project Gallery Created</span>
              </div>
              <Badge className={overview.total_projects > 0 ? 'bg-green-600' : 'bg-gray-600'}>
                {overview.total_projects} projects
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioAnalytics;
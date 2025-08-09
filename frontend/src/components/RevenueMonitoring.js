import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DollarSign, TrendingUp, TrendingDown, Users, Briefcase,
  CreditCard, Wallet, ArrowUp, ArrowDown, BarChart3,
  PieChart, Calendar, Award, RefreshCw, Eye
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const RevenueMonitoring = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');

  useEffect(() => {
    fetchRevenueAnalytics();
  }, []);

  const fetchRevenueAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/admin/revenue-analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRevenueData(data);
      } else {
        console.error('Failed to fetch revenue analytics');
      }
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'Credit':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'Debit':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'Credit':
        return 'text-green-400';
      case 'Debit':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading && !revenueData) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-700 h-48 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!revenueData) {
    return (
      <Card className="dashboard-card">
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Failed to load revenue analytics</p>
          <Button onClick={fetchRevenueAnalytics} className="mt-4 bg-yellow-600 hover:bg-yellow-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Contract Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(revenueData.summary?.total_contract_value)}
                </p>
                <div className="text-xs text-blue-400 flex items-center mt-1">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {revenueData.summary?.completed_contracts || 0} contracts
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Commission Earned</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(revenueData.summary?.total_commission_earned)}
                </p>
                <div className="text-xs text-green-400 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {((revenueData.summary?.commission_rate || 0) * 100).toFixed(1)}% rate
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Platform Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(revenueData.wallet_statistics?.total_platform_value)}
                </p>
                <div className="text-xs text-purple-400 flex items-center mt-1">
                  <Wallet className="w-3 h-3 mr-1" />
                  {revenueData.summary?.active_wallets || 0} wallets
                </div>
              </div>
              <Wallet className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Escrow Balance</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(revenueData.wallet_statistics?.total_escrow_balance)}
                </p>
                <div className="text-xs text-yellow-400 flex items-center mt-1">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Active funds
                </div>
              </div>
              <CreditCard className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Analytics Dashboard */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Monthly Revenue Trends
                </div>
                <Button size="sm" onClick={fetchRevenueAnalytics} variant="outline" className="border-gray-600">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.monthly_revenue && revenueData.monthly_revenue.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.monthly_revenue.map((month, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">{month.month}</p>
                          <p className="text-gray-400 text-sm">{month.contracts_count} contracts</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">
                          {formatCurrency(month.commission)}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {formatCurrency(month.contract_value)} total value
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction Analytics */}
        <div>
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Transaction Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueData.transaction_analytics && revenueData.transaction_analytics.length > 0 ? (
                <div className="space-y-3">
                  {revenueData.transaction_analytics.map((transaction, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction._id)}
                        <span className="text-gray-300">{transaction._id}</span>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getTransactionColor(transaction._id)}`}>
                          {formatCurrency(transaction.total_amount)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {transaction.count} transactions
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No transaction data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Performing Freelancers */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Top Performing Freelancers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.top_freelancers && revenueData.top_freelancers.length > 0 ? (
            <div className="space-y-4">
              {revenueData.top_freelancers.slice(0, 10).map((freelancer, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{freelancer.full_name}</h4>
                      <p className="text-gray-400 text-sm">{freelancer.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="text-white font-semibold">
                        {formatCurrency(freelancer.total_earned)}
                      </p>
                      <p className="text-gray-400">Total Earned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400 font-semibold">
                        {formatCurrency(freelancer.commission_generated)}
                      </p>
                      <p className="text-gray-400">Commission</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-400 font-semibold">
                        {freelancer.total_contracts}
                      </p>
                      <p className="text-gray-400">Contracts</p>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No freelancer data available</p>
              <p className="text-gray-500 text-sm mt-2">
                Complete contracts will appear here once revenue is generated
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Health Summary */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Platform Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">
                {((revenueData.summary?.total_commission_earned / revenueData.summary?.total_contract_value) * 100 || 0).toFixed(2)}%
              </div>
              <div className="text-gray-400 text-sm">Revenue Conversion</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">
                {revenueData.summary?.completed_contracts > 0 
                  ? formatCurrency((revenueData.summary?.total_contract_value / revenueData.summary?.completed_contracts) || 0)
                  : formatCurrency(0)}
              </div>
              <div className="text-gray-400 text-sm">Avg Contract Value</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">
                {revenueData.summary?.active_wallets || 0}
              </div>
              <div className="text-gray-400 text-sm">Active Wallets</div>
            </div>
            
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <div className="text-2xl font-bold text-white mb-2">
                {formatCurrency((revenueData.wallet_statistics?.total_available_balance + revenueData.wallet_statistics?.total_escrow_balance) || 0)}
              </div>
              <div className="text-gray-400 text-sm">Total Platform Funds</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevenueMonitoring;
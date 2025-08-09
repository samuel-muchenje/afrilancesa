import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Star, Send, Calendar, MessageSquare, User, Briefcase,
  ThumbsUp, Award, TrendingUp
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ReviewSystem = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    review_text: '',
    reviewer_type: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserReviews();
    }
  }, [user]);

  const fetchUserReviews = async (page = 1) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/reviews/${user.id}?skip=${(page-1)*10}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        setPagination({
          page: data.page || 1,
          pages: data.pages || 1,
          total: data.total || 0
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedContract || !reviewData.review_text) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contract_id: selectedContract.id,
          rating: reviewData.rating,
          review_text: reviewData.review_text,
          reviewer_type: reviewData.reviewer_type
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Review submitted successfully! Average rating: ${result.average_rating}`);
        setShowReviewForm(false);
        setSelectedContract(null);
        setReviewData({ rating: 5, review_text: '', reviewer_type: '' });
        fetchUserReviews(); // Refresh reviews
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating 
              ? 'text-yellow-400 fill-yellow-400' 
              : 'text-gray-400'
          } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
          onClick={interactive && onRatingChange ? () => onRatingChange(i) : undefined}
        />
      );
    }
    return <div className="flex items-center space-x-1">{stars}</div>;
  };

  const getReviewerTypeIcon = (type) => {
    switch (type) {
      case 'client':
        return <Briefcase className="w-4 h-4 text-blue-400" />;
      case 'freelancer':
        return <User className="w-4 h-4 text-green-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Review Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{user?.rating || 0}</div>
              <div className="mb-2">{renderStars(user?.rating || 0)}</div>
              <div className="text-gray-400 text-sm">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">{user?.total_reviews || 0}</div>
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-gray-400 text-sm">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-2">
                {user?.rating >= 4.5 ? '95%' : user?.rating >= 4 ? '85%' : '75%'}
              </div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-gray-400 text-sm">Satisfaction Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Reviews ({pagination.total})
            </div>
            <Button 
              size="sm" 
              onClick={() => fetchUserReviews(pagination.page)}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-700 h-24 rounded"></div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-gray-600 text-white">
                            {review.reviewer_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-semibold">{review.reviewer_name}</h4>
                            <Badge variant={review.reviewer_type === 'client' ? 'default' : 'secondary'}>
                              {review.reviewer_type}
                            </Badge>
                            {getReviewerTypeIcon(review.reviewer_type)}
                          </div>
                          <p className="text-gray-400 text-sm">Project: {review.job_title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(review.rating)}
                        <p className="text-gray-500 text-xs mt-1 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{review.review_text}</p>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-gray-400 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() => fetchUserReviews(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page === pagination.pages}
                      onClick={() => fetchUserReviews(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No reviews yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Complete projects to start receiving reviews from clients
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form Modal */}
      {showReviewForm && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Submit Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Rating</label>
                {renderStars(reviewData.rating, true, (rating) => 
                  setReviewData(prev => ({ ...prev, rating }))
                )}
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Review</label>
                <textarea
                  value={reviewData.review_text}
                  onChange={(e) => setReviewData(prev => ({ ...prev, review_text: e.target.value }))}
                  placeholder="Share your experience working on this project..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={!reviewData.review_text}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewSystem;
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Star, 
  TrendingUp, 
  TrendingDown,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  AlertTriangle,
  CheckCircle,
  Heart,
  Award
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SatisfactionMetrics {
  overallRating: number;
  totalReviews: number;
  responseRate: number;
  recommendationRate: number;
  repeatGuestRate: number;
  averageStayRating: number;
  improvementTrend: number;
  satisfactionScore: number;
}

interface CategoryRating {
  category: string;
  rating: number;
  previousRating: number;
  trend: number;
  reviewCount: number;
  topCompliments: string[];
  topComplaints: string[];
}

interface GuestFeedback {
  id: string;
  guestName: string;
  retreatType: string;
  checkOutDate: string;
  overallRating: number;
  categories: {
    accommodation: number;
    food: number;
    service: number;
    facilities: number;
    activities: number;
    value: number;
  };
  comment: string;
  wouldRecommend: boolean;
  isRepeatGuest: boolean;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

interface ImprovementRecommendation {
  id: string;
  area: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  issue: string;
  suggestion: string;
  impactScore: number;
  estimatedCost: string;
  timeframe: string;
  affectedGuests: number;
}

interface ReviewTrend {
  month: string;
  averageRating: number;
  reviewCount: number;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
}

export default function SatisfactionReportsPage() {
  const { isOpen } = useSidebar();
  const [metrics, setMetrics] = useState<SatisfactionMetrics | null>(null);
  const [categoryRatings, setCategoryRatings] = useState<CategoryRating[]>([]);
  const [guestFeedback, setGuestFeedback] = useState<GuestFeedback[]>([]);
  const [recommendations, setRecommendations] = useState<ImprovementRecommendation[]>([]);
  const [reviewTrends, setReviewTrends] = useState<ReviewTrend[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [periodFilter, setPeriodFilter] = useState("3m");
  const [retreatTypeFilter, setRetreatTypeFilter] = useState("ALL");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");

  // Mock data
  useEffect(() => {
    const mockMetrics: SatisfactionMetrics = {
      overallRating: 4.7,
      totalReviews: 245,
      responseRate: 78.5,
      recommendationRate: 92.3,
      repeatGuestRate: 34.2,
      averageStayRating: 4.6,
      improvementTrend: 8.5,
      satisfactionScore: 94.2
    };

    const mockCategoryRatings: CategoryRating[] = [
      {
        category: 'Accommodation',
        rating: 4.8,
        previousRating: 4.6,
        trend: 4.3,
        reviewCount: 238,
        topCompliments: ['Clean rooms', 'Comfortable beds', 'Beautiful views', 'Peaceful atmosphere'],
        topComplaints: ['Air conditioning noise', 'Limited storage space']
      },
      {
        category: 'Food & Dining',
        rating: 4.5,
        previousRating: 4.7,
        trend: -4.3,
        reviewCount: 235,
        topCompliments: ['Fresh ingredients', 'Healthy options', 'Dietary accommodations', 'Presentation'],
        topComplaints: ['Limited variety', 'Cold food', 'Slow service']
      },
      {
        category: 'Service',
        rating: 4.9,
        previousRating: 4.8,
        trend: 2.1,
        reviewCount: 242,
        topCompliments: ['Friendly staff', 'Helpful guidance', 'Quick response', 'Personal attention'],
        topComplaints: ['Language barrier', 'Inconsistent service']
      },
      {
        category: 'Facilities',
        rating: 4.6,
        previousRating: 4.4,
        trend: 4.5,
        reviewCount: 228,
        topCompliments: ['Clean facilities', 'Modern equipment', 'Good maintenance', 'Accessibility'],
        topComplaints: ['Limited parking', 'Wifi issues', 'Pool temperature']
      },
      {
        category: 'Activities',
        rating: 4.7,
        previousRating: 4.5,
        trend: 4.4,
        reviewCount: 220,
        topCompliments: ['Variety of activities', 'Expert instructors', 'Well organized', 'Engaging content'],
        topComplaints: ['Too intense', 'Limited beginner options', 'Schedule conflicts']
      },
      {
        category: 'Value for Money',
        rating: 4.3,
        previousRating: 4.2,
        trend: 2.4,
        reviewCount: 198,
        topCompliments: ['Good value', 'Inclusive packages', 'Quality experience', 'Worth the price'],
        topComplaints: ['Expensive', 'Hidden costs', 'Limited inclusions']
      }
    ];

    const mockGuestFeedback: GuestFeedback[] = [
      {
        id: '1',
        guestName: 'Sarah Johnson',
        retreatType: 'Wellness Retreat',
        checkOutDate: '2024-01-18',
        overallRating: 5,
        categories: {
          accommodation: 5,
          food: 4,
          service: 5,
          facilities: 5,
          activities: 5,
          value: 4
        },
        comment: 'Amazing experience! The staff was incredibly welcoming and the facilities were top-notch. The meditation sessions really helped me find inner peace. Will definitely return!',
        wouldRecommend: true,
        isRepeatGuest: false,
        sentiment: 'POSITIVE'
      },
      {
        id: '2',
        guestName: 'Michael Chen',
        retreatType: 'Meditation Retreat',
        checkOutDate: '2024-01-23',
        overallRating: 4,
        categories: {
          accommodation: 4,
          food: 3,
          service: 5,
          facilities: 4,
          activities: 5,
          value: 4
        },
        comment: 'Great retreat overall. The meditation sessions were transformative. Food could be improved - more variety would be nice. Staff was excellent though.',
        wouldRecommend: true,
        isRepeatGuest: true,
        sentiment: 'POSITIVE'
      },
      {
        id: '3',
        guestName: 'Emma Wilson',
        retreatType: 'Yoga Retreat',
        checkOutDate: '2024-01-28',
        overallRating: 3,
        categories: {
          accommodation: 4,
          food: 2,
          service: 3,
          facilities: 4,
          activities: 4,
          value: 3
        },
        comment: 'Mixed experience. Yoga classes were good but food service was slow and limited options. Room was comfortable. Expected more for the price.',
        wouldRecommend: false,
        isRepeatGuest: false,
        sentiment: 'NEUTRAL'
      }
    ];

    const mockRecommendations: ImprovementRecommendation[] = [
      {
        id: '1',
        area: 'Food & Dining',
        priority: 'HIGH',
        issue: 'Limited food variety and slow service during peak hours',
        suggestion: 'Expand menu options and add additional serving staff during busy periods',
        impactScore: 8.5,
        estimatedCost: 'AED 15,000-25,000',
        timeframe: '2-3 months',
        affectedGuests: 85
      },
      {
        id: '2',
        area: 'Facilities',
        priority: 'MEDIUM',
        issue: 'Wifi connectivity issues in some rooms',
        suggestion: 'Upgrade network infrastructure and add additional access points',
        impactScore: 6.8,
        estimatedCost: 'AED 8,000-12,000',
        timeframe: '1-2 months',
        affectedGuests: 45
      },
      {
        id: '3',
        area: 'Activities',
        priority: 'MEDIUM',
        issue: 'Need more beginner-friendly activity options',
        suggestion: 'Develop introductory programs and provide skill-level guidance',
        impactScore: 7.2,
        estimatedCost: 'AED 5,000-8,000',
        timeframe: '1 month',
        affectedGuests: 62
      },
      {
        id: '4',
        area: 'Value Perception',
        priority: 'LOW',
        issue: 'Guests feel some services should be included in base price',
        suggestion: 'Review pricing structure and consider bundling popular add-ons',
        impactScore: 5.5,
        estimatedCost: 'Revenue impact analysis needed',
        timeframe: '3-4 months',
        affectedGuests: 38
      }
    ];

    const mockReviewTrends: ReviewTrend[] = [
      { month: 'Oct', averageRating: 4.5, reviewCount: 42, positivePercentage: 78, neutralPercentage: 15, negativePercentage: 7 },
      { month: 'Nov', averageRating: 4.6, reviewCount: 38, positivePercentage: 82, neutralPercentage: 13, negativePercentage: 5 },
      { month: 'Dec', averageRating: 4.7, reviewCount: 45, positivePercentage: 85, neutralPercentage: 12, negativePercentage: 3 },
      { month: 'Jan', averageRating: 4.8, reviewCount: 52, positivePercentage: 88, neutralPercentage: 10, negativePercentage: 2 },
      { month: 'Feb', averageRating: 4.7, reviewCount: 48, positivePercentage: 85, neutralPercentage: 12, negativePercentage: 3 },
      { month: 'Mar', averageRating: 4.9, reviewCount: 58, positivePercentage: 92, neutralPercentage: 6, negativePercentage: 2 }
    ];

    setMetrics(mockMetrics);
    setCategoryRatings(mockCategoryRatings);
    setGuestFeedback(mockGuestFeedback);
    setRecommendations(mockRecommendations);
    setReviewTrends(mockReviewTrends);
    setLoading(false);
  }, []);

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star 
            key={i} 
            className={cn(
              "fill-yellow-400 text-yellow-400",
              size === "sm" ? "h-4 w-4" : "h-5 w-5"
            )} 
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star 
            key={i} 
            className={cn(
              "fill-yellow-200 text-yellow-400",
              size === "sm" ? "h-4 w-4" : "h-5 w-5"
            )} 
          />
        );
      } else {
        stars.push(
          <Star 
            key={i} 
            className={cn(
              "text-gray-300",
              size === "sm" ? "h-4 w-4" : "h-5 w-5"
            )} 
          />
        );
      }
    }
    return stars;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'outline';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'text-green-600';
      case 'NEUTRAL': return 'text-yellow-600';
      case 'NEGATIVE': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={cn("flex-1 flex flex-col overflow-hidden", isOpen ? "lg:ml-64" : "lg:ml-20")}>
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Guest Satisfaction Reports</h1>
                <p className="text-gray-600">Guest feedback analysis and service quality metrics</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">Last month</SelectItem>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="12m">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Key Satisfaction Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{metrics?.overallRating}</div>
                    <div className="flex">{renderStars(metrics?.overallRating || 0, "sm")}</div>
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +{metrics?.improvementTrend}% improvement
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalReviews}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.responseRate}% response rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recommendation Rate</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{metrics?.recommendationRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Would recommend to others
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Repeat Guests</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{metrics?.repeatGuestRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Return for another stay
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Ratings */}
            <Card>
              <CardHeader>
                <CardTitle>Service Quality by Category</CardTitle>
                <CardDescription>Detailed breakdown of guest ratings across service areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categoryRatings.map((category) => (
                    <div key={category.category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{category.category}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-semibold">{category.rating}</span>
                            <div className="flex">{renderStars(category.rating, "sm")}</div>
                          </div>
                          <Badge variant="outline">{category.reviewCount} reviews</Badge>
                        </div>
                        <div className={cn(
                          "flex items-center text-sm",
                          category.trend > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {category.trend > 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(category.trend)}%
                        </div>
                      </div>
                      
                      <Progress value={(category.rating / 5) * 100} className="h-2" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            Top Compliments:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {category.topCompliments.map((compliment, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {compliment}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <ThumbsDown className="h-3 w-3" />
                            Common Issues:
                          </span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {category.topComplaints.map((complaint, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {complaint}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Review Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Review Trends</CardTitle>
                <CardDescription>Monthly rating patterns and sentiment analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
                    <div>Month</div>
                    <div>Avg Rating</div>
                    <div>Reviews</div>
                    <div>Positive</div>
                    <div>Neutral</div>
                    <div>Negative</div>
                  </div>
                  {reviewTrends.map((trend) => (
                    <div key={trend.month} className="grid grid-cols-6 gap-4 py-2 border-b">
                      <div className="font-medium">{trend.month}</div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{trend.averageRating}</span>
                        <div className="flex">{renderStars(trend.averageRating, "sm")}</div>
                      </div>
                      <div>{trend.reviewCount}</div>
                      <div className="text-green-600 font-semibold">{trend.positivePercentage}%</div>
                      <div className="text-yellow-600 font-semibold">{trend.neutralPercentage}%</div>
                      <div className="text-red-600 font-semibold">{trend.negativePercentage}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Guest Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Guest Feedback</CardTitle>
                <CardDescription>Latest reviews and detailed guest comments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {guestFeedback.map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{feedback.guestName}</span>
                          <Badge variant="outline">{feedback.retreatType}</Badge>
                          {feedback.isRepeatGuest && (
                            <Badge variant="secondary">Repeat Guest</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(feedback.overallRating, "sm")}</div>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(feedback.checkOutDate), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Room:</span>
                          <div className="flex">{renderStars(feedback.categories.accommodation, "sm")}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Food:</span>
                          <div className="flex">{renderStars(feedback.categories.food, "sm")}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Service:</span>
                          <div className="flex">{renderStars(feedback.categories.service, "sm")}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Facilities:</span>
                          <div className="flex">{renderStars(feedback.categories.facilities, "sm")}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Activities:</span>
                          <div className="flex">{renderStars(feedback.categories.activities, "sm")}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Value:</span>
                          <div className="flex">{renderStars(feedback.categories.value, "sm")}</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 italic">"{feedback.comment}"</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={feedback.wouldRecommend ? "default" : "outline"}>
                            {feedback.wouldRecommend ? 'Would Recommend' : 'Would Not Recommend'}
                          </Badge>
                          <span className={cn("text-sm font-medium", getSentimentColor(feedback.sentiment))}>
                            {feedback.sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Improvement Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Improvement Recommendations
                </CardTitle>
                <CardDescription>Data-driven suggestions to enhance guest satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={getPriorityColor(rec.priority)}>
                            {rec.priority} PRIORITY
                          </Badge>
                          <span className="font-medium">{rec.area}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">Impact Score: {rec.impactScore}/10</div>
                          <div className="text-xs text-muted-foreground">{rec.affectedGuests} guests affected</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-red-600">Issue:</span>
                          <p className="text-sm text-gray-700">{rec.issue}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-600">Suggestion:</span>
                          <p className="text-sm text-gray-700">{rec.suggestion}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Estimated Cost:</span>
                          <div className="font-semibold">{rec.estimatedCost}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Timeframe:</span>
                          <div className="font-semibold">{rec.timeframe}</div>
                        </div>
                      </div>
                      
                      <Progress value={rec.impactScore * 10} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Satisfaction Score Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Guest Satisfaction Summary</CardTitle>
                <CardDescription>Overall performance indicators and benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">{metrics?.satisfactionScore}%</div>
                    <div className="text-sm text-muted-foreground">Overall Satisfaction Score</div>
                    <Progress value={metrics?.satisfactionScore || 0} className="mt-2 h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Industry Benchmark</span>
                      <Badge variant="outline">85%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Our Performance</span>
                      <Badge variant="default">{metrics?.satisfactionScore}%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Target Score</span>
                      <Badge variant="secondary">95%</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Above industry average</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Improving trend</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Room for improvement in F&B</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
} 
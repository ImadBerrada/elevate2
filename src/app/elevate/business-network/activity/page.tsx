"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  Activity, 
  MessageSquare, 
  UserPlus, 
  Calendar,
  TrendingUp,
  Building,
  Clock,
  Star,
  Eye,
  Heart,
  Share2,
  Filter,
  Plus,
  X,
  Upload,
  Camera,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sidebar } from "@/components/sidebar";
import { BurgerMenu } from "@/components/burger-menu";
import { useSidebar } from "@/contexts/sidebar-context";
import { apiClient } from "@/lib/api-client";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const activityTypes = [
  { value: "MEETING", label: "Business Meeting", points: 10 },
  { value: "CALL", label: "Phone Call", points: 5 },
  { value: "EMAIL", label: "Email Exchange", points: 3 },
  { value: "NETWORKING", label: "Networking Event", points: 15 },
  { value: "PRESENTATION", label: "Presentation", points: 20 },
  { value: "NEGOTIATION", label: "Negotiation", points: 25 },
  { value: "PARTNERSHIP", label: "Partnership Discussion", points: 30 },
  { value: "DEAL", label: "Deal Closure", points: 50 },
];

export default function BusinessNetworkActivity() {
  const { isOpen } = useSidebar();
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState("");
  const [activityData, setActivityData] = useState({
    title: "",
    date: "",
    notes: "",
    picture: null as File | null
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, []);

  const fetchActivities = async () => {
    try {
      const data = await apiClient.getActivities({ limit: 20 });
      setActivities(data.activities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleActivitySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.createActivity({
        title: activityData.title,
        type: selectedActivityType as any,
        date: activityData.date,
        notes: activityData.notes || undefined,
        picture: undefined // File upload will be implemented later
      });

      setIsAddActivityOpen(false);
      // Reset form
      setActivityData({ title: "", date: "", notes: "", picture: null });
      setSelectedActivityType("");
      
      // Refresh activities and stats
      await fetchActivities();
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setActivityData(prev => ({ ...prev, picture: file }));
    }
  };

  const selectedTypePoints = activityTypes.find(t => t.value === selectedActivityType)?.points || 0;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'MEETING': return <Calendar className="w-5 h-5" />;
      case 'CALL': return <MessageSquare className="w-5 h-5" />;
      case 'EMAIL': return <MessageSquare className="w-5 h-5" />;
      case 'NETWORKING': return <UserPlus className="w-5 h-5" />;
      case 'PRESENTATION': return <TrendingUp className="w-5 h-5" />;
      case 'NEGOTIATION': return <Building className="w-5 h-5" />;
      case 'PARTNERSHIP': return <Building className="w-5 h-5" />;
      case 'DEAL': return <Star className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatActivityType = (type: string) => {
    return type.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading activities...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isOpen ? 'ml-0' : 'ml-0'}`}>
        <motion.header 
          className="glass-header sticky top-0 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-3"
                {...fadeInUp}
                transition={{ delay: 0.1 }}
              >
                <BurgerMenu />
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-refined"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Activity className="w-4 h-4 text-white" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-elegant text-gradient">Network Activity</h1>
                    <p className="text-sm text-muted-foreground font-refined">Recent Network Updates</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button variant="outline" className="border-refined">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-premium">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] glass-card border-refined">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-elegant text-gradient">Add New Activity</DialogTitle>
                      <DialogDescription className="text-refined">
                        Record your business network activities to track your monthly success points.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleActivitySubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="activity-type" className="text-sm font-medium">Activity Type</Label>
                          <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
                            <SelectTrigger className="border-refined">
                              <SelectValue placeholder="Select activity type" />
                            </SelectTrigger>
                            <SelectContent>
                              {activityTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{type.label}</span>
                                    <Badge variant="secondary" className="ml-2">
                                      {type.points} pts
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedActivityType && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-muted-foreground">
                                This activity will earn you <span className="font-bold text-primary">{selectedTypePoints} points</span>
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="activity-date" className="text-sm font-medium">Date</Label>
                          <Input
                            id="activity-date"
                            type="date"
                            value={activityData.date}
                            onChange={(e) => setActivityData(prev => ({ ...prev, date: e.target.value }))}
                            className="border-refined"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="activity-title" className="text-sm font-medium">Activity Title</Label>
                        <Input
                          id="activity-title"
                          placeholder="Enter activity title..."
                          value={activityData.title}
                          onChange={(e) => setActivityData(prev => ({ ...prev, title: e.target.value }))}
                          className="border-refined"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="activity-notes" className="text-sm font-medium">Notes (Optional)</Label>
                        <Textarea
                          id="activity-notes"
                          placeholder="Add any additional notes about this activity..."
                          value={activityData.notes}
                          onChange={(e) => setActivityData(prev => ({ ...prev, notes: e.target.value }))}
                          className="border-refined min-h-[100px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="activity-picture" className="text-sm font-medium">Picture (Optional)</Label>
                        <div className="flex items-center space-x-4">
                          <Input
                            id="activity-picture"
                            type="file"
                            accept="image/*"
                            onChange={handlePictureUpload}
                            className="border-refined"
                          />
                          <Button type="button" variant="outline" className="border-refined">
                            <Camera className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                        {activityData.picture && (
                          <p className="text-sm text-muted-foreground">
                            Selected: {activityData.picture.name}
                          </p>
                        )}
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm">{error}</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddActivityOpen(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="btn-premium"
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Activity
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </motion.div>
            </div>
          </div>
        </motion.header>

        <main className="flex-1 container mx-auto px-6 py-6">
          <motion.div 
            className="mb-8"
            {...fadeInUp}
          >
            <h2 className="text-2xl font-prestigious text-gradient mb-2">
              Activity Feed
            </h2>
            <p className="text-refined text-muted-foreground">
              Track your business network activities and engagement.
            </p>
          </motion.div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.activities.today || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.activities.week || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.activities.month || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
              <Card className="card-premium border-refined">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gradient">
                    {stats?.points.total || 0}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Activities List */}
          <motion.div 
            {...fadeInUp}
            transition={{ delay: 0.5 }}
          >
            <Card className="card-premium border-refined">
              <CardHeader>
                <CardTitle className="text-xl font-elegant">Recent Activities</CardTitle>
                <CardDescription className="text-refined">
                  Your latest business network activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        className="flex items-start space-x-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-lg">{activity.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatActivityType(activity.type)}
                              </p>
                              {activity.notes && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {activity.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="mb-2">
                                +{activity.points} pts
                              </Badge>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Activity className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No activities yet</h3>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                      Start tracking your business activities to build your network profile.
                    </p>
                    <Button 
                      className="btn-premium"
                      onClick={() => setIsAddActivityOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Activity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
} 
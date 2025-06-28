"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  Star,
  Calendar,
  Copy,
  MoreHorizontal,
  Settings,
  Activity,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface ScheduleActivity {
  id: string;
  time: string;
  name: string;
  description: string;
  duration: number; // minutes
  instructor: string;
  location: string;
  capacity: number;
  currentParticipants: number;
  resources: string[];
  type: 'session' | 'meal' | 'break' | 'activity' | 'free-time';
  isRequired: boolean;
}

interface DaySchedule {
  day: number;
  date: string;
  activities: ScheduleActivity[];
  notes?: string;
}

interface Instructor {
  id: string;
  name: string;
  specialties: string[];
  availability: string[];
}

interface Resource {
  id: string;
  name: string;
  type: 'room' | 'equipment' | 'material';
  capacity?: number;
  location: string;
}

export default function RetreatSchedule() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const params = useParams();
  const retreatId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ScheduleActivity | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  const [newActivity, setNewActivity] = useState<Partial<ScheduleActivity>>({
    time: "09:00",
    name: "",
    description: "",
    duration: 60,
    instructor: "",
    location: "",
    capacity: 20,
    currentParticipants: 0,
    resources: [],
    type: "session",
    isRequired: true
  });

  useEffect(() => {
    fetchScheduleData();
  }, [retreatId]);

  const fetchScheduleData = async () => {
    try {
      const response = await fetch(`/api/bridge-retreats/retreats/${retreatId}/schedule`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedule data');
      }

      const data = await response.json();
      
      // If no schedule exists, create empty schedule based on retreat duration
      let scheduleData = data.schedule;
      if (!scheduleData || scheduleData.length === 0) {
        // Fetch retreat details to get duration
        const retreatResponse = await fetch(`/api/bridge-retreats/retreats/${retreatId}`);
        const retreatData = await retreatResponse.json();
        
        // Create empty schedule for each day
        scheduleData = [];
        for (let day = 1; day <= (retreatData.duration || 7); day++) {
          const startDate = new Date(retreatData.startDate);
          const dayDate = new Date(startDate.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
          
          scheduleData.push({
            day,
            date: dayDate.toISOString().split('T')[0],
            activities: [],
            notes: ''
          });
        }
      }
      
      setSchedule(scheduleData);
      setInstructors(data.instructors || []);
      setResources(data.resources || []);
      setLoading(false);
      checkConflicts(scheduleData);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      setLoading(false);
      // Create a basic empty schedule as fallback
      setSchedule([{
        day: 1,
        date: new Date().toISOString().split('T')[0],
        activities: [],
        notes: ''
      }]);
    }
  };

  const checkConflicts = (scheduleData: DaySchedule[]) => {
    const foundConflicts: string[] = [];
    
    scheduleData.forEach(day => {
      const instructorSchedule: { [key: string]: string[] } = {};
      const resourceSchedule: { [key: string]: string[] } = {};
      
      day.activities.forEach(activity => {
        const timeSlot = `${activity.time}-${addMinutes(activity.time, activity.duration)}`;
        
        // Check instructor conflicts
        if (activity.instructor) {
          if (!instructorSchedule[activity.instructor]) {
            instructorSchedule[activity.instructor] = [];
          }
          
          if (instructorSchedule[activity.instructor].some(slot => timesOverlap(slot, timeSlot))) {
            foundConflicts.push(`Day ${day.day}: ${activity.instructor} has overlapping sessions`);
          }
          
          instructorSchedule[activity.instructor].push(timeSlot);
        }
        
        // Check resource conflicts
        activity.resources.forEach(resource => {
          if (!resourceSchedule[resource]) {
            resourceSchedule[resource] = [];
          }
          
          if (resourceSchedule[resource].some(slot => timesOverlap(slot, timeSlot))) {
            foundConflicts.push(`Day ${day.day}: ${resource} is double-booked at ${activity.time}`);
          }
          
          resourceSchedule[resource].push(timeSlot);
        });
      });
    });
    
    setConflicts(foundConflicts);
  };

  const addMinutes = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  const timesOverlap = (slot1: string, slot2: string): boolean => {
    const [start1, end1] = slot1.split('-');
    const [start2, end2] = slot2.split('-');
    
    return (start1 < end2 && start2 < end1);
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'session': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meal': return 'bg-green-100 text-green-800 border-green-200';
      case 'break': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'activity': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'free-time': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const addActivity = () => {
    if (!newActivity.name || !newActivity.time) return;
    
    const activity: ScheduleActivity = {
      id: `temp-${Date.now()}`,
      time: newActivity.time!,
      name: newActivity.name!,
      description: newActivity.description || "",
      duration: newActivity.duration || 60,
      instructor: newActivity.instructor === "none" ? "" : (newActivity.instructor || ""),
      location: newActivity.location || "",
      capacity: newActivity.capacity || 20,
      currentParticipants: 0,
      resources: newActivity.resources || [],
      type: newActivity.type as any || "session",
      isRequired: newActivity.isRequired || true
    };

    const updatedSchedule = schedule.map(day => {
      if (day.day === activeDay) {
        const newActivities = [...day.activities, activity].sort((a, b) => a.time.localeCompare(b.time));
        return { ...day, activities: newActivities };
      }
      return day;
    });

    setSchedule(updatedSchedule);
    checkConflicts(updatedSchedule);
    setIsAddActivityOpen(false);
    
    // Reset form
    setNewActivity({
      time: "09:00",
      name: "",
      description: "",
      duration: 60,
      instructor: "",
      location: "",
      capacity: 20,
      currentParticipants: 0,
      resources: [],
      type: "session",
      isRequired: true
    });
  };

  const deleteActivity = async (activityId: string) => {
    try {
      // If it's a new activity (not saved to database), just remove from local state
      if (activityId.startsWith('temp-') || activityId === Date.now().toString()) {
        const updatedSchedule = schedule.map(day => {
          if (day.day === activeDay) {
            return {
              ...day,
              activities: day.activities.filter(a => a.id !== activityId)
            };
          }
          return day;
        });

        setSchedule(updatedSchedule);
        checkConflicts(updatedSchedule);
        return;
      }

      // For saved activities, call the API
      const response = await fetch(`/api/bridge-retreats/retreats/${retreatId}/schedule?activityId=${activityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete activity');
      }

      // Update local state
      const updatedSchedule = schedule.map(day => {
        if (day.day === activeDay) {
          return {
            ...day,
            activities: day.activities.filter(a => a.id !== activityId)
          };
        }
        return day;
      });

      setSchedule(updatedSchedule);
      checkConflicts(updatedSchedule);
      
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Failed to delete activity. Please try again.');
    }
  };

  const duplicateActivity = (activity: ScheduleActivity) => {
    const newActivity: ScheduleActivity = {
      ...activity,
      id: `temp-${Date.now()}`,
      time: addMinutes(activity.time, activity.duration),
      currentParticipants: 0
    };

    const updatedSchedule = schedule.map(day => {
      if (day.day === activeDay) {
        const newActivities = [...day.activities, newActivity].sort((a, b) => a.time.localeCompare(b.time));
        return { ...day, activities: newActivities };
      }
      return day;
    });

    setSchedule(updatedSchedule);
    checkConflicts(updatedSchedule);
  };

  const copyDaySchedule = (fromDay: number, toDay: number) => {
    const sourceDay = schedule.find(d => d.day === fromDay);
    if (!sourceDay) return;

    const updatedSchedule = schedule.map(day => {
      if (day.day === toDay) {
        const copiedActivities = sourceDay.activities.map(activity => ({
          ...activity,
          id: `temp-${activity.id}-copy-${Date.now()}`,
          currentParticipants: 0
        }));
        
        return {
          ...day,
          activities: copiedActivities
        };
      }
      return day;
    });

    setSchedule(updatedSchedule);
    checkConflicts(updatedSchedule);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/bridge-retreats/retreats/${retreatId}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schedule }),
      });

      if (!response.ok) {
        throw new Error('Failed to save schedule');
      }

      const result = await response.json();
      console.log('Schedule saved successfully:', result);
      
      // Show success message (you can add a toast notification here)
      alert('Schedule saved successfully!');
      
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const currentDay = schedule.find(d => d.day === activeDay);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Loading Schedule...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isDesktop && isOpen ? "ml-0" : "ml-0",
        "min-w-0"
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Page Header */}
          <motion.div 
            className="mb-6 sm:mb-8"
            {...fadeInUp}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Link href={`/bridge-retreats/retreats/${retreatId}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Retreat
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-prestigious text-gradient">
                    Retreat Schedule
                  </h1>
                  <p className="text-sm sm:text-base text-refined text-muted-foreground">
                    Manage daily activities, instructors, and resources.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Day
                </Button>
                <Button 
                  className="btn-premium" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Schedule
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Conflicts Alert */}
          {conflicts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-medium mb-2">Schedule Conflicts Detected:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {conflicts.map((conflict, index) => (
                      <li key={index} className="text-sm">{conflict}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Day Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="card-premium border-refined">
                <CardHeader>
                  <CardTitle className="text-lg">Days</CardTitle>
                  <CardDescription>
                    Select a day to edit its schedule
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {schedule.map((day) => (
                      <button
                        key={day.day}
                        onClick={() => setActiveDay(day.day)}
                        className={cn(
                          "w-full p-3 text-left rounded-lg border transition-all duration-200",
                          activeDay === day.day
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="font-medium">Day {day.day}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(day.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {day.activities.length} activities
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Schedule Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Day Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="card-premium border-refined">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                          Day {activeDay} Schedule
                        </CardTitle>
                        <CardDescription>
                          {currentDay && new Date(currentDay.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </CardDescription>
                      </div>
                      
                      <Dialog open={isAddActivityOpen} onOpenChange={setIsAddActivityOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Add New Activity</DialogTitle>
                            <DialogDescription>
                              Create a new activity for Day {activeDay}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Activity Name *</Label>
                                <Input
                                  placeholder="e.g., Morning Meditation"
                                  value={newActivity.name || ""}
                                  onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Time *</Label>
                                <Input
                                  type="time"
                                  value={newActivity.time || "09:00"}
                                  onChange={(e) => setNewActivity(prev => ({ ...prev, time: e.target.value }))}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input
                                placeholder="Brief description of the activity"
                                value={newActivity.description || ""}
                                onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Duration (minutes)</Label>
                                <Input
                                  type="number"
                                  min="15"
                                  max="480"
                                  value={newActivity.duration || 60}
                                  onChange={(e) => setNewActivity(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Type</Label>
                                <Select 
                                  value={newActivity.type || "session"} 
                                  onValueChange={(value) => setNewActivity(prev => ({ ...prev, type: value as any }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="session">Session</SelectItem>
                                    <SelectItem value="meal">Meal</SelectItem>
                                    <SelectItem value="break">Break</SelectItem>
                                    <SelectItem value="activity">Activity</SelectItem>
                                    <SelectItem value="free-time">Free Time</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Instructor</Label>
                                <Select 
                                  value={newActivity.instructor || ""} 
                                  onValueChange={(value) => setNewActivity(prev => ({ ...prev, instructor: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select instructor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">No instructor</SelectItem>
                                    {instructors.map(instructor => (
                                      <SelectItem key={instructor.id} value={instructor.name}>
                                        {instructor.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Location</Label>
                                <Select 
                                  value={newActivity.location || ""} 
                                  onValueChange={(value) => setNewActivity(prev => ({ ...prev, location: value }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select location" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {resources.filter(r => r.type === 'room').map(resource => (
                                      <SelectItem key={resource.id} value={resource.name}>
                                        {resource.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Capacity</Label>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={newActivity.capacity || 20}
                                onChange={(e) => setNewActivity(prev => ({ ...prev, capacity: parseInt(e.target.value) || 20 }))}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end space-x-3 mt-6">
                            <Button variant="outline" onClick={() => setIsAddActivityOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={addActivity}>
                              Add Activity
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  
                  {currentDay?.notes && (
                    <CardContent className="pt-0">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">{currentDay.notes}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>

              {/* Activities Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="card-premium border-refined">
                  <CardContent className="p-6">
                    {currentDay?.activities.length === 0 ? (
                      <div className="text-center py-12">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Scheduled</h3>
                        <p className="text-muted-foreground mb-4">
                          Start building your day by adding the first activity.
                        </p>
                        <Button onClick={() => setIsAddActivityOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Activity
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {currentDay?.activities.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
                          >
                            {/* Time */}
                            <div className="flex-shrink-0 w-16 text-center">
                              <div className="text-lg font-semibold text-gray-900">{activity.time}</div>
                              <div className="text-xs text-muted-foreground">
                                {activity.duration}min
                              </div>
                            </div>

                            {/* Activity Details */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className="font-medium text-gray-900">{activity.name}</h4>
                                    <Badge className={cn("text-xs", getActivityTypeColor(activity.type))}>
                                      {activity.type}
                                    </Badge>
                                    {activity.isRequired && (
                                      <Badge variant="outline" className="text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  {activity.description && (
                                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                                  )}
                                </div>
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditingActivity(activity)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => duplicateActivity(activity)}>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => deleteActivity(activity.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                                {activity.instructor && (
                                  <div className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>{activity.instructor}</span>
                                  </div>
                                )}
                                
                                {activity.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{activity.location}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-1">
                                  <Users className="w-4 h-4" />
                                  <span>{activity.currentParticipants}/{activity.capacity}</span>
                                </div>
                              </div>

                              {activity.resources.length > 0 && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground">Resources:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {activity.resources.map((resource, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {resource}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 
 
 
 
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Plus, 
  User,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Award,
  AlertTriangle,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  Edit,
  Eye,
  MoreHorizontal,
  FileText,
  TrendingUp,
  UserCheck,
  UserX
} from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  position: string;
  department: 'HOUSEKEEPING' | 'MAINTENANCE' | 'RECEPTION' | 'KITCHEN' | 'SECURITY' | 'MANAGEMENT' | 'WELLNESS';
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY';
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  hireDate: string;
  salary: number;
  hourlyRate?: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  skillset: string[];
  certifications: string[];
  performanceRating: number;
  avatar?: string;
  manager?: string;
  workSchedule: WorkSchedule;
  leaveBalance: LeaveBalance;
  attendanceRecord: AttendanceRecord[];
}

interface WorkSchedule {
  monday: ShiftDetails | null;
  tuesday: ShiftDetails | null;
  wednesday: ShiftDetails | null;
  thursday: ShiftDetails | null;
  friday: ShiftDetails | null;
  saturday: ShiftDetails | null;
  sunday: ShiftDetails | null;
}

interface ShiftDetails {
  startTime: string;
  endTime: string;
  breakDuration: number; // in minutes
}

interface LeaveBalance {
  annual: number;
  sick: number;
  personal: number;
  used: {
    annual: number;
    sick: number;
    personal: number;
  };
}

interface AttendanceRecord {
  id: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  breakDuration?: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
  hoursWorked?: number;
  overtime?: number;
  notes?: string;
}

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'ANNUAL' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'UNPAID';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  comments?: string;
}

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  overallRating: number;
  criteria: {
    punctuality: number;
    qualityOfWork: number;
    teamwork: number;
    communication: number;
    initiative: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  goals: string[];
  reviewerName: string;
  reviewDate: string;
  nextReviewDate: string;
  comments: string;
}

export default function StaffManagementPage() {
  const { isOpen } = useSidebar();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("employees");
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  // Employee form data
  const [employeeData, setEmployeeData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    employmentType: "FULL_TIME",
    salary: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    hireDate: format(new Date(), "yyyy-MM-dd")
  });

  // Mock data
  useEffect(() => {
    const mockEmployees: Employee[] = [
      {
        id: '1',
        employeeId: 'EMP001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@bridgeretreats.com',
        phone: '+971-50-123-4567',
        address: '123 Marina District, Dubai, UAE',
        position: 'Housekeeping Supervisor',
        department: 'HOUSEKEEPING',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        hireDate: '2023-06-15',
        salary: 8000,
        emergencyContactName: 'John Johnson',
        emergencyContactPhone: '+971-50-123-4568',
        skillset: ['Team Leadership', 'Quality Control', 'Training'],
        certifications: ['First Aid', 'Hospitality Management'],
        performanceRating: 4.5,
        manager: 'Ahmed Hassan',
        workSchedule: {
          monday: { startTime: '08:00', endTime: '17:00', breakDuration: 60 },
          tuesday: { startTime: '08:00', endTime: '17:00', breakDuration: 60 },
          wednesday: { startTime: '08:00', endTime: '17:00', breakDuration: 60 },
          thursday: { startTime: '08:00', endTime: '17:00', breakDuration: 60 },
          friday: { startTime: '08:00', endTime: '17:00', breakDuration: 60 },
          saturday: null,
          sunday: null
        },
        leaveBalance: {
          annual: 30,
          sick: 15,
          personal: 5,
          used: { annual: 8, sick: 2, personal: 1 }
        },
        attendanceRecord: []
      },
      {
        id: '2',
        employeeId: 'EMP002',
        firstName: 'Ahmed',
        lastName: 'Al-Rashid',
        email: 'ahmed.alrashid@bridgeretreats.com',
        phone: '+971-50-234-5678',
        address: '456 Business Bay, Dubai, UAE',
        position: 'Maintenance Technician',
        department: 'MAINTENANCE',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        hireDate: '2023-03-20',
        salary: 7500,
        emergencyContactName: 'Fatima Al-Rashid',
        emergencyContactPhone: '+971-50-234-5679',
        skillset: ['HVAC', 'Plumbing', 'Electrical', 'Carpentry'],
        certifications: ['HVAC License', 'Electrical Safety'],
        performanceRating: 4.2,
        manager: 'Mike Wilson',
        workSchedule: {
          monday: { startTime: '07:00', endTime: '16:00', breakDuration: 60 },
          tuesday: { startTime: '07:00', endTime: '16:00', breakDuration: 60 },
          wednesday: { startTime: '07:00', endTime: '16:00', breakDuration: 60 },
          thursday: { startTime: '07:00', endTime: '16:00', breakDuration: 60 },
          friday: { startTime: '07:00', endTime: '16:00', breakDuration: 60 },
          saturday: { startTime: '08:00', endTime: '12:00', breakDuration: 0 },
          sunday: null
        },
        leaveBalance: {
          annual: 25,
          sick: 10,
          personal: 3,
          used: { annual: 5, sick: 1, personal: 0 }
        },
        attendanceRecord: []
      },
      {
        id: '3',
        employeeId: 'EMP003',
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@bridgeretreats.com',
        phone: '+971-50-345-6789',
        address: '789 Jumeirah Village, Dubai, UAE',
        position: 'Wellness Coordinator',
        department: 'WELLNESS',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        hireDate: '2023-08-10',
        salary: 9000,
        emergencyContactName: 'Carlos Rodriguez',
        emergencyContactPhone: '+971-50-345-6790',
        skillset: ['Yoga Instruction', 'Meditation', 'Nutrition', 'Customer Service'],
        certifications: ['Yoga Alliance RYT-200', 'Wellness Coaching'],
        performanceRating: 4.8,
        manager: 'Lisa Brown',
        workSchedule: {
          monday: { startTime: '09:00', endTime: '18:00', breakDuration: 60 },
          tuesday: { startTime: '09:00', endTime: '18:00', breakDuration: 60 },
          wednesday: { startTime: '09:00', endTime: '18:00', breakDuration: 60 },
          thursday: { startTime: '09:00', endTime: '18:00', breakDuration: 60 },
          friday: { startTime: '09:00', endTime: '18:00', breakDuration: 60 },
          saturday: { startTime: '10:00', endTime: '15:00', breakDuration: 30 },
          sunday: { startTime: '10:00', endTime: '15:00', breakDuration: 30 }
        },
        leaveBalance: {
          annual: 25,
          sick: 10,
          personal: 5,
          used: { annual: 3, sick: 0, personal: 1 }
        },
        attendanceRecord: []
      },
      {
        id: '4',
        employeeId: 'EMP004',
        firstName: 'Thomas',
        lastName: 'Wilson',
        email: 'thomas.wilson@bridgeretreats.com',
        phone: '+971-50-456-7890',
        address: '321 Downtown Dubai, UAE',
        position: 'Security Officer',
        department: 'SECURITY',
        employmentType: 'PART_TIME',
        status: 'ACTIVE',
        hireDate: '2023-11-01',
        salary: 0, // Part-time employee paid hourly
        hourlyRate: 45,
        emergencyContactName: 'Emma Wilson',
        emergencyContactPhone: '+971-50-456-7891',
        skillset: ['Security Systems', 'Emergency Response', 'First Aid'],
        certifications: ['Security License', 'First Aid/CPR'],
        performanceRating: 4.0,
        manager: 'David Smith',
        workSchedule: {
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: { startTime: '22:00', endTime: '06:00', breakDuration: 30 },
          saturday: { startTime: '22:00', endTime: '06:00', breakDuration: 30 },
          sunday: { startTime: '22:00', endTime: '06:00', breakDuration: 30 }
        },
        leaveBalance: {
          annual: 15,
          sick: 8,
          personal: 3,
          used: { annual: 1, sick: 0, personal: 0 }
        },
        attendanceRecord: []
      }
    ];

    const mockLeaveRequests: LeaveRequest[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'Sarah Johnson',
        type: 'ANNUAL',
        startDate: '2024-02-15',
        endDate: '2024-02-19',
        days: 5,
        reason: 'Family vacation',
        status: 'PENDING',
        appliedDate: '2024-01-20'
      },
      {
        id: '2',
        employeeId: '3',
        employeeName: 'Maria Rodriguez',
        type: 'SICK',
        startDate: '2024-01-18',
        endDate: '2024-01-18',
        days: 1,
        reason: 'Medical appointment',
        status: 'APPROVED',
        appliedDate: '2024-01-17',
        approvedBy: 'Lisa Brown',
        approvedDate: '2024-01-17'
      },
      {
        id: '3',
        employeeId: '2',
        employeeName: 'Ahmed Al-Rashid',
        type: 'PERSONAL',
        startDate: '2024-01-25',
        endDate: '2024-01-25',
        days: 1,
        reason: 'Personal appointment',
        status: 'APPROVED',
        appliedDate: '2024-01-22',
        approvedBy: 'Mike Wilson',
        approvedDate: '2024-01-22'
      }
    ];

    const mockPerformanceReviews: PerformanceReview[] = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'Sarah Johnson',
        reviewPeriod: '2023 Q4',
        overallRating: 4.5,
        criteria: {
          punctuality: 5,
          qualityOfWork: 4,
          teamwork: 5,
          communication: 4,
          initiative: 4
        },
        strengths: ['Excellent team leadership', 'High attention to detail', 'Great communication with guests'],
        areasForImprovement: ['Time management during peak seasons', 'Delegation skills'],
        goals: ['Complete advanced housekeeping certification', 'Mentor new team members'],
        reviewerName: 'Ahmed Hassan',
        reviewDate: '2024-01-10',
        nextReviewDate: '2024-04-10',
        comments: 'Sarah consistently delivers high-quality work and is a valuable team leader.'
      },
      {
        id: '2',
        employeeId: '3',
        employeeName: 'Maria Rodriguez',
        reviewPeriod: '2023 Q4',
        overallRating: 4.8,
        criteria: {
          punctuality: 5,
          qualityOfWork: 5,
          teamwork: 5,
          communication: 5,
          initiative: 4
        },
        strengths: ['Exceptional guest relations', 'Innovative wellness programs', 'Strong professional knowledge'],
        areasForImprovement: ['Administrative documentation', 'Workshop planning efficiency'],
        goals: ['Develop new meditation programs', 'Obtain advanced nutrition certification'],
        reviewerName: 'Lisa Brown',
        reviewDate: '2024-01-08',
        nextReviewDate: '2024-04-08',
        comments: 'Maria excels in her role and consistently receives excellent feedback from guests.'
      }
    ];

    setEmployees(mockEmployees);
    setLeaveRequests(mockLeaveRequests);
    setPerformanceReviews(mockPerformanceReviews);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE':
        return 'bg-yellow-100 text-yellow-800';
      case 'TERMINATED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'HOUSEKEEPING':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-orange-100 text-orange-800';
      case 'RECEPTION':
        return 'bg-purple-100 text-purple-800';
      case 'KITCHEN':
        return 'bg-green-100 text-green-800';
      case 'SECURITY':
        return 'bg-red-100 text-red-800';
      case 'MANAGEMENT':
        return 'bg-gray-100 text-gray-800';
      case 'WELLNESS':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED'
    }).format(amount);
  };

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEmployee: Employee = {
      id: Date.now().toString(),
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      email: employeeData.email,
      phone: employeeData.phone,
      address: employeeData.address,
      position: employeeData.position,
      department: employeeData.department as Employee['department'],
      employmentType: employeeData.employmentType as Employee['employmentType'],
      status: 'ACTIVE',
      hireDate: employeeData.hireDate,
      salary: parseFloat(employeeData.salary),
      emergencyContactName: employeeData.emergencyContactName,
      emergencyContactPhone: employeeData.emergencyContactPhone,
      skillset: [],
      certifications: [],
      performanceRating: 0,
      workSchedule: {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null
      },
      leaveBalance: {
        annual: employeeData.employmentType === 'FULL_TIME' ? 30 : 15,
        sick: employeeData.employmentType === 'FULL_TIME' ? 15 : 8,
        personal: employeeData.employmentType === 'FULL_TIME' ? 5 : 3,
        used: { annual: 0, sick: 0, personal: 0 }
      },
      attendanceRecord: []
    };

    setEmployees(prev => [newEmployee, ...prev]);
    setIsAddEmployeeOpen(false);
    setEmployeeData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      position: "",
      department: "",
      employmentType: "FULL_TIME",
      salary: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      hireDate: format(new Date(), "yyyy-MM-dd")
    });
  };

  const employeeColumns = [
    {
      accessorKey: "employeeId",
      header: "Employee",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">{row.original.firstName} {row.original.lastName}</p>
            <p className="text-sm text-gray-500">{row.original.employeeId}</p>
          </div>
        </div>
      )
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.position}</p>
          <Badge className={getDepartmentColor(row.original.department)}>
            {row.original.department}
          </Badge>
        </div>
      )
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }: any) => (
        <div>
          <p className="text-sm">{row.original.email}</p>
          <p className="text-sm text-gray-500">{row.original.phone}</p>
        </div>
      )
    },
    {
      accessorKey: "employmentType",
      header: "Type",
      cell: ({ row }: any) => row.getValue("employmentType").replace('_', ' ')
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.getValue("status"))}>
          {row.getValue("status").replace('_', ' ')}
        </Badge>
      )
    },
    {
      accessorKey: "performanceRating",
      header: "Rating",
      cell: ({ row }: any) => {
        const rating = row.getValue("performanceRating");
        return rating > 0 ? (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{rating}</span>
          </div>
        ) : (
          <span className="text-gray-500">Not rated</span>
        );
      }
    },
    {
      accessorKey: "hireDate",
      header: "Hire Date",
      cell: ({ row }: any) => format(new Date(row.getValue("hireDate")), "MMM dd, yyyy")
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit Employee
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="w-4 h-4 mr-2" />
              View Schedule
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" />
              Performance Review
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const leaveRequestColumns = [
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-600" />
          <span className="font-medium">{row.getValue("employeeName")}</span>
        </div>
      )
    },
    {
      accessorKey: "type",
      header: "Leave Type",
      cell: ({ row }: any) => (
        <Badge variant="outline">
          {row.getValue("type")}
        </Badge>
      )
    },
    {
      accessorKey: "startDate",
      header: "Duration",
      cell: ({ row }: any) => (
        <div>
          <p>{format(new Date(row.original.startDate), "MMM dd")} - {format(new Date(row.original.endDate), "MMM dd")}</p>
          <p className="text-sm text-gray-500">{row.original.days} day(s)</p>
        </div>
      )
    },
    {
      accessorKey: "reason",
      header: "Reason"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <Badge className={getStatusColor(row.getValue("status"))}>
          {row.getValue("status")}
        </Badge>
      )
    },
    {
      accessorKey: "appliedDate",
      header: "Applied",
      cell: ({ row }: any) => format(new Date(row.getValue("appliedDate")), "MMM dd")
    }
  ];

  const performanceColumns = [
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-600" />
          <span className="font-medium">{row.getValue("employeeName")}</span>
        </div>
      )
    },
    {
      accessorKey: "reviewPeriod",
      header: "Period"
    },
    {
      accessorKey: "overallRating",
      header: "Overall Rating",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="font-medium">{row.getValue("overallRating")}</span>
        </div>
      )
    },
    {
      accessorKey: "reviewerName",
      header: "Reviewer"
    },
    {
      accessorKey: "reviewDate",
      header: "Review Date",
      cell: ({ row }: any) => format(new Date(row.getValue("reviewDate")), "MMM dd, yyyy")
    },
    {
      accessorKey: "nextReviewDate",
      header: "Next Review",
      cell: ({ row }: any) => format(new Date(row.getValue("nextReviewDate")), "MMM dd, yyyy")
    }
  ];

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
                <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-600">Manage employees, schedules, performance, and leave requests</p>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Employee
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                      <DialogDescription>Enter employee details to add them to the system</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEmployee} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={employeeData.firstName}
                            onChange={(e) => setEmployeeData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={employeeData.lastName}
                            onChange={(e) => setEmployeeData(prev => ({ ...prev, lastName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={employeeData.email}
                            onChange={(e) => setEmployeeData(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={employeeData.phone}
                            onChange={(e) => setEmployeeData(prev => ({ ...prev, phone: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={employeeData.address}
                          onChange={(e) => setEmployeeData(prev => ({ ...prev, address: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            value={employeeData.position}
                            onChange={(e) => setEmployeeData(prev => ({ ...prev, position: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select 
                            value={employeeData.department} 
                            onValueChange={(value) => setEmployeeData(prev => ({ ...prev, department: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                              <SelectItem value="RECEPTION">Reception</SelectItem>
                              <SelectItem value="KITCHEN">Kitchen</SelectItem>
                              <SelectItem value="SECURITY">Security</SelectItem>
                              <SelectItem value="MANAGEMENT">Management</SelectItem>
                              <SelectItem value="WELLNESS">Wellness</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employmentType">Employment Type</Label>
                          <Select 
                            value={employeeData.employmentType} 
                            onValueChange={(value) => setEmployeeData(prev => ({ ...prev, employmentType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FULL_TIME">Full Time</SelectItem>
                              <SelectItem value="PART_TIME">Part Time</SelectItem>
                              <SelectItem value="CONTRACT">Contract</SelectItem>
                              <SelectItem value="TEMPORARY">Temporary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salary">Monthly Salary (AED)</Label>
                          <Input
                            id="salary"
                            type="number"
                            value={employeeData.salary}
                            onChange={(e) => setEmployeeData(prev => ({ ...prev, salary: e.target.value }))}
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                          <Input
                            id="emergencyContactName"
                            value={employeeData.emergencyContactName}
                            onChange={(e) => setEmployeeData(prev => ({ ...prev, emergencyContactName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                          <Input
                            id="emergencyContactPhone"
                            value={employeeData.emergencyContactPhone}
                            onChange={(e) => setEmployeeData(prev => ({ ...prev, emergencyContactPhone: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hireDate">Hire Date</Label>
                        <Input
                          id="hireDate"
                          type="date"
                          value={employeeData.hireDate}
                          onChange={(e) => setEmployeeData(prev => ({ ...prev, hireDate: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <Button type="submit">Add Employee</Button>
                        <Button type="button" variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {employees.filter(e => e.status === 'ACTIVE').length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                  <UserX className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.filter(e => e.status === 'ON_LEAVE').length}</div>
                  <p className="text-xs text-muted-foreground">
                    {leaveRequests.filter(l => l.status === 'PENDING').length} pending requests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(employees.filter(e => e.performanceRating > 0).reduce((sum, e) => sum + e.performanceRating, 0) / 
                      employees.filter(e => e.performanceRating > 0).length || 0).toFixed(1)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Out of 5.0 rating
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(employees.reduce((sum, e) => sum + (e.salary || 0), 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total monthly cost
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="employees" className="gap-2">
                  <Users className="w-4 h-4" />
                  Employees
                </TabsTrigger>
                <TabsTrigger value="leave" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Leave Requests
                </TabsTrigger>
                <TabsTrigger value="performance" className="gap-2">
                  <Award className="w-4 h-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="schedule" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Schedule
                </TabsTrigger>
              </TabsList>

              {/* Employees Tab */}
              <TabsContent value="employees">
                <Card>
                  <CardHeader>
                    <CardTitle>Employee Directory</CardTitle>
                    <CardDescription>Manage all employee information and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={employeeColumns}
                      data={employees}
                      searchKey="firstName"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Leave Requests Tab */}
              <TabsContent value="leave">
                <Card>
                  <CardHeader>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>Review and approve employee leave requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={leaveRequestColumns}
                      data={leaveRequests}
                      searchKey="employeeName"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Reviews</CardTitle>
                    <CardDescription>Track employee performance and review history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={performanceColumns}
                      data={performanceReviews}
                      searchKey="employeeName"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Schedule</CardTitle>
                    <CardDescription>View and manage employee work schedules</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Label>Week of:</Label>
                        <Input
                          type="date"
                          value={format(startOfWeek(selectedWeek), "yyyy-MM-dd")}
                          onChange={(e) => setSelectedWeek(new Date(e.target.value))}
                          className="w-auto"
                        />
                      </div>
                      
                      <div className="text-center text-gray-500 py-8">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Schedule management interface would be implemented here</p>
                        <p className="text-sm">Showing week of {format(startOfWeek(selectedWeek), "MMM dd, yyyy")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  Home,
  CreditCard,
  Settings,
  Bell,
  FileText,
  TrendingUp,
  Briefcase,
  Calculator,
  MapPin,
  UserCheck,
  Car,
  Gamepad2,
  ShoppingCart,
  DollarSign,
  Receipt,
  Truck,
  ChevronRight,
  Network,
  Activity,
  Contact,
  Building,
  X,
  LogOut,
  BarChart3,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSidebar } from "@/contexts/sidebar-context";
import { useAuth } from "@/contexts/auth-context";

interface SidebarItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: number | string;
  isNew?: boolean;
  children?: SidebarItem[];
  allowedRoles?: string[];
  requiredPlatforms?: string[];
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
  isHighlighted?: boolean;
  allowedRoles?: string[];
  platformKey?: string;
}

// Function to get manager's assigned platforms
const getManagerPlatforms = async (userId: string): Promise<string[]> => {
  try {
    // Skip API call if we don't have a real user ID (temp implementation)
    if (!userId || userId === 'temp-id') {
      return [];
    }

    const { apiClient } = await import('@/lib/api-client');
    const data = await apiClient.getManagerAssignments({
      userId: userId
    });
    
    const allPlatforms = new Set<string>();
    
    // Platform ID mapping for backward compatibility
    const platformIdMapping: { [key: string]: string } = {
      'marah': 'MARAH Games',
      'real-estate': 'Real Estate',
      'employees': 'Employee Management',
      'investors': 'Investor Relations',
      // Keep new IDs as-is
      'MARAH Games': 'MARAH Games',
      'Real Estate': 'Real Estate',
      'Employee Management': 'Employee Management',
      'Investor Relations': 'Investor Relations',
    };
    
    // Extract platforms from assignments
    if (data.assignments && Array.isArray(data.assignments)) {
      data.assignments.forEach((assignment: any) => {
        if (assignment.platforms && Array.isArray(assignment.platforms)) {
          assignment.platforms.forEach((platform: string) => {
            // Map old platform IDs to new ones
            const mappedPlatform = platformIdMapping[platform] || platform;
            allPlatforms.add(mappedPlatform);
          });
        }
      });
    }
    
    return Array.from(allPlatforms);
  } catch (error) {
    console.error('Error fetching manager platforms:', error);
    return [];
  }
};

// Function to get sidebar data based on user role and platforms
const getSidebarData = (userRole: string, managerPlatforms: string[] = []): SidebarSection[] => {
  const allSections: SidebarSection[] = [
    {
      title: "Manager Dashboard",
      isHighlighted: true,
      allowedRoles: ['MANAGER'],
      items: [
        {
          title: "Dashboard Overview",
          icon: BarChart3,
          href: "/manager-dashboard",
          allowedRoles: ['MANAGER'],
        },
      ],
    },
    {
      title: "Users",
      isHighlighted: true,
      allowedRoles: ['SUPER_ADMIN'],
      items: [
        {
          title: "User Management",
          icon: Users,
          href: "/users",
          allowedRoles: ['SUPER_ADMIN'],
        },
        {
          title: "Manager Administration",
          icon: UserCheck,
          href: "/managers",
          allowedRoles: ['SUPER_ADMIN'],
        },
      ],
    },
    {
      title: "Companies",
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      items: [
        {
          title: "Companies",
          icon: Building2,
          children: [
            { 
              title: "Company Management", 
              icon: Building2, 
              href: "/companies",
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
            },
            { 
              title: "Employee Management", 
              icon: Users, 
              href: "/employees",
              allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
            },
          ],
        },
      ],
    },
    {
      title: "ALBARQ",
      allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
      platformKey: "ALBARQ",
      items: [
        {
          title: "Dashboard",
          icon: Home,
          href: "/albarq/dashboard",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ALBARQ'],
        },
      ],
    },
    {
      title: "ELEVATE",
      allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
      platformKey: "ELEVATE",
      items: [
        {
          title: "Home",
          icon: Home,
          href: "/elevate/home",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ELEVATE'],
        },
        {
          title: "Cash Requests",
          icon: CreditCard,
          href: "/elevate/cash-requests",
          badge: 1,
          isNew: true,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ELEVATE'],
        },
        {
          title: "Settings",
          icon: Settings,
          href: "/elevate/settings",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ELEVATE'],
        },
        {
          title: "Notifications",
          icon: Bell,
          href: "/elevate/notifications",
          badge: 10,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ELEVATE'],
        },
        {
          title: "Reports & Analysis",
          icon: FileText,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ELEVATE'],
          children: [
            { title: "Financial Reports", icon: TrendingUp, href: "/elevate/reports/financial", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Performance Analytics", icon: TrendingUp, href: "/elevate/reports/performance", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Investment Analysis", icon: TrendingUp, href: "/elevate/reports/investment", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
          ],
        },
        {
          title: "Investor",
          icon: TrendingUp,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ELEVATE'],
          children: [
            { title: "Investor Portfolio", icon: TrendingUp, href: "/elevate/investor", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Management", icon: Settings, href: "/elevate/investor/manage", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
          ],
        },
        {
          title: "Business Network",
          icon: Network,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ELEVATE'],
          children: [
            { title: "Dashboard", icon: Home, href: "/elevate/business-network/dashboard", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Activity", icon: Activity, href: "/elevate/business-network/activity", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Contacts", icon: Contact, href: "/elevate/business-network/contacts", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Business", icon: Building, href: "/elevate/business-network/business", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Employers", icon: Users, href: "/elevate/business-network/employers", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
          ],
        },
        {
          title: "Business Management",
          icon: Briefcase,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ELEVATE'],
          children: [
            { title: "Portfolio Management", icon: Briefcase, href: "/elevate/business/portfolio", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Investment Tracking", icon: TrendingUp, href: "/elevate/business/tracking", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Risk Assessment", icon: FileText, href: "/elevate/business/risk", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
          ],
        },
        {
          title: "Accounts & Finance",
          icon: Calculator,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['ELEVATE'],
          children: [
            { title: "Account Overview", icon: Calculator, href: "/elevate/finance/overview", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Transactions", icon: CreditCard, href: "/elevate/finance/transactions", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
            { title: "Budget Planning", icon: FileText, href: "/elevate/finance/budget", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['ELEVATE'] },
          ],
        },
      ],
    },
    {
      title: "REAL-ESTATE",
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      platformKey: "Real Estate",
      items: [
        {
          title: "Home",
          icon: Home,
          href: "/real-estate/home",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Real Estate'],
        },
        {
          title: "Properties",
          icon: Building2,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Real Estate'],
          children: [
            { title: "Property Listings", icon: Building2, href: "/real-estate/properties/listings", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Real Estate'] },
            { title: "Property Management", icon: Settings, href: "/real-estate/properties/management", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Real Estate'] },        ],
        },
        {
          title: "Tenants / Lease",
          icon: UserCheck,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Real Estate'],
          children: [
            { title: "Tenant Management", icon: Users, href: "/real-estate/tenants/management", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Real Estate'] },
            { title: "Lease Agreements", icon: FileText, href: "/real-estate/tenants/leases", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Real Estate'] },
            { title: "Rent Collection", icon: DollarSign, href: "/real-estate/tenants/rent", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Real Estate'] },
          ],
        },
        {
          title: "Appliances",
          icon: Settings,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Real Estate'],
          children: [
            { title: "Appliance Management", icon: Settings, href: "/real-estate/appliances/management", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Real Estate'] },
            { title: "Maintenance Requests", icon: Settings, href: "/real-estate/appliances/maintenance", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Real Estate'] },
          ],
        },
        {
          title: "Property Finances",
          icon: Calculator,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['Real Estate'],
          children: [
            { title: "Income Tracking", icon: TrendingUp, href: "/real-estate/finances/income", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['Real Estate'] },
            { title: "Expense Management", icon: Calculator, href: "/real-estate/finances/expenses", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['Real Estate'] },
            { title: "Financial Reports", icon: FileText, href: "/real-estate/finances/reports", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['Real Estate'] },
          ],
        },
      ],
    },
    {
      title: "MARAH GAMES",
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      platformKey: "MARAH Games",
      items: [
        {
          title: "Home",
          icon: Home,
          href: "/marah/home",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['MARAH Games'],
        },
        {
          title: "Customer Management",
          icon: Users,
          href: "/marah/customers",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['MARAH Games'],
        },
        {
          title: "Game Management",
          icon: Gamepad2,
          href: "/marah/games",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['MARAH Games'],
        },
        {
          title: "Driver Management",
          icon: Car,
          href: "/marah/drivers",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['MARAH Games'],
        },
        {
          title: "Order Management",
          icon: ShoppingCart,
          href: "/marah/orders",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['MARAH Games'],
        },
        {
          title: "Payment & Billing",
          icon: DollarSign,
          requiredPlatforms: ['MARAH Games'],
          children: [
            { title: "Payments", icon: DollarSign, href: "/marah/payments", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['MARAH Games'] },
            { title: "Invoices", icon: Receipt, href: "/marah/invoices", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['MARAH Games'] },
          ],
        },
        {
          title: "Delivery Management",
          icon: Truck,
          requiredPlatforms: ['MARAH Games'],
          children: [
            { title: "Delivery Charges", icon: Truck, href: "/marah/delivery/charges", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['MARAH Games'] },
            { title: "Zone Management", icon: MapPin, href: "/marah/delivery/zones", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['MARAH Games'] },
          ],
        },
        {
          title: "Financial Management",
          icon: Calculator,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['MARAH Games'],
          children: [
            { title: "Revenue Tracking", icon: TrendingUp, href: "/marah/finance/revenue", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['MARAH Games'] },
            { title: "Expense Management", icon: Calculator, href: "/marah/finance/expenses", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['MARAH Games'] },
            { title: "Financial Reports", icon: FileText, href: "/marah/finance/reports", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['MARAH Games'] },
          ],
        },
        {
          title: "Settings & Configuration",
          icon: Settings,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['MARAH Games'],
          children: [
            { title: "System Settings", icon: Settings, href: "/marah/settings/system", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['MARAH Games'] },
            { title: "Payment Configuration", icon: CreditCard, href: "/marah/settings/payment", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['MARAH Games'] },
            { title: "Notification Settings", icon: Bell, href: "/marah/settings/notifications", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['MARAH Games'] },
          ],
        },
      ],
    },
    {
      title: "EMPLOYEE MANAGEMENT",
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      platformKey: "Employee Management",
      items: [
        {
          title: "Employee Directory",
          icon: Users,
          href: "/hr/employees/directory",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Employee Management'],
        },
        {
          title: "Payroll Management",
          icon: DollarSign,
          href: "/hr/employees/payroll",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['Employee Management'],
        },
        {
          title: "Performance Reviews",
          icon: TrendingUp,
          href: "/hr/employees/reviews",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Employee Management'],
        },
      ],
    },
    {
      title: "INVESTOR RELATIONS",
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      platformKey: "Investor Relations",
      items: [
        {
          title: "Investor Dashboard",
          icon: TrendingUp,
          href: "/investor/dashboard",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Investor Relations'],
        },
        {
          title: "Communication Management",
          icon: Contact,
          href: "/investor/communications",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Investor Relations'],
        },
        {
          title: "Investor Reports",
          icon: FileText,
          href: "/investor/reports",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['Investor Relations'],
        },
      ],
    },
    {
      title: "BRIDGE RETREATS",
      allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
      platformKey: "Bridge Retreats",
      items: [
        {
          title: "Dashboard",
          icon: Home,
          href: "/bridge-retreats/dashboard",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Bridge Retreats'],
        },
        {
          title: "Analytics",
          icon: BarChart3,
          href: "/bridge-retreats/analytics",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Bridge Retreats'],
        },
        {
          title: "Retreat Management",
          icon: Calendar,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Bridge Retreats'],
          children: [
            { title: "All Retreats", icon: Calendar, href: "/bridge-retreats/retreats", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Bridge Retreats'] },
            { title: "Create Retreat", icon: Calendar, href: "/bridge-retreats/retreats/create", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Bridge Retreats'] },
            { title: "Retreat Calendar", icon: Calendar, href: "/bridge-retreats/calendar", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Bridge Retreats'] },
          ],
        },
        {
          title: "Bookings",
          icon: Calendar,
          href: "/bridge-retreats/bookings",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Bridge Retreats'],
        },
        {
          title: "Guest Management",
          icon: Users,
          href: "/bridge-retreats/guests",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Bridge Retreats'],
        },
        {
          title: "Facilities",
          icon: Building2,
          href: "/bridge-retreats/facilities",
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Bridge Retreats'],
        },
        {
          title: "Financial Management",
          icon: Calculator,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
          requiredPlatforms: ['Bridge Retreats'],
          children: [
            { title: "Revenue Tracking", icon: TrendingUp, href: "/bridge-retreats/finance/revenue", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['Bridge Retreats'] },
            { title: "Expense Management", icon: Calculator, href: "/bridge-retreats/finance/expenses", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['Bridge Retreats'] },
            { title: "Financial Reports", icon: FileText, href: "/bridge-retreats/finance/reports", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['Bridge Retreats'] },
          ],
        },
        {
          title: "Operations",
          icon: Settings,
          allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'],
          requiredPlatforms: ['Bridge Retreats'],
          children: [
            { title: "Housekeeping", icon: Settings, href: "/bridge-retreats/operations/housekeeping", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Bridge Retreats'] },
            { title: "Maintenance", icon: Settings, href: "/bridge-retreats/operations/maintenance", allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'], requiredPlatforms: ['Bridge Retreats'] },
            { title: "Staff Management", icon: Users, href: "/bridge-retreats/operations/staff", allowedRoles: ['SUPER_ADMIN', 'ADMIN'], requiredPlatforms: ['Bridge Retreats'] },
          ],
        },
      ],
    },
  ];

  // Helper function to check if item has platform access
  const hasPermission = (item: SidebarItem | SidebarSection, userRole: string, managerPlatforms: string[]): boolean => {
    // Check role permission
    if (item.allowedRoles && !item.allowedRoles.includes(userRole)) {
      return false;
    }
    
    // For managers, check platform access
    if (userRole === 'MANAGER') {
      if ('requiredPlatforms' in item && item.requiredPlatforms) {
        return item.requiredPlatforms.some(platform => managerPlatforms.includes(platform));
      }
      if ('platformKey' in item && item.platformKey) {
        return managerPlatforms.includes(item.platformKey);
      }
    }
    
    return true;
  };

  // Filter sections and items based on user role and platform access
  return allSections
    .filter(section => hasPermission(section, userRole, managerPlatforms))
    .map(section => ({
      ...section,
      items: section.items
        .filter(item => hasPermission(item, userRole, managerPlatforms))
        .map(item => ({
          ...item,
          children: item.children?.filter(child => hasPermission(child, userRole, managerPlatforms))
        }))
    }))
    .filter(section => section.items.length > 0); // Remove empty sections
};

interface CollapsibleMenuItemProps {
  item: SidebarItem;
  level?: number;
}

function CollapsibleMenuItem({ item, level = 0 }: CollapsibleMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { close, isMobile, isTablet } = useSidebar();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href;

  const handleLinkClick = () => {
    if (isMobile || isTablet) {
      close();
    }
  };

  if (!hasChildren) {
    return (
      <motion.div
        whileHover={{ x: isMobile ? 0 : 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Link href={item.href || "#"} onClick={handleLinkClick}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal h-auto py-3 px-4 rounded-xl",
              level > 0 && "ml-6 text-sm",
              "hover:bg-primary/10 hover:text-primary transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/10",
              "group relative overflow-hidden",
              isActive && "bg-primary/10 text-primary shadow-lg shadow-primary/10",
              isMobile && "min-h-[48px] active:bg-primary/20" // Larger touch targets and active state
            )}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent transition-opacity duration-300",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )} />
            <item.icon className="mr-3 h-4 w-4 flex-shrink-0 relative z-10" />
            <span className="flex-1 relative z-10">{item.title}</span>
            {item.badge && (
              <Badge 
                variant={item.isNew ? "default" : "secondary"} 
                className={cn(
                  "ml-2 h-5 text-xs relative z-10",
                  item.isNew && "animate-pulse-glow"
                )}
              >
                {item.badge}
              </Badge>
            )}
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <motion.div
          whileHover={{ x: isMobile ? 0 : 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal h-auto py-3 px-4 rounded-xl",
              level > 0 && "ml-6 text-sm",
              "hover:bg-primary/10 hover:text-primary transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/10",
              "group relative overflow-hidden",
              isMobile && "min-h-[48px] active:bg-primary/20" // Larger touch targets and active state
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <item.icon className="mr-3 h-4 w-4 flex-shrink-0 relative z-10" />
            <span className="flex-1 relative z-10">{item.title}</span>
            {item.badge && (
              <Badge 
                variant={item.isNew ? "default" : "secondary"} 
                className={cn(
                  "ml-2 h-5 text-xs relative z-10",
                  item.isNew && "animate-pulse-glow"
                )}
              >
                {item.badge}
              </Badge>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0" />
            </motion.div>
          </Button>
        </motion.div>
      </CollapsibleTrigger>
      <AnimatePresence>
        {isOpen && (
          <CollapsibleContent asChild>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-2 space-y-1 border-l border-primary/20 pl-4">
                {item.children?.map((child, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <CollapsibleMenuItem item={child} level={level + 1} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </CollapsibleContent>
        )}
      </AnimatePresence>
    </Collapsible>
  );
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { isOpen, close, isMobile, isTablet } = useSidebar();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [managerPlatforms, setManagerPlatforms] = useState<string[]>([]);
  const [platformsLoaded, setPlatformsLoaded] = useState(false);
  
  // Get user role, default to USER if not available
  const userRole = user?.role || 'USER';

  // Fetch manager platforms on component mount for managers
  useEffect(() => {
    const fetchManagerPlatforms = async () => {
      if (user && userRole === 'MANAGER') {
        try {
          const platforms = await getManagerPlatforms(user.id);
          console.log('Manager platforms loaded:', platforms);
          setManagerPlatforms(platforms);
        } catch (error) {
          console.error('Error loading manager platforms:', error);
          setManagerPlatforms([]);
        }
      } else {
        setManagerPlatforms([]);
      }
      setPlatformsLoaded(true);
    };

    fetchManagerPlatforms();
  }, [user, userRole]);

  // Get sidebar data based on role and platforms
  const sidebarData = getSidebarData(userRole, managerPlatforms);

  // Debug log for platform filtering
  if (userRole === 'MANAGER') {
    console.log('Sidebar - User role:', userRole);
    console.log('Sidebar - Manager platforms:', managerPlatforms);
    console.log('Sidebar - Filtered sections:', sidebarData.map(s => s.title));
  }

  // Don't render sidebar until platforms are loaded for managers
  if (userRole === 'MANAGER' && !platformsLoaded) {
    return (
      <div className="fixed left-0 top-0 h-screen w-80 bg-gray-100 z-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading platforms...</p>
        </div>
      </div>
    );
  }

  // Mobile overlay click handler
  const handleOverlayClick = () => {
    if (isMobile || isTablet) {
      close();
    }
  };

  // Logout handler
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <>
      {/* Mobile/Tablet Overlay */}
      <AnimatePresence>
        {isOpen && (isMobile || isTablet) && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleOverlayClick}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always Visible */}
      {(!isMobile && !isTablet) && (
        <motion.div 
          className={cn(
            "sticky top-0 h-screen glass-sidebar overflow-y-auto z-40 w-80",
            !isOpen && "transform -translate-x-full",
            className
          )}
          initial={{ x: 0, opacity: 1 }}
          animate={{ x: isOpen ? 0 : -320, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Header */}
          <motion.div 
            className="p-4 sm:p-6 border-b border-border/30"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/logo ele.png"
                  alt="ELEVATE Investment Group"
                  width={180}
                  height={60}
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

                      {/* Navigation */}
            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {sidebarData.map((section, sectionIndex) => (
              <motion.div 
                key={sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + sectionIndex * 0.05 }}
              >
                {/* Section Header */}
                <div className="mb-3 sm:mb-4">
                  <motion.h2 
                    className={cn(
                      "text-xs sm:text-sm font-semibold tracking-wide uppercase",
                      section.isHighlighted 
                        ? "text-white bg-gradient-primary px-3 sm:px-4 py-2 rounded-xl shadow-lg" 
                        : "text-muted-foreground px-3 sm:px-4"
                    )}
                    whileHover={section.isHighlighted ? { scale: 1.02 } : {}}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {section.title}
                  </motion.h2>
                </div>

                {/* Section Items */}
                {section.items.length > 0 && (
                  <div className="space-y-1 sm:space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + sectionIndex * 0.05 + itemIndex * 0.02 }}
                      >
                        <CollapsibleMenuItem item={item} />
                      </motion.div>
                    ))}
                  </div>
                )}

                                  {/* Separator between sections */}
                  {sectionIndex < sidebarData.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4 + sectionIndex * 0.05 }}
                    className="mt-6 sm:mt-8"
                  >
                    <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div 
            className="p-4 sm:p-6 mt-auto border-t border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {/* Logout Button */}
            <motion.div 
              className="mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </motion.div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                © 2024 ELEVATE Investment Group
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Premium Dashboard v2.0
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile/Tablet Sidebar */}
      <AnimatePresence mode="wait">
        {isOpen && (isMobile || isTablet) && (
          <motion.div 
            className={cn(
              "fixed left-0 top-0 h-screen glass-sidebar overflow-y-auto z-40 w-80 max-w-[85vw]",
              className
            )}
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Mobile/Tablet Close Button */}
            <motion.div 
              className="absolute top-4 right-4 z-50"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={close}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 active:bg-white/30"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>

          {/* Header */}
          <motion.div 
              className={cn(
                "p-4 sm:p-6 border-b border-border/30",
                (isMobile || isTablet) && "pr-16" // Add padding for close button on mobile/tablet
              )}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
              <div className="flex items-center justify-center">
              <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                  <Image
                    src="/logo ele.png"
                    alt="ELEVATE Investment Group"
                    width={180}
                    height={60}
                    className="object-contain"
                    priority
                  />
              </motion.div>
            </div>
          </motion.div>

          {/* Navigation */}
            <div className={cn(
              "p-4 sm:p-6 space-y-6 sm:space-y-8",
              (isMobile || isTablet) && "pb-20" // Extra padding at bottom for mobile/tablet
            )}>
                          {sidebarData.map((section, sectionIndex) => (
              <motion.div 
                key={sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + sectionIndex * 0.05 }}
              >
                {/* Section Header */}
                  <div className="mb-3 sm:mb-4">
                  <motion.h2 
                    className={cn(
                        "text-xs sm:text-sm font-semibold tracking-wide uppercase",
                      section.isHighlighted 
                          ? "text-white bg-gradient-primary px-3 sm:px-4 py-2 rounded-xl shadow-lg" 
                          : "text-muted-foreground px-3 sm:px-4"
                    )}
                    whileHover={section.isHighlighted ? { scale: 1.02 } : {}}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {section.title}
                  </motion.h2>
                </div>

                {/* Section Items */}
                {section.items.length > 0 && (
                    <div className="space-y-1 sm:space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + sectionIndex * 0.05 + itemIndex * 0.02 }}
                      >
                        <CollapsibleMenuItem item={item} />
                      </motion.div>
                    ))}
                  </div>
                )}

                                  {/* Separator between sections */}
                  {sectionIndex < sidebarData.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.4 + sectionIndex * 0.05 }}
                      className="mt-6 sm:mt-8"
                  >
                    <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div 
              className="p-4 sm:p-6 mt-auto border-t border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {/* Logout Button */}
            <motion.div 
              className="mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </motion.div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                © 2024 ELEVATE Investment Group
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Premium Dashboard v2.0
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Logout Confirmation Dialog */}
    <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LogOut className="w-5 h-5 mr-2 text-red-600" />
            Confirm Logout
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to log out? You will be redirected to the login page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={cancelLogout}>
            Cancel
          </Button>
          <Button 
            onClick={confirmLogout}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
} 
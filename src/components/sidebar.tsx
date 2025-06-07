"use client";

import { useState } from "react";
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
  LogOut
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
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
  isHighlighted?: boolean;
}

const sidebarData: SidebarSection[] = [
  {
    title: "Users",
    isHighlighted: true,
    items: [
      {
        title: "User Management",
        icon: Users,
        href: "/users",
      },
    ],
  },
  {
    title: "Companies",
    items: [
      {
        title: "Companies",
        icon: Building2,
        children: [
          { title: "Company Management", icon: Building2, href: "/companies" },
          { title: "Employee Management", icon: Users, href: "/employees" },
        ],
      },
    ],
  },
  {
    title: "ALBARQ",
    items: [
      {
        title: "Dashboard",
        icon: Home,
        href: "/albarq/dashboard",
      },
    ],
  },
  {
    title: "ELEVATE",
    items: [
      {
        title: "Home",
        icon: Home,
        href: "/elevate/home",
      },
      {
        title: "Cash Requests",
        icon: CreditCard,
        href: "/elevate/cash-requests",
        badge: 1,
        isNew: true,
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/elevate/settings",
      },
      {
        title: "Notifications",
        icon: Bell,
        href: "/elevate/notifications",
        badge: 10,
      },
      {
        title: "Reports & Analysis",
        icon: FileText,
        children: [
          { title: "Financial Reports", icon: TrendingUp, href: "/elevate/reports/financial" },
          { title: "Performance Analytics", icon: TrendingUp, href: "/elevate/reports/performance" },
          { title: "Investment Analysis", icon: TrendingUp, href: "/elevate/reports/investment" },
        ],
      },
      {
        title: "Investor",
        icon: TrendingUp,
        href: "/elevate/investor",
      },
      {
        title: "Business Network",
        icon: Network,
        children: [
          { title: "Dashboard", icon: Home, href: "/elevate/business-network/dashboard" },
          { title: "Activity", icon: Activity, href: "/elevate/business-network/activity" },
          { title: "Contacts", icon: Contact, href: "/elevate/business-network/contacts" },
          { title: "Business", icon: Building, href: "/elevate/business-network/business" },
          { title: "Employers", icon: Users, href: "/elevate/business-network/employers" },
        ],
      },
      {
        title: "Business Management",
        icon: Briefcase,
        children: [
          { title: "Portfolio Management", icon: Briefcase, href: "/elevate/business/portfolio" },
          { title: "Investment Tracking", icon: TrendingUp, href: "/elevate/business/tracking" },
          { title: "Risk Assessment", icon: FileText, href: "/elevate/business/risk" },
        ],
      },
      {
        title: "Accounts & Finance",
        icon: Calculator,
        children: [
          { title: "Account Overview", icon: Calculator, href: "/elevate/finance/overview" },
          { title: "Transactions", icon: CreditCard, href: "/elevate/finance/transactions" },
          { title: "Budget Planning", icon: FileText, href: "/elevate/finance/budget" },
        ],
      },
    ],
  },
  {
    title: "REAL-ESTATE",
    items: [
      {
        title: "Home",
        icon: Home,
        href: "/real-estate/home",
      },
      {
        title: "Properties",
        icon: Building2,
        children: [
          { title: "Property Listings", icon: Building2, href: "/real-estate/properties/listings" },
          { title: "Property Management", icon: Settings, href: "/real-estate/properties/management" },
          { title: "Maintenance", icon: Settings, href: "/real-estate/properties/maintenance" },
        ],
      },
      {
        title: "Tenants / Lease",
        icon: UserCheck,
        children: [
          { title: "Tenant Management", icon: Users, href: "/real-estate/tenants/management" },
          { title: "Lease Agreements", icon: FileText, href: "/real-estate/tenants/leases" },
          { title: "Rent Collection", icon: DollarSign, href: "/real-estate/tenants/rent" },
        ],
      },
      {
        title: "Appliances",
        icon: Settings,
        children: [
          { title: "Appliance Inventory", icon: Settings, href: "/real-estate/appliances/inventory" },
          { title: "Maintenance Schedule", icon: Settings, href: "/real-estate/appliances/maintenance" },
        ],
      },
      {
        title: "Expenses",
        icon: Receipt,
        children: [
          { title: "Operating Expenses", icon: Receipt, href: "/real-estate/expenses/operating" },
          { title: "Maintenance Costs", icon: Receipt, href: "/real-estate/expenses/maintenance" },
        ],
      },
      {
        title: "Invoices",
        icon: FileText,
        children: [
          { title: "Generate Invoices", icon: FileText, href: "/real-estate/invoices/generate" },
          { title: "Invoice History", icon: FileText, href: "/real-estate/invoices/history" },
        ],
      },
      {
        title: "Payments",
        icon: DollarSign,
        children: [
          { title: "Payment Processing", icon: DollarSign, href: "/real-estate/payments/processing" },
          { title: "Payment History", icon: DollarSign, href: "/real-estate/payments/history" },
        ],
      },
      {
        title: "Reports",
        icon: FileText,
        href: "/real-estate/reports",
      },
    ],
  },
  {
    title: "MARAH",
    items: [
      {
        title: "Home",
        icon: Home,
        href: "/marah/home",
      },
      {
        title: "Drivers",
        icon: Car,
        href: "/marah/drivers",
      },
      {
        title: "Customers",
        icon: Users,
        href: "/marah/customers",
      },
      {
        title: "Games",
        icon: Gamepad2,
        children: [
          { title: "Game Management", icon: Gamepad2, href: "/marah/games/management" },
          { title: "Game Statistics", icon: TrendingUp, href: "/marah/games/statistics" },
        ],
      },
      {
        title: "Orders",
        icon: ShoppingCart,
        href: "/marah/orders",
      },
      {
        title: "Payments",
        icon: DollarSign,
        href: "/marah/payments",
      },
      {
        title: "Expenses",
        icon: Receipt,
        children: [
          { title: "Operational Expenses", icon: Receipt, href: "/marah/expenses/operational" },
          { title: "Driver Expenses", icon: Car, href: "/marah/expenses/drivers" },
        ],
      },
      {
        title: "Delivery Charges",
        icon: Truck,
        href: "/marah/delivery-charges",
      },
      {
        title: "Settings",
        icon: Settings,
        href: "/marah/settings",
      },
    ],
  },
  {
    title: "HUMAN RESOURCES",
    items: [
      {
        title: "Employees",
        icon: Users,
        children: [
          { title: "Employee Directory", icon: Users, href: "/hr/employees/directory" },
          { title: "Payroll Management", icon: DollarSign, href: "/hr/employees/payroll" },
          { title: "Performance Reviews", icon: TrendingUp, href: "/hr/employees/reviews" },
        ],
      },
    ],
  },
  {
    title: "DEFINITIONS",
    items: [
      {
        title: "Cities",
        icon: MapPin,
        href: "/definitions/cities",
      },
      {
        title: "City Areas",
        icon: MapPin,
        href: "/definitions/city-areas",
      },
      {
        title: "Expense Categories",
        icon: Receipt,
        href: "/definitions/expense-categories",
      },
    ],
  },
];

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
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

      {/* Sidebar */}
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
            className={cn(
              "h-screen glass-sidebar overflow-y-auto z-40",
              isMobile || isTablet
                ? "fixed left-0 top-0 w-80 max-w-[85vw]" 
                : "sticky top-0 w-80",
              className
            )}
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            {/* Mobile/Tablet Close Button */}
            {(isMobile || isTablet) && (
              <motion.div 
                className="absolute top-4 right-4 z-50 lg:hidden"
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
            )}

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
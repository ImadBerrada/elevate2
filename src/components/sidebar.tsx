"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
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
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSidebar } from "@/contexts/sidebar-context";

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
    items: [],
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
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.href;

  if (!hasChildren) {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Link href={item.href || "#"}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal h-auto py-3 px-4 rounded-xl",
              level > 0 && "ml-6 text-sm",
              "hover:bg-primary/10 hover:text-primary transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/10",
              "group relative overflow-hidden",
              isActive && "bg-primary/10 text-primary shadow-lg shadow-primary/10"
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
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal h-auto py-3 px-4 rounded-xl",
              level > 0 && "ml-6 text-sm",
              "hover:bg-primary/10 hover:text-primary transition-all duration-300",
              "hover:shadow-lg hover:shadow-primary/10",
              "group relative overflow-hidden"
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
  const { isOpen } = useSidebar();

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div 
          className={cn("w-80 h-screen glass-sidebar overflow-y-auto sticky top-0 z-40", className)}
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Header */}
          <motion.div 
            className="p-6 border-b border-border/30"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gradient">ELEVATE</h1>
                <p className="text-sm text-muted-foreground">Investment Group</p>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="p-6 space-y-8">
            {sidebarData.map((section, sectionIndex) => (
              <motion.div 
                key={sectionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + sectionIndex * 0.05 }}
              >
                {/* Section Header */}
                <div className="mb-4">
                  <motion.h2 
                    className={cn(
                      "text-sm font-semibold tracking-wide uppercase",
                      section.isHighlighted 
                        ? "text-white bg-gradient-primary px-4 py-2 rounded-xl shadow-lg" 
                        : "text-muted-foreground px-4"
                    )}
                    whileHover={section.isHighlighted ? { scale: 1.02 } : {}}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {section.title}
                  </motion.h2>
                </div>

                {/* Section Items */}
                {section.items.length > 0 && (
                  <div className="space-y-2">
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
                    className="mt-8"
                  >
                    <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div 
            className="p-6 mt-auto border-t border-border/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
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
  );
} 
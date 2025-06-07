"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Minus,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Target,
  Activity,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ReactNode;
  description?: string;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  description,
  color = 'default',
  size = 'md',
  className
}: StatCardProps) {
  const colorClasses = {
    default: 'text-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    switch (change.type) {
      case 'increase':
        return <ArrowUpRight className="h-3 w-3 text-green-500" />;
      case 'decrease':
        return <ArrowDownRight className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    
    switch (change.type) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("relative overflow-hidden", className)}>
        <CardContent className={sizeClasses[size]}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-baseline space-x-2">
                <p className={cn(
                  "text-2xl font-bold",
                  size === 'lg' && "text-3xl",
                  size === 'sm' && "text-xl",
                  colorClasses[color]
                )}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {change && (
                  <div className={cn(
                    "flex items-center space-x-1 text-xs font-medium",
                    getChangeColor()
                  )}>
                    {getChangeIcon()}
                    <span>
                      {Math.abs(change.value)}%
                      {change.period && ` ${change.period}`}
                    </span>
                  </div>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {icon && (
              <div className={cn(
                "rounded-full p-3",
                color === 'success' && "bg-green-100 text-green-600",
                color === 'warning' && "bg-yellow-100 text-yellow-600",
                color === 'danger' && "bg-red-100 text-red-600",
                color === 'info' && "bg-blue-100 text-blue-600",
                color === 'default' && "bg-muted text-muted-foreground"
              )}>
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface ProgressStatProps {
  title: string;
  value: number;
  max: number;
  label?: string;
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  showPercentage?: boolean;
  className?: string;
}

export function ProgressStat({
  title,
  value,
  max,
  label,
  color = 'default',
  showPercentage = true,
  className
}: ProgressStatProps) {
  const percentage = Math.round((value / max) * 100);
  
  const getProgressColor = () => {
    switch (color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              {showPercentage && (
                <Badge variant="secondary" className="text-xs">
                  {percentage}%
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">{value.toLocaleString()}</span>
                <span className="text-muted-foreground">
                  of {max.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2"
                // Apply custom color through CSS variable
                style={{ 
                  '--progress-background': getProgressColor().replace('bg-', '') 
                } as React.CSSProperties}
              />
              {label && (
                <p className="text-xs text-muted-foreground">{label}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface MetricGridProps {
  metrics: Array<{
    title: string;
    value: string | number;
    change?: {
      value: number;
      type: 'increase' | 'decrease' | 'neutral';
      period?: string;
    };
    icon?: React.ReactNode;
    color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  }>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricGrid({ metrics, columns = 4, className }: MetricGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn(`grid gap-4 ${gridClasses[columns]}`, className)}>
      {metrics.map((metric, index) => (
        <StatCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          icon={metric.icon}
          color={metric.color}
        />
      ))}
    </div>
  );
}

// Predefined metric configurations for MARAH pages
export const getCustomerMetrics = (data: any) => [
  {
    title: "Total Customers",
    value: data.totalCustomers || 0,
    change: data.customerGrowth ? {
      value: data.customerGrowth,
      type: data.customerGrowth > 0 ? 'increase' as const : 'decrease' as const,
      period: "this month"
    } : undefined,
    icon: <Users className="h-5 w-5" />,
    color: 'info' as const
  },
  {
    title: "Active Customers",
    value: data.activeCustomers || 0,
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'success' as const
  },
  {
    title: "VIP Customers",
    value: data.vipCustomers || 0,
    icon: <Star className="h-5 w-5" />,
    color: 'warning' as const
  },
  {
    title: "Total Revenue",
    value: `${(data.totalRevenue || 0).toLocaleString()} AED`,
    change: data.revenueGrowth ? {
      value: data.revenueGrowth,
      type: data.revenueGrowth > 0 ? 'increase' as const : 'decrease' as const,
      period: "this month"
    } : undefined,
    icon: <DollarSign className="h-5 w-5" />,
    color: 'success' as const
  }
];

export const getOrderMetrics = (data: any) => [
  {
    title: "Total Orders",
    value: data.totalOrders || 0,
    change: data.orderGrowth ? {
      value: data.orderGrowth,
      type: data.orderGrowth > 0 ? 'increase' as const : 'decrease' as const,
      period: "this month"
    } : undefined,
    icon: <ShoppingCart className="h-5 w-5" />,
    color: 'info' as const
  },
  {
    title: "Pending Orders",
    value: data.pendingOrders || 0,
    icon: <Clock className="h-5 w-5" />,
    color: 'warning' as const
  },
  {
    title: "Completed Orders",
    value: data.completedOrders || 0,
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'success' as const
  },
  {
    title: "Total Revenue",
    value: `${(data.totalRevenue || 0).toLocaleString()} AED`,
    change: data.revenueGrowth ? {
      value: data.revenueGrowth,
      type: data.revenueGrowth > 0 ? 'increase' as const : 'decrease' as const,
      period: "this month"
    } : undefined,
    icon: <DollarSign className="h-5 w-5" />,
    color: 'success' as const
  }
];

export const getGameMetrics = (data: any) => [
  {
    title: "Total Games",
    value: data.totalGames || 0,
    icon: <Package className="h-5 w-5" />,
    color: 'info' as const
  },
  {
    title: "Available Games",
    value: data.availableGames || 0,
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'success' as const
  },
  {
    title: "Most Popular",
    value: data.popularGame?.nameEn || "N/A",
    icon: <Star className="h-5 w-5" />,
    color: 'warning' as const
  },
  {
    title: "Avg. Daily Rate",
    value: `${(data.avgDailyRate || 0).toLocaleString()} AED`,
    icon: <DollarSign className="h-5 w-5" />,
    color: 'success' as const
  }
]; 
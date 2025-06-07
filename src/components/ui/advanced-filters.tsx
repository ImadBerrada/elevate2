"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  X, 
  Search, 
  Calendar,
  DollarSign,
  Tag,
  User,
  Truck,
  Package,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'search' | 'date' | 'range';
  options?: FilterOption[];
  placeholder?: string;
  icon?: React.ReactNode;
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
  className?: string;
  showActiveCount?: boolean;
}

export function AdvancedFilters({
  filters,
  values,
  onChange,
  onClear,
  className,
  showActiveCount = true
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeFiltersCount = Object.values(values).filter(
    value => value && value !== 'all' && value !== ''
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
            {showActiveCount && hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              <Filter className={cn(
                "h-3 w-3 transition-transform",
                isExpanded && "rotate-180"
              )} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filters.map((filter) => (
                  <FilterField
                    key={filter.key}
                    filter={filter}
                    value={values[filter.key] || ''}
                    onChange={(value) => onChange(filter.key, value)}
                  />
                ))}
              </div>
              
              {hasActiveFilters && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">
                      Active Filters
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(values)
                        .filter(([_, value]) => value && value !== 'all' && value !== '')
                        .map(([key, value]) => {
                          const filter = filters.find(f => f.key === key);
                          const option = filter?.options?.find(o => o.value === value);
                          return (
                            <Badge
                              key={key}
                              variant="secondary"
                              className="text-xs flex items-center gap-1"
                            >
                              {filter?.icon && (
                                <span className="h-3 w-3">{filter.icon}</span>
                              )}
                              {filter?.label}: {option?.label || value}
                              <button
                                onClick={() => onChange(key, '')}
                                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </Badge>
                          );
                        })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

interface FilterFieldProps {
  filter: FilterConfig;
  value: string;
  onChange: (value: string) => void;
}

function FilterField({ filter, value, onChange }: FilterFieldProps) {
  switch (filter.type) {
    case 'search':
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            {filter.icon && <span className="h-3 w-3">{filter.icon}</span>}
            {filter.label}
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder={filter.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="pl-7 h-8 text-xs"
            />
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            {filter.icon && <span className="h-3 w-3">{filter.icon}</span>}
            {filter.label}
          </Label>
          <Select value={value || 'all'} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.icon && <span className="h-3 w-3">{option.icon}</span>}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case 'date':
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium flex items-center gap-1">
            {filter.icon && <span className="h-3 w-3">{filter.icon}</span>}
            {filter.label}
          </Label>
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      );

    default:
      return null;
  }
}

// Predefined filter configurations for MARAH pages
export const customerFilters: FilterConfig[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search customers...',
    icon: <Search className="h-3 w-3" />
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    icon: <User className="h-3 w-3" />,
    options: [
      { value: 'ACTIVE', label: 'Active', icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
      { value: 'INACTIVE', label: 'Inactive', icon: <Clock className="h-3 w-3 text-yellow-500" /> },
      { value: 'BLOCKED', label: 'Blocked', icon: <XCircle className="h-3 w-3 text-red-500" /> },
    ]
  },
  {
    key: 'customerType',
    label: 'Type',
    type: 'select',
    icon: <Tag className="h-3 w-3" />,
    options: [
      { value: 'REGULAR', label: 'Regular' },
      { value: 'VIP', label: 'VIP' },
      { value: 'PREMIUM', label: 'Premium' },
    ]
  },
  {
    key: 'balance',
    label: 'Balance',
    type: 'select',
    icon: <DollarSign className="h-3 w-3" />,
    options: [
      { value: 'positive', label: 'Positive Balance' },
      { value: 'negative', label: 'Negative Balance' },
      { value: 'zero', label: 'Zero Balance' },
    ]
  }
];

export const orderFilters: FilterConfig[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search orders...',
    icon: <Search className="h-3 w-3" />
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    icon: <Package className="h-3 w-3" />,
    options: [
      { value: 'PENDING', label: 'Pending', icon: <Clock className="h-3 w-3 text-yellow-500" /> },
      { value: 'CONFIRMED', label: 'Confirmed', icon: <CheckCircle className="h-3 w-3 text-blue-500" /> },
      { value: 'ASSIGNED', label: 'Assigned', icon: <Truck className="h-3 w-3 text-purple-500" /> },
      { value: 'DELIVERED', label: 'Delivered', icon: <CheckCircle className="h-3 w-3 text-green-500" /> },
      { value: 'COMPLETED', label: 'Completed', icon: <CheckCircle className="h-3 w-3 text-green-600" /> },
      { value: 'CANCELLED', label: 'Cancelled', icon: <XCircle className="h-3 w-3 text-red-500" /> },
    ]
  },
  {
    key: 'paymentStatus',
    label: 'Payment',
    type: 'select',
    icon: <CreditCard className="h-3 w-3" />,
    options: [
      { value: 'PENDING', label: 'Pending Payment' },
      { value: 'PARTIAL', label: 'Partial Payment' },
      { value: 'PAID', label: 'Paid' },
      { value: 'REFUNDED', label: 'Refunded' },
    ]
  },
  {
    key: 'eventDate',
    label: 'Event Date',
    type: 'date',
    icon: <Calendar className="h-3 w-3" />
  }
];

export const gameFilters: FilterConfig[] = [
  {
    key: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search games...',
    icon: <Search className="h-3 w-3" />
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    icon: <Tag className="h-3 w-3" />,
    options: [
      { value: 'BOUNCE_HOUSE', label: 'Bounce House' },
      { value: 'SLIDE', label: 'Slide' },
      { value: 'COMBO', label: 'Combo' },
      { value: 'OBSTACLE', label: 'Obstacle Course' },
      { value: 'INTERACTIVE', label: 'Interactive' },
    ]
  },
  {
    key: 'status',
    label: 'Availability',
    type: 'select',
    icon: <CheckCircle className="h-3 w-3" />,
    options: [
      { value: 'available', label: 'Available' },
      { value: 'unavailable', label: 'Unavailable' },
      { value: 'discountable', label: 'Discountable' },
    ]
  },
  {
    key: 'priceRange',
    label: 'Price Range',
    type: 'select',
    icon: <DollarSign className="h-3 w-3" />,
    options: [
      { value: 'low', label: 'Under 100 AED' },
      { value: 'medium', label: '100-300 AED' },
      { value: 'high', label: '300-500 AED' },
      { value: 'premium', label: 'Over 500 AED' },
    ]
  }
]; 
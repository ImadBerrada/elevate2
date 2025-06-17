"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Calendar,
  Bell,
  Search,
  Settings,
  Plus,
  ArrowUpRight,
  Sparkles,
  Zap,
  PieChart,
  Activity,
  Target,
  Globe,
  Briefcase,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { cn } from "@/lib/utils";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

// Chart data
const revenueData = [
  { month: 'Jan', revenue: 3200000, profit: 1100000, expenses: 2100000 },
  { month: 'Feb', revenue: 3800000, profit: 1500000, expenses: 2300000 },
  { month: 'Mar', revenue: 4100000, profit: 1600000, expenses: 2500000 },
  { month: 'Apr', revenue: 3900000, profit: 1500000, expenses: 2400000 },
  { month: 'May', revenue: 4300000, profit: 1700000, expenses: 2600000 },
  { month: 'Jun', revenue: 4600000, profit: 1800000, expenses: 2800000 },
  { month: 'Jul', revenue: 4800000, profit: 1950000, expenses: 2850000 },
  { month: 'Aug', revenue: 5100000, profit: 2100000, expenses: 3000000 },
  { month: 'Sep', revenue: 5300000, profit: 2200000, expenses: 3100000 },
  { month: 'Oct', revenue: 5600000, profit: 2400000, expenses: 3200000 },
  { month: 'Nov', revenue: 5800000, profit: 2500000, expenses: 3300000 },
  { month: 'Dec', revenue: 6200000, profit: 2700000, expenses: 3500000 }
];

const portfolioData = [
  { name: 'Technology', value: 35, amount: 4340000, color: '#3B82F6' },
  { name: 'Real Estate', value: 25, amount: 3100000, color: '#10B981' },
  { name: 'Healthcare', value: 20, amount: 2480000, color: '#8B5CF6' },
  { name: 'Energy', value: 12, amount: 1490000, color: '#F59E0B' },
  { name: 'Emerging Markets', value: 8, amount: 990000, color: '#EF4444' }
];

const performanceData = [
  { name: 'ELEVATE', performance: 94, target: 90, color: '#3B82F6' },
  { name: 'Real Estate', performance: 87, target: 85, color: '#10B981' },
  { name: 'MARAH', performance: 92, target: 88, color: '#8B5CF6' },
  { name: 'ALBARQ', performance: 78, target: 75, color: '#F59E0B' }
];

const globalMetrics = [
  { region: 'North America', revenue: 45, growth: 15.2 },
  { region: 'Europe', revenue: 30, growth: 12.8 },
  { region: 'Asia Pacific', revenue: 20, growth: 22.5 },
  { region: 'Middle East', revenue: 5, growth: 18.7 }
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (!token) {
        // No token, redirect to login
        router.replace('/login');
      } else {
        // Has token, check user role and redirect accordingly
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.role === 'MANAGER') {
              router.replace('/manager-dashboard');
            } else {
              router.replace('/dashboard');
            }
          } catch (error) {
            // If user data is invalid, redirect to dashboard
            router.replace('/dashboard');
          }
        } else {
          // No user data, redirect to dashboard
          router.replace('/dashboard');
        }
      }
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center space-x-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="text-lg font-medium">Loading...</span>
      </div>
    </div>
  );
}
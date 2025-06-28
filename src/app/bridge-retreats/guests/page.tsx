'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  Star,
  Eye,
  Edit,
  MessageSquare,
  Download,
  MoreHorizontal,
  UserCheck,
  Award,
  Heart,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { fetchGuests, Guest, GuestListResponse } from '@/lib/api/guests';

const GuestsPage = () => {
  const router = useRouter();
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestsWithBookings, setGuestsWithBookings] = useState<Guest[]>([]);
  const [guestsWithoutBookings, setGuestsWithoutBookings] = useState<Guest[]>([]);
  const [bookingOnlyGuests, setBookingOnlyGuests] = useState<Guest[]>([]);
  const [comparisonStats, setComparisonStats] = useState<any>(null);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [guestsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  // Enhanced filtering states
  const [countryFilter, setCountryFilter] = useState('all');
  const [vipFilter, setVipFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [staysFilter, setStaysFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [stats, setStats] = useState({
    totalGuests: 0,
    activeGuests: 0,
    vipGuests: 0,
    newThisMonth: 0,
    averageStays: 0,
    totalLoyaltyPoints: 0,
    guestsWithBookings: 0,
    guestsWithoutBookings: 0,
    bookingOnlyGuests: 0,
    guestsWithSpending: 0,
  });

  useEffect(() => {
    loadGuests();
  }, []);

  useEffect(() => {
    filterAndSortGuests();
    // Reset to first page when tab changes
    setCurrentPage(1);
  }, [guests, activeTab, searchTerm, countryFilter, vipFilter, genderFilter, bookingStatusFilter, staysFilter, sortBy]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const loadGuests = async () => {
    try {
      setLoading(true);
      // Remove all filters - fetch all guests
      const response = await fetch(`/api/bridge-retreats/guests`);
      const data = await response.json();
      
      console.log('API Response Status:', response.status);
      console.log('API Response Data:', {
        source: data.source,
        total: data.total,
        lastSync: data.lastSync,
        hasError: !!data.error,
        guestCount: data.guests?.length || 0
      });
      
      if (data.error) {
        console.error('API Error:', data.error, data.details);
      }
      
      // Debug: Check if we're getting guest data
      if (data.guests && data.guests.length > 0) {
        console.log('First guest sample:', {
          id: data.guests[0]?.id || data.guests[0]?.GuestID,
          email: data.guests[0]?.email || data.guests[0]?.Email,
          guestName: data.guests[0]?.guestName || data.guests[0]?.GuestName,
          firstName: data.guests[0]?.firstName || data.guests[0]?.FirstName,
          totalBookings: data.guests[0]?.totalBookings || data.guests[0]?.TotalBookings
        });
      } else {
        console.log('No guests returned from API');
      }
      
      if (data.guests) {
        // Set comparison data
        setComparisonStats(data.comparisonStats);
        
        // Format all guest categories
        const formatGuest = (guest: any) => ({
          id: guest.id || guest.guestId || guest.GuestID,
          firstName: guest.firstName || guest.FirstName || guest.guestName?.split(' ')[0] || '',
          lastName: guest.lastName || guest.LastName || guest.guestName?.split(' ').slice(1).join(' ') || '',
          email: guest.email || guest.Email,
          phone: guest.phone || guest.Phone,
          mobile: guest.mobile || guest.Mobile,
          country: guest.country || guest.Country,
          nationality: guest.nationality || guest.Nationality || guest.country || guest.Country,
          // Map VIP status to frontend status
          status: (guest.vipStatus === 'VIP' || guest.vipStatus === 'VVIP') ? 'VIP' : 
                  guest.vipStatus === 'Corporate' ? 'ACTIVE' : 'ACTIVE',
          loyaltyTier: guest.vipStatus || 'Regular',
          loyaltyPoints: Math.floor((guest.totalSpent || guest.TotalSpent || 0) / 10), // Convert spending to points
          dateOfBirth: guest.dateOfBirth || guest.DateOfBirth,
          memberSince: guest.createdDate || guest.CreatedDate || guest.memberSince,
          totalStays: guest.TotalStays || guest.totalStays || guest.totalBookings || guest.TotalBookings || 0,
          totalSpent: guest.totalSpent || guest.TotalSpent || 0,
          averageRating: guest.averageRating || guest.AverageRating || null, // Only use real rating data
          lastStay: (guest.lastBookingDate || guest.LastBookingDate) ? {
            startDate: guest.lastBookingDate || guest.LastBookingDate,
            title: 'Bridge Retreat'
          } : null,
          lastBookingDate: guest.lastBookingDate || guest.LastBookingDate,
          // Add booking history if available
          bookingHistory: guest.BookingHistory || [],
          profileImage: guest.profileImage,
          // Additional eZee PMS fields
          city: guest.city || guest.City,
          state: guest.state || guest.State,
          address: guest.address || guest.Address,
          postalCode: guest.postalCode || guest.PostalCode,
          gender: guest.gender || guest.Gender,
          notes: guest.notes || guest.Notes,
          preferences: guest.preferences || guest.Preferences || [],
          addressCountry: guest.country || guest.Country,
        });

        const formattedGuests = data.guests.map(formatGuest);
        const formattedGuestsWithBookings = (data.guestsWithBookings || []).map(formatGuest);
        const formattedGuestsWithoutBookings = (data.guestsWithoutBookings || []).map(formatGuest);
        const formattedBookingOnlyGuests = (data.bookingOnlyGuests || []).map(formatGuest);
        
        setGuests(formattedGuests);
        setGuestsWithBookings(formattedGuestsWithBookings);
        setGuestsWithoutBookings(formattedGuestsWithoutBookings);
        setBookingOnlyGuests(formattedBookingOnlyGuests);
        
        // Debug: Check formatted email data and data source
        if (formattedGuests.length > 0) {
          console.log('Guest data analysis:', {
            totalGuests: formattedGuests.length,
            source: data.source,
            firstGuest: {
              email: formattedGuests[0]?.email,
              name: formattedGuests[0]?.firstName + ' ' + formattedGuests[0]?.lastName,
              totalStays: formattedGuests[0]?.totalStays,
              totalSpent: formattedGuests[0]?.totalSpent,
              bookingHistory: formattedGuests[0]?.bookingHistory?.length || 0
            },
            emailsPresent: formattedGuests.filter((g: any) => g.email && g.email !== 'No email provided').length,
            guestsWithBookings: formattedGuests.filter((g: any) => (g.totalStays || 0) > 0).length,
            guestsWithSpending: formattedGuests.filter((g: any) => (g.totalSpent || 0) > 0).length
          });
        }
        
        // Calculate stats from the actual data
        const totalGuests = formattedGuests.length;
        const activeGuests = formattedGuests.filter((g: any) => g.status === 'ACTIVE').length;
        const vipGuests = formattedGuests.filter((g: any) => g.status === 'VIP' || g.loyaltyTier === 'VIP' || g.loyaltyTier === 'VVIP').length;
        const totalLoyaltyPoints = formattedGuests.reduce((sum: number, g: any) => sum + (g.loyaltyPoints || 0), 0);
        
        // Calculate guests with and without bookings
        const guestsWithBookings = formattedGuests.filter((g: any) => (g.totalStays || 0) > 0).length;
        const guestsWithoutBookings = formattedGuests.filter((g: any) => (g.totalStays || 0) === 0).length;
        
        // Calculate new guests this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newThisMonth = formattedGuests.filter((g: any) => {
          if (!g.memberSince) return false;
          const memberDate = new Date(g.memberSince);
          return memberDate.getMonth() === currentMonth && memberDate.getFullYear() === currentYear;
        }).length;
        
        // Calculate average stays
        const totalStays = formattedGuests.reduce((sum: number, g: any) => sum + (g.totalStays || 0), 0);
        const averageStays = totalGuests > 0 ? Math.round((totalStays / totalGuests) * 10) / 10 : 0;
        
        setStats({
          totalGuests,
          activeGuests,
          vipGuests,
          newThisMonth,
          averageStays,
          totalLoyaltyPoints,
          guestsWithBookings: formattedGuestsWithBookings.length + formattedBookingOnlyGuests.length,
          guestsWithoutBookings: formattedGuestsWithoutBookings.length,
          bookingOnlyGuests: formattedBookingOnlyGuests.length,
          guestsWithSpending: formattedGuests.filter((g: any) => (g.totalSpent || 0) > 0).length,
        });
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      setGuests([]);
      setStats({
        totalGuests: 0,
        activeGuests: 0,
        vipGuests: 0,
        newThisMonth: 0,
        averageStays: 0,
        totalLoyaltyPoints: 0,
        guestsWithBookings: 0,
        guestsWithoutBookings: 0,
        bookingOnlyGuests: 0,
        guestsWithSpending: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGuests = () => {
    let filtered = [...guests];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(guest => 
        `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchLower) ||
        guest.email.toLowerCase().includes(searchLower) ||
        guest.phone?.includes(searchTerm) ||
        guest.addressCountry?.toLowerCase().includes(searchLower) ||
        guest.nationality?.toLowerCase().includes(searchLower)
      );
    }

    // Apply tab filter - use specific datasets for comparison
    if (activeTab !== 'all') {
      switch (activeTab) {
        case 'with-bookings':
          // Combine guests with bookings and booking-only guests (all guests who have booking history)
          const allGuestsWithBookings = [...guestsWithBookings, ...bookingOnlyGuests];
          filtered = allGuestsWithBookings;
          break;
        case 'without-bookings':
          // Start with guests without bookings dataset
          filtered = [...guestsWithoutBookings];
          break;
        case 'vip':
          filtered = filtered.filter(guest => guest.status === 'VIP' || guest.loyaltyTier === 'GOLD' || guest.loyaltyTier === 'PLATINUM');
          break;
      }
      
      // Apply search filter to the selected dataset
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(guest => 
          `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchLower) ||
          guest.email?.toLowerCase().includes(searchLower) ||
          guest.phone?.includes(searchTerm) ||
          guest.addressCountry?.toLowerCase().includes(searchLower) ||
          guest.nationality?.toLowerCase().includes(searchLower)
        );
      }
    }

    // Apply advanced filters
    if (countryFilter !== 'all') {
      filtered = filtered.filter(guest => guest.addressCountry === countryFilter);
    }

    if (vipFilter !== 'all') {
      filtered = filtered.filter(guest => guest.loyaltyTier === vipFilter);
    }

    if (genderFilter !== 'all') {
      filtered = filtered.filter(guest => guest.gender === genderFilter);
    }

    if (bookingStatusFilter !== 'all') {
      if (bookingStatusFilter === 'with-bookings') {
        filtered = filtered.filter(guest => (guest.totalStays || 0) > 0);
      } else if (bookingStatusFilter === 'without-bookings') {
        filtered = filtered.filter(guest => (guest.totalStays || 0) === 0);
      }
    }

    if (staysFilter !== 'all') {
      switch (staysFilter) {
        case 'no-stays':
          filtered = filtered.filter(guest => (guest.totalStays || 0) === 0);
          break;
        case '1-2-stays':
          filtered = filtered.filter(guest => (guest.totalStays || 0) >= 1 && (guest.totalStays || 0) <= 2);
          break;
        case '3-5-stays':
          filtered = filtered.filter(guest => (guest.totalStays || 0) >= 3 && (guest.totalStays || 0) <= 5);
          break;
        case '6-plus-stays':
          filtered = filtered.filter(guest => (guest.totalStays || 0) >= 6);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'totalStays':
          return (b.totalStays || 0) - (a.totalStays || 0);
        case 'totalSpent':
          return (b.totalSpent || 0) - (a.totalSpent || 0);
        case 'country':
          return (a.addressCountry || '').localeCompare(b.addressCountry || '');
        case 'memberSince':
          return new Date(b.memberSince || '').getTime() - new Date(a.memberSince || '').getTime();
        default: // createdAt
          return new Date(b.memberSince || '').getTime() - new Date(a.memberSince || '').getTime();
      }
    });

    setFilteredGuests(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'INACTIVE':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'VIP':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'BLACKLISTED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'VIP':
        return 'bg-yellow-100 text-yellow-800';
      case 'BLACKLISTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getCurrentPageGuests = () => {
    const startIndex = (currentPage - 1) * guestsPerPage;
    const endIndex = startIndex + guestsPerPage;
    return filteredGuests.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <div className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          "min-w-0"
        )}>
          <Header />
          
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        "min-w-0"
      )}>
        <Header />

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Guest Management</h1>
                <p className="text-gray-600 mt-1">Manage guest profiles, preferences, and communication history</p>
                {/* Data Source Indicator */}
                <div className="mt-2 flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stats.guestsWithSpending > 0 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {stats.guestsWithSpending > 0 ? 'Real eZee PMS Data' : 'Limited Data Available'}
                  </div>
                  <span className="text-xs text-gray-500">
                    Last sync: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                <Button
                  onClick={() => router.push('/bridge-retreats/guests/create')}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Guest</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Guests</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalGuests.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">With Bookings</p>
                      <p className="text-2xl font-bold text-green-600">{stats.guestsWithBookings.toLocaleString()}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Without Bookings</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.guestsWithoutBookings.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">VIP Guests</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.vipGuests.toLocaleString()}</p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Guests</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.activeGuests.toLocaleString()}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.newThisMonth.toLocaleString()}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Stays</p>
                      <p className="text-2xl font-bold text-indigo-600">{stats.averageStays.toFixed(1)}</p>
                    </div>
                    <Award className="h-8 w-8 text-indigo-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Points</p>
                      <p className="text-2xl font-bold text-pink-600">{stats.totalLoyaltyPoints.toLocaleString()}</p>
                    </div>
                    <Heart className="h-8 w-8 text-pink-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Guest Booking Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Guest Booking Overview</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">With Bookings</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Without Bookings</span>
                    </div>

                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900">{stats.totalGuests}</p>
                    <p className="text-sm text-gray-600">Total Guests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.guestsWithBookings}</p>
                    <p className="text-sm text-gray-600">Guests with Bookings</p>
                    <p className="text-xs text-gray-500">
                      {stats.totalGuests > 0 ? Math.round((stats.guestsWithBookings / stats.totalGuests) * 100) : 0}% of total
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Includes all guests with booking history
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">{stats.guestsWithoutBookings}</p>
                    <p className="text-sm text-gray-600">Guests without Bookings</p>
                    <p className="text-xs text-gray-500">
                      {stats.totalGuests > 0 ? Math.round((stats.guestsWithoutBookings / stats.totalGuests) * 100) : 0}% of total
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Prospects and potential guests
                    </p>
                  </div>
                </div>
                
                {/* Detailed Comparison Stats */}
                {comparisonStats && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Data Source Comparison</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="font-medium text-blue-900">Guest Database</p>
                        <p className="text-2xl font-bold text-blue-600">{comparisonStats.guestsInDatabase}</p>
                        <p className="text-blue-700">Guests in master database</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="font-medium text-green-900">Booking Records</p>
                        <p className="text-2xl font-bold text-green-600">{comparisonStats.guestsFromBookings}</p>
                        <p className="text-green-700">Guests from booking data</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="font-medium text-purple-900">Unique Total</p>
                        <p className="text-2xl font-bold text-purple-600">{comparisonStats.totalUniqueGuests}</p>
                        <p className="text-purple-700">After deduplication</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search guests by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Date Added</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="totalStays">Total Stays</SelectItem>
                        <SelectItem value="totalSpent">Total Spent</SelectItem>
                        <SelectItem value="country">Country</SelectItem>
                        <SelectItem value="memberSince">Member Since</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Advanced Filters</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Country</label>
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Countries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        {Array.from(new Set(guests.map(g => g.addressCountry).filter(Boolean))).map(country => (
                          <SelectItem key={country} value={country!}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">VIP Status</label>
                    <Select value={vipFilter} onValueChange={setVipFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All VIP" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All VIP Status</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="VIP">VIP</SelectItem>
                        <SelectItem value="VVIP">VVIP</SelectItem>
                        <SelectItem value="Corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Gender</label>
                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Genders" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Genders</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Booking Status</label>
                    <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Guests" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Guests</SelectItem>
                        <SelectItem value="with-bookings">With Bookings</SelectItem>
                        <SelectItem value="without-bookings">Without Bookings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">Stay Count</label>
                    <Select value={staysFilter} onValueChange={setStaysFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All Stays" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stay Counts</SelectItem>
                        <SelectItem value="no-stays">No Stays (0)</SelectItem>
                        <SelectItem value="1-2-stays">New Guests (1-2)</SelectItem>
                        <SelectItem value="3-5-stays">Regular (3-5)</SelectItem>
                        <SelectItem value="6-plus-stays">Frequent (6+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCountryFilter('all');
                      setVipFilter('all');
                      setGenderFilter('all');
                      setBookingStatusFilter('all');
                      setStaysFilter('all');
                      setSearchTerm('');
                      setActiveTab('all');
                    }}
                  >
                    Clear All Filters
                  </Button>
                  <span className="text-xs text-gray-500">
                    Showing {filteredGuests.length} of {guests.length} guests
                  </span>
                </div>
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Guests</TabsTrigger>
                <TabsTrigger value="with-bookings">With Bookings</TabsTrigger>
                <TabsTrigger value="without-bookings">Without Bookings</TabsTrigger>
                <TabsTrigger value="vip">VIP</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full table-fixed min-w-[1200px]">
                        <thead className="bg-gray-100 border-b-2 border-gray-200">
                          <tr>
                            <th className="w-64 p-4 text-left font-semibold text-gray-800 text-sm">Guest</th>
                            <th className="w-48 p-4 text-left font-semibold text-gray-800 text-sm">Contact</th>
                            <th className="w-32 p-4 text-left font-semibold text-gray-800 text-sm">Status</th>
                            <th className="w-32 p-4 text-left font-semibold text-gray-800 text-sm">Booking Status</th>
                            <th className="w-24 p-4 text-center font-semibold text-gray-800 text-sm">Stays</th>
                            <th className="w-32 p-4 text-center font-semibold text-gray-800 text-sm">Loyalty</th>
                            <th className="w-32 p-4 text-center font-semibold text-gray-800 text-sm">Last Stay</th>
                            <th className="w-20 p-4 text-center font-semibold text-gray-800 text-sm">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {getCurrentPageGuests().map((guest) => (
                            <motion.tr
                              key={guest.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                            >
                              <td className="p-4">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage src={guest.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${guest.firstName} ${guest.lastName}`} />
                                    <AvatarFallback className="text-sm">
                                      {guest.firstName?.[0] || 'N'}{guest.lastName?.[0] || 'A'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1 overflow-hidden">
                                    <p className="font-semibold text-gray-900 text-sm truncate">
                                      {guest.firstName} {guest.lastName}
                                    </p>
                                    <p className="text-xs text-gray-600 truncate">
                                      ID: {guest.id?.toString().slice(-8) || 'N/A'}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center truncate">
                                      <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                      <span className="truncate">{guest.nationality || guest.country || 'N/A'}</span>
                                    </p>
                                    {guest.memberSince && (
                                      <p className="text-xs text-gray-400 truncate">
                                        Member since: {new Date(guest.memberSince).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1 overflow-hidden">
                                  <div className="flex items-center space-x-2">
                                    <Mail className={`h-3 w-3 flex-shrink-0 ${guest.email ? 'text-gray-400' : 'text-red-400'}`} />
                                    <span className={`text-xs truncate ${guest.email ? 'text-gray-900' : 'text-red-600'}`}>
                                      {guest.email || 'No email in system'}
                                    </span>
                                  </div>
                                  {guest.phone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                      <span className="text-xs text-gray-900 truncate">{guest.phone}</span>
                                    </div>
                                  )}
                                  {guest.mobile && guest.mobile !== guest.phone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                      <span className="text-xs text-gray-900 truncate">{guest.mobile}</span>
                                    </div>
                                  )}
                                  {guest.gender && (
                                    <div className="text-xs text-gray-600">
                                      Gender: {guest.gender}
                                    </div>
                                  )}
                                  {(guest.city || guest.state || guest.addressCountry) && (
                                  <div className="flex items-center space-x-2">
                                      <MapPin className="h-3 w-3 flex-shrink-0 text-gray-400" />
                                      <span className="text-xs text-gray-600 truncate">
                                        {[guest.city, guest.state, guest.addressCountry].filter(Boolean).join(', ')}
                                      </span>
                                  </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(guest.status)}
                                  <Badge className={getStatusColor(guest.status)}>
                                    {guest.status}
                                  </Badge>
                                  </div>
                                  {guest.dateOfBirth && (
                                    <div className="text-xs text-gray-600">
                                      DOB: {new Date(guest.dateOfBirth).toLocaleDateString()}
                                    </div>
                                  )}
                                  {guest.notes && (
                                    <div className="text-xs text-gray-600 truncate" title={guest.notes}>
                                      {guest.notes}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  {guest.loyaltyTier && (
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 text-xs">
                                      <Star className="h-3 w-3 mr-1" />
                                      {guest.loyaltyTier}
                                    </Badge>
                                  )}
                                  {(guest.totalStays || 0) > 0 ? (
                                    <div className="flex items-center space-x-1">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      <span className="text-xs text-green-700">ACTIVE</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center space-x-1">
                                      <XCircle className="h-3 w-3 text-orange-500" />
                                      <span className="text-xs text-orange-700">PROSPECT</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="space-y-1">
                                  {(guest.totalStays || 0) > 0 ? (
                                    <>
                                      <div className="flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                        <span className="text-sm font-semibold text-green-700">
                                          {guest.totalStays} Stay{(guest.totalStays || 0) !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                      {guest.averageRating && guest.averageRating > 0 && (
                                  <div className="flex items-center justify-center space-x-1">
                                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                          <span className="text-xs text-gray-600">
                                            {guest.averageRating.toFixed(1)}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="flex items-center justify-center">
                                      <XCircle className="h-4 w-4 text-orange-500 mr-1" />
                                      <span className="text-xs text-orange-700">No Stays</span>
                                  </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="space-y-1">
                                  <div>
                                    <p className="text-lg font-bold text-green-600">
                                      ${(guest.totalSpent || 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">Total Spent</p>
                                  </div>
                                  {(guest.totalStays || 0) > 0 && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">
                                        ${Math.round((guest.totalSpent || 0) / (guest.totalStays || 1)).toLocaleString()}
                                      </p>
                                      <p className="text-xs text-gray-500">Avg per stay</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <div className="space-y-1">
                                  {(guest.lastStay || guest.lastBookingDate) ? (
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {new Date(guest.lastStay?.startDate || guest.lastBookingDate).toLocaleDateString()}
                                      </p>
                                      <p className="text-xs text-gray-500">Last Stay</p>
                                    </div>
                                  ) : (
                                    <div>
                                      <p className="text-sm text-gray-400">-</p>
                                      <p className="text-xs text-gray-500">No stays</p>
                                    </div>
                                  )}
                                  {guest.bookingHistory && guest.bookingHistory.length > 0 && (
                                    <div className="text-xs text-blue-600">
                                      {guest.bookingHistory.length} booking{guest.bookingHistory.length !== 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() => router.push(`/bridge-retreats/guests/${guest.id}`)}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => router.push(`/bridge-retreats/guests/${guest.id}/edit`)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Guest
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Send Message
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {filteredGuests.length > 0 && (
                      <div className="border-t bg-gray-50 px-4 py-3 flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                          <Button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            variant="outline"
                            size="sm"
                          >
                            Previous
                          </Button>
                          <Button
                            onClick={() => setCurrentPage(Math.min(Math.ceil(filteredGuests.length / guestsPerPage), currentPage + 1))}
                            disabled={currentPage === Math.ceil(filteredGuests.length / guestsPerPage)}
                            variant="outline"
                            size="sm"
                          >
                            Next
                          </Button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing{' '}
                              <span className="font-medium">
                                {Math.min((currentPage - 1) * guestsPerPage + 1, filteredGuests.length)}
                              </span>{' '}
                              to{' '}
                              <span className="font-medium">
                                {Math.min(currentPage * guestsPerPage, filteredGuests.length)}
                              </span>{' '}
                              of{' '}
                              <span className="font-medium">{filteredGuests.length}</span> guests
                            </p>
                          </div>
                          <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                              <Button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                variant="outline"
                                size="sm"
                                className="rounded-l-md"
                              >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              
                              {/* Page Numbers */}
                              {Array.from({ length: Math.min(5, Math.ceil(filteredGuests.length / guestsPerPage)) }, (_, i) => {
                                const totalPages = Math.ceil(filteredGuests.length / guestsPerPage);
                                let pageNumber;
                                
                                if (totalPages <= 5) {
                                  pageNumber = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNumber = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNumber = totalPages - 4 + i;
                                } else {
                                  pageNumber = currentPage - 2 + i;
                                }
                                
                                return (
                                  <Button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                    size="sm"
                                    className="border-l-0"
                                  >
                                    {pageNumber}
                                  </Button>
                                );
                              })}
                              
                              <Button
                                onClick={() => setCurrentPage(Math.min(Math.ceil(filteredGuests.length / guestsPerPage), currentPage + 1))}
                                disabled={currentPage === Math.ceil(filteredGuests.length / guestsPerPage)}
                                variant="outline"
                                size="sm"
                                className="rounded-r-md border-l-0"
                              >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </nav>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GuestsPage; 
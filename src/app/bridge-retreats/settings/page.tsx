"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Settings,
  Bell,
  Shield,
  Globe,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  Check,
  Save,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemSettings {
  general: {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    businessEmail: string;
    timezone: string;
    currency: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  businessRules: {
    minAdvanceBooking: number;
    maxAdvanceBooking: number;
    cancellationPolicyHours: number;
    checkInTime: string;
    checkOutTime: string;
    maxGuestsPerRetreat: number;
    minStayNights: number;
    maxStayNights: number;
    allowSameDayBooking: boolean;
    requireDeposit: boolean;
    depositPercentage: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    bookingConfirmation: boolean;
    paymentReminder: boolean;
    checkInReminder: boolean;
    feedbackRequest: boolean;
    maintenanceAlerts: boolean;
    lowInventoryAlerts: boolean;
    systemUpdates: boolean;
  };
  integrations: {
    paymentGateway: string;
    emailService: string;
    smsService: string;
    analyticsService: string;
    backupService: string;
    calendarSync: boolean;
    inventorySync: boolean;
    accountingSync: boolean;
  };
}

export default function SystemSettingsPage() {
  const { isOpen } = useSidebar();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Mock data
  useEffect(() => {
    const mockSettings: SystemSettings = {
      general: {
        businessName: "Bridge Retreats Center",
        businessAddress: "123 Serenity Lane, Dubai, UAE",
        businessPhone: "+971-4-123-4567",
        businessEmail: "info@bridgeretreats.com",
        timezone: "Asia/Dubai",
        currency: "AED",
        language: "en",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "24h"
      },
      businessRules: {
        minAdvanceBooking: 24,
        maxAdvanceBooking: 365,
        cancellationPolicyHours: 48,
        checkInTime: "15:00",
        checkOutTime: "11:00",
        maxGuestsPerRetreat: 20,
        minStayNights: 1,
        maxStayNights: 14,
        allowSameDayBooking: false,
        requireDeposit: true,
        depositPercentage: 30
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        bookingConfirmation: true,
        paymentReminder: true,
        checkInReminder: true,
        feedbackRequest: true,
        maintenanceAlerts: true,
        lowInventoryAlerts: true,
        systemUpdates: false
      },
      integrations: {
        paymentGateway: "stripe",
        emailService: "sendgrid",
        smsService: "twilio",
        analyticsService: "google",
        backupService: "aws",
        calendarSync: true,
        inventorySync: false,
        accountingSync: true
      }
    };

    setSettings(mockSettings);
    setLoading(false);
  }, []);

  const handleSave = async (section: keyof SystemSettings) => {
    setSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaving(false);
    
    // Show success message (you might want to use a toast notification)
    console.log(`${section} settings saved successfully`);
  };

  const handleGeneralChange = (field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      general: {
        ...prev!.general,
        [field]: value
      }
    }));
  };

  const handleBusinessRulesChange = (field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      businessRules: {
        ...prev!.businessRules,
        [field]: value
      }
    }));
  };

  const handleNotificationsChange = (field: string, value: boolean) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      notifications: {
        ...prev!.notifications,
        [field]: value
      }
    }));
  };

  const handleIntegrationsChange = (field: string, value: any) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      integrations: {
        ...prev!.integrations,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className={cn("flex-1 flex flex-col overflow-hidden", isOpen ? "lg:ml-64" : "lg:ml-20")}>
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="text-gray-600">Configure general system settings, business rules, and integrations</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general" className="gap-2">
                  <Settings className="w-4 h-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="business" className="gap-2">
                  <Shield className="w-4 h-4" />
                  Business Rules
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="integrations" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Integrations
                </TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Configuration</CardTitle>
                    <CardDescription>Basic business information and system preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={settings.general.businessName}
                          onChange={(e) => handleGeneralChange('businessName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessEmail">Business Email</Label>
                        <Input
                          id="businessEmail"
                          type="email"
                          value={settings.general.businessEmail}
                          onChange={(e) => handleGeneralChange('businessEmail', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Textarea
                        id="businessAddress"
                        value={settings.general.businessAddress}
                        onChange={(e) => handleGeneralChange('businessAddress', e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="businessPhone">Business Phone</Label>
                        <Input
                          id="businessPhone"
                          value={settings.general.businessPhone}
                          onChange={(e) => handleGeneralChange('businessPhone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select 
                          value={settings.general.timezone} 
                          onValueChange={(value) => handleGeneralChange('timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                            <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select 
                          value={settings.general.currency} 
                          onValueChange={(value) => handleGeneralChange('currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dateFormat">Date Format</Label>
                        <Select 
                          value={settings.general.dateFormat} 
                          onValueChange={(value) => handleGeneralChange('dateFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timeFormat">Time Format</Label>
                        <Select 
                          value={settings.general.timeFormat} 
                          onValueChange={(value) => handleGeneralChange('timeFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12h">12 Hour</SelectItem>
                            <SelectItem value="24h">24 Hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => handleSave('general')}
                        disabled={saving}
                      >
                        {saving ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save General Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Business Rules */}
              <TabsContent value="business">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Rules & Policies</CardTitle>
                    <CardDescription>Configure booking policies, time restrictions, and business rules</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="minAdvanceBooking">Minimum Advance Booking (hours)</Label>
                        <Input
                          id="minAdvanceBooking"
                          type="number"
                          value={settings.businessRules.minAdvanceBooking}
                          onChange={(e) => handleBusinessRulesChange('minAdvanceBooking', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAdvanceBooking">Maximum Advance Booking (days)</Label>
                        <Input
                          id="maxAdvanceBooking"
                          type="number"
                          value={settings.businessRules.maxAdvanceBooking}
                          onChange={(e) => handleBusinessRulesChange('maxAdvanceBooking', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="checkInTime">Check-in Time</Label>
                        <Input
                          id="checkInTime"
                          type="time"
                          value={settings.businessRules.checkInTime}
                          onChange={(e) => handleBusinessRulesChange('checkInTime', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="checkOutTime">Check-out Time</Label>
                        <Input
                          id="checkOutTime"
                          type="time"
                          value={settings.businessRules.checkOutTime}
                          onChange={(e) => handleBusinessRulesChange('checkOutTime', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="maxGuestsPerRetreat">Max Guests per Retreat</Label>
                        <Input
                          id="maxGuestsPerRetreat"
                          type="number"
                          value={settings.businessRules.maxGuestsPerRetreat}
                          onChange={(e) => handleBusinessRulesChange('maxGuestsPerRetreat', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minStayNights">Minimum Stay (nights)</Label>
                        <Input
                          id="minStayNights"
                          type="number"
                          value={settings.businessRules.minStayNights}
                          onChange={(e) => handleBusinessRulesChange('minStayNights', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxStayNights">Maximum Stay (nights)</Label>
                        <Input
                          id="maxStayNights"
                          type="number"
                          value={settings.businessRules.maxStayNights}
                          onChange={(e) => handleBusinessRulesChange('maxStayNights', parseInt(e.target.value))}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Cancellation & Payment Policies</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="cancellationPolicyHours">Cancellation Policy (hours before)</Label>
                          <Input
                            id="cancellationPolicyHours"
                            type="number"
                            value={settings.businessRules.cancellationPolicyHours}
                            onChange={(e) => handleBusinessRulesChange('cancellationPolicyHours', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="depositPercentage">Deposit Percentage (%)</Label>
                          <Input
                            id="depositPercentage"
                            type="number"
                            value={settings.businessRules.depositPercentage}
                            onChange={(e) => handleBusinessRulesChange('depositPercentage', parseInt(e.target.value))}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Allow Same-day Booking</Label>
                            <p className="text-sm text-gray-500">Allow guests to book retreats for the same day</p>
                          </div>
                          <Switch
                            checked={settings.businessRules.allowSameDayBooking}
                            onCheckedChange={(checked) => handleBusinessRulesChange('allowSameDayBooking', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Require Deposit</Label>
                            <p className="text-sm text-gray-500">Require guests to pay a deposit when booking</p>
                          </div>
                          <Switch
                            checked={settings.businessRules.requireDeposit}
                            onCheckedChange={(checked) => handleBusinessRulesChange('requireDeposit', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => handleSave('businessRules')}
                        disabled={saving}
                      >
                        {saving ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Business Rules
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notifications */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Configure how and when notifications are sent</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notification Channels</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-gray-500">Send notifications via email</p>
                          </div>
                          <Switch
                            checked={settings.notifications.emailNotifications}
                            onCheckedChange={(checked) => handleNotificationsChange('emailNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>SMS Notifications</Label>
                            <p className="text-sm text-gray-500">Send notifications via SMS</p>
                          </div>
                          <Switch
                            checked={settings.notifications.smsNotifications}
                            onCheckedChange={(checked) => handleNotificationsChange('smsNotifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Push Notifications</Label>
                            <p className="text-sm text-gray-500">Send push notifications to mobile apps</p>
                          </div>
                          <Switch
                            checked={settings.notifications.pushNotifications}
                            onCheckedChange={(checked) => handleNotificationsChange('pushNotifications', checked)}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Guest Notifications</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Booking Confirmation</Label>
                            <p className="text-sm text-gray-500">Send confirmation when booking is made</p>
                          </div>
                          <Switch
                            checked={settings.notifications.bookingConfirmation}
                            onCheckedChange={(checked) => handleNotificationsChange('bookingConfirmation', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Payment Reminder</Label>
                            <p className="text-sm text-gray-500">Send reminders for pending payments</p>
                          </div>
                          <Switch
                            checked={settings.notifications.paymentReminder}
                            onCheckedChange={(checked) => handleNotificationsChange('paymentReminder', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Check-in Reminder</Label>
                            <p className="text-sm text-gray-500">Send reminder before check-in time</p>
                          </div>
                          <Switch
                            checked={settings.notifications.checkInReminder}
                            onCheckedChange={(checked) => handleNotificationsChange('checkInReminder', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Feedback Request</Label>
                            <p className="text-sm text-gray-500">Request feedback after retreat completion</p>
                          </div>
                          <Switch
                            checked={settings.notifications.feedbackRequest}
                            onCheckedChange={(checked) => handleNotificationsChange('feedbackRequest', checked)}
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">System Notifications</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Maintenance Alerts</Label>
                            <p className="text-sm text-gray-500">Alert when maintenance is required</p>
                          </div>
                          <Switch
                            checked={settings.notifications.maintenanceAlerts}
                            onCheckedChange={(checked) => handleNotificationsChange('maintenanceAlerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Low Inventory Alerts</Label>
                            <p className="text-sm text-gray-500">Alert when inventory is running low</p>
                          </div>
                          <Switch
                            checked={settings.notifications.lowInventoryAlerts}
                            onCheckedChange={(checked) => handleNotificationsChange('lowInventoryAlerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>System Updates</Label>
                            <p className="text-sm text-gray-500">Notify about system updates and maintenance</p>
                          </div>
                          <Switch
                            checked={settings.notifications.systemUpdates}
                            onCheckedChange={(checked) => handleNotificationsChange('systemUpdates', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => handleSave('notifications')}
                        disabled={saving}
                      >
                        {saving ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Notification Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integrations */}
              <TabsContent value="integrations">
                <Card>
                  <CardHeader>
                    <CardTitle>Integration Settings</CardTitle>
                    <CardDescription>Configure third-party service integrations and API connections</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Service Providers</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="paymentGateway">Payment Gateway</Label>
                            <Select 
                              value={settings.integrations.paymentGateway} 
                              onValueChange={(value) => handleIntegrationsChange('paymentGateway', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="stripe">Stripe</SelectItem>
                                <SelectItem value="paypal">PayPal</SelectItem>
                                <SelectItem value="square">Square</SelectItem>
                                <SelectItem value="adyen">Adyen</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="emailService">Email Service</Label>
                            <Select 
                              value={settings.integrations.emailService} 
                              onValueChange={(value) => handleIntegrationsChange('emailService', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sendgrid">SendGrid</SelectItem>
                                <SelectItem value="mailgun">Mailgun</SelectItem>
                                <SelectItem value="ses">Amazon SES</SelectItem>
                                <SelectItem value="postmark">Postmark</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="smsService">SMS Service</Label>
                            <Select 
                              value={settings.integrations.smsService} 
                              onValueChange={(value) => handleIntegrationsChange('smsService', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="twilio">Twilio</SelectItem>
                                <SelectItem value="vonage">Vonage</SelectItem>
                                <SelectItem value="messagebird">MessageBird</SelectItem>
                                <SelectItem value="clicksend">ClickSend</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="analyticsService">Analytics Service</Label>
                            <Select 
                              value={settings.integrations.analyticsService} 
                              onValueChange={(value) => handleIntegrationsChange('analyticsService', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="google">Google Analytics</SelectItem>
                                <SelectItem value="mixpanel">Mixpanel</SelectItem>
                                <SelectItem value="amplitude">Amplitude</SelectItem>
                                <SelectItem value="hotjar">Hotjar</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="backupService">Backup Service</Label>
                            <Select 
                              value={settings.integrations.backupService} 
                              onValueChange={(value) => handleIntegrationsChange('backupService', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="aws">Amazon S3</SelectItem>
                                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                                <SelectItem value="azure">Azure Blob Storage</SelectItem>
                                <SelectItem value="dropbox">Dropbox</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Sync Settings</h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Calendar Sync</Label>
                            <p className="text-sm text-gray-500">Sync bookings with external calendar systems</p>
                          </div>
                          <Switch
                            checked={settings.integrations.calendarSync}
                            onCheckedChange={(checked) => handleIntegrationsChange('calendarSync', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Inventory Sync</Label>
                            <p className="text-sm text-gray-500">Sync inventory with external systems</p>
                          </div>
                          <Switch
                            checked={settings.integrations.inventorySync}
                            onCheckedChange={(checked) => handleIntegrationsChange('inventorySync', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Accounting Sync</Label>
                            <p className="text-sm text-gray-500">Sync financial data with accounting software</p>
                          </div>
                          <Switch
                            checked={settings.integrations.accountingSync}
                            onCheckedChange={(checked) => handleIntegrationsChange('accountingSync', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button 
                        onClick={() => handleSave('integrations')}
                        disabled={saving}
                      >
                        {saving ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Integration Settings
                      </Button>
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
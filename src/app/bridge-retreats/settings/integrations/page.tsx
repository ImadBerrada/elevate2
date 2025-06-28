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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useSidebar } from "@/contexts/sidebar-context";
import { 
  Settings,
  Globe,
  CreditCard,
  Mail,
  MessageSquare,
  BarChart3,
  Shield,
  Database,
  Cloud,
  Zap,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  TestTube,
  Save,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'PAYMENT' | 'EMAIL' | 'SMS' | 'ANALYTICS' | 'SECURITY' | 'STORAGE' | 'CALENDAR' | 'ACCOUNTING';
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'TESTING';
  provider: string;
  apiKey?: string;
  webhookUrl?: string;
  settings: Record<string, any>;
  lastSync?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'FAILED';
  lastTriggered?: string;
  successCount: number;
  failureCount: number;
}

export default function IntegrationSettingsPage() {
  const { isOpen } = useSidebar();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payment");
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // Mock data
  useEffect(() => {
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'Stripe Payment Gateway',
        description: 'Process credit card payments and handle subscriptions',
        category: 'PAYMENT',
        status: 'CONNECTED',
        provider: 'Stripe',
        apiKey: 'pk_live_51H***************************',
        webhookUrl: 'https://api.bridgeretreats.com/webhooks/stripe',
        settings: {
          currency: 'AED',
          captureMethod: 'automatic',
          statementDescriptor: 'Bridge Retreats',
          webhookSecret: 'whsec_***************************'
        },
        lastSync: '2024-01-16T10:30:00Z',
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-16T10:30:00Z'
      },
      {
        id: '2',
        name: 'SendGrid Email Service',
        description: 'Send transactional and marketing emails',
        category: 'EMAIL',
        status: 'CONNECTED',
        provider: 'SendGrid',
        apiKey: 'SG.***************************',
        settings: {
          fromEmail: 'no-reply@bridgeretreats.com',
          fromName: 'Bridge Retreats',
          replyTo: 'support@bridgeretreats.com',
          trackOpens: true,
          trackClicks: true
        },
        lastSync: '2024-01-16T09:15:00Z',
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-16T09:15:00Z'
      },
      {
        id: '3',
        name: 'Twilio SMS Service',
        description: 'Send SMS notifications and alerts',
        category: 'SMS',
        status: 'CONNECTED',
        provider: 'Twilio',
        apiKey: 'AC***************************',
        settings: {
          fromNumber: '+971501234567',
          accountSid: 'AC***************************',
          authToken: '***************************'
        },
        lastSync: '2024-01-16T08:45:00Z',
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-16T08:45:00Z'
      },
      {
        id: '4',
        name: 'Google Analytics',
        description: 'Track website traffic and user behavior',
        category: 'ANALYTICS',
        status: 'CONNECTED',
        provider: 'Google',
        settings: {
          trackingId: 'GA-123456789-1',
          propertyId: '123456789',
          enableEcommerce: true,
          enableReports: true
        },
        lastSync: '2024-01-16T07:30:00Z',
        isActive: true,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-16T07:30:00Z'
      },
      {
        id: '5',
        name: 'QuickBooks Accounting',
        description: 'Sync financial data with accounting system',
        category: 'ACCOUNTING',
        status: 'ERROR',
        provider: 'QuickBooks',
        settings: {
          companyId: '123456789',
          sandbox: false,
          syncFrequency: 'daily'
        },
        lastSync: '2024-01-15T18:20:00Z',
        isActive: false,
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-01-15T18:20:00Z'
      }
    ];

    const mockWebhooks: WebhookEndpoint[] = [
      {
        id: '1',
        name: 'Booking Notifications',
        url: 'https://api.bridgeretreats.com/webhooks/bookings',
        events: ['booking.created', 'booking.updated', 'booking.cancelled'],
        status: 'ACTIVE',
        lastTriggered: '2024-01-16T10:15:00Z',
        successCount: 245,
        failureCount: 3
      },
      {
        id: '2',
        name: 'Payment Processing',
        url: 'https://api.bridgeretreats.com/webhooks/payments',
        events: ['payment.succeeded', 'payment.failed', 'payment.refunded'],
        status: 'ACTIVE',
        lastTriggered: '2024-01-16T09:30:00Z',
        successCount: 156,
        failureCount: 1
      },
      {
        id: '3',
        name: 'Guest Management',
        url: 'https://api.bridgeretreats.com/webhooks/guests',
        events: ['guest.created', 'guest.updated', 'guest.checked_in', 'guest.checked_out'],
        status: 'FAILED',
        lastTriggered: '2024-01-15T14:20:00Z',
        successCount: 89,
        failureCount: 12
      }
    ];

    setIntegrations(mockIntegrations);
    setWebhooks(mockWebhooks);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'bg-green-100 text-green-800';
      case 'DISCONNECTED':
        return 'bg-gray-100 text-gray-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'TESTING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'ACTIVE':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'DISCONNECTED':
      case 'INACTIVE':
        return <X className="w-4 h-4 text-gray-600" />;
      case 'ERROR':
      case 'FAILED':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'TESTING':
        return <TestTube className="w-4 h-4 text-yellow-600" />;
      default:
        return <X className="w-4 h-4 text-gray-600" />;
    }
  };

  const toggleApiKeyVisibility = (integrationId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [integrationId]: !prev[integrationId]
    }));
  };

  const maskApiKey = (apiKey: string) => {
    if (apiKey.length <= 8) return apiKey;
    return apiKey.substring(0, 8) + '*'.repeat(apiKey.length - 8);
  };

  const handleTestConnection = async (integrationId: string) => {
    // Update status to testing
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'TESTING' }
        : integration
    ));

    // Simulate API test
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'CONNECTED', lastSync: new Date().toISOString() }
          : integration
      ));
    }, 2000);
  };

  const handleToggleIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, isActive: !integration.isActive, updatedAt: new Date().toISOString() }
        : integration
    ));
  };

  const filterIntegrationsByCategory = (category: string) => {
    return integrations.filter(integration => integration.category === category);
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Integration Settings</h1>
                <p className="text-gray-600">Configure third-party services and API connections</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Integration
                </Button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{integrations.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Configured services
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
                  <Check className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{integrations.filter(i => i.status === 'CONNECTED').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully connected
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed Connections</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{integrations.filter(i => i.status === 'ERROR').length}</div>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Webhook Events</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{webhooks.reduce((sum, w) => sum + w.successCount, 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total processed
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="payment" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payments
                </TabsTrigger>
                <TabsTrigger value="communication" className="gap-2">
                  <Mail className="w-4 h-4" />
                  Communication
                </TabsTrigger>
                <TabsTrigger value="analytics" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="business" className="gap-2">
                  <Database className="w-4 h-4" />
                  Business
                </TabsTrigger>
                <TabsTrigger value="webhooks" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Webhooks
                </TabsTrigger>
              </TabsList>

              {/* Payment Integrations */}
              <TabsContent value="payment">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Payment Gateway Integration</h2>
                    <p className="text-gray-600">Configure payment processing and transaction handling</p>
                  </div>
                  
                  <div className="grid gap-6">
                    {filterIntegrationsByCategory('PAYMENT').map((integration) => (
                      <Card key={integration.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <CardDescription>{integration.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(integration.status)}
                              <Badge className={getStatusColor(integration.status)}>
                                {integration.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>API Key</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type={showApiKeys[integration.id] ? "text" : "password"}
                                  value={integration.apiKey || ""}
                                  readOnly
                                  className="font-mono text-sm"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleApiKeyVisibility(integration.id)}
                                >
                                  {showApiKeys[integration.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Currency</Label>
                              <Select value={integration.settings.currency} disabled>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AED">AED</SelectItem>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EUR">EUR</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Webhook URL</Label>
                              <Input
                                value={integration.webhookUrl || ""}
                                readOnly
                                className="font-mono text-sm"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Statement Descriptor</Label>
                              <Input
                                value={integration.settings.statementDescriptor || ""}
                                readOnly
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={integration.isActive}
                                  onCheckedChange={() => handleToggleIntegration(integration.id)}
                                />
                                <Label>Active</Label>
                              </div>
                              <div className="text-sm text-gray-500">
                                Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestConnection(integration.id)}
                                disabled={integration.status === 'TESTING'}
                              >
                                {integration.status === 'TESTING' ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <TestTube className="w-4 h-4 mr-2" />
                                )}
                                Test Connection
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Configure
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Communication Integrations */}
              <TabsContent value="communication">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Communication Services</h2>
                    <p className="text-gray-600">Email and SMS service integrations</p>
                  </div>
                  
                  <div className="grid gap-6">
                    {[...filterIntegrationsByCategory('EMAIL'), ...filterIntegrationsByCategory('SMS')].map((integration) => (
                      <Card key={integration.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                {integration.category === 'EMAIL' ? (
                                  <Mail className="w-5 h-5 text-green-600" />
                                ) : (
                                  <MessageSquare className="w-5 h-5 text-green-600" />
                                )}
                              </div>
                              <div>
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <CardDescription>{integration.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(integration.status)}
                              <Badge className={getStatusColor(integration.status)}>
                                {integration.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {integration.category === 'EMAIL' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>From Email</Label>
                                <Input
                                  value={integration.settings.fromEmail || ""}
                                  readOnly
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>From Name</Label>
                                <Input
                                  value={integration.settings.fromName || ""}
                                  readOnly
                                />
                              </div>
                            </div>
                          )}
                          
                          {integration.category === 'SMS' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>From Number</Label>
                                <Input
                                  value={integration.settings.fromNumber || ""}
                                  readOnly
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Account SID</Label>
                                <Input
                                  value={maskApiKey(integration.settings.accountSid || "")}
                                  readOnly
                                  className="font-mono"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={integration.isActive}
                                  onCheckedChange={() => handleToggleIntegration(integration.id)}
                                />
                                <Label>Active</Label>
                              </div>
                              <div className="text-sm text-gray-500">
                                Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestConnection(integration.id)}
                                disabled={integration.status === 'TESTING'}
                              >
                                {integration.status === 'TESTING' ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <TestTube className="w-4 h-4 mr-2" />
                                )}
                                Test Connection
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Configure
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Analytics Integrations */}
              <TabsContent value="analytics">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Analytics & Tracking</h2>
                    <p className="text-gray-600">Website analytics and performance tracking</p>
                  </div>
                  
                  <div className="grid gap-6">
                    {filterIntegrationsByCategory('ANALYTICS').map((integration) => (
                      <Card key={integration.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <CardDescription>{integration.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(integration.status)}
                              <Badge className={getStatusColor(integration.status)}>
                                {integration.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Tracking ID</Label>
                              <Input
                                value={integration.settings.trackingId || ""}
                                readOnly
                                className="font-mono"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Property ID</Label>
                              <Input
                                value={integration.settings.propertyId || ""}
                                readOnly
                                className="font-mono"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={integration.settings.enableEcommerce}
                                disabled
                              />
                              <Label>E-commerce Tracking</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={integration.settings.enableReports}
                                disabled
                              />
                              <Label>Custom Reports</Label>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={integration.isActive}
                                  onCheckedChange={() => handleToggleIntegration(integration.id)}
                                />
                                <Label>Active</Label>
                              </div>
                              <div className="text-sm text-gray-500">
                                Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Configure
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Business Integrations */}
              <TabsContent value="business">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Business Applications</h2>
                    <p className="text-gray-600">Accounting, CRM, and other business tools</p>
                  </div>
                  
                  <div className="grid gap-6">
                    {filterIntegrationsByCategory('ACCOUNTING').map((integration) => (
                      <Card key={integration.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Database className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{integration.name}</CardTitle>
                                <CardDescription>{integration.description}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(integration.status)}
                              <Badge className={getStatusColor(integration.status)}>
                                {integration.status}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Company ID</Label>
                              <Input
                                value={integration.settings.companyId || ""}
                                readOnly
                                className="font-mono"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Sync Frequency</Label>
                              <Select value={integration.settings.syncFrequency} disabled>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="realtime">Real-time</SelectItem>
                                  <SelectItem value="hourly">Hourly</SelectItem>
                                  <SelectItem value="daily">Daily</SelectItem>
                                  <SelectItem value="weekly">Weekly</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {integration.status === 'ERROR' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-800 font-medium">Connection Error</span>
                              </div>
                              <p className="text-sm text-red-700 mt-1">
                                Authentication failed. Please check your credentials and try again.
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={integration.isActive}
                                  onCheckedChange={() => handleToggleIntegration(integration.id)}
                                />
                                <Label>Active</Label>
                              </div>
                              <div className="text-sm text-gray-500">
                                Last sync: {integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTestConnection(integration.id)}
                                disabled={integration.status === 'TESTING'}
                              >
                                {integration.status === 'TESTING' ? (
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <TestTube className="w-4 h-4 mr-2" />
                                )}
                                Test Connection
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Reconfigure
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Webhooks */}
              <TabsContent value="webhooks">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Webhook Endpoints</h2>
                      <p className="text-gray-600">Configure webhook endpoints for real-time event notifications</p>
                    </div>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Webhook
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {webhooks.map((webhook) => (
                      <Card key={webhook.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{webhook.name}</h3>
                                <p className="text-sm text-gray-500 font-mono">{webhook.url}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {webhook.events.map((event) => (
                                    <Badge key={event} variant="outline" className="text-xs">
                                      {event}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-500">
                                  Success: {webhook.successCount} | Failed: {webhook.failureCount}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Last: {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleString() : 'Never'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(webhook.status)}
                                <Badge className={getStatusColor(webhook.status)}>
                                  {webhook.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
} 
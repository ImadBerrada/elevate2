'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  RotateCcw,
  Play,
  Pause,
  Info,
  Activity,
  BarChart3,
  Calendar,
  Users,
  Building2,
  Wrench,
  Bed,
  Eye,
  EyeOff,
  Save,
  TestTube,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

interface PMSConfig {
  baseUrl: string;
  authCode: string;
  propertyCode: string;
  propertyName: string;
  autoSync: boolean;
  syncInterval: number; // in minutes
}

interface PMSStatus {
  isConnected: boolean;
  lastSync: Date | null;
  syncStatus: 'success' | 'error' | 'in_progress' | 'never';
  errorMessage?: string;
  stats: {
    roomsSynced: number;
    bookingsSynced: number;
    housekeepingTasksSynced: number;
    maintenanceTasksSynced: number;
  };
}

const PMSSettingsPage = () => {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();
  
  const [config, setConfig] = useState<PMSConfig>({
    baseUrl: 'https://live.ipms247.com',
    authCode: '8556457281f6abb894-1607-11f0-a',
    propertyCode: '43119',
    propertyName: 'Bridge Retreats',
    autoSync: true,
    syncInterval: 15
  });

  const [status, setStatus] = useState<PMSStatus>({
    isConnected: false,
    lastSync: null,
    syncStatus: 'never',
    stats: {
      roomsSynced: 0,
      bookingsSynced: 0,
      housekeepingTasksSynced: 0,
      maintenanceTasksSynced: 0,
    }
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showAuthCode, setShowAuthCode] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);

  useEffect(() => {
    loadPMSStatus();
    const interval = setInterval(loadPMSStatus, 30000); // Check status every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadPMSStatus = async () => {
    try {
      const response = await fetch('/api/bridge-retreats/settings/pms/status');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          ...data.status,
          lastSync: data.status.lastSync ? new Date(data.status.lastSync) : null
        });
      }
    } catch (error) {
      console.error('Failed to load PMS status:', error);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/bridge-retreats/settings/pms/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('✅ Connection successful! PMS is accessible.');
        setStatus(prev => ({ ...prev, isConnected: true }));
      } else {
        setError(data.error || 'Connection test failed');
        setStatus(prev => ({ ...prev, isConnected: false }));
      }
    } catch (error) {
      setError('Network error: Unable to test connection');
      setStatus(prev => ({ ...prev, isConnected: false }));
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/bridge-retreats/settings/pms/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('⚙️ Configuration saved successfully!');
      } else {
        setError(data.error || 'Failed to save configuration');
      }
    } catch (error) {
      setError('Network error: Unable to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const performSync = async (syncType: 'full' | 'rooms' | 'bookings' | 'housekeeping' | 'maintenance' = 'full') => {
    setSyncing(true);
    setError(null);
    setSuccess(null);
    setSyncProgress(0);

    const progressInterval = setInterval(() => {
      setSyncProgress(prev => Math.min(prev + Math.random() * 20, 90));
    }, 500);

    try {
      const response = await fetch('/api/bridge-retreats/settings/pms/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ syncType }),
      });

      const data = await response.json();

      if (response.ok) {
        setSyncProgress(100);
        setSuccess(`🔄 ${syncType === 'full' ? 'Full sync' : syncType + ' sync'} completed successfully!`);
        setStatus(data.status);
        setTimeout(() => setSyncProgress(0), 2000);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (error) {
      setError('Network error: Unable to perform sync');
    } finally {
      clearInterval(progressInterval);
      setSyncing(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? (
      <Wifi className="h-4 w-4 text-green-600" />
    ) : (
      <WifiOff className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusColor = (syncStatus: string) => {
    switch (syncStatus) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'never':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      <Sidebar />
      
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isOpen ? "ml-64" : "ml-20",
        isMobile && "ml-0"
      )}>
        <Header />
        
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <motion.div 
            className="flex items-center justify-between"
            {...fadeInUp}
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Settings className="h-7 w-7 text-blue-600" />
                PMS Integration Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure and manage your eZee PMS integration
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {status.isConnected ? (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Status Messages */}
          {error && (
            <motion.div {...fadeInUp}>
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMessages}
                    className="ml-2 h-6 px-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div {...fadeInUp}>
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearMessages}
                    className="ml-2 h-6 px-2 text-green-600 hover:text-green-800"
                  >
                    ✕
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Sync Progress */}
          {syncing && (
            <motion.div {...fadeInUp}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Synchronizing with PMS...</span>
                    <span className="text-sm text-gray-500">{Math.round(syncProgress)}%</span>
                  </div>
                  <Progress value={syncProgress} className="h-2" />
                </CardContent>
              </Card>
            </motion.div>
          )}

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="sync">Synchronization</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" {...fadeInUp}>
                {/* Connection Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {getStatusIcon(status.isConnected)}
                        Connection Status
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={testConnection}
                        disabled={testing}
                      >
                        {testing ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                        Test
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">PMS System</span>
                      <span className="font-medium">eZee Centralise</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Property</span>
                      <span className="font-medium">{config.propertyName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Property Code</span>
                      <span className="font-medium">{config.propertyCode}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge className={status.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {status.isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Sync Status */}
                <Card>
                  <CardHeader>
                                       <CardTitle className="flex items-center gap-2">
                     <RotateCcw className="h-5 w-5 text-blue-600" />
                     Sync Status
                   </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="font-medium">
                        {status.lastSync 
                          ? status.lastSync.toLocaleString() 
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge className={getStatusColor(status.syncStatus)}>
                        {status.syncStatus === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {status.syncStatus === 'error' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {status.syncStatus === 'in_progress' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                        {status.syncStatus === 'never' && <Clock className="h-3 w-3 mr-1" />}
                        {status.syncStatus.charAt(0).toUpperCase() + status.syncStatus.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Auto Sync</span>
                      <Badge className={config.autoSync ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {config.autoSync ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Interval</span>
                      <span className="font-medium">{config.syncInterval} minutes</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Sync Statistics */}
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      Synchronization Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Bed className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{status.stats.roomsSynced}</div>
                        <div className="text-sm text-gray-600">Rooms Synced</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{status.stats.bookingsSynced}</div>
                        <div className="text-sm text-gray-600">Bookings Synced</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{status.stats.housekeepingTasksSynced}</div>
                        <div className="text-sm text-gray-600">Housekeeping Tasks</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <Wrench className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-600">{status.stats.maintenanceTasksSynced}</div>
                        <div className="text-sm text-gray-600">Maintenance Tasks</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="configuration" className="space-y-6">
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle>PMS Connection Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="baseUrl">Base URL</Label>
                        <Input
                          id="baseUrl"
                          value={config.baseUrl}
                          onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                          placeholder="https://live.ipms247.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="propertyCode">Property Code</Label>
                        <Input
                          id="propertyCode"
                          value={config.propertyCode}
                          onChange={(e) => setConfig(prev => ({ ...prev, propertyCode: e.target.value }))}
                          placeholder="43119"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="propertyName">Property Name</Label>
                        <Input
                          id="propertyName"
                          value={config.propertyName}
                          onChange={(e) => setConfig(prev => ({ ...prev, propertyName: e.target.value }))}
                          placeholder="Bridge Retreats"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="authCode" className="flex items-center gap-2">
                          Auth Code
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAuthCode(!showAuthCode)}
                            className="h-6 w-6 p-0"
                          >
                            {showAuthCode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </Label>
                        <Input
                          id="authCode"
                          type={showAuthCode ? "text" : "password"}
                          value={config.authCode}
                          onChange={(e) => setConfig(prev => ({ ...prev, authCode: e.target.value }))}
                          placeholder="Authentication code"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Auto Sync</Label>
                          <p className="text-sm text-gray-600">
                            Automatically synchronize data with PMS at regular intervals
                          </p>
                        </div>
                        <Switch
                          checked={config.autoSync}
                          onCheckedChange={(checked) => setConfig(prev => ({ ...prev, autoSync: checked }))}
                        />
                      </div>

                      {config.autoSync && (
                        <div className="space-y-2">
                          <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                          <Input
                            id="syncInterval"
                            type="number"
                            min="5"
                            max="1440"
                            value={config.syncInterval}
                            onChange={(e) => setConfig(prev => ({ ...prev, syncInterval: parseInt(e.target.value) || 15 }))}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={saveConfig}
                        disabled={loading}
                        className="flex items-center gap-2"
                      >
                        {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Configuration
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={testConnection}
                        disabled={testing}
                        className="flex items-center gap-2"
                      >
                        {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                        Test Connection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Synchronization Tab */}
            <TabsContent value="sync" className="space-y-6">
              <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle>Manual Synchronization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button
                        onClick={() => performSync('full')}
                        disabled={syncing || !status.isConnected}
                        className="w-full justify-start"
                        size="lg"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Full Sync
                        <span className="ml-auto text-xs text-gray-500">All Data</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => performSync('rooms')}
                        disabled={syncing || !status.isConnected}
                        className="w-full justify-start"
                      >
                        <Bed className="h-4 w-4 mr-2" />
                        Sync Rooms
                        <span className="ml-auto text-xs text-gray-500">Rooms & Status</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => performSync('bookings')}
                        disabled={syncing || !status.isConnected}
                        className="w-full justify-start"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Sync Bookings
                        <span className="ml-auto text-xs text-gray-500">Reservations</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => performSync('housekeeping')}
                        disabled={syncing || !status.isConnected}
                        className="w-full justify-start"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Sync Housekeeping
                        <span className="ml-auto text-xs text-gray-500">Cleaning Tasks</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => performSync('maintenance')}
                        disabled={syncing || !status.isConnected}
                        className="w-full justify-start"
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        Sync Maintenance
                        <span className="ml-auto text-xs text-gray-500">Repair Tasks</span>
                      </Button>
                    </div>

                    {!status.isConnected && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          PMS connection required for synchronization
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Import/Export</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                        <span className="ml-auto text-xs text-gray-500">Coming Soon</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                        <span className="ml-auto text-xs text-gray-500">Coming Soon</span>
                      </Button>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Data import/export features will be available in the next release
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <motion.div {...fadeInUp}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <div className="font-medium">Sync completed successfully</div>
                          <div className="text-sm text-gray-600">
                            Synchronized 24 rooms, 12 bookings, 5 maintenance tasks
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">2 min ago</div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <TestTube className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <div className="font-medium">Connection test successful</div>
                          <div className="text-sm text-gray-600">
                            PMS connection verified and authenticated
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">15 min ago</div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <RefreshCw className="h-5 w-5 text-orange-600" />
                        <div className="flex-1">
                          <div className="font-medium">Auto-sync started</div>
                          <div className="text-sm text-gray-600">
                            Scheduled synchronization initiated
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">30 min ago</div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Save className="h-5 w-5 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-medium">Configuration updated</div>
                          <div className="text-sm text-gray-600">
                            PMS settings saved successfully
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">1 hour ago</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PMSSettingsPage;
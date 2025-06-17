'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useSidebar } from '@/contexts/sidebar-context';
import { cn } from '@/lib/utils';
import { Building2, Plus, Settings } from 'lucide-react';

export default function CompanyManagementPage() {
  const { isOpen, isMobile, isTablet, isDesktop } = useSidebar();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className={cn(
          "flex-1 overflow-y-auto",
          isMobile ? "p-4" : "p-6"
        )}>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Company Management</h1>
                <p className="text-muted-foreground">
                  Manage your assigned companies and their configurations.
                </p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </div>

            {/* Coming Soon Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Management
                </CardTitle>
                <CardDescription>
                  Comprehensive company management tools
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Company management features are under development.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


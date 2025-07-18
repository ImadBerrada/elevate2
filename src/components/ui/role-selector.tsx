"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Briefcase } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const defaultRoles = [
  { value: "MANAGER", label: "Manager" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "DRIVER", label: "Driver" },
  { value: "SALES_REPRESENTATIVE", label: "Sales Representative" },
  { value: "CUSTOMER_SERVICE", label: "Customer Service" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "HR_SPECIALIST", label: "HR Specialist" },
  { value: "MARKETING_SPECIALIST", label: "Marketing Specialist" },
  { value: "OPERATIONS_COORDINATOR", label: "Operations Coordinator" },
  { value: "WAREHOUSE_STAFF", label: "Warehouse Staff" },
  { value: "MAINTENANCE_TECHNICIAN", label: "Maintenance Technician" },
  { value: "DELIVERY_COORDINATOR", label: "Delivery Coordinator" },
  { value: "GAME_SETUP_SPECIALIST", label: "Game Setup Specialist" },
  { value: "QUALITY_INSPECTOR", label: "Quality Inspector" },
  { value: "ADMIN_ASSISTANT", label: "Administrative Assistant" },
  { value: "IT_SUPPORT", label: "IT Support" },
  { value: "SECURITY_GUARD", label: "Security Guard" },
  { value: "CLEANER", label: "Cleaner" },
  { value: "INTERN", label: "Intern" },
  { value: "CONSULTANT", label: "Consultant" },
  { value: "OTHER", label: "Other" }
];

export function RoleSelector({
  value,
  onChange,
  label = "Role/Function",
  placeholder = "Select employee role...",
  className,
  required = false
}: RoleSelectorProps) {
  const [customRoles, setCustomRoles] = useState<Array<{ value: string; label: string }>>([]);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [allRoles, setAllRoles] = useState(defaultRoles);

  useEffect(() => {
    const savedRoles = localStorage.getItem('customEmployeeRoles');
    if (savedRoles) {
      try {
        const parsed = JSON.parse(savedRoles);
        setCustomRoles(parsed);
        setAllRoles([...defaultRoles, ...parsed]);
      } catch (error) {
        console.error('Error loading custom roles:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (customRoles.length > 0) {
      localStorage.setItem('customEmployeeRoles', JSON.stringify(customRoles));
      setAllRoles([...defaultRoles, ...customRoles]);
    }
  }, [customRoles]);

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const roleValue = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
      const roleLabel = newRoleName.trim();
      
      const exists = allRoles.some(role => 
        role.value === roleValue || role.label.toLowerCase() === roleLabel.toLowerCase()
      );
      
      if (!exists) {
        const newRole = { value: roleValue, label: roleLabel };
        setCustomRoles(prev => [...prev, newRole]);
        onChange(roleValue);
      }
      
      setNewRoleName("");
      setIsAddingRole(false);
    }
  };

  const handleCancelAdd = () => {
    setNewRoleName("");
    setIsAddingRole(false);
  };

  const getRoleLabel = (roleValue: string) => {
    const role = allRoles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const isDriverRole = (roleValue: string) => {
    return roleValue === 'DRIVER' || roleValue.toLowerCase().includes('driver');
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium flex items-center space-x-2">
        <Briefcase className="w-4 h-4" />
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
      </Label>
      
      <div className="space-y-3">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="border-refined">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <div className="px-2 py-1">
              <div className="text-xs font-medium text-muted-foreground mb-1">Standard Roles</div>
              {defaultRoles.map((role) => (
                <SelectItem key={role.value} value={role.value} className="pl-4">
                  <div className="flex items-center space-x-2">
                    <span>{role.label}</span>
                    {isDriverRole(role.value) && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                        Driver
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </div>
            
            {customRoles.length > 0 && (
              <div className="px-2 py-1 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-1">Custom Roles</div>
                {customRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value} className="pl-4">
                    <div className="flex items-center space-x-2">
                      <span>{role.label}</span>
                      <Badge variant="outline" className="text-xs">Custom</Badge>
                      {isDriverRole(role.value) && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                          Driver
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            )}
            
            <div className="px-2 py-1 border-t">
              {!isAddingRole ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => setIsAddingRole(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Role
                </Button>
              ) : (
                <div className="space-y-2 p-2 bg-muted/50 rounded-md">
                  <Input
                    placeholder="Enter role name..."
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRole();
                      } else if (e.key === 'Escape') {
                        handleCancelAdd();
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex space-x-1">
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 px-2"
                      onClick={handleAddRole}
                      disabled={!newRoleName.trim()}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={handleCancelAdd}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SelectContent>
        </Select>
        
        {value && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Selected:</span>
            <Badge variant="outline" className="text-xs">
              {getRoleLabel(value)}
            </Badge>
            {isDriverRole(value) && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                Will be added to MARAH drivers if assigned to MARAH
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

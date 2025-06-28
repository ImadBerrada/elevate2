"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Building, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface DepartmentSelectorProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  multi?: boolean;
  error?: string;
}

const defaultDepartments = [
  { value: "ENGINEERING", label: "Engineering" },
  { value: "PRODUCT", label: "Product" },
  { value: "DESIGN", label: "Design" },
  { value: "MARKETING", label: "Marketing" },
  { value: "SALES", label: "Sales" },
  { value: "HR", label: "Human Resources" },
  { value: "FINANCE", label: "Finance" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "LOGISTICS", label: "Logistics" },
  { value: "CUSTOMER_SERVICE", label: "Customer Service" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "QUALITY_ASSURANCE", label: "Quality Assurance" },
  { value: "LEGAL", label: "Legal" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "IT", label: "Information Technology" },
  { value: "SECURITY", label: "Security" },
  { value: "ADMINISTRATION", label: "Administration" },
  { value: "EXECUTIVE", label: "Executive" }
];

export function DepartmentSelector({
  value,
  onChange,
  label = "Department",
  placeholder = "Select department...",
  className,
  required = false,
  multi = false,
  error
}: DepartmentSelectorProps) {
  const [customDepartments, setCustomDepartments] = useState<Array<{ value: string; label: string }>>([]);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [allDepartments, setAllDepartments] = useState(defaultDepartments);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedDepartments = localStorage.getItem('customEmployeeDepartments');
    if (savedDepartments) {
      try {
        const parsed = JSON.parse(savedDepartments);
        setCustomDepartments(parsed);
        setAllDepartments([...defaultDepartments, ...parsed]);
      } catch (error) {
        console.error('Error loading custom departments:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (customDepartments.length > 0) {
      localStorage.setItem('customEmployeeDepartments', JSON.stringify(customDepartments));
      setAllDepartments([...defaultDepartments, ...customDepartments]);
    }
  }, [customDepartments]);

  const handleAddDepartment = () => {
    if (newDepartmentName.trim()) {
      const deptValue = newDepartmentName.trim().toUpperCase().replace(/\s+/g, '_');
      const deptLabel = newDepartmentName.trim();
      
      const exists = allDepartments.some(dept => 
        dept.value === deptValue || dept.label.toLowerCase() === deptLabel.toLowerCase()
      );
      
      if (!exists) {
        const newDepartment = { value: deptValue, label: deptLabel };
        setCustomDepartments(prev => [...prev, newDepartment]);
        
        if (multi) {
          const currentValues = Array.isArray(value) ? value : [];
          onChange([...currentValues, deptValue]);
        } else {
          onChange(deptValue);
        }
      }
      
      setNewDepartmentName("");
      setIsAddingDepartment(false);
    }
  };

  const handleCancelAdd = () => {
    setNewDepartmentName("");
    setIsAddingDepartment(false);
  };

  const getDepartmentLabel = (deptValue: string) => {
    const dept = allDepartments.find(d => d.value === deptValue);
    return dept ? dept.label : deptValue;
  };

  const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

  const handleDepartmentToggle = (deptValue: string) => {
    if (multi) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(deptValue)) {
        onChange(currentValues.filter(v => v !== deptValue));
      } else {
        onChange([...currentValues, deptValue]);
      }
    } else {
      onChange(deptValue);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium flex items-center space-x-2">
        <Building className="w-4 h-4" />
        <span>{label} {required && <span className="text-red-500">*</span>}</span>
      </Label>
      
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between border-refined min-h-[40px] h-auto",
            error && "border-red-500"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 flex-1 text-left">
            {selectedValues.length > 0 ? (
              selectedValues.map(deptValue => (
                <Badge key={deptValue} variant="secondary" className="text-xs">
                  {getDepartmentLabel(deptValue)}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
        </Button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 space-y-1">
              <div className="text-xs font-medium text-muted-foreground mb-2">Select Departments</div>
              {allDepartments.map((dept) => (
                <div
                  key={dept.value}
                  className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                  onClick={() => handleDepartmentToggle(dept.value)}
                >
                  <div className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                    selectedValues.includes(dept.value) 
                      ? "bg-primary text-primary-foreground" 
                      : "opacity-50"
                  )}>
                    {selectedValues.includes(dept.value) && <Check className="h-3 w-3" />}
                  </div>
                  <span className="text-sm">{dept.label}</span>
                </div>
              ))}
              
              <div className="border-t pt-2 mt-2">
                {!isAddingDepartment ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => setIsAddingDepartment(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Department
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter department name..."
                      value={newDepartmentName}
                      onChange={(e) => setNewDepartmentName(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDepartment();
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
                        onClick={handleAddDepartment}
                        className="h-6 px-2 text-xs"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCancelAdd}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
} 
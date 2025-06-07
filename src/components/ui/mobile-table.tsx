"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Column {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface MobileTableProps {
  columns: Column[];
  data: any[];
  className?: string;
  onRowClick?: (row: any) => void;
  actions?: (row: any) => React.ReactNode;
}

export function MobileTable({ 
  columns, 
  data, 
  className, 
  onRowClick,
  actions 
}: MobileTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const primaryColumn = columns[0];
  const secondaryColumns = columns.slice(1);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "text-left py-3 px-4 text-sm font-semibold text-muted-foreground",
                      column.className
                    )}
                  >
                    {column.label}
                  </th>
                ))}
                {actions && <th className="w-12"></th>}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <motion.tr
                  key={index}
                  className={cn(
                    "border-b border-border/10 hover:bg-muted/50 transition-colors",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                  whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "py-3 px-4 text-sm",
                        column.className
                      )}
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : row[column.key]
                      }
                    </td>
                  ))}
                  {actions && (
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions(row)}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {data.map((row, index) => {
          const isExpanded = expandedRows.has(index);
          
          return (
            <motion.div
              key={index}
              layout
              className="glass-card rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-4">
                  {/* Primary Row */}
                  <div 
                    className={cn(
                      "flex items-center justify-between",
                      (secondaryColumns.length > 0 || onRowClick) && "cursor-pointer"
                    )}
                    onClick={() => {
                      if (secondaryColumns.length > 0) {
                        toggleRow(index);
                      } else if (onRowClick) {
                        onRowClick(row);
                      }
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {primaryColumn.render 
                          ? primaryColumn.render(row[primaryColumn.key], row)
                          : row[primaryColumn.key]
                        }
                      </div>
                      {/* Show first secondary column as subtitle on mobile */}
                      {secondaryColumns.length > 0 && (
                        <div className="text-sm text-muted-foreground mt-1 truncate">
                          {secondaryColumns[0].render 
                            ? secondaryColumns[0].render(row[secondaryColumns[0].key], row)
                            : row[secondaryColumns[0].key]
                          }
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {actions && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions(row)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      
                      {secondaryColumns.length > 0 && (
                        <motion.div
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && secondaryColumns.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border/20 space-y-3">
                          {secondaryColumns.slice(1).map((column) => (
                            <div key={column.key} className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground font-medium">
                                {column.label}
                              </span>
                              <span className="text-sm text-foreground">
                                {column.render 
                                  ? column.render(row[column.key], row)
                                  : row[column.key]
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )}
    </div>
  );
} 
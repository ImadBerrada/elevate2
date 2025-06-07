"use client";

import { useMemo, cloneElement, isValidElement } from "react";
import { ResponsiveContainer } from "recharts";
import { useSidebar } from "@/contexts/sidebar-context";

interface MobileChartProps {
  children: React.ReactElement;
  height?: number;
  mobileHeight?: number;
  className?: string;
}

export function MobileChart({ 
  children, 
  height = 320, 
  mobileHeight = 240,
  className 
}: MobileChartProps) {
  const { isMobile } = useSidebar();
  
  const chartHeight = useMemo(() => {
    return isMobile ? mobileHeight : height;
  }, [isMobile, height, mobileHeight]);

  const chartProps = useMemo(() => {
    if (!isMobile) return {};
    
    // Mobile-specific chart optimizations
    return {
      margin: { top: 5, right: 5, left: 5, bottom: 5 },
      fontSize: 10,
      strokeWidth: 1.5,
    };
  }, [isMobile]);

  // Clone the child element with mobile props if it's a valid React element
  const enhancedChildren = useMemo(() => {
    if (isValidElement(children) && isMobile) {
      return cloneElement(children, {
        ...(children.props as Record<string, any>),
        ...chartProps
      });
    }
    return children;
  }, [children, chartProps, isMobile]);

  return (
    <div className={className} style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        {enhancedChildren}
      </ResponsiveContainer>
    </div>
  );
}

// Hook for mobile chart configurations
export function useMobileChartConfig() {
  const { isMobile } = useSidebar();
  
  return useMemo(() => ({
    fontSize: isMobile ? 10 : 12,
    strokeWidth: isMobile ? 1.5 : 2,
    margin: isMobile 
      ? { top: 5, right: 5, left: 5, bottom: 5 }
      : { top: 20, right: 30, left: 20, bottom: 5 },
    legendHeight: isMobile ? 24 : 36,
    pieInnerRadius: isMobile ? 40 : 60,
    pieOuterRadius: isMobile ? 80 : 120,
    tooltipStyle: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      border: 'none',
      borderRadius: '12px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
      fontSize: isMobile ? '12px' : '14px'
    },
    axisStyle: {
      fontSize: isMobile ? 10 : 12,
      tick: { fontSize: isMobile ? 10 : 12 }
    }
  }), [isMobile]);
} 

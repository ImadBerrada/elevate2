"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar-context";

export function BurgerMenu() {
  const { isOpen, toggle, isMobile, isTablet } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="glass-card border-refined hover-glow relative overflow-hidden group w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 touch-target"
      aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
    >
      <div className="w-4 h-4 sm:w-5 sm:h-5 flex flex-col justify-center items-center space-y-0.5 sm:space-y-1">
        <motion.div
          className="w-4 h-0.5 sm:w-5 sm:h-0.5 bg-current origin-center"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? (isMobile ? 4 : 6) : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.div
          className="w-4 h-0.5 sm:w-5 sm:h-0.5 bg-current"
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -10 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.div
          className="w-4 h-0.5 sm:w-5 sm:h-0.5 bg-current origin-center"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? (isMobile ? -4 : -6) : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
    </Button>
  );
} 
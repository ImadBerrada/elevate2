"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar-context";

export function BurgerMenu() {
  const { isOpen, toggle } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="glass-card border-refined hover-glow relative overflow-hidden group"
    >
      <div className="w-5 h-5 flex flex-col justify-center items-center space-y-1">
        <motion.div
          className="w-5 h-0.5 bg-current origin-center"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 6 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.div
          className="w-5 h-0.5 bg-current"
          animate={{
            opacity: isOpen ? 0 : 1,
            x: isOpen ? -10 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
        <motion.div
          className="w-5 h-0.5 bg-current origin-center"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? -6 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
    </Button>
  );
} 
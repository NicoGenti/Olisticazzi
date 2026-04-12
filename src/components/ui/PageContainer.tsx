"use client";

import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";
import { LoadingScreen } from "./LoadingScreen";

interface PageContainerProps {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  pt?: string;
  pb?: string;
}

export function PageContainer({
  children,
  loading = false,
  className = "",
  pt = "pt-10",
  pb = "pb-4",
}: PageContainerProps) {
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <motion.main
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      className={`flex flex-col gap-4 px-4 ${pt} ${pb} ${className}`.trim()}
    >
      {children}
    </motion.main>
  );
}

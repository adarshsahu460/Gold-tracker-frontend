import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  className?: string;
  showTitle?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  className = '', 
  showTitle = false 
}) => {
  if (!showTitle) return null;
  
  return (
    <motion.h2
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-xl font-semibold text-dark-900 ${className}`}
    >
      {title}
    </motion.h2>
  );
};

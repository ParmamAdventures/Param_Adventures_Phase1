"use client";

import React from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import { fadeInUp, scaleOnHover } from "./motion";

/**
 * MotionCard - Card component for content containers.
 * @param {Object} props - Component props
 * @param {React.ReactNode} [props.children] - Card content
 * @param {string} [props.title] - Card title
 * @param {string} [props.className] - Additional CSS classes
 * @returns {React.ReactElement} Card element
 */
export function MotionCard(props: React.ComponentProps<typeof Card>) {
  const { children, className, ...rest } = props;
  return (
    <motion.div
      initial={fadeInUp.initial}
      animate={fadeInUp.animate}
      exit={fadeInUp.exit}
      transition={fadeInUp.transition as any}
      whileHover={scaleOnHover.whileHover}
      whileTap={scaleOnHover.whileTap}
    >
      <Card className={className} {...(rest as any)}>
        {children}
      </Card>
    </motion.div>
  );
}

export default MotionCard;

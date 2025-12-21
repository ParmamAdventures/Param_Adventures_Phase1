"use client";

import React from "react";
import { motion } from "framer-motion";
import Card from "./Card";
import { fadeInUp, scaleOnHover } from "./motion";

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

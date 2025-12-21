"use client";

import React from "react";
import { motion } from "framer-motion";
import Button from "./Button";
import { scaleOnHover } from "./motion";

export function MotionButton(props: React.ComponentProps<typeof Button>) {
  const { children, ...rest } = props;
  return (
    <motion.div
      whileHover={scaleOnHover.whileHover}
      whileTap={scaleOnHover.whileTap}
    >
      <Button {...(rest as any)}>{children}</Button>
    </motion.div>
  );
}

export default MotionButton;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useRef } from "react";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
}

export function AnimatedButton({
  children,
  className = "",
  asChild = false,
  ...props
}: AnimatedButtonProps) {
  const bgControls = useAnimation();
  const textControls = useAnimation();
  const isHovered = useRef(false);

  const handleMouseEnter = async () => {
    isHovered.current = true;
    bgControls.stop();

    textControls.start({
      color: "#171717",
      transition: { duration: 0.3 },
    });

    bgControls.set({
      y: "100%",
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "50%",
      borderBottomLeftRadius: "0%",
      borderBottomRightRadius: "0%",
    });

    await bgControls.start({
      y: "0%",
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "50%",
      transition: { ease: [0.25, 1, 0.5, 1], duration: 0.3 },
    });

    if (isHovered.current) {
      bgControls.start({
        borderTopLeftRadius: "0%",
        borderTopRightRadius: "0%",
        transition: { ease: "easeIn", duration: 0.15 },
      });
    }
  };

  const handleMouseLeave = async () => {
    isHovered.current = false;
    bgControls.stop();

    textControls.start({
      color: "#ffffff",
      transition: { duration: 0.3, delay: 0.1 },
    });

    bgControls.set({
      borderTopLeftRadius: "0%",
      borderTopRightRadius: "0%",
      borderBottomLeftRadius: "50%",
      borderBottomRightRadius: "50%",
    });

    await bgControls.start({
      y: "-100%",
      borderBottomLeftRadius: "50%",
      borderBottomRightRadius: "50%",
      transition: { ease: [0.25, 1, 0.5, 1], duration: 0.5 },
    });
  };

  // Filter out event handlers that conflict with framer-motion
  const {
    onDrag,
    onDragStart,
    onDragEnd,
    onAnimationStart,
    onAnimationEnd,
    ...safeProps
  } = props as any;

  const motionProps = {
    whileTap: { scale: 0.98 },
  };

  const eventHandlers = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleMouseEnter,
    onBlur: handleMouseLeave,
  };

  const baseClassName = `group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-[6px] border border-[#171717] bg-[#171717] px-8 py-3.5 ${className}`;

  const content = (
    <>
      {/* Background fill */}
      <motion.div
        initial={{
          y: "100%",
          borderTopLeftRadius: "50%",
          borderTopRightRadius: "50%",
        }}
        animate={bgControls}
        className="absolute -inset-x-[20%] top-0 z-0 h-[150%] w-[140%] bg-white"
      />

      {/* Button content */}
      <motion.span
        initial={{ color: "#ffffff" }}
        animate={textControls}
        className="relative z-10 flex w-full items-center justify-center gap-2.5"
      >
        {children}
      </motion.span>
    </>
  );

  // If asChild is true, render as a wrapper div instead of button
  if (asChild) {
    return (
      <motion.div {...motionProps} {...eventHandlers} className={baseClassName}>
        {content}
      </motion.div>
    );
  }

  return (
    <motion.button
      {...motionProps}
      {...eventHandlers}
      className={baseClassName}
      {...safeProps}
    >
      {content}
    </motion.button>
  );
}

// src/components/common/Loader.jsx
import React from "react";
import { motion } from "framer-motion";
import logo from "../../assets/VideoTube.png";

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] relative space-y-4">
      {/* Animated logo */}
      <motion.img
        src={logo}
        alt="App Logo"
        className="w-20 h-20 object-contain drop-shadow-md dark:brightness-90"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle pulse ring (positioned around logo) */}
      <motion.div
        className="absolute w-24 h-24 border-4 border-blue-500 border-opacity-40 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 0, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Message */}
      <p className="text-gray-500 text-sm font-medium mt-6">{message}</p>
    </div>
  );
};

export default Loader;

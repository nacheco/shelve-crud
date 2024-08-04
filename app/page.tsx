"use client"
import { motion } from "framer-motion";
import ListComponent from "@/components/ListComponent";
import { containerVariants, itemVariants } from "@/lib/motion";

const Home = () => {
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-4xl w-full space-y-12">
        <motion.div
          className="space-y-4"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-5xl font-bold text-gray-800 text-center"
            variants={itemVariants}
          >
            Inventory Manager
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 text-center"
            variants={itemVariants}
          >
            Efficiently manage your pantry items with ease
          </motion.p>
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          variants={itemVariants}
        >
          <ListComponent />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
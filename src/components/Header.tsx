import { motion } from "framer-motion";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-black/50 backdrop-blur-sm px-6 py-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto flex items-center justify-between max-w-2xl"
        >
          <div className="text-4xl font-poppins">
            <span className="logo-at">@</span>
            <span className="text-white">insite</span>
            <span className="logo-domain">.net</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
};
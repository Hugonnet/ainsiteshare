import { motion } from "framer-motion";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass px-6 py-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto flex items-center justify-between"
        >
          <div className="logo-text text-4xl font-poppins">
            <span className="logo-at">@</span>
            <span className="text-muted-foreground">insite</span>
            <span className="logo-domain">.net</span>
          </div>
        </motion.div>
      </div>
    </header>
  );
};
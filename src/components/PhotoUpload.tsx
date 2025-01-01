import { useState } from "react";
import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";

export const PhotoUpload = () => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl mx-auto"
    >
      <div
        className={`glass rounded-lg p-8 text-center ${
          isDragging ? "border-primary" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">
          Déposez vos photos ici
        </h3>
        <p className="text-muted-foreground mb-4">
          ou
        </p>
        <Button>
          Sélectionner des fichiers
        </Button>
      </div>
    </motion.div>
  );
};
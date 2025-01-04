import { motion } from "framer-motion";
import { useEffect } from "react";

interface SuccessMessageProps {
  company: string;
  city: string;
}

export const SuccessMessage = ({ company, city }: SuccessMessageProps) => {
  useEffect(() => {
    const audio = new Audio("/success.mp3");
    audio.play().catch(error => {
      console.error("Error playing success sound:", error);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.2,
        ease: [0, 0.71, 0.2, 1.01]
      }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
    >
      <motion.h1
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-6xl font-bold mb-8 text-white text-center"
      >
        Projet soumis avec succès
      </motion.h1>
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-2xl text-white/80"
      >
        <p className="mb-3">Félicitations {company} !</p>
        <p>Vos magnifiques réalisations à {city} sont maintenant partagées</p>
      </motion.div>
    </motion.div>
  );
};
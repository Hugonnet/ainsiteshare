import { motion } from "framer-motion";

interface SuccessMessageProps {
  company: string;
  city: string;
}

export const SuccessMessage = ({ company, city }: SuccessMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.2,
        ease: [0, 0.71, 0.2, 1.01]
      }}
      className="text-center"
    >
      <motion.h1
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-6xl font-bold mb-8 text-white"
      >
        Envoi réalisé avec succès
      </motion.h1>
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-xl text-white/80"
      >
        <p className="mb-2">Félicitations {company} !</p>
        <p>Vos magnifiques réalisations à {city} sont maintenant partagées</p>
      </motion.div>
    </motion.div>
  );
};
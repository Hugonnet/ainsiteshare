import { Header } from "@/components/Header";
import { ProjectForm } from "@/components/ProjectForm";
import { Fireworks } from "@/components/Fireworks";
import { SuccessMessage } from "@/components/SuccessMessage";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold mb-4">
            Partagez vos réalisations
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Téléchargez et partagez facilement les photos de vos chantiers
          </p>
        </motion.div>
        
        <ProjectForm />
        
        {/* Uncomment when upload is successful */}
        {/* <Fireworks />
        <SuccessMessage company="Entreprise" city="Paris" /> */}
      </main>
    </div>
  );
};

export default Index;
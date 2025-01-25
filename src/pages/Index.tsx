import { Header } from "@/components/Header";
import { ProjectForm } from "@/components/ProjectForm";
import { Fireworks } from "@/components/Fireworks";
import { SuccessMessage } from "@/components/SuccessMessage";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState<{ company: string; city: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmissionSuccess = (company: string, city: string) => {
    setSubmissionData({ company, city });
    setSubmitted(true);
    
    setTimeout(() => {
      setSubmitted(false);
      setSubmissionData(null);
      navigate(0);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-xl mx-auto pt-24 pb-16 px-4">
        {!submitted ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <h1 className="text-2xl md:text-4xl font-bold mb-4 whitespace-nowrap">
                Partagez vos réalisations
              </h1>
              <p className="text-muted-foreground">
                Téléchargez et partagez facilement les photos de vos chantiers
              </p>
            </motion.div>
            
            <ProjectForm onSubmissionSuccess={handleSubmissionSuccess} />
          </>
        ) : submissionData && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-40">
            <Fireworks />
            <SuccessMessage company={submissionData.company} city={submissionData.city} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
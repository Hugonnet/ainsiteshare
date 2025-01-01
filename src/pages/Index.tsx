import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";

const ProjectForm = lazy(() => import("@/components/ProjectForm"));
const Fireworks = lazy(() => import("@/components/Fireworks"));
const SuccessMessage = lazy(() => import("@/components/SuccessMessage"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            Partagez vos réalisations
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Téléchargez et partagez facilement les photos de vos chantiers
          </p>
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        }>
          <ProjectForm />
          
          {/* Uncomment when upload is successful */}
          {/* <Fireworks />
          <SuccessMessage company="Entreprise" city="Paris" /> */}
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
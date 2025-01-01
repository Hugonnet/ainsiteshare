import { Header } from "@/components/Header";
import ProjectForm from "@/components/ProjectForm";

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
        <ProjectForm />
      </main>
    </div>
  );
};

export default Index;
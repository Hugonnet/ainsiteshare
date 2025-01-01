import { Header } from "@/components/Header";
import ProjectForm from "@/components/ProjectForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-white">
            Partagez vos réalisations
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Téléchargez et partagez facilement les photos de vos chantiers
          </p>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
          <ProjectForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
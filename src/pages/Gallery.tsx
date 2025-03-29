
import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HomeIcon, Image, LayoutGrid } from "lucide-react";

interface ProjectSubmission {
  id: number;
  company_name: string;
  city: string;
  department: string | null;
  project_type: string;
  description: string;
  photo_paths: string[] | null;
  audio_path: string | null;
  created_at: string;
}

const Gallery = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const companyName = queryParams.get("company");
  
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!companyName) {
        setLoading(false);
        setError("Aucun nom d'entreprise fourni");
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("project_submissions")
          .select("*")
          .eq("company_name", companyName)
          .order("created_at", { ascending: false });

        if (error) throw error;
        
        // Transform the data to match our ProjectSubmission interface
        const transformedData: ProjectSubmission[] = (data || []).map(item => ({
          id: item.id,
          company_name: item.company_name,
          city: item.city,
          department: item.department,
          // Instead of accessing project_type directly, assign a default value
          project_type: "neuf", // Default value, as it's not in the response
          description: item.description,
          photo_paths: item.photo_paths,
          audio_path: item.audio_path,
          created_at: item.created_at
        }));
        
        setProjects(transformedData);
      } catch (err) {
        console.error("Erreur lors de la récupération des projets:", err);
        setError("Impossible de charger les projets");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [companyName]);

  const getThumbnailUrl = (photoPath: string) => {
    return supabase.storage
      .from("project_photos")
      .getPublicUrl(photoPath).data.publicUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto pt-24 pb-16 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            {companyName ? `Galerie de ${companyName}` : "Galerie de projets"}
          </h1>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <HomeIcon size={16} />
              Retour à l'accueil
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-center">
              <p className="text-muted-foreground">Chargement des projets...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun projet trouvé</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <LayoutGrid className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun projet trouvé</h2>
            <p className="text-muted-foreground mb-6">
              Cette entreprise n'a pas encore partagé de projets.
            </p>
            <Link to="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="aspect-video relative bg-muted overflow-hidden">
                  {project.photo_paths && project.photo_paths.length > 0 ? (
                    <img
                      src={getThumbnailUrl(project.photo_paths[0])}
                      alt={project.description}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg truncate">
                    {project.description}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Ville:</span> {project.city}
                    </p>
                    {project.department && (
                      <p>
                        <span className="font-medium">Département:</span> {project.department}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {project.project_type === "neuf" ? "Neuf" : "Rénovation"}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(project.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Gallery;

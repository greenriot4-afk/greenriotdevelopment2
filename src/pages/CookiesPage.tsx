import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
          <h1 className="text-4xl font-impact text-rebel mb-4">Política de Cookies</h1>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-6">
            Esta página de política de cookies está en construcción.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">¿Qué son las cookies?</h2>
          <p className="mb-4">
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Cómo utilizamos las cookies</h2>
          <p className="mb-4">
            Utilizamos cookies para mejorar tu experiencia de navegación y para analizar el tráfico de nuestro sitio web.
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
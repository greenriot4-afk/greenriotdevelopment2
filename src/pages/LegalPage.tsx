import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LegalPage() {
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
          <h1 className="text-4xl font-impact text-rebel mb-4">Aviso Legal</h1>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-6">
            Esta página de aviso legal está en construcción.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Datos identificativos</h2>
          <p className="mb-4">
            GreenRiot - Aplicación de economía circular
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Condiciones de uso</h2>
          <p className="mb-4">
            El acceso y uso de este sitio web implica la aceptación de estos términos y condiciones.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Propiedad intelectual</h2>
          <p className="mb-4">
            Todos los contenidos de este sitio web están protegidos por derechos de propiedad intelectual.
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
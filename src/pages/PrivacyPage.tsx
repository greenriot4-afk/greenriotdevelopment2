import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-impact text-rebel mb-4">Política de Privacidad</h1>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-lg mb-6">
            Esta página de política de privacidad está en construcción.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Información que recopilamos</h2>
          <p className="mb-4">
            Recopilamos información que nos proporcionas directamente y información sobre cómo utilizas nuestros servicios.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Cómo utilizamos tu información</h2>
          <p className="mb-4">
            Utilizamos tu información para proporcionar, mantener y mejorar nuestros servicios.
          </p>
          
          <h2 className="text-2xl font-impact text-rebel mb-4">Protección de datos</h2>
          <p className="mb-4">
            Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos personales.
          </p>
          
          <p className="text-sm text-muted-foreground mt-8">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
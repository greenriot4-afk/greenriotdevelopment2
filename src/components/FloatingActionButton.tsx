import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Sofa, Gift, Package, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthAction } from "@/hooks/useAuthAction";

interface FloatingActionButtonProps {
  onUpload: (type: 'abandoned' | 'donation' | 'product') => void;
}

export function FloatingActionButton({ onUpload }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { requireAuth } = useAuthAction();

  const options = [
    {
      type: 'abandoned' as const,
      label: 'Subir Abandono',
      icon: Sofa,
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      type: 'donation' as const,
      label: 'Subir Donación',
      icon: Gift,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      type: 'product' as const,
      label: 'Subir Producto',
      icon: Package,
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  const handleOptionClick = (type: 'abandoned' | 'donation' | 'product') => {
    requireAuth(() => {
      const routeMap = {
        abandoned: '/app/abandons',
        donation: '/app/donations',
        product: '/app/products'
      };
      
      // Check if we're already on the correct page
      const currentPath = window.location.pathname;
      const targetPath = routeMap[type];
      
      if (currentPath === targetPath) {
        // Same page, just show the upload form immediately
        onUpload(type);
      } else {
        // Different page, navigate first then show upload form
        navigate(targetPath);
        // Use a longer timeout to ensure navigation and useEffect complete
        setTimeout(() => {
          onUpload(type);
        }, 300);
      }
      
      setIsOpen(false);
    }, 'Debes crear una cuenta para publicar contenido');
  };

  return (
    <>
      {/* Overlay background */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="fixed bottom-6 right-6 z-50">
        {/* Options Menu */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-4">
            {options.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.type}
                  onClick={() => handleOptionClick(option.type)}
                  className="bg-white hover:bg-gray-50 text-gray-700 shadow-lg flex items-center gap-3 h-12 px-4 rounded-lg min-w-max border border-gray-200 animate-fade-in"
                  variant="outline"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </Button>
              );
            })}
          </div>
        )}

        {/* Main FAB Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            isOpen 
              ? 'bg-gray-600 hover:bg-gray-700' 
              : 'bg-primary hover:bg-primary/90'
          }`}
          size="icon"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>
    </>
  );
}
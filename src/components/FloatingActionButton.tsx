import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Gift, Package, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FloatingActionButtonProps {
  onUpload: (type: 'abandoned' | 'donation' | 'product') => void;
}

export function FloatingActionButton({ onUpload }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const options = [
    {
      type: 'abandoned' as const,
      label: 'Subir Abandono',
      icon: Trash2,
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
    // Navigate to the correct page first
    const routeMap = {
      abandoned: '/abandons',
      donation: '/donations',
      product: '/products'
    };
    
    navigate(routeMap[type]);
    
    // Then trigger the upload
    setTimeout(() => {
      onUpload(type);
    }, 100);
    
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Options Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2 mb-2">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.type}
                onClick={() => handleOptionClick(option.type)}
                className={`${option.color} text-white shadow-lg flex items-center gap-2 h-12 px-4 rounded-full min-w-max`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{option.label}</span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-primary hover:bg-primary/90'
        }`}
        size="icon"
      >
        <Plus className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}
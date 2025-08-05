import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { processAffiliateCommission } from '@/utils/processAffiliateCommission';
import { toast } from 'sonner';

export const ProcessCommissionButton = () => {
  const [processing, setProcessing] = useState(false);

  const handleProcessCommission = async () => {
    try {
      setProcessing(true);
      const result = await processAffiliateCommission('560a6c56-9bec-4000-a509-25b2e845272a');
      toast.success(`Comisión procesada exitosamente: €${result.commission}`);
      console.log('Commission result:', result);
    } catch (error) {
      toast.error('Error al procesar la comisión');
      console.error('Error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-2">Procesar Comisión de Afiliado</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Procesar comisión faltante para el usuario afiliate4 referido por inigoloperena@gmail.com
      </p>
      <Button 
        onClick={handleProcessCommission}
        disabled={processing}
      >
        {processing ? 'Procesando...' : 'Procesar Comisión'}
      </Button>
    </div>
  );
};
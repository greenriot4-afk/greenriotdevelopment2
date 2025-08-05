import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminCommissionPage = () => {
  const [referralId, setReferralId] = useState("");
  const [processing, setProcessing] = useState(false);

  const processCommission = async () => {
    if (!referralId) {
      toast.error("Please enter a referral ID");
      return;
    }

    setProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('manual-commission-processing', {
        body: { referralId }
      });

      if (error) {
        throw error;
      }

      if (data.success === false) {
        toast.warning(data.message);
        return;
      }

      toast.success(`Commission processed successfully! Amount: €${data.commission}`);
      console.log("Commission processing result:", data);
    } catch (error) {
      console.error("Error processing commission:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Manual Commission Processing</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Referral ID
          </label>
          <Input
            value={referralId}
            onChange={(e) => setReferralId(e.target.value)}
            placeholder="Enter referral ID"
          />
        </div>
        
        <Button 
          onClick={processCommission}
          disabled={processing}
          className="w-full"
        >
          {processing ? "Processing..." : "Process Commission"}
        </Button>
      </div>
    </div>
  );
};

export default AdminCommissionPage;
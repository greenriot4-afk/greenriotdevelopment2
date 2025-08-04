import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useAffiliates } from './useAffiliates';

export const useAffiliateProcessor = () => {
  const { user } = useAuth();
  const { processReferralSignup } = useAffiliates();

  useEffect(() => {
    if (user) {
      const storedAffiliateCode = localStorage.getItem('pendingAffiliateCode');
      if (storedAffiliateCode) {
        processReferralSignup(storedAffiliateCode, user.id)
          .then(() => {
            localStorage.removeItem('pendingAffiliateCode');
            console.log('Affiliate referral processed successfully');
          })
          .catch((error) => {
            console.error('Error processing affiliate referral:', error);
            // Keep the code for retry
          });
      }
    }
  }, [user, processReferralSignup]);

  return null;
};

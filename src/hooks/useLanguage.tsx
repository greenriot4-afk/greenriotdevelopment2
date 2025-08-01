import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.abandons': 'Abandons',
    'nav.donations': 'Donations', 
    'nav.products': 'Products',
    'nav.markets': 'Circular Markets',
    'nav.affiliates': 'Affiliates',
    
    // Menu
    'menu.title': 'Menu',
    'menu.myAccount': 'My Account',
    'menu.wallet': 'Wallet',
    'menu.myChats': 'My Chats',
    'menu.affiliateProgram': 'Affiliate Program',
    'menu.myCircularMarket': 'My Circular Market',
    'menu.createCircularMarket': 'Create Circular Market',
    'menu.signOut': 'Sign Out',
    'menu.activeUser': 'Active user',
    
    // Auth
    'auth.title': 'Authentication',
    'auth.description': 'Sign in or register to get started',
    'auth.slogan': 'Earn or save. Save the planet',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Name',
    'auth.yourName': 'Your name',
    'auth.yourEmail': 'your@email.com',
    'auth.signingIn': 'Signing in...',
    'auth.registering': 'Registering...',
    'auth.welcome': 'Welcome!',
    'auth.signedInSuccessfully': 'Successfully signed in',
    'auth.registrationSuccessful': 'Registration successful!',
    'auth.checkEmailToConfirm': 'Check your email to confirm your account',
    'auth.referredByAffiliate': 'You have been referred by an affiliate',
    'auth.affiliateBonus': 'You have been invited by a user. If you subscribe to the premium plan in the next 30 days, your referrer will receive a commission!',
    'auth.referredByAffiliateTitle': 'Referred by affiliate!',
    
    // Errors
    'error.fillAllFields': 'Please fill in all fields',
    'error.passwordsDontMatch': 'Passwords do not match',
    'error.passwordTooShort': 'Password must be at least 6 characters',
    'error.emailAlreadyRegistered': 'This email is already registered. Try signing in.',
    'error.invalidCredentials': 'Invalid credentials. Check your email and password.',
    'error.signInError': 'Sign in error',
    'error.signUpError': 'Sign up error',
    
    // Affiliate System
    'affiliate.title': 'Affiliate System',
    'affiliate.description': 'Earn $19 for each user you refer who subscribes to the premium plan',
    'affiliate.totalEarnings': 'Total earnings:',
    'affiliate.startEarning': 'Start earning with affiliates',
    'affiliate.createCode': 'Create your unique code and start referring users',
    'affiliate.createAffiliateCode': 'Create affiliate code',
    'affiliate.yourCode': 'Your affiliate code:',
    'affiliate.yourLink': 'Your affiliate link:',
    'affiliate.totalReferrals': 'Total referrals',
    'affiliate.paidCommissions': 'Paid commissions',
    'affiliate.recentReferrals': 'Recent referrals',
    'affiliate.referredUser': 'Referred user',
    'affiliate.pending': 'Pending',
    'affiliate.howItWorks': 'How it works?',
    'affiliate.step1': 'Share your affiliate link with friends',
    'affiliate.step2': 'When they register using your link, they will be linked to you',
    'affiliate.step3': 'If they subscribe to the premium plan in the next 30 days, you receive $19',
    'affiliate.step4': 'Commissions are automatically deposited to your wallet',
    'affiliate.premiumPlan': 'Premium Plan',
    'affiliate.premiumPrice': '$19/month',
    'affiliate.subscribe': 'Subscribe',
    'affiliate.processing': 'Processing...',
    'affiliate.tryPremium': 'Want to try the premium plan?',
    'affiliate.premiumDescription': 'Subscribe to the premium plan to create circular markets',
    'affiliate.codeCreatedSuccessfully': 'Affiliate code created successfully',
    'affiliate.errorCreatingCode': 'Error creating affiliate code',
    'affiliate.linkCopied': 'Link copied to clipboard',
    'affiliate.errorCopyingLink': 'Error copying link',
    'affiliate.loadingData': 'Loading...',
    'affiliate.errorLoadingData': 'Error loading affiliate data',
    
    // Account Settings
    'account.title': 'Account Settings',
    'account.profile': 'Profile',
    'account.email': 'Email',
    'account.displayName': 'Display Name',
    'account.updateProfile': 'Update Profile',
    'account.subscription': 'Subscription',
    'account.currentPlan': 'Current Plan',
    'account.free': 'Free',
    'account.premium': 'Premium - $19/month',
    'account.premiumDescription': 'Create and manage unlimited circular markets',
    'account.manageSubscription': 'Manage Subscription',
    'account.upgradeNow': 'Upgrade Now',
    'account.affiliateProgram': 'Affiliate Program',
    'account.profileUpdated': 'Profile updated successfully',
    'account.errorUpdatingProfile': 'Error updating profile',
    'account.updating': 'Updating...',
    'account.errorCreatingSubscription': 'Error creating subscription',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.close': 'Close',
    'common.copy': 'Copy',
    'common.share': 'Share',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.confirm': 'Confirm',
    'common.retry': 'Retry',
    'common.refresh': 'Refresh',
  },
  es: {
    // Navigation
    'nav.abandons': 'Abandonos',
    'nav.donations': 'Donaciones',
    'nav.products': 'Productos', 
    'nav.markets': 'Mercadillos',
    'nav.affiliates': 'Afiliados',
    
    // Menu
    'menu.title': 'Menú',
    'menu.myAccount': 'Mi Cuenta',
    'menu.wallet': 'Billetera',
    'menu.myChats': 'Mis Chats',
    'menu.affiliateProgram': 'Programa de Afiliados',
    'menu.myCircularMarket': 'Mi Mercadillo Circular',
    'menu.createCircularMarket': 'Crear Mercadillo Circular',
    'menu.signOut': 'Cerrar Sesión',
    'menu.activeUser': 'Usuario activo',
    
    // Auth
    'auth.title': 'Autenticación',
    'auth.description': 'Inicia sesión o regístrate para comenzar',
    'auth.slogan': 'Gana o ahorra. Salva el planeta',
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.register': 'Registrarse',
    'auth.email': 'Email',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.name': 'Nombre',
    'auth.yourName': 'Tu nombre',
    'auth.yourEmail': 'tu@email.com',
    'auth.signingIn': 'Iniciando sesión...',
    'auth.registering': 'Registrando...',
    'auth.welcome': '¡Bienvenido!',
    'auth.signedInSuccessfully': 'Has iniciado sesión correctamente',
    'auth.registrationSuccessful': '¡Registro exitoso!',
    'auth.checkEmailToConfirm': 'Revisa tu email para confirmar tu cuenta',
    'auth.referredByAffiliate': 'Has sido referido por un afiliado',
    'auth.affiliateBonus': 'Has sido invitado por un usuario. Si te suscribes al plan premium en los próximos 30 días, ¡tu referidor recibirá una comisión!',
    'auth.referredByAffiliateTitle': '¡Referido por afiliado!',
    
    // Errors
    'error.fillAllFields': 'Por favor completa todos los campos',
    'error.passwordsDontMatch': 'Las contraseñas no coinciden',
    'error.passwordTooShort': 'La contraseña debe tener al menos 6 caracteres',
    'error.emailAlreadyRegistered': 'Este email ya está registrado. Intenta iniciar sesión.',
    'error.invalidCredentials': 'Credenciales inválidas. Verifica tu email y contraseña.',
    'error.signInError': 'Error al iniciar sesión',
    'error.signUpError': 'Error al registrarse',
    
    // Affiliate System
    'affiliate.title': 'Sistema de Afiliados',
    'affiliate.description': 'Gana $19 por cada usuario que refiera y se suscriba al plan premium',
    'affiliate.totalEarnings': 'Ganancias totales:',
    'affiliate.startEarning': 'Comienza a ganar con afiliados',
    'affiliate.createCode': 'Crea tu código único y empieza a referir usuarios',
    'affiliate.createAffiliateCode': 'Crear código de afiliado',
    'affiliate.yourCode': 'Tu código de afiliado:',
    'affiliate.yourLink': 'Tu link de afiliado:',
    'affiliate.totalReferrals': 'Referencias totales',
    'affiliate.paidCommissions': 'Comisiones pagadas',
    'affiliate.recentReferrals': 'Referencias recientes',
    'affiliate.referredUser': 'Usuario referido',
    'affiliate.pending': 'Pendiente',
    'affiliate.howItWorks': '¿Cómo funciona?',
    'affiliate.step1': 'Comparte tu link de afiliado con amigos',
    'affiliate.step2': 'Cuando se registren usando tu link, quedarán vinculados a ti',
    'affiliate.step3': 'Si se suscriben al plan premium en los próximos 30 días, recibes $19',
    'affiliate.step4': 'Las comisiones se depositan automáticamente en tu wallet',
    'affiliate.premiumPlan': 'Plan Premium',
    'affiliate.premiumPrice': '$19/mes',
    'affiliate.subscribe': 'Suscribirse',
    'affiliate.processing': 'Procesando...',
    'affiliate.tryPremium': '¿Quieres probar el plan premium?',
    'affiliate.premiumDescription': 'Suscríbete al plan premium para crear mercadillos circulares',
    'affiliate.codeCreatedSuccessfully': 'Código de afiliado creado correctamente',
    'affiliate.errorCreatingCode': 'Error al crear el código de afiliado',
    'affiliate.linkCopied': 'Link copiado al portapapeles',
    'affiliate.errorCopyingLink': 'Error al copiar el link',
    'affiliate.loadingData': 'Cargando...',
    'affiliate.errorLoadingData': 'Error al cargar datos de afiliados',
    
    // Account Settings
    'account.title': 'Configuración de Cuenta',
    'account.profile': 'Perfil',
    'account.email': 'Email',
    'account.displayName': 'Nombre a Mostrar',
    'account.updateProfile': 'Actualizar Perfil',
    'account.subscription': 'Suscripción',
    'account.currentPlan': 'Plan Actual',
    'account.free': 'Gratuito',
    'account.premium': 'Premium - $19/mes',
    'account.premiumDescription': 'Crea y gestiona mercadillos circulares ilimitados',
    'account.manageSubscription': 'Gestionar Suscripción',
    'account.upgradeNow': 'Actualizar Ahora',
    'account.affiliateProgram': 'Programa de Afiliados',
    'account.profileUpdated': 'Perfil actualizado correctamente',
    'account.errorUpdatingProfile': 'Error al actualizar el perfil',
    'account.updating': 'Actualizando...',
    'account.errorCreatingSubscription': 'Error al crear la suscripción',
    
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.create': 'Crear',
    'common.update': 'Actualizar',
    'common.close': 'Cerrar',
    'common.copy': 'Copiar',
    'common.share': 'Compartir',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.submit': 'Enviar',
    'common.confirm': 'Confirmar',
    'common.retry': 'Reintentar',
    'common.refresh': 'Actualizar',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en'); // Default to English

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
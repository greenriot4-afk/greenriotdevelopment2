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
    'menu.user': 'User',
    'menu.myAccount': 'My Account',
    'menu.myWallet': 'My Wallet',
    'menu.wallet': 'Wallet',
    'menu.chats': 'Chats',
    'menu.myChats': 'My Chats',
    'menu.favorites': 'Favorites',
    'menu.affiliateProgram': 'Bring a circular market:\nHelp the planet and earn $19!',
    'menu.myCircularMarket': 'My Circular Market',
    'menu.createCircularMarket': 'Create Circular Market',
    'menu.signOut': 'Sign Out',
    'menu.activeUser': 'Active user',
    
    // Auth
    'auth.title': 'Authentication',
    'auth.description': 'Sign in or register to get started',
    'auth.slogan': 'Make or Save Money. Save the planet',
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.register': 'Register',
    'auth.signInWithGoogle': 'Sign in with Google',
    'auth.signUpWithGoogle': 'Sign up with Google',
    'auth.orContinueWith': 'or continue with email',
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
    'affiliate.description': 'Earn $19 for each user you refer who create a circular market. Planet wins and you too',
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
    
    // Landing Page
    'landing.hero.badge': '🌍 UNDERGROUND CIRCULAR ECONOMY',
    'landing.hero.title': 'STOOPING & THRIFTING',
    'landing.hero.subtitle': 'URBAN REBELLION',
    'landing.hero.description': 'FIND FREE TREASURES NEAR YOU – give them a second life – SAVE OR MAKE MONEY – save the planet',
    'landing.hero.cta1': 'JOIN THE REBELLION',
    'landing.hero.cta2': 'EXPLORE NOW',
    
    'landing.coordinates.badge': '💰 MAKE MONEY',
    'landing.coordinates.title': 'MAKE MONEY SHARING PHOTOS AND COORDINATES OF ABANDONED STREET FINDS',
    'landing.coordinates.feature1': 'HUNT FURNITURE, ELECTRONICS OR TREASURES ABANDONED ON THE STREET',
    'landing.coordinates.feature2': 'SHARE THE APPROXIMATE LOCATION AND EARN MONEY WHEN SOMEONE BUYS THE EXACT COORDINATES',
    'landing.coordinates.feature3': 'TURN YOUR DAILY WALKS INTO AN URBAN BUSINESS OPPORTUNITY',
    'landing.coordinates.cta': 'START EARNING',
    'landing.coordinates.cardTitle': 'BUY COORDINATES AND GET BARGAINS',
    'landing.coordinates.cardDescription': 'You know there is a FREE COUCH 11 km away from you but not exactly where, buy the coordinates and get a €200 COUCH FOR €1',
    
    'landing.markets.badge': '🏪 CIRCULAR MARKETS',
    'landing.markets.title': 'EXPLORE LOCAL UNDERGROUND THRIFT STORES AND GARAGE SALES',
    'landing.markets.feature1': 'BROWSE CATALOGS OF LOCAL STORES, GARAGE SALES AND CIRCULAR MARKETS FROM HOME',
    'landing.markets.feature2': 'VISIT ONLY THE STORES THAT HAVE WHAT YOU\'RE LOOKING FOR, SAVING TIME AND GAS',
    'landing.markets.feature3': 'CREATE YOUR OWN CIRCULAR MARKET, make money with unwanted stuff and save the planet',
    'landing.markets.cta': 'EXPLORE MARKETS',
    'landing.markets.cardTitle': 'EXPLORE UNDERGROUND CIRCULAR STORES',
    'landing.markets.cardDescription': 'SEE THEIR CATALOG FROM THE COMFORT OF YOUR HOME AND THEN GO TO BUY LIVE',
    
    'landing.finalCta.title': 'READY TO TURN TRASH INTO CASH?',
    'landing.finalCta.description': 'JOIN THOUSANDS OF USERS WHO ARE ALREADY MAKING MONEY, SAVING MONEY AND HELPING THE PLANET THROUGH URBAN CIRCULAR ECONOMY.',
    'landing.finalCta.cta1': 'JOIN FREE NOW',
    'landing.finalCta.cta2': 'START EXPLORING',
    
    'landing.footer.title': 'GREENRIOT',
    'landing.footer.description': 'THE CIRCULAR ECONOMY APP THAT TURNS YOUR FINDS INTO MONEY WHILE SAVING THE PLANET.',
    'landing.footer.features': 'FEATURES',
    'landing.footer.findStuff': 'FIND FREE STUFF',
    'landing.footer.circularMarkets': 'CIRCULAR MARKETS',
    'landing.footer.earnings': 'EARNINGS',
    'landing.footer.refer': 'REFER & EARN',
    'landing.footer.community': 'COMMUNITY',
    'landing.footer.chat': 'CHAT',
    'landing.footer.favorites': 'FAVORITES',
    'landing.footer.myAccount': 'MY ACCOUNT',
    'landing.footer.impact': 'IMPACT',
    'landing.footer.activeUsers': '50K+ ACTIVE USERS',
    'landing.footer.wasteReduction': '85% WASTE REDUCTION',
    'landing.footer.avgSavings': '€500 AVERAGE SAVINGS',
    'landing.footer.growingCommunity': 'GROWING COMMUNITY',
    'landing.footer.copyright': '© 2024 GREENRIOT. ALL RIGHTS RESERVED. MAKING CIRCULAR ECONOMY PROFITABLE.',
    'landing.footer.circular': '♻️ CIRCULAR',
    'landing.footer.profitable': '💰 PROFITABLE',
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
    'menu.user': 'Usuario',
    'menu.myAccount': 'Mi Cuenta',
    'menu.myWallet': 'Mi Billetera',
    'menu.wallet': 'Billetera',
    'menu.chats': 'Chats',
    'menu.myChats': 'Mis Chats',
    'menu.favorites': 'Favoritos',
    'menu.affiliateProgram': 'Trae un mercadillo circular:\n¡Ayuda al planeta y gana 19$!',
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
    'auth.signInWithGoogle': 'Iniciar sesión con Google',
    'auth.signUpWithGoogle': 'Registrarse con Google',
    'auth.orContinueWith': 'o continuar con email',
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
    
    // Landing Page
    'landing.hero.badge': '🌍 ECONOMÍA CIRCULAR UNDERGROUND',
    'landing.hero.title': 'STOOPING & THRIFTING',
    'landing.hero.subtitle': 'REBELIÓN URBANA',
    'landing.hero.description': 'ENCUENTRA TESOROS GRATIS CERCA DE TI – dales una segunda vida – GANA O AHORRA DINERO – salva el planeta',
    'landing.hero.cta1': 'ÚNETE A LA REBELIÓN',
    'landing.hero.cta2': 'EXPLORA YA',
    
    'landing.coordinates.badge': '💰 GANA PASTA',
    'landing.coordinates.title': 'GANA PASTA COMPARTIENDO FOTOS Y COORDENADAS DE TESOROS ABANDONADOS EN LA CALLE',
    'landing.coordinates.feature1': 'CAZA MUEBLES, ELECTRÓNICOS O TESOROS ABANDONADOS EN LA CALLE',
    'landing.coordinates.feature2': 'COMPARTE LA UBICACIÓN APROXIMADA Y GANA PASTA CUANDO ALGUIEN COMPRE LAS COORDENADAS EXACTAS',
    'landing.coordinates.feature3': 'CONVIERTE TUS PASEOS DIARIOS EN UNA OPORTUNIDAD DE NEGOCIO URBANO',
    'landing.coordinates.cta': 'EMPEZAR A GANAR',
    'landing.coordinates.cardTitle': 'COMPRA COORDENADAS Y CONSIGUE CHOLLOS',
    'landing.coordinates.cardDescription': 'Sabes que hay un SOFÁ GRATIS a 11 km de ti pero no exactamente dónde, compra las coordenadas y consigue un SOFÁ DE 200€ POR 1€',
    
    'landing.markets.badge': '🏪 MERCADOS CIRCULARES',
    'landing.markets.title': 'EXPLORA TIENDAS DE SEGUNDA MANO Y VENTAS DE GARAJE LOCALES',
    'landing.markets.feature1': 'NAVEGA CATÁLOGOS DE TIENDAS LOCALES, VENTAS DE GARAJE Y MERCADOS CIRCULARES DESDE CASA',
    'landing.markets.feature2': 'VISITA SOLO LAS TIENDAS QUE TIENEN LO QUE BUSCAS, AHORRANDO TIEMPO Y GASOLINA',
    'landing.markets.feature3': 'CREA TU PROPIO MERCADO CIRCULAR, gana dinero con cosas que no quieres y salva el planeta',
    'landing.markets.cta': 'EXPLORAR MERCADOS',
    'landing.markets.cardTitle': 'EXPLORA TIENDAS CIRCULARES UNDERGROUND',
    'landing.markets.cardDescription': 'VE SU CATÁLOGO DESDE LA COMODIDAD DE TU CASA Y LUEGO VE A COMPRAR EN VIVO',
    
    'landing.finalCta.title': '¿LISTO PARA CONVERTIR BASURA EN DINERO?',
    'landing.finalCta.description': 'ÚNETE A MILES DE USUARIOS QUE YA ESTÁN GANANDO DINERO, AHORRANDO DINERO Y AYUDANDO AL PLANETA A TRAVÉS DE LA ECONOMÍA CIRCULAR URBANA.',
    'landing.finalCta.cta1': 'ÚNETE GRATIS AHORA',
    'landing.finalCta.cta2': 'EMPEZAR A EXPLORAR',
    
    'landing.footer.title': 'GREENRIOT',
    'landing.footer.description': 'LA APP DE ECONOMÍA CIRCULAR QUE CONVIERTE TUS HALLAZGOS EN DINERO MIENTRAS SALVAS EL PLANETA.',
    'landing.footer.features': 'FUNCIONES',
    'landing.footer.findStuff': 'ENCONTRAR COSAS GRATIS',
    'landing.footer.circularMarkets': 'MERCADOS CIRCULARES',
    'landing.footer.earnings': 'GANANCIAS',
    'landing.footer.refer': 'REFIERE Y GANA',
    'landing.footer.community': 'COMUNIDAD',
    'landing.footer.chat': 'CHAT',
    'landing.footer.favorites': 'FAVORITOS',
    'landing.footer.myAccount': 'MI CUENTA',
    'landing.footer.impact': 'IMPACTO',
    'landing.footer.activeUsers': '50K+ USUARIOS ACTIVOS',
    'landing.footer.wasteReduction': '85% REDUCCIÓN DE RESIDUOS',
    'landing.footer.avgSavings': '€500 AHORRO PROMEDIO',
    'landing.footer.growingCommunity': 'COMUNIDAD CRECIENTE',
    'landing.footer.copyright': '© 2024 GREENRIOT. TODOS LOS DERECHOS RESERVADOS. HACIENDO LA ECONOMÍA CIRCULAR RENTABLE.',
    'landing.footer.circular': '♻️ CIRCULAR',
    'landing.footer.profitable': '💰 RENTABLE',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Detect browser language and default to appropriate language
  const getBrowserLanguage = (): Language => {
    const browserLang = navigator.language.toLowerCase();
    const browserLangs = navigator.languages?.map(lang => lang.toLowerCase()) || [];
    
    console.log('Browser language detected:', browserLang);
    console.log('Browser languages array:', browserLangs);
    
    // Check primary language first
    if (browserLang.startsWith('es')) {
      console.log('Setting language to Spanish based on primary language');
      return 'es';
    }
    
    // Check all preferred languages
    for (const lang of browserLangs) {
      if (lang.startsWith('es')) {
        console.log('Setting language to Spanish based on preferred languages');
        return 'es';
      }
    }
    
    console.log('Setting language to English as default');
    return 'en'; // Default to English for all other languages
  };

  const [language, setLanguageState] = useState<Language>(() => {
    // Only detect browser language on client side
    if (typeof window !== 'undefined') {
      return getBrowserLanguage();
    }
    return 'en';
  });

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    console.log('Saved language from localStorage:', savedLanguage);
    
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      console.log('Using saved language:', savedLanguage);
      setLanguageState(savedLanguage);
    } else {
      // If no saved language, use browser language
      const browserLang = getBrowserLanguage();
      console.log('No saved language, using browser language:', browserLang);
      setLanguageState(browserLang);
      localStorage.setItem('language', browserLang);
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
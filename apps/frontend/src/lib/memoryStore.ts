// Simple in-memory storage for serverless functions
// Note: In production, you'd want to use a database or external storage

const profiles = new Map<string, any>();
const promptPackages = new Map<string, Map<string, any>>();

export function saveClientProfile(id: string, profile: any) {
  profiles.set(id, { ...profile, id, createdAt: new Date().toISOString() });
  return profiles.get(id);
}

export function getClientProfile(id: string) {
  return profiles.get(id) || null;
}

export function savePromptPackage(profileId: string, campaignId: string, packageData: any) {
  if (!promptPackages.has(profileId)) {
    promptPackages.set(profileId, new Map());
  }
  
  const userPackages = promptPackages.get(profileId)!;
  userPackages.set(campaignId, {
    ...packageData,
    createdAt: new Date().toISOString()
  });
  
  return userPackages.get(campaignId);
}

export function getPromptPackage(profileId: string, campaignId: string) {
  const userPackages = promptPackages.get(profileId);
  return userPackages?.get(campaignId) || null;
}

// For demo purposes, populate with some data
export function initDemoData() {
  const demoProfile = {
    id: 'demo-profile-123',
    offer: 'Servicios de automatización de procesos industriales',
    value_props: [
      'Reducción del 40% en tiempos de producción',
      'Mejora de la calidad y consistencia',
      'ROI comprobado en 6 meses'
    ],
    icp: {
      company_types: ['Industria manufacturera', 'Empresas medianas-grandes'],
      buyer_roles: ['Director de Operaciones', 'Jefe de Producción']
    },
    proof_points: [
      'Más de 200 proyectos exitosos',
      'Certificación ISO 9001',
      'Casos de éxito documentados'
    ],
    constraints: {
      tone: 'natural, directo, sin corporativismo',
      language: 'es-ES'
    },
    data_sources: {
      industrial_data: 'Empresa manufacturera con procesos tradicionales que busca modernizar su línea de producción. Problemas principales: ineficiencias en cadena de montaje, altos tiempos de setup, control de calidad manual. Oportunidades: automatización de procesos repetitivos, implementación de sistemas de monitoreo IoT.'
    }
  };
  
  saveClientProfile(demoProfile.id, demoProfile);
}

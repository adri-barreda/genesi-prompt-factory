function sanitizeInstruction(text) {
  if (!text) return text;

  const replacements = {
    'client_profile.proof_points': 'los resultados y casos de éxito listados en el contexto del cliente',
    'client_profile.value_props': 'las value props descritas en el contexto del cliente',
    'client_profile.offer': 'la oferta descrita en el contexto del cliente',
    'client_profile.icp.company_types': 'los tipos de empresa objetivo descritos en el contexto del cliente',
    'client_profile.icp.buyer_roles': 'los roles decisores descritos en el contexto del cliente',
    'client_profile.client_summary': 'el resumen del cliente indicado en el contexto del cliente',
    'client_profile.constraints.tone': 'el tono indicado en el contexto del cliente',
    'client_profile.constraints.language': 'el idioma indicado en el contexto del cliente',
    'client_profile.case_study.name': 'el nombre del caso de éxito destacado',
    'client_profile.case_study.industry': 'la industria del caso de éxito',
    'client_profile.case_study.company_size': 'el tamaño de la empresa del caso de éxito',
    'client_profile.case_study.similar_companies': 'las empresas similares al caso de éxito',
    'client_profile.case_study.problem': 'el problema detectado en el caso de éxito',
    'client_profile.case_study.solution': 'la solución aplicada en el caso de éxito',
    'client_profile.case_study.phases': 'las fases clave que siguió el caso de éxito',
    'client_profile.case_study.results.general': 'los resultados generales del caso de éxito',
    'client_profile.case_study.results.numeric': 'los resultados numéricos del caso de éxito',
    'client_profile.buyer_persona': 'el buyer persona descrito en el contexto del cliente'
  };

  let sanitized = text;
  for (const [pattern, replacement] of Object.entries(replacements)) {
    sanitized = sanitized.replaceAll(pattern, replacement);
  }

  sanitized = sanitized.replaceAll('client_profile', 'perfil del cliente');
  sanitized = sanitized.replaceAll('CLIENT_PROFILE', 'el contexto del cliente');
  return sanitized;
}

function normalizeList(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => typeof item === 'string' && item.trim().length > 0).map((item) => item.trim());
}

function formatList(items, prefix = '•') {
  const normalized = normalizeList(items);
  if (!normalized.length) return null;
  return normalized.map((item) => `${prefix} ${item}`).join('\n');
}

function summarizeDependency(dep, clientProfile) {
  const {
    offer,
    value_props: valueProps = [],
    proof_points: proofPoints = [],
    icp = {},
    constraints = {},
    client_summary: clientSummary,
    case_study: rawCaseStudy = {},
    buyer_persona: buyerPersona
  } = clientProfile || {};

  const caseStudy = {
    ...rawCaseStudy,
    similar_companies: normalizeList(rawCaseStudy?.similar_companies),
    phases: normalizeList(rawCaseStudy?.phases),
    results: {
      general: normalizeList(rawCaseStudy?.results?.general),
      numeric: normalizeList(rawCaseStudy?.results?.numeric)
    }
  };

  switch (dep) {
    case 'client_profile.proof_points': {
      const list = formatList(proofPoints);
      return list
        ? `Casos de éxito y resultados del cliente:\n${list}`
        : 'Casos de éxito y resultados del cliente: no se aportaron datos específicos';
    }
    case 'client_profile.client_summary':
      return clientSummary
        ? `Resumen operativo del cliente: ${clientSummary}`
        : 'Resumen operativo del cliente: no disponible en la discovery';
    case 'client_profile.offer':
      return offer
        ? `Oferta del cliente: ${offer}`
        : 'Oferta del cliente: pendiente de definir';
    case 'client_profile.value_props': {
      const list = formatList(valueProps);
      return list ? `Value props del cliente:\n${list}` : 'Value props del cliente: no registradas';
    }
    case 'client_profile.icp.company_types': {
      const list = formatList(icp?.company_types);
      return list ? `Tipos de empresa objetivo:\n${list}` : 'Tipos de empresa objetivo: no detallados';
    }
    case 'client_profile.icp.buyer_roles': {
      const list = formatList(icp?.buyer_roles);
      return list ? `Roles decisores objetivo:\n${list}` : 'Roles decisores objetivo: no indicados';
    }
    case 'client_profile.constraints.tone':
      return constraints?.tone
        ? `Tono preferido: ${constraints.tone}`
        : 'Tono preferido: no especificado';
    case 'client_profile.constraints.language':
      return constraints?.language
        ? `Idioma requerido: ${constraints.language}`
        : 'Idioma requerido: no especificado';
    case 'client_profile.case_study.name':
      return caseStudy?.name
        ? `Caso de éxito destacado: ${caseStudy.name}`
        : 'Caso de éxito destacado: no identificado';
    case 'client_profile.case_study.industry':
      return caseStudy?.industry
        ? `Industria del caso de éxito: ${caseStudy.industry}`
        : 'Industria del caso de éxito: no indicada';
    case 'client_profile.case_study.company_size':
      return caseStudy?.company_size
        ? `Tamaño de empresa del caso: ${caseStudy.company_size}`
        : 'Tamaño de empresa del caso: no indicado';
    case 'client_profile.case_study.similar_companies': {
      const list = formatList(caseStudy.similar_companies);
      return list ? `Empresas similares al caso:
${list}` : 'Empresas similares al caso: no mencionadas';
    }
    case 'client_profile.case_study.problem':
      return caseStudy.problem
        ? `Problema resuelto: ${caseStudy.problem}`
        : 'Problema resuelto: no detallado';
    case 'client_profile.case_study.solution':
      return caseStudy.solution
        ? `Cómo se resolvió: ${caseStudy.solution}`
        : 'Cómo se resolvió: no especificado';
    case 'client_profile.case_study.phases': {
      const list = formatList(caseStudy.phases);
      return list ? `Fases clave del proyecto:
${list}` : 'Fases clave del proyecto: no descritas';
    }
    case 'client_profile.case_study.results.general': {
      const list = formatList(caseStudy.results.general);
      return list ? `Resultados generales del caso:
${list}` : 'Resultados generales del caso: no registrados';
    }
    case 'client_profile.case_study.results.numeric': {
      const list = formatList(caseStudy.results.numeric, '•');
      return list ? `Resultados numéricos del caso:
${list}` : 'Resultados numéricos del caso: no disponibles';
    }
    case 'client_profile.buyer_persona':
      return buyerPersona
        ? `Buyer persona principal: ${buyerPersona}`
        : 'Buyer persona principal: no definido';
    default:
      return dep;
  }
}

function buildClientContextInstructions(clientProfile) {
  const {
    offer,
    value_props: valueProps = [],
    proof_points: proofPoints = [],
    icp = {},
    constraints = {},
    client_summary: clientSummary,
    case_study: rawCaseStudy = {},
    buyer_persona: buyerPersona
  } = clientProfile || {};

  const caseStudy = {
    ...rawCaseStudy,
    similar_companies: normalizeList(rawCaseStudy?.similar_companies),
    phases: normalizeList(rawCaseStudy?.phases),
    results: {
      general: normalizeList(rawCaseStudy?.results?.general),
      numeric: normalizeList(rawCaseStudy?.results?.numeric)
    }
  };

  const context = ['Contexto del cliente (usa esta información literal, no nombres de variables):'];

  if (offer) {
    context.push(`- Oferta principal: ${offer}`);
  }

  const normalizedValueProps = normalizeList(valueProps);
  if (normalizedValueProps.length > 0) {
    context.push(`- Value props clave: ${normalizedValueProps.join('; ')}`);
  }

  if (clientSummary) {
    context.push(`- Resumen operativo: ${clientSummary}`);
  }

  if (caseStudy?.name) {
    context.push(`- Caso de éxito destacado: ${caseStudy.name}`);
  }

  if (caseStudy?.industry) {
    context.push(`- Industria del caso de éxito: ${caseStudy.industry}`);
  }

  if (caseStudy?.company_size) {
    context.push(`- Tamaño del caso de éxito: ${caseStudy.company_size}`);
  }

  if (caseStudy.similar_companies.length > 0) {
    context.push(`- Empresas similares al caso: ${caseStudy.similar_companies.join(', ')}`);
  }

  if (caseStudy?.problem) {
    context.push(`- Problema del caso: ${caseStudy.problem}`);
  }

  if (caseStudy?.solution) {
    context.push(`- Cómo lo resolvimos: ${caseStudy.solution}`);
  }

  if (Array.isArray(caseStudy?.phases) && caseStudy.phases.length > 0) {
    context.push('- Fases clave del proyecto:');
    caseStudy.phases.forEach((phase) => {
      if (typeof phase === 'string' && phase.trim().length > 0) {
        context.push(`  - ${phase.trim()}`);
      }
    });
  }

  if (caseStudy.results.general.length > 0) {
    context.push('- Resultados generales del caso:');
    caseStudy.results.general.forEach((result) => {
      if (typeof result === 'string' && result.trim().length > 0) {
        context.push(`  - ${result.trim()}`);
      }
    });
  }

  if (caseStudy.results.numeric.length > 0) {
    context.push('- Resultados numéricos del caso:');
    caseStudy.results.numeric.forEach((result) => {
      if (typeof result === 'string' && result.trim().length > 0) {
        context.push(`  - ${result.trim()}`);
      }
    });
  }

  const normalizedProofPoints = normalizeList(proofPoints);
  if (normalizedProofPoints.length > 0) {
    context.push('- Casos de éxito y resultados relevantes:');
    normalizedProofPoints.forEach((point) => {
      if (typeof point === 'string' && point.trim().length > 0) {
        context.push(`  - ${point.trim()}`);
      }
    });
  }

  const normalizedCompanyTypes = normalizeList(icp?.company_types);
  if (normalizedCompanyTypes.length > 0) {
    context.push(`- Tipos de empresa objetivo: ${normalizedCompanyTypes.join(', ')}`);
  }

  const normalizedBuyerRoles = normalizeList(icp?.buyer_roles);
  if (normalizedBuyerRoles.length > 0) {
    context.push(`- Roles decisores clave: ${normalizedBuyerRoles.join(', ')}`);
  }

  if (constraints?.tone) {
    context.push(`- Tono preferido: ${constraints.tone}`);
  }

  if (constraints?.language) {
    context.push(`- Idioma requerido: ${constraints.language}`);
  }

  if (buyerPersona) {
    context.push(`- Buyer persona principal: ${buyerPersona}`);
  }

  return context;
}

export function withClientContext(lineSpec, clientProfile, overrides = {}) {
  const { instructions: overrideInstructions, depends_on: overrideDepends, ...rest } = overrides;
  const specCopy = { ...lineSpec, ...rest };
  const baseInstructions = overrideInstructions ?? lineSpec.instructions ?? [];
  const baseDependencies = overrideDepends ?? lineSpec.depends_on ?? [];
  const contextInstructions = buildClientContextInstructions(clientProfile);
  const sanitizedInstructions = baseInstructions.map((instruction) => sanitizeInstruction(instruction));
  const sanitizedDependsOn = baseDependencies.map((dependency) => summarizeDependency(dependency, clientProfile));

  specCopy.instructions = [...contextInstructions, ...sanitizedInstructions];
  specCopy.depends_on = sanitizedDependsOn;

  return specCopy;
}

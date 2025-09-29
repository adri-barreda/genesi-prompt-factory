export const lookalikeLineSpecs = [
  {
    line_id: 'LL_E1_L2_conexion_caso',
    name: 'Lookalike Email 1 - Conexión con caso de éxito',
    target_variable: 'Lookalike | E1.1',
    structure: 'Empieza exactamente con "Vi en vuestra web que {X}" y termina mencionando a un cliente real {Y}.',
    rules: {
      max_words: 27,
      tone: 'cercano y directo',
      no_invention: true,
      style: 'lenguaje sencillo, sin tecnicismos'
    },
    instructions: [
      'Usa Industrial Data para resumir qué hace el prospecto en {X} en 10-14 palabras.',
      'Introduce el caso de éxito con el nombre completo y matices clave (industria, tamaño, empresas similares) presentes en el contexto.',
      'Alinea el gancho con el problema y la solución documentados del caso para que la comparación sea creíble.',
      'Mantén la estructura exacta "Vi en vuestra web que {X}, y me vino a la cabeza uno de nuestros clientes, {Y}".',
      'No superes las 27 palabras totales y mantén un tono conversacional cercano.',
      'Evita adjetivos grandilocuentes; prioriza verbos y sustantivos concretos.'
    ],
    examples: [
      'Vi en vuestra web que hacéis cemento para infraestructuras marinas, y me vino a la cabeza uno de nuestros clientes, Cemex',
      'Vi en vuestra web que tenéis un software para autónomos de gestión de impuestos, y me vino a la cabeza uno de nuestros clientes, Declarando',
      'Vi en vuestra web que sois una agencia de marketing digital especializada en contenidos, y me vino a la cabeza uno de nuestros clientes, Código Media'
    ],
    depends_on: [
      'Industrial Data (dato del prospecto disponible en Genesy en tiempo de envío)',
      'client_profile.case_study.name',
      'client_profile.case_study.industry',
      'client_profile.case_study.company_size',
      'client_profile.case_study.similar_companies',
      'client_profile.case_study.problem',
      'client_profile.case_study.solution',
      'client_profile.case_study.results.general',
      'client_profile.case_study.results.numeric'
    ]
  },
  {
    line_id: 'LL_E1_L3_problema_solucion',
    name: 'Lookalike Email 1 - Problema resuelto para el caso',
    target_variable: 'Lookalike | E1.2',
    structure: 'Frase que cuenta qué reto tenía el caso de éxito y cómo se solucionó con nuestra ayuda.',
    rules: {
      max_words: 32,
      tone: 'cercano y claro',
      no_invention: true,
      style: 'frases cortas, foco en acción'
    },
    instructions: [
      'Describe el reto concreto identificado para el caso de éxito (usa el problema descrito en el contexto).',
      'Explica cómo lo resolvisteis con vuestra oferta, apoyándote en la solución documentada.',
      'Si las fases ayudan a entender la historia, menciónalas brevemente.',
      'Prioriza verbos de acción y mantén un tono cercano, sin tecnicismos.',
      'No excedas las 32 palabras.'
    ],
    examples: [
      'Con Cemex pasaba que el producto era tan técnico que costaba venderlo, así que hicimos infografías y vídeos para explicarlo claro y aumentar ventas',
      'En Declarando querían captar más clientes sin contratar nuevos vendedores, y lo lograron con nuestro agente de IA que automatizaba las demos',
      'En Código Media conseguían cada vez menos clientes por inbound, así que implementamos un sistema de prospección que genera 10 reuniones al mes'
    ],
    depends_on: [
      'client_profile.case_study.problem',
      'client_profile.case_study.solution',
      'client_profile.case_study.phases',
      'client_profile.offer'
    ]
  },
  {
    line_id: 'LL_E1_L4_resultados',
    name: 'Lookalike Email 1 - Resultados conseguidos',
    target_variable: 'Lookalike | E1.3',
    structure: 'Frase breve que destaca resultados generales y, si existen, cifras concretas.',
    rules: {
      max_words: 26,
      tone: 'positivo y tangible',
      no_invention: true,
      style: 'menciona métricas o impactos claros'
    },
    instructions: [
      'Prioriza métricas concretas (porcentajes, volúmenes, cifras) presentes en los resultados del caso.',
      'Si no hay datos numéricos, resume un logro cualitativo convincente alineado con el caso.',
      'Mantén la conexión con el caso mencionado en las líneas anteriores y evita superlativos vacíos.',
      'No superes las 26 palabras.'
    ],
    examples: [
      'El resultado fue un aumento de un 15% de ventas que supuso unos cuantos cientos miles de euros',
      'La IA logró hacer 100 demos al mes con un ratio de conversión del 60%',
      'De esas 10 reuniones cierran un 20% de clientes al mes, lo que hizo duplicar su facturación'
    ],
    depends_on: [
      'client_profile.case_study.results.general',
      'client_profile.case_study.results.numeric'
    ]
  },
  {
    line_id: 'LL_E1_L5_cta_lookalike',
    name: 'Lookalike Email 1 - CTA de invitación',
    target_variable: 'Lookalike | E1.4',
    structure: 'Pregunta que empieza con "Si te cuento" y plantea el mensaje a testear.',
    rules: {
      max_words: 25,
      tone: 'cercano y conversacional',
      no_invention: true,
      style: 'pregunta corta con verbo de acción'
    },
    instructions: [
      'Empieza siempre con "Si te cuento" seguido del beneficio principal obtenido por el caso de éxito.',
      'Conecta ese beneficio con la oferta o expertise propia descrita en el contexto.',
      'Cierra con una pregunta tipo "¿ves útil verlo?" o variante breve equivalente.',
      'No superes las 25 palabras, mantén el tono cercano y coherente con el caso mencionado.'
    ],
    examples: [
      'Si te cuento qué hicimos para que lo explicaran fácil y vendieran más, ¿ves útil verlo?',
      'Si te cuento cómo lo implementaron para conseguir estos resultados, ¿ves útil echarle un vistazo?',
      'Si te cuento qué proceso seguimos para captar nuevos clientes, ¿ves útil echarle un vistazo?'
    ],
    depends_on: [
      'client_profile.offer',
      'client_profile.value_props',
      'client_profile.case_study.results.general',
      'client_profile.case_study.results.numeric'
    ]
  },
  {
    line_id: 'LL_E2_L1_gancho_contexto',
    name: 'Lookalike Email 2 - Gancho con caso o competencia',
    target_variable: 'Lookalike | E2.1',
    structure:
      'Empieza con "He visto que" y termina con "me pregunté" introduciendo cómo el prospecto gestiona el reto que resolvió nuestro caso de éxito.',
    rules: {
      max_words: 24,
      tone: 'cercano y directo',
      no_invention: true,
      style: 'frase conversacional con una pregunta implícita'
    },
    instructions: [
      'Abre con "He visto que" seguido de un dato real sobre el prospecto tomado de Industrial Data.',
      'Menciona el caso de éxito principal descrito en el contexto y conéctalo con ese reto.',
      'Cierra con "y me pregunté cómo" seguido de la responsabilidad del prospecto respecto a dicho reto.',
      'Si no hay caso explícito, usa el sector o testimonios recogidos en Industrial Data como referencia.',
      'Limita la frase a 24 palabras, tono cercano y directo.'
    ],
    examples: [
      'He visto que trabajasteis con Hurre en UniDeck y me pregunté cómo apoyáis al equipo comercial para captar más clientes así',
      'He visto que publicasteis un caso con Declarando y me pregunté cómo mantenéis ese ritmo sin ampliar el equipo de ventas'
    ],
    depends_on: [
      'Industrial Data (dato del prospecto disponible en Genesy en tiempo de envío)',
      'client_profile.case_study.name',
      'client_profile.case_study.problem',
      'client_profile.case_study.solution'
    ]
  },
  {
    line_id: 'LL_E2_L2_aporte_1',
    name: 'Lookalike Email 2 - Aporte clave #1',
    target_variable: 'Lookalike | E2.2',
    structure: 'Elemento en formato lista que describe una acción específica ejecutada para el caso de éxito.',
    rules: {
      max_words: 12,
      tone: 'práctico y concreto',
      no_invention: true,
      style: 'comienza con un símbolo "•" y verbo en infinitivo'
    },
    instructions: [
      'Empieza con "•" seguido de un verbo en infinitivo que resuma la acción ejecutada.',
      'Describe una iniciativa concreta aplicada en el caso de éxito (materiales, automatizaciones, procesos, etc.).',
      'Usa información literal del contexto del cliente para garantizar la veracidad.',
      'No repitas la misma idea en las siguientes viñetas.'
    ],
    examples: [
      '• Crear infografías que simplifican el producto',
      '• Automatizar demos comerciales con IA'
    ],
    depends_on: [
      'client_profile.case_study.solution',
      'client_profile.case_study.phases',
      'client_profile.offer'
    ]
  },
  {
    line_id: 'LL_E2_L3_aporte_2',
    name: 'Lookalike Email 2 - Aporte clave #2',
    target_variable: 'Lookalike | E2.3',
    structure: 'Segundo elemento en lista que refuerza la solución dada al caso de éxito.',
    rules: {
      max_words: 12,
      tone: 'práctico y concreto',
      no_invention: true,
      style: 'comienza con "•" y verbo en infinitivo'
    },
    instructions: [
      'Inicia con "•" y un verbo en infinitivo diferente al de la viñeta anterior.',
      'Añade otra acción complementaria clave del caso de éxito (contenidos, procesos, soportes, automatizaciones, etc.).',
      'Mantén la coherencia con la oferta y evita repetir ideas ya usadas.'
    ],
    examples: [
      '• Diseñar materiales para ferias que destacan frente a competidores',
      '• Documentar el guion de ventas para repetir las demos ganadoras'
    ],
    depends_on: [
      'client_profile.case_study.solution',
      'client_profile.case_study.phases',
      'client_profile.value_props'
    ]
  },
  {
    line_id: 'LL_E2_L4_aporte_3',
    name: 'Lookalike Email 2 - Aporte clave #3',
    target_variable: 'Lookalike | E2.4',
    structure: 'Tercer elemento en lista que remata con un beneficio operativo.',
    rules: {
      max_words: 12,
      tone: 'práctico y concreto',
      no_invention: true,
      style: 'comienza con "•" y verbo en infinitivo'
    },
    instructions: [
      'Empieza con "•" y usa un verbo en infinitivo distinto a los anteriores.',
      'Remata con un beneficio operativo claro logrado en el caso (ej. acelerar ventas, reducir retrabajos).',
      'Redacta la idea en pocas palabras y aporta un ángulo nuevo respecto a las viñetas previas.'
    ],
    examples: [
      '• Entrenar al postventa para responder dudas técnicas',
      '• Integrar dashboards para seguir cada oportunidad'
    ],
    depends_on: [
      'client_profile.case_study.solution',
      'client_profile.case_study.results.general',
      'client_profile.case_study.results.numeric'
    ]
  },
  {
    line_id: 'LL_E2_L5_cta',
    name: 'Lookalike Email 2 - CTA de demostración',
    target_variable: 'Lookalike | E2.5',
    structure: 'Pregunta breve que empieza con "Si te cuento" e invita a conocer el proceso.',
    rules: {
      max_words: 22,
      tone: 'cercano y no invasivo',
      no_invention: true,
      style: 'pregunta condicional con cierre "¿ves útil...?"'
    },
    instructions: [
      'Arranca con "Si te cuento" seguido del beneficio principal obtenido por el caso de éxito citado.',
      'Termina con "¿ves útil echarle un vistazo?" u otra variante breve equivalente.',
      'Adapta el beneficio al sector del prospecto y al caso mencionado.',
      'No excedas las 22 palabras y mantén el tono conversacional.'
    ],
    examples: [
      'Si te cuento cómo los ayudamos a vender más rápido, ¿ves útil echarle un vistazo?',
      'Si te cuento qué hicimos para multiplicar sus demos útiles, ¿ves útil verlo?'
    ],
    depends_on: [
      'client_profile.offer',
      'client_profile.case_study.results.general',
      'client_profile.case_study.results.numeric',
      'client_profile.value_props'
    ]
  },
  {
    line_id: 'LL_E3_L1_recordatorio',
    name: 'Lookalike Email 3 - Recordatorio de caso',
    target_variable: 'Lookalike | E3.1',
    structure: 'Frase que vincula al prospecto con el caso de éxito usando un cierre variado.',
    rules: {
      max_words: 20,
      tone: 'cercano y directo',
      no_invention: true,
      style: 'elige aleatoriamente “pensé que podía seros útil” o “creí que podía ser útil”'
    },
    instructions: [
      'Comienza con "Como" o "Ya que" para relacionar al prospecto con el caso de éxito citado en emails previos.',
      'Menciona el nombre del caso de éxito y el sector compartido.',
      'Cierra usando una de estas opciones exactas (elige aleatoriamente): "pensé que podía seros útil" o "creí que podía ser útil".',
      'Mantén la frase en un máximo de 20 palabras y sin tecnicismos.'
    ],
    examples: [
      'Como estáis en el mismo sector que Cemex, pensé que podía seros útil',
      'Ya que trabajáis retos similares a Declarando, creí que podía ser útil'
    ],
    depends_on: [
      'client_profile.case_study.name',
      'client_profile.case_study.industry'
    ]
  },
  {
    line_id: 'LL_E3_L2_pregunta_seguimiento',
    name: 'Lookalike Email 3 - Pregunta de seguimiento',
    target_variable: 'Lookalike | E3.2',
    structure: 'Pregunta corta que confirma si vio el correo anterior, con variación aleatoria.',
    rules: {
      max_words: 14,
      tone: 'cercano y educado',
      no_invention: true,
      style: 'elige aleatoriamente entre dos formulaciones propuestas'
    },
    instructions: [
      'Genera una pregunta directa utilizando una de estas opciones exactas (elige aleatoriamente): "¿Has leído el correo que te envié?" o "¿Has visto el email que te envié?".',
      'Mantén el tono cercano, sin añadir justificaciones adicionales.',
      'No superes las 14 palabras.'
    ],
    examples: [
      '¿Has leído el correo que te envié?',
      '¿Has visto el email que te envié?'
    ],
    depends_on: []
  }
];

export function getLookalikeSpec() {
  return lookalikeLineSpecs;
}

export const creativeIdeasLineSpecs = [
  {
    line_id: 'CI_E1_L2_apertura_web',
    name: 'Creative Ideas Email 1 - Apertura desde web',
    target_variable: 'HR-Industriales | Creative Ideas E1.1',
    structure: 'Empieza con: "Viendo vuestra web vi que {X}…" y termina con dos puntos.',
    rules: {
      max_words: 25,
      tone: 'natural y conversacional',
      ban: ['líder global', 'innovadoras', '®', '™', '©'],
      no_invention: true
    },
    instructions: [
      'Empieza con la estructura exacta "Viendo vuestra web vi que {X}".',
      '{X} es un resumen conciso de sectores o procesos clave detectados en Industrial Data (12–15 palabras).',
      'Usa lenguaje claro, sin corporativismos ni tecnicismos innecesarios.',
      'Alinea la frase con lo que ofrece nuestro cliente según el client_summary para que la transición hacia las ideas tenga sentido.',
      'Termina la frase con dos puntos finales para introducir la lista de ideas.',
      'Máximo 25 palabras en total.',
      'No inventes información que no esté en Industrial Data.'
    ],
    examples: [
      'Viendo vuestra web vi que fabricáis válvulas y skids para energía y petroquímica, con foco en soldadura TIG y calidad, y tengo un par de ideas:'
    ],
    depends_on: [
      'Industrial Data (dato del prospecto disponible en Genesy en tiempo de envío)',
      'client_profile.client_summary'
    ]
  },
  {
    line_id: 'CI_E1_L4_idea_1',
    name: 'Creative Ideas Email 1 - Idea #1',
    target_variable: 'HR-Industriales | Creative Ideas E1.2',
    structure: 'Una frase con una idea de formación aplicable al contexto del prospecto.',
    rules: {
      max_words: 18,
      tone: 'claro y práctico',
      use: ['offer', 'data_sources.industrial_data'],
      no_invention: true,
      style: 'sustantivos y verbos simples'
    },
    instructions: [
      'Redacta una sola frase (máximo 18 palabras).',
      'Propón una idea de formación interna que se pueda ejecutar con nuestra oferta actual.',
      'Menciona procesos concretos, productos o situaciones que aparezcan en Industrial Data.',
      'Asegúrate de que la idea sea algo que nuestro cliente pueda entregar según el client_summary.',
      'Usa lenguaje claro y directo; evita palabras vacías como "innovador" o "puntero".',
      'No inventes información.'
    ],
    examples: [
      'Contenidos audiovisuales paso a paso sobre soldadura TIG segura para operarios recién incorporados.',
      'Guías de onboarding para pruebas hidrostáticas y control de calidad en válvulas.'
    ],
    depends_on: [
      'client_profile.offer',
      'client_profile.client_summary',
      'Industrial Data (dato del prospecto disponible en Genesy en tiempo de envío)'
    ]
  },
  {
    line_id: 'CI_E1_L5_idea_2',
    name: 'Creative Ideas Email 1 - Idea #2',
    target_variable: 'HR-Industriales | Creative Ideas E1.3',
    structure: 'Una frase con una idea de formación aplicable al contexto del prospecto.',
    rules: {
      max_words: 18,
      tone: 'claro y práctico',
      use: ['offer', 'data_sources.industrial_data'],
      no_invention: true,
      style: 'sustantivos y verbos simples'
    },
    instructions: [
      'Redacta una sola frase (máximo 18 palabras).',
      'Propón una idea de formación interna distinta a la anterior.',
      'Menciona procesos concretos o retos detectados en Industrial Data.',
      'Confirma que la idea encaja con la oferta descrita en el client_summary.',
      'Usa lenguaje claro y directo; evita palabras vacías.',
      'No inventes información.'
    ],
    examples: [
      'Checklists de seguridad sobre purga y presurización de líneas de gases para técnicos en campo.',
      'Microlecciones móviles sobre mantenimiento preventivo en equipos de envasado alimentario.'
    ],
    depends_on: [
      'client_profile.offer',
      'client_profile.client_summary',
      'Industrial Data (dato del prospecto disponible en Genesy en tiempo de envío)'
    ]
  },
  {
    line_id: 'CI_E1_L6_idea_3',
    name: 'Creative Ideas Email 1 - Idea #3',
    target_variable: 'HR-Industriales | Creative Ideas E1.4',
    structure: 'Una frase con una idea de formación aplicable al contexto del prospecto.',
    rules: {
      max_words: 18,
      tone: 'claro y práctico',
      use: ['offer', 'data_sources.industrial_data'],
      no_invention: true,
      style: 'sustantivos y verbos simples'
    },
    instructions: [
      'Redacta una sola frase (máximo 18 palabras).',
      'Propón una idea complementaria a las anteriores para reforzar valor.',
      'Menciona procesos, normativas o equipos específicos detectados en Industrial Data.',
      'Alinea la propuesta con las capacidades descritas en el client_summary.',
      'Usa lenguaje claro y directo; evita palabras vacías.',
      'No inventes información.'
    ],
    examples: [
      'Sesiones interactivas sobre protocolos de seguridad ATEX para supervisores de planta.',
      'Simulaciones de respuesta a incidentes para técnicos de control de calidad.'
    ],
    depends_on: [
      'client_profile.offer',
      'client_profile.client_summary',
      'Industrial Data (dato del prospecto disponible en Genesy en tiempo de envío)'
    ]
  },
  {
    line_id: 'CI_E2_L2_comparacion_sector',
    name: 'Creative Ideas Email 2 - Comparación sectorial',
    target_variable: 'HR Industriales | E2',
    structure:
      'Empieza con: "He visto que os comparan con {Y} y me pregunté cómo estáis formando a vuestros equipos para diferenciaros de ellos".',
    rules: {
      max_words: 28,
      tone: 'natural',
      no_invention: true,
      fallback: 'Si no hay {Y}, usa una comparación genérica del sector (sin inventar marcas).' 
    },
    instructions: [
      'Empieza con la frase exacta indicada en la estructura, sustituyendo {Y} por un competidor citado en Industrial Data.',
      'Si no hay competidores citados, usa "otras marcas del sector" como {Y}.',
      'No inventes nombres propios que no estén en Industrial Data.',
      'Mantén la conexión con la propuesta de valor recogida en el client_summary.',
      'Mantén un tono natural y directo.',
      'Máximo 28 palabras.'
    ],
    examples: [
      'He visto que os comparan con Airgas y me pregunté cómo estáis formando a vuestros equipos para diferenciaros de ellos.'
    ],
    depends_on: [
      'Industrial Data (dato del prospecto disponible en Genesy en tiempo de envío)',
      'client_profile.client_summary'
    ]
  },
  {
    line_id: 'CI_E3_L2_routing_roles',
    name: 'Creative Ideas Email 3 - Routing por rol',
    target_variable: 'HR Industriales | E3',
    structure:
      'Frase que valida si la persona de {Simplified Job Title} es quien lleva los contenidos formativos internos.',
    rules: {
      max_words: 28,
      tone: 'respetuoso y directo',
      no_invention: true
    },
    instructions: [
      'Redacta una sola frase de 24 a 28 palabras.',
      'Opcional: menciona tamaño aproximado de la empresa si aparece en Industrial Data.',
      'Valida con respeto si la persona gestiona los contenidos formativos o si es mejor hablar con RRHH/L&D.',
      'Apóyate en la propuesta y el ICP descritos en el client_summary para justificar el contacto.',
      'No inventes datos.'
    ],
    examples: [
      'Sé que en {Simplified Company Name} sois alrededor de {Number of employees}; por tu rol en {Simplified Job Title}, ¿gestionas los contenidos formativos o sería mejor hablar con RRHH o L&D?'
    ],
    depends_on: [
      'client_profile.icp.buyer_roles',
      'client_profile.client_summary',
      'Industrial Data (dato del prospecto disponible en Genesy en tiempo de envío)'
    ]
  }
];

export function getCreativeIdeasSpec() {
  return creativeIdeasLineSpecs;
}

type Section = 'discovery' | 'profile' | 'prompts';

interface WorkspaceHeaderProps {
  onReset: () => void;
  onGeneratePrompts: () => void;
  isGeneratingPrompts: boolean;
  canGeneratePrompts: boolean;
  activeSection: Section;
  hasProfile: boolean;
  hasPrompts: boolean;
  campaignName?: string | null;
}

const breadcrumbLabels: Record<Section, string> = {
  discovery: 'Discovery',
  profile: 'Perfil',
  prompts: 'Prompts'
};

const order: Section[] = ['discovery', 'profile', 'prompts'];

export function WorkspaceHeader({
  onReset,
  onGeneratePrompts,
  isGeneratingPrompts,
  canGeneratePrompts,
  activeSection,
  hasProfile,
  hasPrompts,
  campaignName
}: WorkspaceHeaderProps) {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const campaignLabel = campaignName ? `${campaignName} · Campaign Design` : 'Campaign Design';

  return (
    <header className="dashboard-toolbar">
      <div style={{ display: 'grid', gap: '10px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem'
          }}
        >
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.28em' }}>Workflow</span>
          <div style={{ height: 14, width: 1, background: 'rgba(148,163,184,0.35)' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {order.map((item, idx) => (
              <span
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: item === activeSection ? 600 : 400,
                  color: item === activeSection ? 'var(--accent-primary)' : 'var(--text-muted)'
                }}
              >
                {breadcrumbLabels[item]}
                {idx < order.length - 1 && <span style={{ opacity: 0.45 }}>→</span>}
              </span>
            ))}
          </span>
        </div>

        <h1 className="dashboard-toolbar__title">{campaignLabel}</h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: 620 }}>
          Conecta las notas de discovery con los prompts dinámicos de Genesy. Revisa los datos críticos, valida el perfil y
          exporta el paquete seleccionado sin perder consistencia de tono ni estructura.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '12px', justifyItems: 'end' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
            fontSize: '0.82rem'
          }}
        >
          <span
            style={{
              padding: '6px 12px',
              borderRadius: '999px',
              border: '1px solid var(--surface-border)',
              background: 'rgba(226, 232, 240, 0.6)',
              color: 'var(--text-primary)',
            }}
          >
            Sesión activa · {timestamp}
          </span>
          <span style={{ opacity: 0.7 }}>Operador: Clarbi Ops</span>
        </div>

        <div className="dashboard-toolbar__actions">
          <button type="button" className="ghost-button" onClick={onReset}>
            Reiniciar workspace
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={onGeneratePrompts}
            disabled={!canGeneratePrompts || isGeneratingPrompts}
          >
            {isGeneratingPrompts ? 'Generando...' : hasPrompts ? 'Actualizar prompts' : 'Generar prompts'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span
            style={{
              padding: '6px 10px',
              borderRadius: '999px',
              border: '1px solid rgba(37, 99, 235, 0.22)',
              background: 'rgba(191, 219, 254, 0.35)',
              color: 'var(--accent-secondary)'
            }}
          >
            Perfil · {hasProfile ? 'Completo' : 'Pendiente'}
          </span>
          <span
            style={{
              padding: '6px 10px',
              borderRadius: '999px',
              border: '1px solid rgba(37, 99, 235, 0.18)',
              background: 'rgba(226, 232, 240, 0.65)',
              color: 'var(--accent-primary)'
            }}
          >
            Prompts · {hasPrompts ? 'Listos' : 'En preparación'}
          </span>
        </div>
      </div>
    </header>
  );
}

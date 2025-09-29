type Section = 'discovery' | 'profile' | 'prompts';

interface SidebarProps {
  hasProfile: boolean;
  hasPrompts: boolean;
  isLoadingProfile: boolean;
  isGeneratingPrompts: boolean;
  activeSection: Section;
  onNavigate: (section: Section) => void;
  campaignName?: string | null;
}

export function Sidebar({
  hasProfile,
  hasPrompts,
  isLoadingProfile,
  isGeneratingPrompts,
  activeSection,
  onNavigate,
  campaignName
}: SidebarProps) {
  const statusLabel = (() => {
    if (isLoadingProfile) return 'Procesando perfil';
    if (isGeneratingPrompts) return 'Generando prompts';
    if (hasPrompts) return campaignName ? `Paquete ${campaignName} listo` : 'Exporta a Genesy';
    return 'Listo para discovery';
  })();

  return (
    <aside className="dashboard-shell__sidebar">
      <div className="dashboard-brand">
        <span className="dashboard-brand__icon">C</span>
        <div className="dashboard-brand__text">
          <span>Clarbi</span>
          <small style={{ fontSize: '0.75rem', opacity: 0.75 }}>Prospect workspace</small>
        </div>
      </div>

      <nav className="dashboard-nav" aria-label="Workspace navigation">
        <div className="dashboard-nav__title">Secciones</div>
        <button
          type="button"
          className={activeSection === 'discovery' ? 'is-active' : ''}
          onClick={() => onNavigate('discovery')}
        >
          🗂️ Discovery Transcript
        </button>
        <button
          type="button"
          className={activeSection === 'profile' ? 'is-active' : ''}
          onClick={() => onNavigate('profile')}
        >
          🧭 Perfil Clarbi
        </button>
        <button
          type="button"
          className={activeSection === 'prompts' ? 'is-active' : ''}
          onClick={() => onNavigate('prompts')}
        >
          ✉️ Paquete {campaignName ?? 'de prompts'}
        </button>
      </nav>

      <div className="dashboard-nav" aria-label="Pipeline status" style={{ marginTop: 'auto' }}>
        <div className="dashboard-nav__title">Estado</div>
        <button type="button">
          {hasProfile ? '✅ Perfil generado' : '○ Perfil pendiente'}
        </button>
        <button type="button">
          {hasPrompts ? '✅ Prompts listos' : '○ Prompts pendientes'}
        </button>
        <button type="button">
          {statusLabel}
        </button>
      </div>
    </aside>
  );
}

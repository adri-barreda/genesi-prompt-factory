'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader';
import { WorkspacePanel } from '@/components/layout/WorkspacePanel';
import {
  Campaign,
  ClientProfile,
  PromptPackage,
  ReverseEngineeringResponse,
  ReverseVariable
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<'workspace' | 'reverse' | null>(null);
  const [transcript, setTranscript] = useState('');
  const [clientName, setClientName] = useState('');
  const [website, setWebsite] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [promptPackagesByCampaign, setPromptPackagesByCampaign] = useState<Record<string, PromptPackage>>({});
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'discovery' | 'profile' | 'prompts'>('discovery');
  const [reverseEmail, setReverseEmail] = useState('');
  const [reverseResults, setReverseResults] = useState<ReverseEngineeringResponse | null>(null);
  const [isAnalyzingEmail, setIsAnalyzingEmail] = useState(false);
  const [reverseError, setReverseError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCampaigns = async () => {
      setIsLoadingCampaigns(true);
      try {
        const response = await fetch(`${API_BASE_URL}/campaigns`);
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || 'No se pudieron cargar las campañas');
        }

        const data = await response.json();
        if (cancelled) return;

        const campaignList: Campaign[] = Array.isArray(data?.campaigns) ? data.campaigns : [];
        setCampaigns(campaignList);
        setSelectedCampaignId((prev) => prev ?? (campaignList[0]?.id ?? null));
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Error al cargar las campañas disponibles.';
        setError((prev) => prev ?? message);
      } finally {
        if (!cancelled) {
          setIsLoadingCampaigns(false);
        }
      }
    };

    loadCampaigns();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCampaign = useMemo(() => {
    return campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? null;
  }, [campaigns, selectedCampaignId]);

  const promptPackage = selectedCampaignId
    ? promptPackagesByCampaign[selectedCampaignId] ?? null
    : null;

  const handleSelectMode = (mode: 'workspace' | 'reverse') => {
    setActiveMode(mode);
    setError(null);
    setReverseError(null);
  };

  const handleReturnToSelector = () => {
    setActiveMode(null);
    setError(null);
    setReverseError(null);
  };

  const handleCreateProfile = async () => {
    setError(null);
    setPromptPackagesByCampaign({});

    if (!transcript || transcript.trim().length < 10) {
      setError('Añade la transcripción completa (mínimo 10 caracteres).');
      return;
    }

    setIsLoadingProfile(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcript,
          client_name: clientName || undefined,
          website: website || undefined,
          notes: notes || undefined
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Error al crear el perfil');
      }

      const data = await response.json();
      setProfileId(data.profile_id);
      setClientProfile(data.client_profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al crear el perfil');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleGeneratePrompts = async () => {
    setError(null);
    if (!profileId) {
      setError('Primero crea y guarda el perfil del cliente.');
      return;
    }

    if (!selectedCampaignId) {
      setError('Selecciona una campaña para generar los prompts.');
      return;
    }

    setIsGeneratingPrompts(true);

    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${selectedCampaignId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile_id: profileId })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Error al generar los prompts');
      }

      const data = await response.json();
      setPromptPackagesByCampaign((prev) => ({
        ...prev,
        [selectedCampaignId]: data.prompt_package
      }));
      setActiveSection('prompts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al generar los prompts');
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  const handleResetWorkspace = () => {
    setTranscript('');
    setClientName('');
    setWebsite('');
    setNotes('');
    setClientProfile(null);
    setPromptPackagesByCampaign({});
    setProfileId(null);
    setActiveSection('discovery');
  };

  const handleNavigate = (section: 'discovery' | 'profile' | 'prompts') => {
    const anchors: Record<typeof section, string> = {
      discovery: 'discovery-card',
      profile: 'profile-card',
      prompts: 'prompt-card'
    };

    const target = document.getElementById(anchors[section]);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setActiveSection(section);
  };

  const handleAnalyzeEmail = async () => {
    setReverseError(null);

    if (!reverseEmail || reverseEmail.trim().length < 10) {
      setReverseError('Pega el email completo (mínimo 10 caracteres).');
      return;
    }

    setIsAnalyzingEmail(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reverse-engineering/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_body: reverseEmail,
          language: clientProfile?.constraints.language ?? 'es-ES'
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || 'Error al analizar el email');
      }

      const data: ReverseEngineeringResponse = await response.json();
      setReverseResults(data);
    } catch (err) {
      setReverseResults(null);
      setReverseError(err instanceof Error ? err.message : 'Error desconocido al analizar el email');
    } finally {
      setIsAnalyzingEmail(false);
    }
  };

  const transcriptWords = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const valuePropsCount = clientProfile?.value_props.length ?? 0;
  const buyerRolesCount = clientProfile?.icp.buyer_roles.length ?? 0;
  const promptCount = promptPackage?.prompts.length ?? 0;
  const generateActionLabel = selectedCampaign ? `Generar prompts ${selectedCampaign.name}` : 'Selecciona una campaña';

  const copyPromptPackageToClipboard = () => {
    if (!promptPackage) return;
    navigator.clipboard
      .writeText(JSON.stringify(promptPackage, null, 2))
      .catch(() => setError('No se pudo copiar el JSON al portapapeles.'));
  };

  if (!activeMode) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 16px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <section 
          className="canvas-card" 
          style={{ 
            maxWidth: 760, 
            width: '100%', 
            display: 'grid', 
            gap: 32,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1
          }}
        >
          <header style={{ display: 'grid', gap: 12, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              margin: '0 auto 8px'
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                ✨
              </div>
            </div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              ¿Cómo quieres trabajar hoy?
            </h1>
            <p style={{ 
              margin: '0 auto', 
              color: 'var(--text-muted)', 
              maxWidth: 600,
              fontSize: '1.05rem',
              lineHeight: 1.6
            }}>
              Elige entre diseñar campañas completas con Clarbi o hacer ingeniería inversa de un email para construir prompts reutilizables en Genesy.
            </p>
          </header>

          <div style={{ display: 'grid', gap: 16 }}>
            <button
              type="button"
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '28px 32px',
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => handleSelectMode('workspace')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
              }}
            >
              <span style={{ textAlign: 'left', flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '1.25rem', marginBottom: '6px' }}>
                  🚀 Workspace de campañas
                </strong>
                <small style={{ display: 'block', opacity: 0.95, fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Genera el perfil del cliente, valida el caso de éxito y obtén los prompts para Lookalike o Creative Ideas
                </small>
              </span>
              <span 
                style={{ 
                  fontSize: '1.5rem',
                  marginLeft: '16px',
                  transition: 'transform 0.3s ease'
                }}
                aria-hidden
              >
                →
              </span>
            </button>

            <button
              type="button"
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '28px 32px',
                fontSize: '1.05rem',
                background: 'white',
                color: '#1a202c',
                borderRadius: '16px',
                border: '2px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onClick={() => handleSelectMode('reverse')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
              }}
            >
              <span style={{ textAlign: 'left', flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '1.25rem', marginBottom: '6px' }}>
                  🔄 Ingeniería inversa de email
                </strong>
                <small style={{ display: 'block', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Analiza un email existente y convierte sus variables en prompts con instrucciones claras y ejemplos
                </small>
              </span>
              <span 
                style={{ 
                  fontSize: '1.5rem',
                  marginLeft: '16px',
                  transition: 'transform 0.3s ease',
                  color: '#667eea'
                }}
                aria-hidden
              >
                →
              </span>
            </button>
          </div>

          <footer style={{ 
            textAlign: 'center', 
            paddingTop: '8px',
            borderTop: '1px solid #e2e8f0',
            marginTop: '8px'
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '0.85rem', 
              color: '#94a3b8'
            }}>
              Potenciado por OpenAI GPT-4 • ClarBI v0.1.0
            </p>
          </footer>
        </section>
      </main>
    );
  }

  if (activeMode === 'reverse') {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--surface-muted, #f8fafc)',
          padding: '40px 16px'
        }}
      >
        <section
          className="canvas-card"
          style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 24 }}
        >
          <header style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <button type="button" className="ghost-button" onClick={handleReturnToSelector}>
                ← Cambiar de módulo
              </button>
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.28em', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Reverse Prompt Builder
              </span>
              <h1 style={{ margin: 0 }}>Ingeniería inversa del email</h1>
              <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: 640 }}>
                Pega el texto del email que quieras desglosar. Clarbi detectará las variables dinámicas y te devolverá
                instrucciones listas para convertirlas en prompts reutilizables.
              </p>
            </div>
            <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
              <span
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: '1px solid var(--surface-border)',
                  background: 'rgba(226,232,240,0.6)',
                  color: 'var(--text-primary)',
                  fontSize: '0.82rem'
                }}
              >
                {isAnalyzingEmail ? 'Analizando email…' : reverseResults ? 'Resultados disponibles' : 'Pendiente de análisis'}
              </span>
              <button type="button" className="ghost-button" onClick={() => {
                setReverseEmail('');
                setReverseResults(null);
                setReverseError(null);
              }}>
                Limpiar email
              </button>
            </div>
          </header>

          <div className="canvas-form-grid">
            <div className="canvas-field">
              <label>Email base *</label>
              <textarea
                className="canvas-textarea"
                rows={12}
                value={reverseEmail}
                onChange={(event) => setReverseEmail(event.target.value)}
                placeholder="Pega aquí el email con variables entre llaves {así}"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              className="primary-button"
              type="button"
              onClick={handleAnalyzeEmail}
              disabled={isAnalyzingEmail}
            >
              {isAnalyzingEmail ? 'Analizando...' : 'Generar instrucciones'}
            </button>
          </div>

          {(reverseError || error) && (
            <div className="error-banner" role="alert">
              {reverseError || error}
            </div>
          )}

          {reverseResults && reverseResults.data?.variables ? (
            reverseResults.data.variables.length ? (
              <div className="canvas-prompts-grid">
                {reverseResults.data.variables.map((variable: ReverseVariable) => (
                  <article className="canvas-prompt-card" key={variable.variable_name}>
                    <header>
                      <div>
                        <div className="canvas-prompt-card__tag">{variable.placeholder}</div>
                        <h3 style={{ margin: '6px 0 4px 0' }}>{variable.variable_name.replace(/_/g, ' ')}</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)' }}>{variable.goal}</p>
                      </div>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() =>
                          navigator.clipboard
                            .writeText(variable.prompt_text)
                            .catch(() => setReverseError('No se pudo copiar las instrucciones.'))
                        }
                      >
                        Copiar instrucciones
                      </button>
                    </header>
                    <div style={{ marginBottom: 12 }}>
                      <small style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Fragmento original</small>
                      <p style={{ margin: '4px 0 0 0', color: 'var(--text-primary)' }}>{variable.source_snippet}</p>
                    </div>
                    <pre>{variable.prompt_text}</pre>
                    {variable.sample_outputs.length ? (
                      <div style={{ marginTop: 12 }}>
                        <small style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Ejemplos</small>
                        <ul style={{ margin: '6px 0 0 16px', padding: 0, color: 'var(--text-primary)' }}>
                          {variable.sample_outputs.map((sample, index) => (
                            <li key={index}>{sample}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="canvas-card__subtitle" style={{ margin: 0 }}>
                No se detectaron variables dinámicas. Revisa que el email contenga marcadores con llaves, por ejemplo {`{variable}`}.
              </p>
            )
          ) : (
            <p className="canvas-card__subtitle" style={{ margin: 0 }}>
              Genera las instrucciones para ver aquí las variables detectadas y los prompts recomendados.
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard-shell">
      <Sidebar
        hasProfile={Boolean(clientProfile)}
        hasPrompts={Boolean(promptPackage)}
        isLoadingProfile={isLoadingProfile}
        isGeneratingPrompts={isGeneratingPrompts}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        campaignName={selectedCampaign?.name ?? null}
      />

      <div className="dashboard-shell__content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button type="button" className="ghost-button" onClick={handleReturnToSelector}>
            Cambiar de módulo
          </button>
        </div>
        <WorkspaceHeader
          onReset={handleResetWorkspace}
          onGeneratePrompts={handleGeneratePrompts}
          isGeneratingPrompts={isGeneratingPrompts}
          canGeneratePrompts={Boolean(clientProfile) && Boolean(selectedCampaignId)}
          activeSection={activeSection}
          hasProfile={Boolean(clientProfile)}
          hasPrompts={Boolean(promptPackage)}
          campaignName={selectedCampaign?.name ?? null}
        />

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        <div className="dashboard-grid">
          <WorkspacePanel
            id="discovery-card"
            title="Discovery Transcript"
            subtitle="Pega la transcripción completa de la reunión y comparte notas clave. Clarbi extraerá el perfil canónico y el resumen extendido del cliente."
            stepLabel="Paso 1"
            stepColor="pink"
          >
            <div className="canvas-metrics">
              <div className="canvas-metric">
                <strong>Transcripción</strong>
                <span>{transcriptWords ? `${transcriptWords} palabras` : 'Pendiente de pegar'}</span>
              </div>
              <div className="canvas-metric">
                <strong>Notas internas</strong>
                <span>{notes.trim() ? 'Personalizadas' : 'Sin completar'}</span>
              </div>
              <div className="canvas-metric">
                <strong>Cliente</strong>
                <span>{clientName.trim() ? clientName : 'Sin asignar'}</span>
              </div>
            </div>

            <div className="dashboard-columns">
              <div className="canvas-form-grid">
                <div className="canvas-field">
                  <label>Transcripción completa *</label>
                  <textarea
                    className="canvas-textarea"
                    rows={12}
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder="Pega aquí la conversación con el cliente..."
                  />
                </div>

                <div className="canvas-form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                  <div className="canvas-field">
                    <label>Nombre del cliente</label>
                    <input
                      className="canvas-input"
                      value={clientName}
                      onChange={(event) => setClientName(event.target.value)}
                      placeholder="Ej. Código Media"
                    />
                  </div>
                  <div className="canvas-field">
                    <label>Sitio web</label>
                    <input
                      className="canvas-input"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="canvas-field">
                    <label>Notas internas</label>
                    <input
                      className="canvas-input"
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Restricciones, tono, riesgos, etc."
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button className="ghost-button" type="button" onClick={handleResetWorkspace}>
                    Limpiar todo
                  </button>
                  <button className="primary-button" type="button" onClick={handleCreateProfile} disabled={isLoadingProfile}>
                    {isLoadingProfile ? 'Procesando...' : 'Generar perfil Clarbi'}
                  </button>
                </div>
              </div>

              <aside className="canvas-sidebar-card">
                <h3 className="canvas-sidebar-card__title">Checklist de discovery</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  Guion sugerido para cubrir todos los datos que Clarbi necesita antes de generar prompts.
                </p>
                <ul className="canvas-checklist">
                  <li>
                    Caso de éxito
                    <ul className="canvas-checklist__nested">
                      <li>Nombre del caso de éxito.</li>
                      <li>Industria del caso de éxito.</li>
                      <li>Tamaño de empresa.</li>
                      <li>Empresas similares.</li>
                    </ul>
                  </li>
                  <li>
                    Problema resuelto del caso de éxito o cómo lo han ayudado
                    <ul className="canvas-checklist__nested">
                      <li>Cómo resolvieron el problema o cómo los ayudaron.</li>
                      <li>Fases de cómo resolvieron ese problema o cómo dieron esa ayuda.</li>
                    </ul>
                  </li>
                  <li>
                    Resultados conseguidos
                    <ul className="canvas-checklist__nested">
                      <li>Generales.</li>
                      <li>Numéricos (importantes).</li>
                    </ul>
                  </li>
                  <li>Buyer persona.</li>
                </ul>
              </aside>
            </div>
          </WorkspacePanel>

          <WorkspacePanel
            id="profile-card"
            title="Perfil Clarbi"
            subtitle="Revisa el perfil canónico. Ajusta si detectas matices adicionales antes de generar los prompts."
            stepLabel="Paso 2"
            stepColor="blue"
          >
            <div className="canvas-metrics">
              <div className="canvas-metric">
                <strong>Value props</strong>
                <span>{valuePropsCount ? `${valuePropsCount} detectadas` : 'Detectando...'}</span>
              </div>
              <div className="canvas-metric">
                <strong>Buyer roles</strong>
                <span>{buyerRolesCount ? `${buyerRolesCount} roles` : 'Sin mapear'}</span>
              </div>
              <div className="canvas-metric">
                <strong>Proof points</strong>
                <span>{clientProfile?.proof_points.length ? `${clientProfile.proof_points.length} activos` : 'Añadir referencias'}</span>
              </div>
            </div>

            {clientProfile ? (
              <div className="canvas-form-grid">
                <div className="canvas-summary-grid">
                  <div className="canvas-summary-tile">
                    <strong>Oferta</strong>
                    <span>{clientProfile.offer || '—'}</span>
                  </div>
                  <div className="canvas-summary-tile">
                    <strong>Tono</strong>
                    <span>{clientProfile.constraints.tone}</span>
                  </div>
                  <div className="canvas-summary-tile">
                    <strong>Idioma</strong>
                    <span>{clientProfile.constraints.language}</span>
                  </div>
                </div>

                <div className="canvas-chip-row">
                  {clientProfile.value_props.length ? (
                    clientProfile.value_props.map((prop) => (
                      <span key={prop} className="canvas-chip">
                        {prop}
                      </span>
                    ))
                  ) : (
                  <span style={{ color: 'var(--text-muted)' }}>Sin value props detectadas</span>
                  )}
                </div>

                <div className="canvas-summary-grid">
                  <div className="canvas-card__subtitle" style={{ margin: 0 }}>
                    <strong>Company types:</strong>{' '}
                    {clientProfile.icp.company_types.length ? clientProfile.icp.company_types.join(', ') : '—'}
                  </div>
                  <div className="canvas-card__subtitle" style={{ margin: 0 }}>
                    <strong>Buyer roles:</strong>{' '}
                    {clientProfile.icp.buyer_roles.length ? clientProfile.icp.buyer_roles.join(', ') : '—'}
                  </div>
                </div>

                <div className="canvas-card__subtitle" style={{ whiteSpace: 'pre-line' }}>
                  <strong>Proof points:</strong>{' '}
                  {clientProfile.proof_points.length ? clientProfile.proof_points.join('\n') : '—'}
                </div>

                <div className="canvas-card__subtitle" style={{ whiteSpace: 'pre-line', color: 'var(--text-primary)' }}>
                  <strong>Resumen extendido del cliente</strong>
                  <br />
                  {clientProfile.client_summary || '—'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={handleGeneratePrompts}
                    disabled={isGeneratingPrompts || !selectedCampaignId}
                  >
                    {isGeneratingPrompts ? 'Generando...' : generateActionLabel}
                  </button>
                </div>
              </div>
            ) : (
              <p className="canvas-card__subtitle" style={{ margin: 0 }}>
                Genera primero el perfil desde el paso anterior. Aquí aparecerá la oferta, value props, ICP, pruebas y el
                resumen extendido.
              </p>
            )}
          </WorkspacePanel>

          <WorkspacePanel
            id="prompt-card"
            title="Prompts listos para Genesy"
            subtitle="Copia cada prompt individual o descarga el JSON completo para cargarlo en tu espacio de Genesy."
          stepLabel="Paso 3"
          stepColor="green"
          headerActions={
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, alignItems: 'flex-end' }}>
              <label style={{ display: 'grid', gap: 6, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                  Campaña activa
                </span>
                <select
                  value={selectedCampaignId ?? ''}
                  onChange={(event) => {
                    const value = event.target.value || null;
                    setSelectedCampaignId(value);
                    setError(null);
                  }}
                  disabled={isGeneratingPrompts || isLoadingCampaigns}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--surface-border)',
                    background: '#fff',
                    fontSize: '0.95rem',
                    cursor: isGeneratingPrompts || isLoadingCampaigns ? 'not-allowed' : 'pointer',
                  }}
                >
                  {campaigns.length === 0 ? (
                    <option value="">Sin campañas disponibles</option>
                  ) : null}
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </label>

              {promptPackage ? (
                <button className="ghost-button" type="button" onClick={copyPromptPackageToClipboard}>
                  Copiar JSON completo
                </button>
              ) : null}
            </div>
          }
          >
            <div className="canvas-metrics">
              <div className="canvas-metric">
                <strong>Prompts generados</strong>
                <span>
                  {promptCount
                    ? `${promptCount} líneas`
                    : !clientProfile
                    ? 'A la espera de perfil'
                    : selectedCampaignId
                    ? 'Genera la campaña seleccionada'
                    : 'Selecciona campaña'}
                </span>
              </div>
              <div className="canvas-metric">
                <strong>Campaña</strong>
                <span>
                  {isLoadingCampaigns
                    ? 'Cargando campañas...'
                    : promptPackage?.campaign ?? selectedCampaign?.name ?? 'Sin campaña seleccionada'}
                </span>
              </div>
              <div className="canvas-metric">
                <strong>Última acción</strong>
                <span>
                  {isGeneratingPrompts
                    ? 'Generando prompts...'
                    : promptPackage
                    ? 'Paquete listo para exportar'
                    : 'Pendiente de ejecución'}
                </span>
              </div>
            </div>

            {promptPackage ? (
              <div className="canvas-prompts-grid">
                {promptPackage.prompts.map((prompt) => (
                  <article className="canvas-prompt-card" key={prompt.id}>
                    <header>
                      <div>
                        <div className="canvas-prompt-card__tag">{prompt.target_variable}</div>
                        <h3 style={{ margin: '6px 0 0 0' }}>{prompt.name}</h3>
                      </div>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() =>
                          navigator.clipboard
                            .writeText(prompt.prompt_text)
                            .catch(() => setError(`No se pudo copiar el prompt ${prompt.id}.`))
                        }
                      >
                        Copiar prompt
                      </button>
                    </header>
                    <pre>{prompt.prompt_text}</pre>
                    {prompt.depends_on.length ? (
                      <small style={{ color: 'var(--text-muted)' }}>
                        Dependencias: {prompt.depends_on.join(', ')}
                      </small>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="canvas-card__subtitle" style={{ margin: 0 }}>
                Una vez valides el perfil Clarbi, pulsa “{generateActionLabel}” para ver aquí las instrucciones
                listas para Genesy.
              </p>
            )}
          </WorkspacePanel>
        </div>
      </div>
    </div>
  );
}

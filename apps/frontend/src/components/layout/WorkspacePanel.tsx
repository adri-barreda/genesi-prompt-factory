import { CSSProperties, ReactNode } from 'react';

interface WorkspacePanelProps {
  id: string;
  title: string;
  subtitle: string;
  stepLabel: string;
  stepColor?: 'pink' | 'blue' | 'green';
  headerActions?: ReactNode;
  children: ReactNode;
}

const STEP_STYLE: Record<NonNullable<WorkspacePanelProps['stepColor']>, CSSProperties> = {
  pink: {
    background: 'rgba(17, 24, 39, 0.08)',
    borderColor: 'transparent',
    color: '#111827'
  },
  blue: {
    background: 'rgba(31, 41, 55, 0.1)',
    borderColor: 'transparent',
    color: '#111827'
  },
  green: {
    background: 'rgba(55, 65, 81, 0.12)',
    borderColor: 'transparent',
    color: '#0f172a'
  }
};

export function WorkspacePanel({
  id,
  title,
  subtitle,
  stepLabel,
  stepColor = 'blue',
  headerActions,
  children
}: WorkspacePanelProps) {
  return (
    <section className="canvas-card" id={id} aria-labelledby={`${id}-title`}>
      <div className="canvas-card__header">
        <div>
          <h2 className="canvas-card__title" id={`${id}-title`}>
            {title}
          </h2>
          <p className="canvas-card__subtitle">{subtitle}</p>
        </div>
        <span className="canvas-chip" style={STEP_STYLE[stepColor]}>
          {stepLabel}
        </span>
      </div>
      {headerActions && <div className="canvas-panel-actions">{headerActions}</div>}
      {children}
    </section>
  );
}

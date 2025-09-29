interface HeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export function Header({ title, subtitle, className = '' }: HeaderProps) {
  return (
    <header className={`space-y-4 ${className}`}>
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
        {title}
      </h1>
      <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-4xl">
        {subtitle}
      </p>
    </header>
  );
}
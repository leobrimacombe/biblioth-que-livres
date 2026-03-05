"use client";

import { useRef, MouseEvent } from 'react';
import Link from 'next/link';

interface InkButtonProps {
  href?: string;
  onClick?: (e: any) => void;
  children: React.ReactNode;
  isDark?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function InkButton({ 
  href, 
  onClick, 
  children, 
  isDark = false, 
  className = "", 
  type = "button",
  disabled = false 
}: InkButtonProps) {
  const buttonRef = useRef<any>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!buttonRef.current || disabled) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    buttonRef.current.style.setProperty('--x', `${x}px`);
    buttonRef.current.style.setProperty('--y', `${y}px`);
  };

  // Les classes de base (Brutalisme + animations)
  const baseClasses = `relative overflow-hidden paper-card transition-all duration-300 group block sm:inline-block ${
    disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
  } ${isDark ? 'bg-stone-900 text-[#F4F3EE]' : 'bg-[#FAFAFA] text-stone-900'} ${className}`;

  // Le cercle d'encre
  const inkCircle = (
    <span 
      className={`absolute block rounded-full pointer-events-none z-0 transition-transform duration-[600ms] ease-out -translate-x-1/2 -translate-y-1/2 scale-0 ${
        disabled ? '' : 'group-hover:scale-100'
      } ${isDark ? 'bg-[#FAFAFA]' : 'bg-stone-900'}`}
      style={{ left: 'var(--x, 50%)', top: 'var(--y, 50%)', width: '250%', paddingTop: '250%' }}
    ></span>
  );

  // Le contenu (texte + icônes potentiels)
  const content = (
    <span className={`relative z-10 flex items-center justify-center gap-2 transition-colors duration-[400ms] ${
      disabled ? '' : (isDark ? 'group-hover:text-stone-900' : 'group-hover:text-[#F4F3EE]')
    }`}>
      {children}
    </span>
  );

  // Si c'est un lien
  if (href) {
    return (
      <Link href={href} ref={buttonRef} onMouseMove={handleMouseMove} className={baseClasses}>
        {inkCircle}
        {content}
      </Link>
    );
  }

  // Si c'est un bouton d'action ou de formulaire
  return (
    <button type={type} onClick={onClick} disabled={disabled} ref={buttonRef} onMouseMove={handleMouseMove} className={baseClasses}>
      {inkCircle}
      {content}
    </button>
  );
}
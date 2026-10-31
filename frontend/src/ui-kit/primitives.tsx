import React, { useState, useRef, useEffect } from 'react';
import type {
  BaseButtonProps,
  InputProps,
  CardProps,
  ModalProps,
  DropdownProps,
  TooltipProps,
  BadgeProps,
  AvatarProps,
  SwitchProps,
} from './types';

/* ============================================================
   1. BUTTON PRIMITIVE
   ============================================================ */
export const Button: React.FC<BaseButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white shadow-sm hover:shadow-cyan-500/20',
    secondary:
      'bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600',
    ghost:
      'bg-transparent hover:bg-slate-800/60 active:bg-slate-800 text-slate-300 hover:text-white',
    danger:
      'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm hover:shadow-rose-500/20',
    accent:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-md',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};

/* ============================================================
   2. INPUT PRIMITIVE
   ============================================================ */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-slate-500 pointer-events-none flex items-center">{icon}</span>}
        <input
          id={inputId}
          className={`w-full bg-slate-900 border ${
            error ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500'
          } rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:ring-1 focus:ring-cyan-500/30 ${
            icon ? 'pl-9' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};

/* ============================================================
   3. CARD PRIMITIVE
   ============================================================ */
export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-xl p-5 shadow-xl transition-all ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

/* ============================================================
   4. BADGE PRIMITIVE
   ============================================================ */
export const Badge: React.FC<BadgeProps> = ({ children, color = 'cyan', size = 'sm' }) => {
  const colorMap = {
    cyan: 'bg-cyan-950/60 border-cyan-800/80 text-cyan-400',
    purple: 'bg-purple-950/60 border-purple-800/80 text-purple-400',
    green: 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400',
    amber: 'bg-amber-950/60 border-amber-800/80 text-amber-400',
    rose: 'bg-rose-950/60 border-rose-800/80 text-rose-400',
    slate: 'bg-slate-800/60 border-slate-700 text-slate-300',
  }[color];

  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center rounded-md font-mono font-medium border ${sizeStyle} ${colorMap}`}>
      {children}
    </span>
  );
};

/* ============================================================
   5. SWITCH PRIMITIVE
   ============================================================ */
export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled = false }) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ${
          checked ? 'bg-cyan-500' : 'bg-slate-800'
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
      {label && <span className="text-xs font-medium text-slate-300">{label}</span>}
    </label>
  );
};

/* ============================================================
   6. AVATAR PRIMITIVE
   ============================================================ */
export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', status }) => {
  const sizeMap = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }[size];

  const statusMap = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-slate-500',
  };

  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="relative inline-block select-none">
      {src ? (
        <img src={src} alt={name} className={`${sizeMap} rounded-full object-cover border border-slate-700`} />
      ) : (
        <div
          className={`${sizeMap} rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-sm`}
        >
          {initial}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-950 ${statusMap[status]}`}
        />
      )}
    </div>
  );
};

/* ============================================================
   7. MODAL PRIMITIVE
   ============================================================ */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 rounded p-1 hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 text-sm text-slate-300">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

/* ============================================================
   8. DROPDOWN PRIMITIVE
   ============================================================ */
export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'left' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 z-50 backdrop-blur-md`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              disabled={item.disabled}
              onClick={() => {
                item.onClick?.();
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-800 transition-colors ${
                item.danger ? 'text-rose-400 hover:bg-rose-950/30' : 'text-slate-200'
              } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {item.icon && <span className="text-slate-400">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   9. TOOLTIP PRIMITIVE
   ============================================================ */
export const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
  const [visible, setVisible] = useState(false);

  const posStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  }[position];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className={`absolute ${posStyles} z-50 px-2 py-1 bg-slate-900 border border-slate-700 text-slate-100 text-[11px] rounded shadow-lg whitespace-nowrap pointer-events-none transition-opacity`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

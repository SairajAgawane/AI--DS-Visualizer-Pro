import React from 'react';

/* ============================================================
   UI-KIT / TYPES.TS
   Comprehensive TypeScript types for themes, component props,
   workbench state, copilot sessions, and visualizer nodes.
   ============================================================ */

export type ComponentVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
export type ComponentSize = 'sm' | 'md' | 'lg';
export type ThemeMode = 'dark' | 'light' | 'system';

export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ComponentVariant;
  size?: ComponentSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export interface BadgeProps {
  children: React.ReactNode;
  color?: 'cyan' | 'purple' | 'green' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md';
}

export interface AvatarProps {
  name: string;
  src?: string;
  size?: ComponentSize;
  status?: 'online' | 'busy' | 'offline';
}

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  active?: boolean;
  onClick?: () => void;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  codeSnippet?: string;
}

export interface VisualizationNode {
  id: string;
  label: string;
  value: string | number;
  status?: 'idle' | 'active' | 'comparing' | 'sorted' | 'visited';
  position?: { x: number; y: number };
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  codeSnippet?: string;
  hint?: string;
  completed?: boolean;
}

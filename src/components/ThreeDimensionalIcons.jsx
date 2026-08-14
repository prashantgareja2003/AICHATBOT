import React from 'react';
import {
  Database,
  Receipt,
  Code,
  Bug,
  FileCode,
  Wrench,
  Terminal,
  Zap,
  Moon,
  Sun,
  Trash2,
  Paperclip,
  Mic,
  Send,
  Sparkles
} from 'lucide-react';

/**
 * Vibrant 3D Colorful SVG Icon Badges with Multi-Layer Gradient & Depth Shadows
 */
export const ThreeDIconBadge = ({ icon: Icon, gradient, shadowColor, size = 20, badgeSize = 42, className = '' }) => {
  return (
    <div
      className={`threed-badge ${className}`}
      style={{
        width: `${badgeSize}px`,
        height: `${badgeSize}px`,
        borderRadius: '12px',
        background: gradient || 'linear-gradient(135deg, #FF5F1F 0%, #FF8C42 100%)',
        boxShadow: `0 6px 16px ${shadowColor || 'rgba(255, 95, 31, 0.4)'}, inset 0 1.5px 2px rgba(255, 255, 255, 0.4), inset 0 -2px 4px rgba(0, 0, 0, 0.25)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        flexShrink: 0,
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
        position: 'relative'
      }}
    >
      <Icon size={size} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
    </div>
  );
};

export const PRESET_3D_CONFIGS = {
  sql: {
    icon: Database,
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.45)'
  },
  invoice: {
    icon: Receipt,
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    shadowColor: 'rgba(139, 92, 246, 0.45)'
  },
  'code-gen': {
    icon: Code,
    gradient: 'linear-gradient(135deg, #FF5F1F 0%, #D97706 100%)',
    shadowColor: 'rgba(255, 95, 31, 0.45)'
  },
  'bug-detector': {
    icon: Bug,
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    shadowColor: 'rgba(239, 68, 68, 0.45)'
  },
  'sp-gen': {
    icon: FileCode,
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    shadowColor: 'rgba(59, 130, 246, 0.45)'
  },
  'json-regex': {
    icon: Wrench,
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
    shadowColor: 'rgba(245, 158, 11, 0.45)'
  },
  'error-log': {
    icon: Terminal,
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
    shadowColor: 'rgba(99, 102, 241, 0.45)'
  }
};

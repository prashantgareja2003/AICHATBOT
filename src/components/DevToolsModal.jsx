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
  X
} from 'lucide-react';
import { ThreeDIconBadge, PRESET_3D_CONFIGS } from './ThreeDimensionalIcons';

export const DEV_PRESETS = [
  {
    id: 'sql',
    name: 'Natural Language → SQL',
    shortLabel: 'NL → SQL',
    desc: 'Translates plain text into runnable SQL queries (SELECT, JOIN, WHERE, GROUP BY)',
    promptPrefix: 'Translate the following query into clean, formatted SQL code:'
  },
  {
    id: 'invoice',
    name: 'Invoice / Receipt OCR',
    shortLabel: 'Invoice OCR',
    desc: 'Extract Invoice #, Vendor Name, GST/Tax ID, Date, Amount, and Line Items',
    promptPrefix: 'Extract structured Invoice Details (Invoice #, Vendor, GST, Date, Amount, Items) from:'
  },
  {
    id: 'code-gen',
    name: 'Code & API Generator',
    shortLabel: 'Code Gen',
    desc: 'Generates clean functions, REST API endpoints, and boilerplate code',
    promptPrefix: 'Generate clean, production-ready code with comments for:'
  },
  {
    id: 'bug-detector',
    name: 'Bug Detection & Optimizer',
    shortLabel: 'Bug Fixer',
    desc: 'Detects memory leaks, async bugs, and provides refactored code',
    promptPrefix: 'Analyze for bugs, memory leaks, and provide refactored optimized code for:'
  },
  {
    id: 'sp-gen',
    name: 'Stored Procedure Generator',
    shortLabel: 'Stored Proc',
    desc: 'Creates MySQL/SQL Server stored procedures and views',
    promptPrefix: 'Write a database Stored Procedure for:'
  },
  {
    id: 'json-regex',
    name: 'JSON Formatter & Regex',
    shortLabel: 'JSON / Regex',
    desc: 'Generates Regex patterns, schema validations, and formats JSON payloads',
    promptPrefix: 'Generate regex validation patterns and JSON schemas for:'
  },
  {
    id: 'error-log',
    name: 'Error Log & Git Analyzer',
    shortLabel: 'Log Analyzer',
    desc: 'Explains error stack traces, git conflicts, and step-by-step fixes',
    promptPrefix: 'Analyze this error stack trace and explain root cause and fix for:'
  }
];

export const DevToolsModal = ({ isOpen, onClose, onSelectMode }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '95%',
          maxWidth: '780px',
          background: 'var(--bg-glass-card)',
          border: 'var(--card-border)',
          borderRadius: '24px',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-md), 0 0 60px rgba(255, 95, 31, 0.25)',
          backdropFilter: 'blur(28px)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <ThreeDIconBadge
              icon={Zap}
              gradient="linear-gradient(135deg, #FF5F1F 0%, #FF8C42 100%)"
              shadowColor="rgba(255, 95, 31, 0.5)"
              badgeSize={46}
              size={23}
            />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                tiger<span style={{ color: '#FF5F1F' }}>X</span> Power Modes
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Select an AI mode to attach an active mode chip to your chat dock
              </p>
            </div>
          </div>

          <button className="icon-btn-header" onClick={onClose} style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(128,128,128,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} color="var(--text-main)" />
          </button>
        </div>

        {/* 2-Column Responsive Grid without any Scrolling */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {DEV_PRESETS.map((preset) => {
            const config = PRESET_3D_CONFIGS[preset.id];
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectMode(preset);
                  onClose();
                }}
                className="threed-preset-card"
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--card-border)',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                }}
              >
                <ThreeDIconBadge
                  icon={config.icon}
                  gradient={config.gradient}
                  shadowColor={config.shadowColor}
                  badgeSize={44}
                  size={21}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '3px' }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {preset.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

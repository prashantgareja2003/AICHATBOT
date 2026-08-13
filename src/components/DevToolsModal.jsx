import React, { useState } from 'react';
import {
  Code,
  Database,
  Receipt,
  FileCode,
  Bug,
  Terminal,
  Zap,
  Check,
  Copy,
  X,
  FileSearch,
  Layers,
  Wrench
} from 'lucide-react';

const DEV_PRESETS = [
  {
    id: 'sql',
    name: 'Natural Language → SQL',
    icon: Database,
    prompt: 'Convert to SQL: Show June 2026 attendance for employee 10 from iclock_transaction table with punch_time'
  },
  {
    id: 'invoice',
    name: 'Invoice / Receipt OCR',
    icon: Receipt,
    prompt: 'Extract Invoice Details: Invoice Number, Vendor Name, GST/Tax ID, Date, Total Amount, and Items table'
  },
  {
    id: 'code-gen',
    name: 'Code Generator & API',
    icon: Code,
    prompt: 'Generate a REST API endpoint in Node.js Express for user authentication with JWT'
  },
  {
    id: 'bug-detector',
    name: 'Bug Detection & Fix',
    icon: Bug,
    prompt: 'Analyze this code for memory leaks, async errors, and potential bugs, then provide optimized refactored code:'
  },
  {
    id: 'sp-gen',
    name: 'Stored Procedure Generator',
    icon: FileCode,
    prompt: 'Write a MySQL Stored Procedure for monthly employee attendance summary report'
  },
  {
    id: 'json-regex',
    name: 'JSON Formatter & Regex',
    icon: Wrench,
    prompt: 'Generate regex pattern to validate email addresses and phone numbers, with sample JSON payload'
  },
  {
    id: 'error-log',
    name: 'Error Log & Git Analyzer',
    icon: Terminal,
    prompt: 'Analyze this error stack trace and explain root cause and step-by-step fix:'
  }
];

export const DevToolsModal = ({ isOpen, onClose, onSelectPrompt }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      animation: 'fadeIn 0.25s ease-out'
    }} onClick={onClose}>
      <div style={{
        width: '90%',
        maxWidth: '620px',
        background: 'var(--bg-glass-card)',
        border: 'var(--card-border)',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: 'var(--shadow-md), 0 0 40px rgba(255, 95, 31, 0.2)',
        backdropFilter: 'blur(24px)',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 95, 31, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={20} color="#FF5F1F" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                TigerX Developer Power Tools 💻
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Instant prompts for SQL generation, OCR, Code Optimization & Analysis
              </p>
            </div>
          </div>

          <button className="icon-btn-header" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Preset Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
          {DEV_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPrompt(preset.prompt);
                  onClose();
                }}
                style={{
                  background: 'var(--input-bg)',
                  border: 'var(--card-border)',
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FF5F1F';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255, 95, 31, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#FF5F1F" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {preset.prompt}
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

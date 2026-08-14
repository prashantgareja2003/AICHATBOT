import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

/**
 * Rich Markdown Renderer for TigerX AI Messages
 * Formats Markdown (headings, bold, lists, tables, code blocks) cleanly.
 */
export const MarkdownRenderer = ({ content }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(idx);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="markdown-body-wrapper">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (!inline) {
              const codeId = Math.random().toString();
              return (
                <div style={{ position: 'relative', margin: '12px 0' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    background: '#1E1E24',
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px',
                    padding: '6px 14px',
                    fontSize: '0.75rem',
                    color: '#94A3B8',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <span>{match ? match[1] : 'code'}</span>
                    <button
                      onClick={() => handleCopyCode(codeString, codeId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedCode === codeId ? '#FF5F1F' : '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem'
                      }}
                    >
                      {copiedCode === codeId ? <Check size={13} color="#FF5F1F" /> : <Copy size={13} />}
                      {copiedCode === codeId ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{
                    margin: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px',
                    background: '#0D0D10',
                    padding: '14px',
                    overflowX: 'auto'
                  }}>
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                </div>
              );
            }

            return (
              <code className={className} props={props} style={{
                background: 'rgba(255, 95, 31, 0.15)',
                color: '#FF5F1F',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.88em'
              }}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '14px 0 8px 0', color: 'var(--text-main)', borderBottom: '2px solid rgba(255,95,31,0.3)', paddingBottom: '4px' }}>{children}</h1>,
          h2: ({ children }) => <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '12px 0 6px 0', color: 'var(--text-main)' }}>{children}</h2>,
          h3: ({ children }) => <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '10px 0 4px 0', color: '#FF5F1F' }}>{children}</h3>,
          p: ({ children }) => <p style={{ margin: '0 0 8px 0', lineHeight: 1.65 }}>{children}</p>,
          ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '6px 0 10px 0' }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '6px 0 10px 0' }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
          blockquote: ({ children }) => <blockquote style={{ borderLeft: '4px solid #FF5F1F', paddingLeft: '12px', margin: '10px 0', color: 'var(--text-muted)', italic: 'true' }}>{children}</blockquote>,
          table: ({ children }) => <div style={{ overflowX: 'auto', margin: '10px 0' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>{children}</table></div>,
          th: ({ children }) => <th style={{ borderBottom: '2px solid rgba(255,95,31,0.4)', padding: '8px', textAlign: 'left', fontWeight: 700 }}>{children}</th>,
          td: ({ children }) => <td style={{ borderBottom: '1px solid rgba(128,128,128,0.2)', padding: '8px' }}>{children}</td>
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

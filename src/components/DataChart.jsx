import React, { useState } from 'react';
import { PieChart, BarChart2, Table as TableIcon, Download } from 'lucide-react';

/**
 * Dynamic SVG Chart & Table Renderer for AI Answers and Excel/CSV data.
 * Supports Pie Chart 📊, Bar Chart 📈, and Data Table 📋 views.
 */
export const DataChart = ({ chartData }) => {
  const [activeTab, setActiveTab] = useState(chartData.type || 'bar');

  if (!chartData || !chartData.data || chartData.data.length === 0) return null;

  const title = chartData.title || "Data Visualization";
  const items = chartData.data;

  // Calculate totals and max for scaling
  const maxValue = Math.max(...items.map(d => Number(d.value) || 0), 1);
  const totalValue = items.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);

  const colors = [
    '#FF5F1F', '#38BDF8', '#4ADE80', '#F59E0B', '#A855F7',
    '#EC4899', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6'
  ];

  return (
    <div className="ai-chart-container" style={{
      background: 'var(--bot-bubble)',
      border: 'var(--bot-border)',
      borderRadius: '14px',
      padding: '16px',
      margin: '12px 0',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Chart Header & View Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '10px' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
          {title}
        </h4>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className={`action-icon-btn ${activeTab === 'bar' ? 'active' : ''}`}
            onClick={() => setActiveTab('bar')}
            title="Bar Chart"
            style={{ color: activeTab === 'bar' ? '#FF5F1F' : 'var(--text-muted)' }}
          >
            <BarChart2 size={16} /> Bar
          </button>
          <button
            className={`action-icon-btn ${activeTab === 'pie' ? 'active' : ''}`}
            onClick={() => setActiveTab('pie')}
            title="Pie Chart"
            style={{ color: activeTab === 'pie' ? '#FF5F1F' : 'var(--text-muted)' }}
          >
            <PieChart size={16} /> Pie
          </button>
          <button
            className={`action-icon-btn ${activeTab === 'table' ? 'active' : ''}`}
            onClick={() => setActiveTab('table')}
            title="Data Table"
            style={{ color: activeTab === 'table' ? '#FF5F1F' : 'var(--text-muted)' }}
          >
            <TableIcon size={16} /> Table
          </button>
        </div>
      </div>

      {/* 1. Bar Chart View 📈 */}
      {activeTab === 'bar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item, idx) => {
            const val = Number(item.value) || 0;
            const pct = Math.round((val / maxValue) * 100);
            const color = colors[idx % colors.length];
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600 }}>
                  <span>{item.label}</span>
                  <span style={{ color: color }}>{val.toLocaleString()}</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(128,128,128,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: color,
                    borderRadius: '999px',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Pie Chart View 📊 */}
      {activeTab === 'pie' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <svg viewBox="0 0 100 100" width="130" height="130">
            {(() => {
              let cumulativePercent = 0;
              return items.map((item, idx) => {
                const val = Number(item.value) || 0;
                const percent = totalValue ? val / totalValue : 0;
                const startAngle = cumulativePercent * 360;
                cumulativePercent += percent;
                const endAngle = cumulativePercent * 360;

                const startX = 50 + 40 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                const startY = 50 + 40 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                const endX = 50 + 40 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                const endY = 50 + 40 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                const largeArc = percent > 0.5 ? 1 : 0;
                const pathData = `M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`;

                return <path key={idx} d={pathData} fill={colors[idx % colors.length]} stroke="var(--bot-bubble)" strokeWidth="1.5" />;
              });
            })()}
          </svg>

          {/* Legends */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
            {items.map((item, idx) => {
              const val = Number(item.value) || 0;
              const pct = totalValue ? Math.round((val / totalValue) * 100) : 0;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors[idx % colors.length] }}></span>
                  <span style={{ fontWeight: 600 }}>{item.label}:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{val.toLocaleString()} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Data Table View 📋 */}
      {activeTab === 'table' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(128,128,128,0.2)', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Category / Item</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Value</th>
                <th style={{ padding: '8px', textAlign: 'right' }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const val = Number(item.value) || 0;
                const pct = totalValue ? Math.round((val / totalValue) * 100) : 0;
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{item.label}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#FF5F1F', fontWeight: 700 }}>{val.toLocaleString()}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: 'var(--text-muted)' }}>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

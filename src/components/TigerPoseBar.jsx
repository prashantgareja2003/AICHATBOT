import React from 'react';

const POSES = [
  { id: 'butterfly', label: '🦋 Butterfly Nose', icon: '🦋' },
  { id: 'waving', label: '🐾 Waving Paw', icon: '👋' },
  { id: 'curious', label: '👀 Curious Tilt', icon: '✨' },
  { id: 'laughing', label: '😄 Playful Laugh', icon: '😹' },
  { id: 'leaf', label: '🍃 Leaf Cub', icon: '🌿' }
];

export const TigerPoseBar = ({ activePose, onSelectPose }) => {
  return (
    <div className="tiger-poses-bar">
      {POSES.map(p => (
        <button
          key={p.id}
          className={`pose-chip ${activePose === p.id ? 'active' : ''}`}
          onClick={() => onSelectPose(p.id)}
          title={`Switch mascot pose to ${p.label}`}
        >
          <span>{p.icon}</span>
          <span>{p.label}</span>
        </button>
      ))}
    </div>
  );
};

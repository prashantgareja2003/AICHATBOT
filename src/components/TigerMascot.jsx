import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import tigerVideo from '../assets/tiger-video.mp4';

/**
 * Interactive 3D Video Mascot Component
 * Sleek circular mascot render with glow aura.
 */
export const TigerMascot = ({ size = 120, interactive = true, className = '', isTalking = false }) => {
  const videoRef = useRef(null);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    if (!interactive) return;
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 500);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF5F1F', '#FF8C42', '#38BDF8', '#FFFFFF']
      });
    } catch (err) {}
  };

  return (
    <div
      className={`tiger-video-mascot-wrapper ${interactive ? 'interactive' : ''} ${isTalking ? 'talking' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        cursor: interactive ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none'
      }}
      onClick={handleClick}
      title="Click to replay tiger animation!"
    >
      <style>{`
        @keyframes videoFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.02); }
        }
        @keyframes videoTalkingGlow {
          0%, 100% { transform: translateY(0px) scale(1.02); box-shadow: 0 0 20px rgba(255, 95, 31, 0.7); }
          50% { transform: translateY(-5px) scale(1.04); box-shadow: 0 0 30px rgba(255, 95, 31, 0.9); }
        }
        .tiger-video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
          border: 2.5px solid #FF5F1F;
          box-shadow: 0 8px 24px rgba(255, 95, 31, 0.35);
          animation: videoFloat 3.5s infinite ease-in-out;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        }
        .tiger-video-mascot-wrapper.talking .tiger-video-element {
          animation: videoTalkingGlow 1.2s infinite ease-in-out;
        }
        .tiger-video-mascot-wrapper:hover .tiger-video-element {
          transform: scale(1.06) translateY(-3px);
          box-shadow: 0 10px 28px rgba(255, 95, 31, 0.55);
        }
        .tiger-video-mascot-wrapper:active .tiger-video-element {
          transform: scale(1.12) rotate(-3deg);
        }
      `}</style>

      <video
        ref={videoRef}
        src={tigerVideo}
        autoPlay
        loop
        muted
        playsInline
        className="tiger-video-element"
        style={{
          transform: isClicked ? 'scale(1.12) rotate(-4deg)' : undefined
        }}
      />
    </div>
  );
};

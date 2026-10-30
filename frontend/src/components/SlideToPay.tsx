import React, { useRef, useState } from 'react';
import { ArrowRight, Check, Zap } from 'lucide-react';

interface SlideToPayProps {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}

export const SlideToPay: React.FC<SlideToPayProps> = ({ label, onConfirm, disabled }) => {
  const [dragProgress, setDragProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);

  const handleStart = (clientX: number) => {
    if (disabled || isSuccess) return;
    isDraggingRef.current = true;
    startXRef.current = clientX;
  };

  const triggerSuccess = () => {
    isDraggingRef.current = false;
    setDragProgress(1);
    setIsSuccess(true);
    onConfirm();
    setTimeout(() => {
      setIsSuccess(false);
      setDragProgress(0);
    }, 1500);
  };

  const handleMove = (clientX: number) => {
    if (!isDraggingRef.current || !trackRef.current || isSuccess) return;
    const trackWidth = trackRef.current.offsetWidth - 56;
    const delta = Math.max(0, Math.min(trackWidth, clientX - startXRef.current));
    const progress = delta / trackWidth;
    setDragProgress(progress);

    if (progress >= 0.90) {
      triggerSuccess();
    }
  };

  const handleEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (dragProgress < 0.90) {
      setDragProgress(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div
        ref={trackRef}
        className="slide-track"
        style={{
          opacity: disabled ? 0.45 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
          background: isSuccess
            ? 'linear-gradient(90deg, #059669 0%, #10B981 100%)'
            : 'linear-gradient(90deg, #131A29 0%, #1A2438 100%)',
          borderColor: isSuccess ? '#10B981' : 'rgba(246, 174, 45, 0.35)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
        }}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        <div
          className="slide-track-fill"
          style={{
            width: `${dragProgress * 100}%`,
            background: isSuccess
              ? 'rgba(16, 185, 129, 0.4)'
              : 'linear-gradient(90deg, rgba(246, 174, 45, 0.25), rgba(246, 174, 45, 0.65))',
          }}
        />

        <span style={{
          position: 'relative',
          zIndex: 1,
          fontSize: '0.86rem',
          fontWeight: 800,
          letterSpacing: '0.03em',
          color: isSuccess ? '#FFFFFF' : '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          {isSuccess ? (
            <>
              <Check size={18} /> Processing Instant Settlement...
            </>
          ) : (
            label
          )}
        </span>

        <div
          className="slide-thumb"
          style={{
            transform: `translateX(${dragProgress * ((trackRef.current?.offsetWidth || 300) - 56)}px)`,
            transition: isDraggingRef.current ? 'none' : 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            background: isSuccess
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #F6AE2D 0%, #D48E12 100%)',
          }}
          onMouseDown={(e) => handleStart(e.clientX)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        >
          {isSuccess ? <Check size={20} color="#FFFFFF" /> : <ArrowRight size={20} />}
        </div>
      </div>

      {/* Alternative quick tap button for maximum accessibility */}
      <button
        type="button"
        disabled={disabled || isSuccess}
        onClick={triggerSuccess}
        style={{
          background: 'none',
          border: 'none',
          color: '#64748B',
          fontSize: '0.72rem',
          fontWeight: 600,
          textAlign: 'center',
          cursor: disabled ? 'default' : 'pointer',
          padding: '2px',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!disabled) (e.currentTarget.style.color = 'var(--color-nimiq-gold)');
        }}
        onMouseLeave={(e) => {
          if (!disabled) (e.currentTarget.style.color = '#64748B');
        }}
      >
        <span>or tap here to confirm instantly ⚡</span>
      </button>
    </div>
  );
};

export default SlideToPay;

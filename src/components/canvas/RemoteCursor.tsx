import { memo } from 'react';

// Using memo so it only re-renders when x, y, or color changes
const RemoteCursor = memo(({ x, y, displayName, color }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `translate3d(${x}px, ${y}px, 0)`,
        transition: 'transform 0.1s linear', // smoother than left/top
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ dropShadow: '0px 2px 4px rgba(0,0,0,0.2)' }}
      >
        <path
          d="M5.65376 2.15376C5.40428 1.90428 5 2.08107 5 2.43389V19.7844C5 20.1583 5.46731 20.3259 5.70617 20.0384L10.3643 14.4316C10.5147 14.2504 10.7417 14.1506 10.9785 14.167L17.8427 14.6416C18.2117 14.6671 18.3976 14.2081 18.1187 13.9572L5.65376 2.15376Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      <div
        className="px-2 py-0.5 rounded-md text-xs font-semibold text-white whitespace-nowrap shadow-sm"
        style={{
          backgroundColor: color,
          marginLeft: '12px', // offset from the cursor SVG
          marginTop: '0px',
        }}
      >
        {displayName}
      </div>
    </div>
  );
});

RemoteCursor.displayName = 'RemoteCursor';

export default RemoteCursor;

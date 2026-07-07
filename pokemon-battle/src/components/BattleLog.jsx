import React, { useEffect, useRef } from 'react';

function BattleLog({ logs }) {
  const logBoxRef = useRef(null);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  const hasLogs = logs && logs.length > 0;

  return (
    <div className="battle-log-container">
      <div className="battle-log-header">Battle Feed</div>
      <div className="battle-log-box" ref={logBoxRef}>
        {hasLogs ? (
          logs.map((log, index) => (
            <div key={index} className={`battle-log-line log-${log.type}`}>
              {log.text}
            </div>
          ))
        ) : (
          <div className="battle-log-placeholder" style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Awaiting battle feed...
          </div>
        )}
      </div>
    </div>
  );
}

export default BattleLog;

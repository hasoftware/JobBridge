export function SkeletonCard() {
  return (
    <div style={{ background: 'var(--jb-bg-card)', border: '1px solid var(--jb-border)', borderRadius: 'var(--jb-radius-lg)', padding: 24 }}>
      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 'var(--jb-radius)' }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 14, width: '50%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <div className="skeleton" style={{ height: 26, width: 100 }} />
        <div className="skeleton" style={{ height: 26, width: 80 }} />
        <div className="skeleton" style={{ height: 26, width: 70 }} />
      </div>
      <div className="skeleton" style={{ height: 1, width: '100%', marginBottom: 14 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ height: 14, width: 120 }} />
        <div className="skeleton" style={{ height: 34, width: 34, borderRadius: '50%' }} />
      </div>
    </div>
  )
}

export function SkeletonLine({ width = '100%', height = 16 }) {
  return <div className="skeleton" style={{ height, width, marginBottom: 8 }} />
}

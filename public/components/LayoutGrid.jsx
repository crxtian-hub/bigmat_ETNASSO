function LayoutGridControls({ visible, onToggle }) {
  return (
    <>
      <button
        className="grid-toggle"
        type="button"
        aria-label={visible ? 'Nascondi griglia layout' : 'Mostra griglia layout'}
        aria-pressed={visible}
        title={visible ? 'Nascondi griglia layout' : 'Mostra griglia layout'}
        onClick={onToggle}
      >
        <span aria-hidden="true">#</span>
      </button>

      {visible && (
        <div className="layout-grid-overlay" aria-hidden="true">
          <div className="layout-grid-inner">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="layout-grid-column" key={index} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

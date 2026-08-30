

/**
 * Generic modal overlay. Click backdrop to close; click content does not.
 * Width is controlled via the `maxWidth` prop (default 700).
 */
export default function Modal({ onClose, children, maxWidth = 700 }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF', border: '1px solid #EAE5DC', borderRadius: 16,
          width: '90%', maxWidth, maxHeight: '90vh', overflowY: 'auto', padding: 32,
        }}
      >
        {children}
      </div>
    </div>
  );
}

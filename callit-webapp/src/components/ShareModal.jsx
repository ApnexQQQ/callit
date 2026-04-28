function ShareModal({ onClose }) {
  const shareOptions = [
    { name: 'Copy Link', icon: '🔗', color: '#333' },
    { name: 'WhatsApp', icon: '💬', color: '#25D366' },
    { name: 'Facebook', icon: 'f', color: '#1877F2' },
    { name: 'Twitter', icon: '𝕏', color: '#000' },
    { name: 'Instagram', icon: '📷', color: '#E4405F' },
    { name: 'SMS', icon: '✉️', color: '#34B7F1' },
    { name: 'Email', icon: '📧', color: '#EA4335' },
    { name: 'More', icon: '⋯', color: '#666' },
  ];

  return (
    <div className="share-modal" onClick={onClose}>
      <div className="share-container" onClick={(e) => e.stopPropagation()}>
        <div className="share-title">Share to</div>
        
        <div className="share-options">
          {shareOptions.map((option) => (
            <div key={option.name} className="share-option">
              <div 
                className="share-icon" 
                style={{ background: option.color }}
              >
                {option.icon}
              </div>
              <span className="share-label">{option.name}</span>
            </div>
          ))}
        </div>

        <button className="cancel-share" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ShareModal;

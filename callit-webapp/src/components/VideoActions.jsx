import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

function VideoActions({ video, isLiked, onLike, onComment, onShare, formatNumber }) {
  return (
    <div className="video-actions">
      <div className="action-btn" style={{ marginBottom: '8px' }}>
        <img 
          src={video.author.avatar} 
          alt={video.author.name}
          className="action-avatar"
        />
      </div>

      <div 
        className={`action-btn ${isLiked ? 'liked' : ''}`}
        onClick={onLike}
      >
        {isLiked ? (
          <HeartSolid />
        ) : (
          <HeartIcon />
        )}
        <span className="action-count">
          {formatNumber(video.likes + (isLiked ? 1 : 0))}
        </span>
      </div>

      <div className="action-btn" onClick={onComment}>
        <ChatBubbleLeftIcon />
        <span className="action-count">{formatNumber(video.comments)}</span>
      </div>

      <div className="action-btn" onClick={onShare}>
        <ShareIcon />
        <span className="action-count">{formatNumber(video.shares)}</span>
      </div>

      <div className="action-btn">
        <BookmarkIcon />
      </div>

      <div className="action-btn" style={{ marginTop: '8px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'spin 3s linear infinite'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default VideoActions;

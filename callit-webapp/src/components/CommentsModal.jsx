import { useState } from 'react';
import { XMarkIcon, HeartIcon } from '@heroicons/react/24/outline';

function CommentsModal({ video, onClose, formatNumber }) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(video.commentList);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      author: "You",
      avatar: "https://i.pravatar.cc/150?img=33",
      text: newComment,
      likes: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="comments-modal" onClick={onClose}>
      <div className="comments-container" onClick={(e) => e.stopPropagation()}>
        <div className="comments-header">
          <span className="comments-count">{comments.length} comments</span>
          <button className="close-comments" onClick={onClose}>
            <XMarkIcon width={24} height={24} />
          </button>
        </div>

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <img 
                src={comment.avatar} 
                alt={comment.author}
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-author">{comment.author}</div>
                <div className="comment-text">{comment.text}</div>
                <div className="comment-actions">
                  <span>Reply</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <HeartIcon width={12} height={12} />
                    {comment.likes || 'Like'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form className="comment-input-container" onSubmit={handleSubmit}>
          <input
            type="text"
            className="comment-input"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit" 
            className="comment-submit"
            disabled={!newComment.trim()}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}

export default CommentsModal;

import { useState, useRef, useEffect } from 'react';
import { videos } from '../data/videos';
import VideoPlayer from './VideoPlayer';
import VideoActions from './VideoActions';
import CommentsModal from './CommentsModal';
import ShareModal from './ShareModal';

function VideoFeed() {
  const [activeVideo, setActiveVideo] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const feedRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setActiveVideo(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    const videoElements = feedRef.current?.querySelectorAll('.video-container');
    videoElements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleLike = (videoId) => {
    setLikedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const openComments = (video) => {
    setCurrentVideo(video);
    setShowComments(true);
  };

  const openShare = (video) => {
    setCurrentVideo(video);
    setShowShare(true);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="video-feed" ref={feedRef}>
      {videos.map((video, index) => (
        <div key={video.id} className="video-container" data-index={index}>
          <VideoPlayer 
            src={video.url} 
            isActive={index === activeVideo}
          />
          
          <div className="video-overlay">
            <div className="video-info">
              <div className="video-author">
                <img 
                  src={video.author.avatar} 
                  alt={video.author.name}
                  className="author-avatar"
                />
                <span className="author-name">{video.author.name}</span>
                {video.author.verified && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#20D5EC">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
                <button className="follow-btn">Follow</button>
              </div>
              
              <p className="video-caption">{video.caption}</p>
              
              <div className="video-music">
                <svg className="music-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
                <span>{video.music}</span>
              </div>
            </div>
          </div>

          <VideoActions
            video={video}
            isLiked={likedVideos.has(video.id)}
            onLike={() => handleLike(video.id)}
            onComment={() => openComments(video)}
            onShare={() => openShare(video)}
            formatNumber={formatNumber}
          />
        </div>
      ))}

      {showComments && currentVideo && (
        <CommentsModal
          video={currentVideo}
          onClose={() => setShowComments(false)}
          formatNumber={formatNumber}
        />
      )}

      {showShare && currentVideo && (
        <ShareModal
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

export default VideoFeed;

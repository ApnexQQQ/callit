import { useState } from 'react';
import { currentUser } from '../data/videos';
import { PlusIcon, UserPlusIcon, BookmarkIcon, HeartIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('videos');
  const user = currentUser;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>{user.name}</h2>
        <button className="profile-menu-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      <div className="profile-info">
        <img 
          src={user.avatar} 
          alt={user.name}
          className="profile-avatar-large"
        />
        <div className="profile-username">{user.name}</div>
        <div className="profile-handle">{user.handle}</div>

        <div className="profile-stats">
          <div className="stat">
            <div className="stat-value">{formatNumber(user.following)}</div>
            <div className="stat-label">Following</div>
          </div>
          <div className="stat">
            <div className="stat-value">{formatNumber(user.followers)}</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="stat">
            <div className="stat-value">{formatNumber(user.likes)}</div>
            <div className="stat-label">Likes</div>
          </div>
        </div>

        <div className="profile-bio">
          {user.bio.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>

        <div className="profile-actions">
          <button className="profile-btn primary">Edit profile</button>
          <button className="profile-btn secondary">Promote</button>
        </div>
      </div>

      <div className="profile-tabs">
        <div 
          className={`profile-tab ${activeTab === 'videos' ? 'active' : ''}`}
          onClick={() => setActiveTab('videos')}
        >
          <Squares2X2Icon width={20} height={20} />
        </div>
        <div 
          className={`profile-tab ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          <BookmarkIcon width={20} height={20} />
        </div>
        <div 
          className={`profile-tab ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          <HeartIcon width={20} height={20} />
        </div>
      </div>

      <div className="profile-videos">
        {activeTab === 'videos' && user.videos.map((video) => (
          <div key={video.id} className="profile-video-thumb">
            <img src={video.thumbnail} alt="" />
            <div className="video-views">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              {formatNumber(video.views)}
            </div>
          </div>
        ))}
        
        {activeTab === 'bookmarks' && (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px',
            color: '#888' 
          }}>
            <BookmarkIcon width={40} height={40} style={{ marginBottom: '12px' }} />
            <div>No bookmarks yet</div>
          </div>
        )}
        
        {activeTab === 'liked' && (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px',
            color: '#888' 
          }}>
            <HeartIcon width={40} height={40} style={{ marginBottom: '12px' }} />
            <div>No liked videos</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;

import { useState } from 'react';
import VideoFeed from './components/VideoFeed';
import ProfilePage from './components/ProfilePage';
import RecordingScreen from './components/RecordingScreen';
import Navbar from './components/Navbar';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showRecording, setShowRecording] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateClick = () => {
    setShowRecording(true);
  };

  const handleCloseRecording = () => {
    setShowRecording(false);
  };

  return (
    <div className="app">
      {showRecording ? (
        <RecordingScreen onClose={handleCloseRecording} />
      ) : (
        <>
          {activeTab === 'home' && <VideoFeed />}
          {activeTab === 'discover' && (
            <div style={{ 
              height: '100vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '16px',
              color: '#888'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <div>Discover page coming soon</div>
            </div>
          )}
          {activeTab === 'inbox' && (
            <div style={{ 
              height: '100vh', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '16px',
              color: '#888'
            }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
              <div>No messages yet</div>
            </div>
          )}
          {activeTab === 'profile' && <ProfilePage />}
          
          <Navbar 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            onCreateClick={handleCreateClick}
          />
        </>
      )}
    </div>
  );
}

export default App;

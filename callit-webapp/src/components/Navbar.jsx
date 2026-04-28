import { HomeIcon, MagnifyingGlassIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, UserIcon as UserSolid } from '@heroicons/react/24/solid';

function Navbar({ activeTab, onTabChange, onCreateClick }) {
  return (
    <nav className="navbar">
      <div 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onTabChange('home')}
      >
        {activeTab === 'home' ? <HomeSolid /> : <HomeIcon />}
        <span>Home</span>
      </div>
      
      <div 
        className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`}
        onClick={() => onTabChange('discover')}
      >
        <MagnifyingGlassIcon />
        <span>Discover</span>
      </div>
      
      <div className="nav-item" onClick={onCreateClick}>
        <div className="create">
          <PlusIcon width={20} height={20} />
        </div>
        <span>Create</span>
      </div>
      
      <div 
        className={`nav-item ${activeTab === 'inbox' ? 'active' : ''}`}
        onClick={() => onTabChange('inbox')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <span>Inbox</span>
      </div>
      
      <div 
        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => onTabChange('profile')}
      >
        {activeTab === 'profile' ? <UserSolid /> : <UserIcon />}
        <span>Profile</span>
      </div>
    </nav>
  );
}

export default Navbar;

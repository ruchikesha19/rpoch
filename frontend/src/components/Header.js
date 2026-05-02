import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getRoleNavLinks = () => {
    if (!currentUser) return null;

    const roleRoutes = {
      volunteer: { path: '/volunteers', label: 'Volunteer' },
      restaurant: { path: '/restaurants', label: 'Restaurant' }
    };

    return (
      <>
        <Link 
          to={roleRoutes[currentUser.user_type]?.path || '/login'}
          className={`role-nav-link ${isActive(roleRoutes[currentUser.user_type]?.path) ? 'active' : ''}`}
        >
          {roleRoutes[currentUser.user_type]?.label || 'Dashboard'}
        </Link>
        <Link 
          to="/community"
          className={`role-nav-link ${isActive('/community') ? 'active' : ''}`}
        >
          Community
        </Link>
        {currentUser.user_type === 'volunteer' && (
          <Link 
            to="/rewards"
            className={`role-nav-link ${isActive('/rewards') ? 'active' : ''}`}
          >
            Rewards
          </Link>
        )}
        <button className="role-nav-link" onClick={logout} type="button">
          Logout
        </button>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-40 mx-auto flex w-[min(1180px,calc(100%_-_32px))] items-center justify-between gap-4 py-4 backdrop-blur-xl max-lg:static max-lg:flex-col">
      <Link to="/" className="flex items-center gap-3 font-black text-ocean-950" aria-label="FeedNet home">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br from-ocean-600 to-mint-500 text-sm font-black text-white shadow-lg shadow-ocean-600/20">
          FN
        </span>
        <span>FeedNet</span>
      </Link>
      
      <nav className="role-nav">
        {currentUser ? getRoleNavLinks() : (
          <>
            <Link to="/login" className={`role-nav-link ${isActive('/login') ? 'active' : ''}`}>
              Login
            </Link>
            <Link to="/register" className={`role-nav-link ${isActive('/register') ? 'active' : ''}`}>
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;

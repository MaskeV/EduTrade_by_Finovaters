import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { FaSignOutAlt } from 'react-icons/fa';
import StockData from './components/StockData';
import AccountSettings from './components/AccountSettings';
import LearnTrading from './components/LearnTrading';
import Profile from './components/profile';
import Authentication from './components/Authentication';
import { auth } from './components/firebase';
import Portfolio from './components/portfolio';
import StockNews from './components/news';
import Chatbot from './components/chatbot';
import './App.css';
import News from './components/news';

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('playground');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Function to get user initials for default avatar
  const getUserInitials = () => {
    if (!user) return '👤';
    
    if (user.displayName) {
      const names = user.displayName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.displayName[0].toUpperCase();
    }
    
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return '👤';
  };

  const renderActiveComponent = () => {
    if (loading) return <div className="loading-screen">Loading</div>;
    if (!user) return <Authentication />;

    switch (activeTab) {
      case 'account':
        return <AccountSettings user={user} />;
      case 'learn':
        return <LearnTrading />;
      case 'profile':
        return <Profile user={user} />;
      case 'portfolio':
        return <Portfolio />;
      case 'news':
        return <StockNews />;
      case 'chatbot':
        return <Chatbot />;
      case 'playground':
      default:
        return <StockData user={user} />;
    }
  };

  const Sidebar = () => {
    if (!user) return null;

    return (
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◄' : '►'}
          </button>
          {sidebarOpen && (
            <div className="user-info">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User"
                  className="user-avatar"
                />
              ) : (
                <div className="default-avatar">
                  {getUserInitials()}
                </div>
              )}
              <span className="user-name">{user.displayName || user.email}</span>
            </div>
          )}
        </div>

        {sidebarOpen && (
          <ul className="sidebar-menu">
            <li
              className={activeTab === 'playground' ? 'active' : ''}
              onClick={() => setActiveTab('playground')}
            >
              <span className="emoji">🎮</span> Stock Playground
            </li>
            <li
              className={activeTab === 'learn' ? 'active' : ''}
              onClick={() => setActiveTab('learn')}
            >
              <span className="emoji">📚</span> Learn Trading
            </li>
            <li
              className={activeTab === 'chatbot' ? 'active' : ''}
              onClick={() => setActiveTab('chatbot')}
            >
              <span className="emoji">🤖</span> Finance Chatbot
            </li>
            <li
              className={activeTab === 'account' ? 'active' : ''}
              onClick={() => setActiveTab('account')}
            >
              <span className="emoji">⚙️</span> Account Settings
            </li>
            <li
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => setActiveTab('profile')}
            >
              <span className="emoji">👤</span> Profile
            </li>
            <li
              className={activeTab === 'portfolio' ? 'active' : ''}
              onClick={() => setActiveTab('portfolio')}
            >
              <span className="emoji">💼</span> Portfolio
            </li>
            <li
              className={activeTab === 'news' ? 'active' : ''}
              onClick={() => setActiveTab('news')}
            >
              <span className="emoji">📰</span> News Forum
            </li>
            <li onClick={handleLogout} className="logout-button-sidebar">
              <FaSignOutAlt /> Logout
            </li>
          </ul>
        )}
      </div>
    );
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="app-container">
       <Sidebar /> 
   <div className="main-content">{renderActiveComponent()}</div>
    </div>
  );
};

export default App;
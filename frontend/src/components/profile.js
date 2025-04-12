import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import '../styles/profile.css';

const Profile = () => {
  const [user, setUser] = useState({
    name: 'Loading...',
    email: 'Loading...',
    joinDate: 'Loading...',
    avatar: '👤',
    level: 'Beginner',
  });
  
  const [loading, setLoading] = useState(true);
  const [learningProgress, setLearningProgress] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Leaderboard states
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              name: userData.displayName || currentUser.displayName || 'Trader',
              email: currentUser.email,
              joinDate: new Date(userData.createdAt?.toDate()).toLocaleDateString() || 'N/A',
              avatar: userData.avatar || '👤',
              level: userData.level || 'Beginner',
            });
            
            if (userData.learningProgress) {
              setLearningProgress(userData.learningProgress);
            } else {
              setLearningProgress([
                { id: 1, title: 'Market Basics', progress: 0, completed: false },
                { id: 2, title: 'Technical Analysis', progress: 0, completed: false },
                { id: 3, title: 'Risk Management', progress: 0, completed: false },
              ]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  // Fetch leaderboard data when period changes or leaderboard is shown
  useEffect(() => {
    if (showLeaderboard) {
      fetchLeaderboardData();
    }
  }, [leaderboardPeriod, showLeaderboard]);

  const fetchLeaderboardData = async () => {
    if (!showLeaderboard) return;
    
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    
    try {
      // Get all users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const usersData = [];
      
      // Process each user
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Initialize profit and investment totals
        let totalProfit = 0;
        let totalInvestment = 0;
        
        // Check if user has transactions
        if (userData.transactions && Array.isArray(userData.transactions)) {
          // Filter transactions by time period if needed
          const now = new Date();
          let cutoffDate = null;
          
          if (leaderboardPeriod === 'week') {
            cutoffDate = new Date(now.setDate(now.getDate() - 7));
          } else if (leaderboardPeriod === 'month') {
            cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
          }
          
          // Calculate totals from transactions
          userData.transactions.forEach(transaction => {
            // Skip if transaction is outside our time filter
            if (cutoffDate && transaction.date && 
                transaction.date.toDate() < cutoffDate) {
              return;
            }
            
            if (transaction.type === 'sell' && transaction.profit) {
              totalProfit += Number(transaction.profit);
            }
            if (transaction.type === 'buy') {
              totalInvestment += Number(transaction.totalAmount);
            }
          });
        }
        
        // Calculate return percentage
        const returnPercentage = totalInvestment > 0 
          ? ((totalProfit / totalInvestment) * 100).toFixed(2)
          : '0.00';
        
        // Add portfolio value to investment (unrealized gains)
        if (userData.portfolio && Array.isArray(userData.portfolio)) {
          userData.portfolio.forEach(stock => {
            if (stock.buyPrice && stock.quantity) {
              totalInvestment += Number(stock.buyPrice) * Number(stock.quantity);
            }
          });
        }
        
        usersData.push({
          userId: userDoc.id,
          name: userData.name || 'Anonymous Trader',
          totalProfit,
          totalInvestment,
          returnPercentage
        });
      }
      
      // Sort by total profit (descending)
      const sortedData = usersData.sort((a, b) => b.totalProfit - a.totalProfit);
      
      setLeaderboardData(sortedData);
      
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setLeaderboardError('Failed to load leaderboard data. Please try again.');
    } finally {
      setLeaderboardLoading(false);
    }
  };
  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Profile</h1>
      
      {/* User Info Section */}
      <div className="profile-section user-info">
        <div className="user-avatar">{user.avatar}</div>
        <div className="user-details">
          <h2>{user.name}</h2>
          <p>Email: {user.email}</p>
          <p>Joined: {user.joinDate}</p>
          <p>Level: {user.level}</p>
        </div>
      </div>
      
      {/* Learning Progress */}
      <div className="profile-section learning-progress">
        <h2>📚 Learning Progress</h2>
        <ul className="progress-list">
          {learningProgress.map((item) => (
            <li key={item.id} className={`progress-item ${item.completed ? 'completed' : ''}`}>
              <span>{item.title}</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <span>{item.progress}%</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Toggle Leaderboard Button */}
      <div className="profile-section">
        <button
          className="leaderboard-toggle-btn"
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
        </button>
      </div>
      
      {/* Integrated Leaderboard */}
      {showLeaderboard && (
        <div className="profile-section leaderboard-view">
          <div className="leaderboard-container">
            <h2>📊 Investor Leaderboard</h2>
            
            <div className="period-selector">
              <button 
                className={leaderboardPeriod === 'all' ? 'active' : ''} 
                onClick={() => setLeaderboardPeriod('all')}
              >
                All Time
              </button>
              <button 
                className={leaderboardPeriod === 'month' ? 'active' : ''} 
                onClick={() => setLeaderboardPeriod('month')}
              >
                Last Month
              </button>
              <button 
                className={leaderboardPeriod === 'week' ? 'active' : ''} 
                onClick={() => setLeaderboardPeriod('week')}
              >
                Last Week
              </button>
            </div>
            
            {leaderboardLoading ? (
              <div className="leaderboard-loading">
                <div className="spinner"></div>
                <p>Loading leaderboard data...</p>
              </div>
            ) : leaderboardError ? (
              <div className="error-message">{leaderboardError}</div>
            ) : (
              <div className="leaderboard-table">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Investor</th>
                      <th>Total Profit</th>
                      <th>Investment</th>
                      <th>Return %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.length > 0 ? (
                      leaderboardData.map((userData, index) => (
                        <tr key={userData.userId} className={index < 3 ? `top-${index + 1}` : ''}>
                          <td className="rank-cell">
                            <div className="rank-badge">{index + 1}</div>
                          </td>
                          <td className="user-cell">
                            <div className="user-info">
                              <span className="user-name">{userData.name}</span>
                            </div>
                          </td>
                          <td className={`profit-cell ${userData.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                            ₹{userData.totalProfit.toLocaleString()}
                          </td>
                          <td className="investment-cell">
                            ₹{userData.totalInvestment.toLocaleString()}
                          </td>
                          <td className={`percentage-cell ${parseFloat(userData.returnPercentage) >= 0 ? 'positive' : 'negative'}`}>
                            {userData.returnPercentage}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-data">
                          No users found or no trading activity in selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="leaderboard-note">
                  <strong>Note:</strong> Rankings are based on total profit, with investment amount as tiebreaker.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
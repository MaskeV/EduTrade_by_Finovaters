import React, { useState } from 'react';
import '../styles/profile.css'; // Create this CSS file

const Profile = () => {
  // User data state
  const [user, setUser] = useState({
    name: 'TraderPro',
    email: 'trader@example.com',
    joinDate: 'January 15, 2023',
    avatar: '👨‍💼',
    virtualBalance: 10000,
    level: 'Intermediate',
  });

  // Learning progress data
  const [learningProgress, setLearningProgress] = useState([
    { id: 1, title: 'Market Basics', progress: 90, completed: true },
    { id: 2, title: 'Technical Analysis', progress: 65, completed: false },
    { id: 3, title: 'Risk Management', progress: 40, completed: false },
    { id: 4, title: 'Advanced Strategies', progress: 20, completed: false },
  ]);

  // Portfolio data
  const [portfolio, setPortfolio] = useState([
    { symbol: 'RELIANCE', shares: 15, avgPrice: 2450, currentPrice: 2580 },
    { symbol: 'TCS', shares: 8, avgPrice: 3250, currentPrice: 3415 },
    { symbol: 'HDFCBANK', shares: 5, avgPrice: 1450, currentPrice: 1520 },
    { symbol: 'INFY', shares: 12, avgPrice: 1420, currentPrice: 1485 },
  ]);

  // Calculate portfolio totals
  const portfolioValue = portfolio.reduce(
    (total, stock) => total + stock.shares * stock.currentPrice,
    0
  );
  const investedAmount = portfolio.reduce(
    (total, stock) => total + stock.shares * stock.avgPrice,
    0
  );
  const profitLoss = portfolioValue - investedAmount;

  return (
    <div className="profile-container">
      <h1 className="profile-title">My Trading Profile</h1>
      
      {/* User Info Section */}
      <div className="profile-section user-info">
        <div className="user-avatar">{user.avatar}</div>
        <div className="user-details">
          <h2>{user.name}</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member Since:</strong> {user.joinDate}</p>
          <p><strong>Trader Level:</strong> {user.level}</p>
        </div>
        <div className="virtual-balance">
          <h3>Virtual Balance</h3>
          <div className="balance-amount">
            ₹{user.virtualBalance.toLocaleString()}
          </div>
          <div className={`profit-loss ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
            {profitLoss >= 0 ? '▲' : '▼'} ₹{Math.abs(profitLoss).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Learning Progress Section */}
      <div className="profile-section learning-progress">
        <h2>📚 Learning Progress</h2>
        <div className="progress-container">
          {learningProgress.map((course) => (
            <div key={course.id} className="progress-item">
              <div className="progress-header">
                <h3>{course.title}</h3>
                <span>{course.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${course.completed ? 'completed' : ''}`}
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              {course.completed && (
                <div className="completion-badge">Completed!</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="profile-section portfolio">
        <h2>📊 My Portfolio</h2>
        <div className="portfolio-summary">
          <div className="summary-card">
            <h3>Total Value</h3>
            <p>₹{portfolioValue.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Invested</h3>
            <p>₹{investedAmount.toLocaleString()}</p>
          </div>
          <div className={`summary-card ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
            <h3>P&L</h3>
            <p>{profitLoss >= 0 ? '+' : ''}₹{Math.abs(profitLoss).toLocaleString()}</p>
          </div>
        </div>
        
        <div className="portfolio-table">
          <table>
            <thead>
              <tr>
                <th>Stock</th>
                <th>Shares</th>
                <th>Avg Price</th>
                <th>Current</th>
                <th>Value</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((stock) => {
                const currentValue = stock.shares * stock.currentPrice;
                const invested = stock.shares * stock.avgPrice;
                const pl = currentValue - invested;
                const plPercent = ((pl / invested) * 100).toFixed(2);
                
                return (
                  <tr key={stock.symbol}>
                    <td>{stock.symbol}</td>
                    <td>{stock.shares}</td>
                    <td>₹{stock.avgPrice}</td>
                    <td>₹{stock.currentPrice}</td>
                    <td>₹{currentValue.toLocaleString()}</td>
                    <td className={pl >= 0 ? 'positive' : 'negative'}>
                      {pl >= 0 ? '+' : ''}₹{Math.abs(pl)} ({plPercent}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;
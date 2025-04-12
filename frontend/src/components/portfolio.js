import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import '../styles/portfolio.css';

// Register Chart.js components
Chart.register(...registerables);

const Portfolio = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('holdings');

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="loader">
        <div className="loading-spinner"></div>
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  if (!userData) {
    return <div className="no-data">No portfolio data found. Start trading!</div>;
  }

  return (
    <div className="portfolio-dashboard">
      <h1>📊 Your Portfolio</h1>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>💰 Virtual Coins</h3>
          <p>${userData.virtualCoins?.toLocaleString() || 0}</p>
        </div>
        <div className="card">
          <h3>📈 Total Profit</h3>
          <p className={userData.profit >= 0 ? 'positive' : 'negative'}>
            ${userData.profit?.toLocaleString() || 0}
          </p>
        </div>
        <div className="card">
          <h3>📦 Stocks Owned</h3>
          <p>{userData.portfolio?.length || 0}</p>
        </div>
      </div>

      {/* Tabs for Holdings vs. Transactions */}
      <div className="tabs">
        <button 
          className={activeTab === 'holdings' ? 'active' : ''}
          onClick={() => setActiveTab('holdings')}
        >
          🏦 Your Holdings
        </button>
        <button 
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          📜 Transaction History
        </button>
      </div>

      {/* Holdings Tab */}
      {activeTab === 'holdings' && (
        <div className="holdings-section">
          {userData.portfolio?.length > 0 ? (
            <>
              <div className="chart-container">
                <h3>📊 Portfolio Distribution</h3>
                <Pie
                  data={{
                    labels: userData.portfolio.map(stock => stock.name),
                    datasets: [{
                      data: userData.portfolio.map(stock => stock.quantity * stock.buyPrice),
                      backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
                      ],
                    }]
                  }}
                />
              </div>

              <div className="stocks-list">
                <h3>📦 Your Stocks</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th>Shares</th>
                      <th>Avg. Buy Price</th>
                      <th>Current Value</th>
                      <th>Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.portfolio.map((stock, index) => (
                      <tr key={index}>
                        <td>{stock.name}</td>
                        <td>{stock.quantity}</td>
                        <td>${stock.buyPrice?.toFixed(2)}</td>
                        <td>${(stock.quantity * stock.buyPrice)?.toFixed(2)}</td>
                        <td className={stock.profit >= 0 ? 'positive' : 'negative'}>
                          {stock.profit ? `$${stock.profit.toFixed(2)}` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="empty-portfolio">You don't own any stocks yet. Start trading!</p>
          )}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="transactions-section">
          {userData.transactions?.length > 0 ? (
            <>
              <div className="chart-container">
                <h3>📈 Profit Trend</h3>
                <Bar
                  data={{
                    labels: userData.transactions.map((_, i) => `T${i + 1}`),
                    datasets: [{
                      label: 'Profit/Loss per Trade',
                      data: userData.transactions.map(t => t.profit || 0),
                      backgroundColor: userData.transactions.map(t => 
                        t.profit >= 0 ? '#4BC0C0' : '#FF6384'
                      ),
                    }]
                  }}
                />
              </div>

              <div className="transactions-list">
                <h3>📜 Recent Activity</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Stock</th>
                      <th>Shares</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.transactions.map((txn, index) => (
                      <tr key={index}>
                        <td>{new Date(txn.date?.seconds * 1000).toLocaleDateString()}</td>
                        <td className={txn.type === 'buy' ? 'buy' : 'sell'}>
                          {txn.type === 'buy' ? '🛒 Buy' : '💰 Sell'}
                        </td>
                        <td>{txn.name}</td>
                        <td>{txn.quantity}</td>
                        <td>${txn.price?.toFixed(2)}</td>
                        <td>${(txn.quantity * txn.price)?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="empty-transactions">No transactions yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
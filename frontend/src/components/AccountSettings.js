import React from 'react';

const AccountSettings = () => {
  return (
    <div className="account-settings-container">
      <h2>Account Settings</h2>
      <div className="settings-form">
        <div className="form-group">
          <label>Username:</label>
          <input type="text" defaultValue="Trader123" />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input type="email" defaultValue="trader@example.com" />
        </div>
        <div className="form-group">
          <label>Risk Level:</label>
          <select defaultValue="moderate">
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
        <button className="save-button">Save Changes</button>
      </div>
    </div>
  );
};

export default AccountSettings;
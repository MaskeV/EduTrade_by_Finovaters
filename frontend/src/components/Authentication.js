import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/Authentication.css';

const Authentication = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (event) => 
    {
    event.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        createdAt: new Date(),
        virtualCoins: 1000,
        profit: 0,
        portfolio: [],
        transactions: [],
      });

      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          name: user.displayName || name || '',
          email: user.email,
          createdAt: new Date(),
          virtualCoins: 1000,
          profit: 0,
        },
        { merge: true }
      );

      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ 
      background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '"Comic Sans MS", cursive, sans-serif'
    }}>
      <div className="auth-box" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
        border: '3px solid #FF9F1C'
      }}>
        <h2 style={{
          color: '#FF6B6B',
          fontSize: '2rem',
          marginBottom: '1.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>{isLogin ? 'Welcome Back!' : 'Join the Fun!'}</h2>

        {error && <div className="error-message" style={{
          color: '#FF6B6B',
          backgroundColor: '#FFEEEE',
          padding: '0.5rem',
          borderRadius: '5px',
          marginBottom: '1rem',
          border: '1px solid #FF6B6B'
        }}>{error}</div>}

        <form className="auth-form" onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Your Super Cool Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '1rem',
                borderRadius: '10px',
                border: '2px solid #4ECDC4',
                fontSize: '1rem',
                backgroundColor: '#F7FFF7',
                outline: 'none'
              }}
            />
          )}
          <input
            type="email"
            placeholder="Your Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '1rem',
              borderRadius: '10px',
              border: '2px solid #4ECDC4',
              fontSize: '1rem',
              backgroundColor: '#F7FFF7',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Your Secret Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '1.5rem',
              borderRadius: '10px',
              border: '2px solid #4ECDC4',
              fontSize: '1rem',
              backgroundColor: '#F7FFF7',
              outline: 'none'
            }}
            minLength="6"
          />
          <button 
            type="submit" 
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#FF9F1C',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              marginBottom: '1rem',
              boxShadow: '0 4px 8px rgba(255, 159, 28, 0.3)'
            }}
            disabled={loading}
            onMouseOver={(e) => e.target.style.backgroundColor = '#FFBF69'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#FF9F1C'}
          >
            {loading ? 'One moment please...' : isLogin ? 'Let Me In!' : 'Create My Account!'}
          </button>
        </form>

        <div className="toggle-link" style={{ margin: '1rem 0' }}>
          {isLogin ? (
            <p style={{ color: '#2EC4B6' }}>
              New to our world?{' '}
              <span 
                onClick={toggleMode} 
                style={{
                  color: '#FF6B6B',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Sign Up here!
              </span>
            </p>
          ) : (
            <p style={{ color: '#2EC4B6' }}>
              Already have an account?{' '}
              <span 
                onClick={toggleMode} 
                style={{
                  color: '#FF6B6B',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Login here!
              </span>
            </p>
          )}
        </div>

        <div className="separator" style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0',
          color: '#FF6B6B'
        }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#FF6B6B' }}></div>
          <span style={{ padding: '0 10px', fontWeight: 'bold' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#FF6B6B' }}></div>
        </div>

        <button 
          onClick={handleGoogleSignIn} 
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid #4285F4',
            backgroundColor: 'white',
            color: '#4285F4',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
          disabled={loading}
          onMouseOver={(e) => {
            e.target.backgroundColor = '#F1F1F1';
            e.target.color = '#3367D6';
          }}
          onMouseOut={(e) => {
            e.target.backgroundColor = 'white';
            e.target.color = '#4285F4';
          }}
        >
          <img 
            src="https://www.svgrepo.com/show/303108/google-icon-logo.svg" 
            alt="Google logo" 
            style={{ width: '20px', height: '20px' }} 
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Authentication;
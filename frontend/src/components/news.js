// frontend/src/News.js

import React, { useEffect, useState } from 'react';
import '../styles/news.css';
import axios from 'axios';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/news');
        setArticles(response.data);
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) return <div className="news-loading">Loading...</div>;

  return (
    <div className="news-container">
      <h2>📢 Indian Finance News</h2>
      <div className="news-grid">
        {articles.map((article, i) => (
          <div key={i} className="news-card">
            <h3>{article.title}</h3>
            <p className="news-description">{article.description || 'No description available.'}</p>
            <p className="news-source">📰 {article.source_id}</p>
            <a href={article.link} target="_blank" rel="noopener noreferrer">Read More →</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default News;

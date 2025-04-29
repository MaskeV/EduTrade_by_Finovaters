import React, { useEffect, useState } from 'react';
import '../styles/news.css';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simplifiedArticles, setSimplifiedArticles] = useState({});
  const [explaining, setExplaining] = useState(null);
  const [readingLevel, setReadingLevel] = useState('medium'); // easy, medium, hard
  const genAI = new GoogleGenerativeAI(process.env.PIXABAY_API_KEY);
  
  // Pixabay API key - replace with your own key
  const PIXABAY_API_KEY = "45815912-cee479e7272433c5901d0ea90";
  const PIXABAY_API_URL = "https://pixabay.com/api/";

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/news');
        
        // Filter and shorten descriptions
        const filtered = response.data
          .filter(article => article.description && article.description.trim() !== '')
          .map(article => ({
            ...article,
            description: article.description.split('. ').slice(0, 4).join('. ') + '.', // roughly 4 short sentences
            imageUrl: null, // Will be filled by fetchImagesForArticles
            imageLoading: true,
          }));
        
        setArticles(filtered);
        
        // Fetch images for all articles
        fetchImagesForArticles(filtered);
      } catch (err) {
        console.error('Error fetching news:', err);
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  const fetchImagesForArticles = async (articlesArray) => {
    // Track already used images to avoid duplicates
    const usedImages = new Set();
    
    // Process articles one by one to ensure uniqueness
    const articlesWithImages = [];
    
    for (const article of articlesArray) {
      try {
        let imageUrl;
        let attempts = 0;
        const maxAttempts = 3;
        
        // Try up to maxAttempts times to get a unique image
        do {
          imageUrl = await fetchImageForArticle(article);
          attempts++;
        } while (usedImages.has(imageUrl) && attempts < maxAttempts);
        
        // If we still got a duplicate after maxAttempts, add a query param to make it unique
        if (usedImages.has(imageUrl)) {
          imageUrl = `${imageUrl}?article=${encodeURIComponent(article.title.substring(0, 10))}`;
        }
        
        usedImages.add(imageUrl);
        articlesWithImages.push({ ...article, imageUrl, imageLoading: false });
      } catch (error) {
        console.error(`Error fetching image for article: ${article.title}`, error);
        articlesWithImages.push({ 
          ...article, 
          imageUrl: 'https://cdn.pixabay.com/photo/2020/03/08/16/10/abc-4912660_1280.jpg',
          imageLoading: false 
        });
      }
    }
    
    setArticles(articlesWithImages);
    setLoading(false);
  };
  const fetchImageForArticle = async (article) => {
    // Extract keywords for image search
    const keywords = getKeywordsFromArticle(article);
    
    try {
      // Get more results and randomly select one
      const params = {
        key: PIXABAY_API_KEY,
        q: keywords,
        image_type: 'photo',
        safesearch: true,
        per_page: 10, // Increase results
        category: 'business', // Focus on business/finance images
      };
      
      const response = await axios.get(PIXABAY_API_URL, { params });
      
      if (response.data.hits && response.data.hits.length > 0) {
        // Use a random image from the results instead of always the first one
        const randomIndex = Math.floor(Math.random() * response.data.hits.length);
        return response.data.hits[randomIndex].webformatURL;
      }
      
      // Fallback with more specific terms and more results
      const fallbackParams = {
        key: PIXABAY_API_KEY,
        q: getSimplifiedKeywords(keywords), // Simplify keywords
        image_type: 'photo',
        safesearch: true,
        per_page: 15,
      };
      
      const fallbackResponse = await axios.get(PIXABAY_API_URL, { params: fallbackParams });
      
      if (fallbackResponse.data.hits && fallbackResponse.data.hits.length > 0) {
        const randomIndex = Math.floor(Math.random() * fallbackResponse.data.hits.length);
        return fallbackResponse.data.hits[randomIndex].webformatURL;
      }
      
      // Final fallback - use default image + article index to get variety
      const defaultImages = [
        'https://cdn.pixabay.com/photo/2020/03/08/16/10/abc-4912660_1280.jpg',
        'https://cdn.pixabay.com/photo/2019/07/14/16/29/pen-4337524_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/27/21/42/stock-1863880_1280.jpg',
        'https://cdn.pixabay.com/photo/2020/07/23/01/16/hand-5430225_1280.jpg',
        'https://cdn.pixabay.com/photo/2017/09/07/08/54/money-2724241_1280.jpg'
      ];
      
      // Use article hash to select different default image
      const imgIndex = Math.abs(article.title.length * 31) % defaultImages.length;
      return defaultImages[imgIndex];
    } catch (error) {
      console.error('Error fetching from Pixabay API:', error);
      return 'https://cdn.pixabay.com/photo/2020/03/08/16/10/abc-4912660_1280.jpg';
    }
  };

  const getKeywordsFromArticle = (article) => {
    // Extract unique keywords from title and first 2-3 words of description
    const title = article.title.toLowerCase();
    const titleWords = title.split(' ').slice(0, 3).join(' '); // First 3 words of title
    
    // Use articleIndex to add variety to similar articles
    const uniqueId = Math.floor(Math.random() * 1000);
    
    // Financial categories with diverse search terms
    const categories = {
      'bank': ['bank building', 'banking', 'bank vault', 'atm machine'],
      'money': ['money coins', 'cash', 'savings', 'currency notes'],
      'finance': ['finance chart', 'calculator money', 'financial planning'],
      'investment': ['investment growth', 'stocks chart', 'mutual funds'],
      'stock': ['stock market', 'bull bear market', 'trading floor'],
      'market': ['marketplace', 'business charts', 'market stall'],
      'economy': ['economy gears', 'industrial economy', 'economic growth'],
      'business': ['business meeting', 'office work', 'handshake deal'],
      // Add more diverse categories
    };
    
    // Try to find a matching category
    for (const [term, searchOptions] of Object.entries(categories)) {
      if (title.includes(term) || article.description.toLowerCase().includes(term)) {
        // Pick a random option from the category + add "kids friendly"
        const randomOption = searchOptions[uniqueId % searchOptions.length];
        return randomOption + " kids friendly";
      }
    }
    
    // If no category match, use title words + a random term for variety
    const randomTerms = ['cartoon', 'illustration', 'kids', 'simple', 'colorful'];
    const randomTerm = randomTerms[uniqueId % randomTerms.length];
    return titleWords + " " + randomTerm;
  };
  const getSimplifiedKeywords = (keywords) => {
    // Strip away some specifics to get more general results
    return keywords.split(' ')[0] + " cartoon";
  };

  const explainToChild = async (article, index) => {
    setExplaining(index);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      
      let difficultyLevel;
      switch(readingLevel) {
        case 'easy':
          difficultyLevel = "a 6-year-old";
          break;
        case 'hard':
          difficultyLevel = "a 12-year-old";
          break;
        default:
          difficultyLevel = "a 10-year-old";
      }
      
      const prompt = `Explain this financial news to ${difficultyLevel} in simple, fun terms:
      Original News: "${article.title}. ${article.description}"
      
      Guidelines:
      1. Use simple words and short sentences
      2. Compare to things kids understand (like pocket money, toys, etc.)
      3. Keep it under 3 sentences
      4. Add emojis to make it fun
      5. If it's complex, say "This is grown-up stuff about..." and give a basic idea`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      setSimplifiedArticles(prev => ({
        ...prev,
        [index]: text
      }));
    } catch (error) {
      console.error('Gemini error:', error);
      setSimplifiedArticles(prev => ({
        ...prev,
        [index]: "Oops! Couldn't explain this one. Maybe ask an adult to help!"
      }));
    } finally {
      setExplaining(null);
    }
  };
  
  
  // Function to get an emoji based on article content
  const getTopicEmoji = (article) => {
    const title = article.title.toLowerCase();
    const description = article.description.toLowerCase();
    const content = title + ' ' + description;
    
    const emojiMap = {
      'bank': '🏦',
      'money': '💰',
      'gold': '🥇',
      'stock': '📈',
      'market': '🛒',
      'tech': '💻',
      'digital': '📱',
      'growth': '🌱',
      'investment': '💸',
      'loan': '🏠',
      'policy': '📜',
      'economy': '🏭',
      'budget': '🧮',
      'rupee': '₹',
      'dollar': '💵',
      'rbi': '🏛️',
      'business': '💼',
      'trade': '🤝',
      'inflation': '🎈',
      'tax': '📝',
    };
    
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (content.includes(keyword)) {
        return emoji;
      }
    }
    
    return '📰'; // Default emoji
  };

  if (loading) return (
    <div className="news-loading">
      <div className="spinner"></div>
      <p>Loading cool finance news for kids...</p>
    </div>
  );

  return (
    <div className="news-container">
      <header className="news-header">
        <h1>📢 Kiddie Finance News</h1>
        <p className="subtitle">Big money news made simple for young minds!</p>
        
        <div className="reading-level-control">
          <p>Choose how simple you want it:</p>
          <div className="level-buttons">
            <button 
              className={`level-btn ${readingLevel === 'easy' ? 'active' : ''}`}
              onClick={() => setReadingLevel('easy')}
            >
              Easy (6-8 years)
            </button>
            <button 
              className={`level-btn ${readingLevel === 'medium' ? 'active' : ''}`}
              onClick={() => setReadingLevel('medium')}
            >
              Medium (9-10 years)
            </button>
            <button 
              className={`level-btn ${readingLevel === 'hard' ? 'active' : ''}`}
              onClick={() => setReadingLevel('hard')}
            >
              Challenge (11-12 years)
            </button>
          </div>
        </div>
      </header>

      <div className="news-grid">
        {articles.map((article, i) => (
          <div key={i} className="news-card">
            <div className="card-image">
              {article.imageLoading ? (
                <div className="image-loading-placeholder">
                  <div className="image-spinner"></div>
                </div>
              ) : (
                <img 
                  src={article.imageUrl} 
                  alt={`Illustration for ${article.title}`}
                  className="news-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://cdn.pixabay.com/photo/2020/03/08/16/10/abc-4912660_1280.jpg';
                  }}
                />
              )}
              <div className="image-badge">{getTopicEmoji(article)} Finance News</div>
            </div>
            
            <div className="card-content">
              <h3 className="article-title">{article.title}</h3>
              
              <div className="explanation-section">
                {simplifiedArticles[i] ? (
                  <div className="kid-explanation">
                    <div className="kid-avatar">🧒</div>
                    <p>{simplifiedArticles[i]}</p>
                  </div>
                ) : (
                  <p className="news-description">{article.description}</p>
                )}
                
                <button
                  onClick={() => explainToChild(article, i)}
                  disabled={explaining === i}
                  className="explain-button"
                >
                  {explaining === i ? (
                    <>
                      <span className="thinking-dots"></span>
                      Thinking...
                    </>
                  ) : (
                    <>
                      <span className="button-icon">🔍</span>
                      Explain Like I'm {readingLevel === 'easy' ? '6' : readingLevel === 'hard' ? '12' : '10'}!
                    </>
                  )}
                </button>
              </div>
              
              <div className="card-footer">
                <span className="news-source">📰 {article.source_id}</span>
                <a 
                  href={article.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="read-more-link"
                >
                  {simplifiedArticles[i] ? 'See Grown-up Version →' : 'Read More →'}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <footer className="news-footer">
        <p>Made with ❤️ for curious kids who want to learn about money!</p>
        <p>Ask a grown-up if you have questions about anything you read here.</p>
        <p className="image-credit">Images powered by Pixabay</p>
      </footer>
    </div>
  );
};



export default News;


import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db, auth } from './firebase';
import '../styles/stockData.css';

// ... (keep your existing stockLists and getAllStocks functions)
const stockLists = {
  // Indian Stocks - NSE
  'NSE': {
    'Large Cap': [
      'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
      'HINDUNILVR.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'KOTAKBANK.NS'
    ],
    'Mid Cap': [
      'TITAN.NS', 'BAJAJ-AUTO.NS', 'HAVELLS.NS', 'GODREJCP.NS', 'BERGEPAINT.NS',
      'MUTHOOTFIN.NS', 'DABUR.NS', 'AUROPHARMA.NS', 'TORNTPHARM.NS', 'COLPAL.NS'
    ],
    'IT Sector': [
      'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS',
      'LTTS.NS', 'MINDTREE.NS', 'MPHASIS.NS', 'COFORGE.NS', 'PERSISTENT.NS'
    ],
    'Banking': [
      'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS', 'AXISBANK.NS',
      'INDUSINDBK.NS', 'BANKBARODA.NS', 'FEDERALBNK.NS', 'PNB.NS', 'IDFCFIRSTB.NS'
    ]
  },
  
  // Indian Stocks - BSE
  'BSE': {
    'Large Cap': [
      'RELIANCE.BO', 'TCS.BO', 'HDFCBANK.BO', 'INFY.BO', 'ICICIBANK.BO',
      'HINDUNILVR.BO', 'SBIN.BO', 'BHARTIARTL.BO', 'ITC.BO', 'KOTAKBANK.BO'
    ],
    'Energy': [
      'RELIANCE.BO', 'ONGC.BO', 'NTPC.BO', 'POWERGRID.BO', 'ADANIENT.BO',
      'IOC.BO', 'BPCL.BO', 'GAIL.BO', 'COAL.BO', 'TATAPOWER.BO'
    ]
  },
  
  // US Markets
  'US': {
    'Tech Giants': [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
      'NVDA', 'TSLA', 'NFLX', 'ADBE', 'INTC'
    ],
    'Financial': [
      'JPM', 'BAC', 'WFC', 'C', 'GS',
      'MS', 'BLK', 'AXP', 'USB', 'PNC'
    ],
    'Healthcare': [
      'JNJ', 'UNH', 'PFE', 'ABBV', 'MRK',
      'TMO', 'ABT', 'DHR', 'BMY', 'AMGN'
    ],
    'Consumer': [
      'PG', 'KO', 'PEP', 'WMT', 'DIS',
      'MCD', 'SBUX', 'NKE', 'COST', 'HD'
    ]
  },
  
  // UK Market - London Stock Exchange
  'LSE': {
    'FTSE 100': [
      'HSBA.L', 'BP.L', 'GSK.L', 'ULVR.L', 'RIO.L',
      'SHEL.L', 'AZN.L', 'LLOY.L', 'VOD.L', 'GLEN.L'
    ]
  },
  
  // Japanese Market
  'JPX': {
    'Nikkei': [
      '7203.T', '9984.T', '6758.T', '6861.T', '6501.T',
      '7267.T', '9432.T', '8306.T', '6702.T', '9983.T'
    ]
  }
};

const stockLogoMap = {
  // Indian Stocks - NSE
  'RELIANCE.NS': 'https://cdn.brandfetch.io/idFM2cAVu-/w/200/h/200/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1667775600285',
  'TCS.NS': 'https://logo.clearbit.com/tcs.com',
  'HDFCBANK.NS': 'https://logo.clearbit.com/hdfcbank.com',
  'INFY.NS': 'https://logo.clearbit.com/infosys.com',
  'ICICIBANK.NS': 'https://logo.clearbit.com/icicibank.com',
  'HINDUNILVR.NS': 'https://logo.clearbit.com/hul.co.in',
  'SBIN.NS': 'https://logo.clearbit.com/sbi.co.in',
  'BHARTIARTL.NS': 'https://logo.clearbit.com/airtel.in',
  'ITC.NS': 'https://logo.clearbit.com/itcportal.com',
  'KOTAKBANK.NS': 'https://logo.clearbit.com/kotak.com',
  'TITAN.NS': 'https://logotyp.us/file/titan-company.svg',
  'BAJAJ-AUTO.NS': 'https://logo.clearbit.com/bajajauto.com',
  'HAVELLS.NS': 'https://logo.clearbit.com/havells.com',
  'GODREJCP.NS': 'https://logo.clearbit.com/godrejcp.com',
  'BERGEPAINT.NS': 'https://logo.clearbit.com/bergerpaints.com',
  'MUTHOOTFIN.NS': 'https://logo.clearbit.com/muthootfinance.com',
  'DABUR.NS': 'https://logo.clearbit.com/dabur.com',
  'AUROPHARMA.NS': 'https://logo.clearbit.com/aurobindo.com',
  'TORNTPHARM.NS': 'https://logo.clearbit.com/torrentpharma.com',
  'COLPAL.NS': 'https://logo.clearbit.com/colgatepalmolive.co.in',
  'WIPRO.NS': 'https://logo.clearbit.com/wipro.com',
  'HCLTECH.NS': 'https://logo.clearbit.com/hcltech.com',
  'TECHM.NS': 'https://logo.clearbit.com/techmahindra.com',
  'LTTS.NS': 'https://logo.clearbit.com/ltts.com',
  'MINDTREE.NS': 'https://logo.clearbit.com/mindtree.com',
  'MPHASIS.NS': 'https://logo.clearbit.com/mphasis.com',
  'COFORGE.NS': 'https://logo.clearbit.com/coforge.com',
  'PERSISTENT.NS': 'https://logo.clearbit.com/persistent.com',
  'AXISBANK.NS': 'https://logo.clearbit.com/axisbank.com',
  'INDUSINDBK.NS': 'https://logo.clearbit.com/indusind.com',
  'BANKBARODA.NS': 'https://logo.clearbit.com/bankofbaroda.in',
  'FEDERALBNK.NS': 'https://logo.clearbit.com/federalbank.co.in',
  'PNB.NS': 'https://logo.clearbit.com/pnbindia.in',
  'IDFCFIRSTB.NS': 'https://logo.clearbit.com/idfcfirstbank.com',

  // Indian Stocks - BSE (same companies as NSE, just different exchange)
  'RELIANCE.BO': 'https://logo.clearbit.com/relianceindustries.com',
  'TCS.BO': 'https://logo.clearbit.com/tcs.com',
  'HDFCBANK.BO': 'https://logo.clearbit.com/hdfcbank.com',
  'INFY.BO': 'https://logo.clearbit.com/infosys.com',
  'ICICIBANK.BO': 'https://logo.clearbit.com/icicibank.com',
  'HINDUNILVR.BO': 'https://logo.clearbit.com/hul.co.in',
  'SBIN.BO': 'https://logo.clearbit.com/sbi.co.in',
  'BHARTIARTL.BO': 'https://logo.clearbit.com/airtel.in',
  'ITC.BO': 'https://logo.clearbit.com/itcportal.com',
  'KOTAKBANK.BO': 'https://logo.clearbit.com/kotak.com',
  'ONGC.BO': 'https://logo.clearbit.com/ongcindia.com',
  'NTPC.BO': 'https://logo.clearbit.com/ntpc.co.in',
  'POWERGRID.BO': 'https://logo.clearbit.com/powergridindia.com',
  'ADANIENT.BO': 'https://logo.clearbit.com/adanienterprises.com',
  'IOC.BO': 'https://logo.clearbit.com/iocl.com',
  'BPCL.BO': 'https://logo.clearbit.com/bharatpetroleum.com',
  'GAIL.BO': 'https://logo.clearbit.com/gailonline.com',
  'COAL.BO': 'https://logo.clearbit.com/coalindia.in',
  'TATAPOWER.BO': 'https://logo.clearbit.com/tatapower.com',

  // US Markets
  'AAPL': 'https://logo.clearbit.com/apple.com',
  'MSFT': 'https://logo.clearbit.com/microsoft.com',
  'GOOGL': 'https://logo.clearbit.com/google.com',
  'AMZN': 'https://logo.clearbit.com/amazon.com',
  'META': 'https://logo.clearbit.com/meta.com',
  'NVDA': 'https://logo.clearbit.com/nvidia.com',
  'TSLA': 'https://logo.clearbit.com/tesla.com',
  'NFLX': 'https://logo.clearbit.com/netflix.com',
  'ADBE': 'https://logo.clearbit.com/adobe.com',
  'INTC': 'https://logo.clearbit.com/intel.com',
  'JPM': 'https://logo.clearbit.com/jpmorganchase.com',
  'BAC': 'https://logo.clearbit.com/bankofamerica.com',
  'WFC': 'https://logo.clearbit.com/wellsfargo.com',
  'C': 'https://logo.clearbit.com/citi.com',
  'GS': 'https://logo.clearbit.com/goldmansachs.com',
  'MS': 'https://logo.clearbit.com/morganstanley.com',
  'BLK': 'https://logo.clearbit.com/blackrock.com',
  'AXP': 'https://logo.clearbit.com/americanexpress.com',
  'USB': 'https://logo.clearbit.com/usbank.com',
  'PNC': 'https://logo.clearbit.com/pnc.com',
  'JNJ': 'https://logo.clearbit.com/jnj.com',
  'UNH': 'https://logo.clearbit.com/unitedhealthgroup.com',
  'PFE': 'https://logo.clearbit.com/pfizer.com',
  'ABBV': 'https://logo.clearbit.com/abbvie.com',
  'MRK': 'https://logo.clearbit.com/merck.com',
  'TMO': 'https://logo.clearbit.com/thermofisher.com',
  'ABT': 'https://logo.clearbit.com/abbott.com',
  'DHR': 'https://logo.clearbit.com/danaher.com',
  'BMY': 'https://logo.clearbit.com/bms.com',
  'AMGN': 'https://logo.clearbit.com/amgen.com',
  'PG': 'https://logo.clearbit.com/pg.com',
  'KO': 'https://logo.clearbit.com/coca-cola.com',
  'PEP': 'https://logo.clearbit.com/pepsi.com',
  'WMT': 'https://logo.clearbit.com/walmart.com',
  'DIS': 'https://logo.clearbit.com/disney.com',
  'MCD': 'https://logo.clearbit.com/mcdonalds.com',
  'SBUX': 'https://logo.clearbit.com/starbucks.com',
  'NKE': 'https://logo.clearbit.com/nike.com',
  'COST': 'https://logo.clearbit.com/costco.com',
  'HD': 'https://logo.clearbit.com/homedepot.com',

  // UK Market - London Stock Exchange
  'HSBA.L': 'https://logo.clearbit.com/hsbc.com',
  'BP.L': 'https://logo.clearbit.com/bp.com',
  'GSK.L': 'https://logo.clearbit.com/gsk.com',
  'ULVR.L': 'https://logo.clearbit.com/unilever.com',
  'RIO.L': 'https://logo.clearbit.com/riotinto.com',
  'SHEL.L': 'https://logo.clearbit.com/shell.com',
  'AZN.L': 'https://logo.clearbit.com/astrazeneca.com',
  'LLOY.L': 'https://logo.clearbit.com/lloydsbankinggroup.com',
  'VOD.L': 'https://logo.clearbit.com/vodafone.com',
  'GLEN.L': 'https://logo.clearbit.com/glencore.com',

  // Japanese Market
  '7203.T': 'https://logo.clearbit.com/toyota.co.jp',
  '9984.T': 'https://logo.clearbit.com/softbank.jp',
  '6758.T': 'https://logo.clearbit.com/sony.com',
  '6861.T': 'https://logo.clearbit.com/keyence.com',
  '6501.T': 'https://logo.clearbit.com/hitachi.com',
  '7267.T': 'https://logo.clearbit.com/honda.com',
  '9432.T': 'https://logo.clearbit.com/ntt.co.jp',
  '8306.T': 'https://logo.clearbit.com/mufg.jp',
  '6702.T': 'https://logo.clearbit.com/fujitsu.com',
  '9983.T': 'https://logo.clearbit.com/fastretailing.com'
};export const getStockLogo = (symbol) => {
  // Remove exchange suffix if present
  const baseSymbol = symbol.split('.')[0];
  return stockLogoMap[symbol] || stockLogoMap[baseSymbol] || 'https://via.placeholder.com/40';
};

// Helper function to flatten our nested structure for initial view
const getAllStocks = () => {
  const allStocks = [];
  
  Object.entries(stockLists).forEach(([exchange, categories]) => {
    Object.entries(categories).forEach(([category, symbols]) => {
      symbols.forEach(symbol => {
        allStocks.push({
          symbol,
          exchange,
          category
        });
      });
    });
  });
  
  return allStocks;
};


const StockCard = ({ meta, exchange, category }) => {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [loadingTransaction, setLoadingTransaction] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const getCurrencySymbol = (currency) => {
    switch(currency) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'JPY': return '¥';
      default: return currency;
    }
  };

  const handleBuy = async () => {
    if (!auth.currentUser) {
      setMessage("Please login to buy stocks");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoadingTransaction(true);
    try {
      const totalCost = quantity * meta.regularMarketPrice;
      const userRef = doc(db, 'users', auth.currentUser.uid);

      // Check if user has enough virtual coins
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        setMessage("User data not found!");
        return;
      }

      const user = userDoc.data();
      if (user.virtualCoins < totalCost) {
        setMessage(`You need ${getCurrencySymbol(meta.currency)}${(totalCost - user.virtualCoins).toFixed(2)} more to buy this!`);
        return;
      }

      // Check if stock already exists in portfolio
      const existingStock = user.portfolio?.find(item => item.symbol === meta.symbol);
      const newQuantity = existingStock ? existingStock.quantity + quantity : quantity;
      const averagePrice = existingStock 
        ? ((existingStock.buyPrice * existingStock.quantity) + (meta.regularMarketPrice * quantity)) / newQuantity
        : meta.regularMarketPrice;

      // Update user data in Firestore
      await updateDoc(userRef, {
        virtualCoins: increment(-totalCost),
        portfolio: existingStock
          ? user.portfolio.map(item => 
              item.symbol === meta.symbol 
                ? { ...item, quantity: newQuantity, buyPrice: averagePrice }
                : item
            )
          : arrayUnion({
              symbol: meta.symbol,
              name: meta.longName || meta.symbol,
              quantity,
              buyPrice: meta.regularMarketPrice,
              buyDate: new Date(),
              exchange,
              category
            }),
        transactions: arrayUnion({
          type: 'buy',
          symbol: meta.symbol,
          name: meta.longName || meta.symbol,
          quantity,
          price: meta.regularMarketPrice,
          totalAmount: totalCost,
          date: new Date(),
          exchange,
          category
        })
      });

      setMessage(`🎉 You bought ${quantity} shares of ${meta.longName || meta.symbol} for ${getCurrencySymbol(meta.currency)}${totalCost.toFixed(2)}`);
      setUserData({
        ...user,
        virtualCoins: user.virtualCoins - totalCost,
        portfolio: existingStock
          ? user.portfolio.map(item => 
              item.symbol === meta.symbol 
                ? { ...item, quantity: newQuantity, buyPrice: averagePrice }
                : item
            )
          : [...(user.portfolio || []), {
              symbol: meta.symbol,
              name: meta.longName || meta.symbol,
              quantity,
              buyPrice: meta.regularMarketPrice,
              buyDate: new Date(),
              exchange,
              category
            }]
      });
    } catch (error) {
      console.error("Error buying stock:", error);
      setMessage("Error processing your purchase");
    } finally {
      setLoadingTransaction(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleSell = async () => {
    if (!auth.currentUser) {
      setMessage("Please login to sell stocks");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setLoadingTransaction(true);
    try {
      const totalValue = quantity * meta.regularMarketPrice;
      const userRef = doc(db, 'users', auth.currentUser.uid);

      // Check if user has the stock and enough quantity
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        setMessage("User data not found!");
        return;
      }

      const user = userDoc.data();
      const ownedStock = user.portfolio?.find(item => item.symbol === meta.symbol);
      
      if (!ownedStock) {
        setMessage(`You don't own ${meta.longName || meta.symbol}`);
        return;
      }

      if (ownedStock.quantity < quantity) {
        setMessage(`You only have ${ownedStock.quantity} shares of ${meta.longName || meta.symbol}`);
        return;
      }

      // Calculate profit/loss
      const profitLoss = (meta.regularMarketPrice - ownedStock.buyPrice) * quantity;

      // Update user data in Firestore
      await updateDoc(userRef, {
        virtualCoins: increment(totalValue),
        profit: increment(profitLoss),
        portfolio: ownedStock.quantity === quantity
          ? user.portfolio.filter(item => item.symbol !== meta.symbol)
          : user.portfolio.map(item => 
              item.symbol === meta.symbol 
                ? { ...item, quantity: item.quantity - quantity }
                : item
            ),
        transactions: arrayUnion({
          type: 'sell',
          symbol: meta.symbol,
          name: meta.longName || meta.symbol,
          quantity,
          price: meta.regularMarketPrice,
          buyPrice: ownedStock.buyPrice,
          profit: profitLoss,
          totalAmount: totalValue,
          date: new Date(),
          exchange,
          category
        })
      });

      setMessage(`💰 You sold ${quantity} shares of ${meta.longName || meta.symbol} for ${getCurrencySymbol(meta.currency)}${totalValue.toFixed(2)} (${profitLoss >= 0 ? 'Profit' : 'Loss'}: ${getCurrencySymbol(meta.currency)}${Math.abs(profitLoss).toFixed(2)})`);
      setUserData({
        ...user,
        virtualCoins: user.virtualCoins + totalValue,
        profit: (user.profit || 0) + profitLoss,
        portfolio: ownedStock.quantity === quantity
          ? user.portfolio.filter(item => item.symbol !== meta.symbol)
          : user.portfolio.map(item => 
              item.symbol === meta.symbol 
                ? { ...item, quantity: item.quantity - quantity }
                : item
            )
      });
    } catch (error) {
      console.error("Error selling stock:", error);
      setMessage("Error processing your sale");
    } finally {
      setLoadingTransaction(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // Calculate price change and determine if it's positive or negative
  const priceChange = meta.regularMarketPrice - meta.chartPreviousClose;
  const priceChangePercent = (priceChange / meta.chartPreviousClose) * 100;
  const isPositive = priceChange >= 0;
  
  // Format the price change values
  const formattedPriceChange = Math.abs(priceChange).toFixed(2);
  const formattedPercentChange = Math.abs(priceChangePercent).toFixed(2);
  
  // Choose appropriate symbols and colors
  const changeSymbol = isPositive ? '▲' : '▼';
  const changeColor = isPositive ? 'price-up' : 'price-down';

  const currencySymbol = getCurrencySymbol(meta.currency);

  // Check if user owns this stock
  const ownedStock = userData?.portfolio?.find(item => item.symbol === meta.symbol);
  const ownedQuantity = ownedStock?.quantity || 0;

  return (
    <div className="stock-card-kids">
      <div className="stock-category-badge">{category}</div>
    
      <div className="stock-header">
      <img 
        src={getStockLogo(meta.symbol)} 
        alt={meta.longName || meta.symbol}
        className="stock-logo"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/40';
        }}
      />
      <div>
        <h3>{meta.longName || meta.symbol}</h3>
        <p className="stock-symbol">{meta.symbol}</p>
      </div>
    </div>
      
      <div className="price-container">
        <p className="current-price"><strong>💰 Price:</strong> {currencySymbol}{meta.regularMarketPrice?.toFixed(2)}</p>
        <p className={`price-change ${changeColor}`}>
          {changeSymbol} {currencySymbol}{formattedPriceChange} ({formattedPercentChange}%)
        </p>
      </div>
      
      {ownedQuantity > 0 && (
        <p className="owned-stock">
          <strong>📊 You own:</strong> {ownedQuantity} shares (Avg: {currencySymbol}{ownedStock.buyPrice.toFixed(2)})
        </p>
      )}
      
      <p><strong>🏷 Symbol:</strong> {meta.symbol}</p>
      <p><strong>📊 Day Range:</strong> {currencySymbol}{meta.regularMarketDayLow?.toFixed(2)} - {currencySymbol}{meta.regularMarketDayHigh?.toFixed(2)}</p>
      <p><strong>📅 52W Range:</strong> {currencySymbol}{meta.fiftyTwoWeekLow?.toFixed(2)} - {currencySymbol}{meta.fiftyTwoWeekHigh?.toFixed(2)}</p>
      <p><strong>🔙 Prev Close:</strong> {currencySymbol}{meta.chartPreviousClose?.toFixed(2)}</p>
      <p><strong>📦 Volume:</strong> {meta.regularMarketVolume?.toLocaleString()}</p>
      <p><strong>🏦 Exchange:</strong> {exchange}</p>
      
      <div className="stock-actions">
        {userData && (
          <div className="user-balance">
            <p>💰 Virtual Coins: {getCurrencySymbol('USD')}{userData.virtualCoins?.toFixed(2)}</p>
            {userData.profit !== undefined && (
              <p className={userData.profit >= 0 ? 'price-up' : 'price-down'}>
                📊 Total Profit: {getCurrencySymbol('USD')}{userData.profit.toFixed(2)}
              </p>
            )}
          </div>
        )}
        
        <div className="quantity-selector">
          <label htmlFor={`quantity-${meta.symbol}`}>Quantity: </label>
          <input 
            type="number" 
            id={`quantity-${meta.symbol}`}
            min="1" 
            max={ownedQuantity || undefined}
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
          />
          {ownedQuantity > 0 && (
            <span className="max-quantity" onClick={() => setQuantity(ownedQuantity)}>
              (Max: {ownedQuantity})
            </span>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="buy-button" 
            onClick={handleBuy}
            disabled={loadingTransaction || !auth.currentUser}
          >
            {loadingTransaction ? 'Processing...' : '🛒 Buy'}
          </button>
          <button 
            className="sell-button" 
            onClick={handleSell}
            disabled={loadingTransaction || !auth.currentUser || ownedQuantity === 0}
          >
            {loadingTransaction ? 'Processing...' : '💸 Sell'}
          </button>
        </div>
        
        {message && <div className="action-message">{message}</div>}
      </div>
    </div>
  );
};

const StockData = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExchange, setSelectedExchange] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [displayCount, setDisplayCount] = useState(9);
  
  // Get all available stocks
  const allStocks = getAllStocks();
  
  // Get all available categories for the selected exchange
  const getAvailableCategories = () => {
    if (selectedExchange === 'All') {
      const uniqueCategories = new Set();
      Object.values(stockLists).forEach(categories => {
        Object.keys(categories).forEach(category => uniqueCategories.add(category));
      });
      return Array.from(uniqueCategories);
    } else {
      return Object.keys(stockLists[selectedExchange] || {});
    }
  };
  
  const availableCategories = getAvailableCategories();
  
  // Filter stocks based on selected exchange and category
  const filteredStocks = allStocks.filter(stock => {
    const exchangeMatch = selectedExchange === 'All' || stock.exchange === selectedExchange;
    const categoryMatch = selectedCategory === 'All' || stock.category === selectedCategory;
    return exchangeMatch && categoryMatch;
  });

  // Limit shown stocks to displayCount
  const displayedStocks = filteredStocks.slice(0, displayCount);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const successfulResponses = [];
        
        const responses = await Promise.allSettled(
          displayedStocks.map(stock =>
            fetch(`http://localhost:3002/api/yfinance/${stock.symbol}`)
              .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch ${stock.symbol}`);
                return res.json();
              })
              .then(data => ({
                meta: data.chart.result[0].meta,
                exchange: stock.exchange,
                category: stock.category
              }))
          ),
        );
        
        responses.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successfulResponses.push(result.value);
          } else {
            console.error(`Failed to fetch ${displayedStocks[index].symbol}:`, result.reason);
          }
        });
        
        setStocks(successfulResponses);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [selectedExchange, selectedCategory, displayCount]);

  useEffect(() => {
    setDisplayCount(9);
  }, [selectedExchange, selectedCategory]);

  const loadMoreStocks = () => {
    setDisplayCount(prevCount => prevCount + 9);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleExchangeChange = (exchange) => {
    setSelectedExchange(exchange);
    setSelectedCategory('All');
  };

  return (
    <div className="stock-dashboard-kids">
      <h2>🎉 Stock Playground 📉</h2>
      <p className="tagline">A fun way to learn stocks! 🧒📊</p>
      
      <div className="filter-section">
        <div className="exchange-filter">
          <p>Choose a Market:</p>
          <div className="exchange-buttons">
            <button 
              className={`exchange-button ${selectedExchange === 'All' ? 'active' : ''}`}
              onClick={() => handleExchangeChange('All')}
            >
              All Markets
            </button>
            <button 
              className={`exchange-button ${selectedExchange === 'NSE' ? 'active' : ''}`}
              onClick={() => handleExchangeChange('NSE')}
            >
              NSE (India)
            </button>
            <button 
              className={`exchange-button ${selectedExchange === 'BSE' ? 'active' : ''}`}
              onClick={() => handleExchangeChange('BSE')}
            >
              BSE (India)
            </button>
            <button 
              className={`exchange-button ${selectedExchange === 'US' ? 'active' : ''}`}
              onClick={() => handleExchangeChange('US')}
            >
              US Markets
            </button>
            <button 
              className={`exchange-button ${selectedExchange === 'LSE' ? 'active' : ''}`}
              onClick={() => handleExchangeChange('LSE')}
            >
              UK Markets
            </button>
            <button 
              className={`exchange-button ${selectedExchange === 'JPX' ? 'active' : ''}`}
              onClick={() => handleExchangeChange('JPX')}
            >
              Japan Markets
            </button>
          </div>
        </div>
        
        {availableCategories.length > 0 && (
          <div className="category-filter">
            <p>Choose a Category:</p>
            <div className="category-buttons">
              <button 
                className={`category-button ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('All')}
              >
                All Categories
              </button>
              {availableCategories.map(category => (
                <button 
                  key={category}
                  className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="loader">
          <div className="loading-animation">
            <div className="loading-bounce"></div>
            <div className="loading-bounce"></div>
            <div className="loading-bounce"></div>
          </div>
          <p>Loading stock data... 🚀</p>
        </div>
      ) : stocks.length === 0 ? (
        <div className="no-stocks-message">
          <h3>No stocks found!</h3>
          <p>Try changing your filters or check your API connection</p>
        </div>
      ) : (
        <div className="stock-grid-kids">
          {stocks.map((stock, index) => (
            <StockCard 
              key={index} 
              meta={stock.meta} 
              exchange={stock.exchange} 
              category={stock.category} 
            />
          ))}
        </div>
      )}
      
      {!loading && displayCount < filteredStocks.length && (
        <button className="load-more-button" onClick={loadMoreStocks}>
          Load More Stocks! 🚀
        </button>
      )}
      
      <div className="stock-count">
        <p>Showing {stocks.length} of {filteredStocks.length} available stocks</p>
      </div>
    </div>
  );
};





export default StockData;

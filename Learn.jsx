import React, { useState, useRef } from 'react';
//import Quiz from './Quiz';

const videos = [
  { id: 2, src: './stockVideo.mp4', title: 'What is Stock' },
  { id: 3, src: './Nifty.mp4', title: 'Nifty Information' },
  { id: 4, src: './sensex.mp4', title: 'Sensex Information' },
  { id: 5, src: './BullBearMarketRate.mp4', title: 'Bull Rate And Bear Rate' },
];

export default function Learn() {
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [overlayVideoId, setOverlayVideoId] = useState(null);
  const videoRef = useRef(null);

  const handleVideoClick = (id) => {
    setOverlayVideoId(id);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }, 100);
  };

  const handleStartQuiz = (id) => {
    setActiveQuizId(id);
    setOverlayVideoId(null);
  };

  if (activeQuizId !== null) {
    return <Quiz topicId={activeQuizId} onBack={() => setActiveQuizId(null)} />;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: '#fff',width:'100%' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>📚 Learn About Stock Market</h2>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '30px',
      }}>
        {videos.map((video) => (
          <div key={video.id} style={{ width: '300px', textAlign: 'center' }}>
            <h4 style={{ marginBottom: '10px', color: '#333' }}>{video.title}</h4>
            <video
              width="100%"
              height="200"
              style={{
                borderRadius: '10px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                cursor: 'pointer',
              }}
              onClick={() => handleVideoClick(video.id)}
              muted
            >
              <source src={video.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button
              onClick={() => handleStartQuiz(video.id)}
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🧠 Start Quiz
            </button>
          </div>
        ))}
      </div>

      {overlayVideoId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '3vh 3vw',
          boxSizing: 'border-box',
        }}>
          <video
            ref={videoRef}
            width="100%"
            height="auto"
            controls
            autoPlay
            style={{
              borderRadius: '12px',
              maxHeight: '85vh',
              boxShadow: '0 0 20px rgba(255,255,255,0.1)',
              backgroundColor: '#000'
            }}
          >
            <source src={videos.find(v => v.id === overlayVideoId)?.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <button
            onClick={() => setOverlayVideoId(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              background: 'transparent',
              color: '#fff',
              fontSize: '36px',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              lineHeight: '1',
            }}
            title="Close"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}

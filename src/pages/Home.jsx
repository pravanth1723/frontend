import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { store } from "../App";

/**
 * Home - shows create/join room area link to rooms.
 */
export default function Home() {
  const [user] = useContext(store);

  const containerStyle = {
    minHeight: '80vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '3rem',
    textAlign: 'center',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  };

  const cardsContainerStyle = {
    display: 'flex',
    gap: '2rem',
    maxWidth: '900px',
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    flex: '1',
    minWidth: '300px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    border: 'none',
  };

  const cardHoverStyle = {
    ...cardStyle,
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
  };

  const cardTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1rem',
  };

  const cardTextStyle = {
    color: '#4a5568',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    fontSize: '1rem',
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '25px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const [hoveredCard, setHoveredCard] = React.useState(null);

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Welcome to Expense Splitter</h1>
      
      <div style={cardsContainerStyle}>
        <div 
          style={hoveredCard === 'get-started' ? cardHoverStyle : cardStyle}
          onMouseEnter={() => setHoveredCard('get-started')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={cardTitleStyle}>🚀 Get Started</h3>
          {user !== "loggedin" ? (
            <p style={cardTextStyle}>Please login or register to create or join a room and start managing your shared expenses.</p>
          ) : (
            <>
              <p style={cardTextStyle}>Create or join a room to start tracking shared expenses with your friends and family.</p>
              <Link to="/rooms" style={{ textDecoration: 'none' }}>
                <button 
                  style={buttonStyle}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Go to Rooms
                </button>
              </Link>
            </>
          )}
        </div>

        <div 
          style={hoveredCard === 'about' ? cardHoverStyle : cardStyle}
          onMouseEnter={() => setHoveredCard('about')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h3 style={cardTitleStyle}>ℹ️ How It Works</h3>
          <p style={cardTextStyle}>
            <strong>Step 1:</strong> Setup room with members<br/>
            <strong>Step 2:</strong> Add expenses with flexible payment options<br/>
            <strong>Step 3:</strong> Preview final settlements and download PDF
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '600',
            display: 'inline-block',
            marginTop: '1rem',
          }}>
            Simple • Fair • Transparent
          </div>
        </div>
      </div>
    </div>
  );
}

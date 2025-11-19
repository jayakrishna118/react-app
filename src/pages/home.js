import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const apiKey = "a9d640830ea84222b48d8e9f5624d568";

function Home() {
  const [articles, setArticles] = useState([]);
  const [query, setQuery] = useState("latest");
  const [page, setPage] = useState(1);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/signin');
    } else {
      setUser(JSON.parse(currentUser));
    }
  }, [navigate]);

  const fetchNews = async (pageNum = 1, searchQuery = "latest") => {
    try {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        searchQuery
      )}&pageSize=5&page=${pageNum}&apiKey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== "ok") {
        setArticles([]);
        return;
      }

      setArticles(data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      setArticles([]);
    }
  };

  useEffect(() => {
    fetchNews(page, query);
  }, [page, query]);

  const handleSearch = () => {
    setPage(1);
    fetchNews(1, query);
  };

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    navigate('/signin');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header>
        <div className="header-content">
          <h1 className="title">The Daily Chaos</h1>
          <div className="user-section">
            <span className="user-name">
              Welcome, {user.name || user.username || user.email}
            </span>
            <button onClick={handleSignOut} className="signout-btn">Sign Out</button>
          </div>
        </div>
      </header>

      <main>
        <div className="search-container">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news..."
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        <div id="news-container">
          {articles.length === 0 ? (
            <p>No news found.</p>
          ) : (
            articles.map((article, index) => (
              <div key={index} className="card">
                <img
                  src={article.urlToImage || "https://via.placeholder.com/600x300"}
                  alt="news"
                  className="news-img"
                />
                <h3>{article.title}</h3>
                <p>
                  {article.description
                    ? article.description.slice(0, 150)
                    : "No description available"}
                  ...
                </p>
                <a href={article.url} target="_blank" rel="noreferrer">
                  Read More
                </a>
              </div>
            ))
          )}
        </div>

        <div className="pagination">
          <button
            onClick={() => page > 1 && setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <button onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </main>
    </div>
  );
}

export default Home;
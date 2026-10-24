
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  async function clearHistory() {
  const confirmed = window.confirm(
    "Are you sure you want to delete all link history?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch("/api/urls", {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Could not clear history.");
    }

    setUrls([]);
  } catch (error) {
    setError(error.message);
  }
 }

  async function loadUrls() {
    setFetching(true);

    try {
      const response = await fetch("/api/urls");

      if (!response.ok) {
        throw new Error("Could not load links.");
      }

      const data = await response.json();
      setUrls(data);
    } catch {
      setError("Could not load links");
    } finally {
      setFetching(false);
    }
  }

  const refreshClickCounts = async () => {
  try {
    const response = await fetch("/api/urls");
    if (!response.ok) return;

    const data = await response.json();
    setUrls(data);
  } catch (error) {
    console.error("Failed to refresh click counts:", error);
  }
};


  useEffect(() => {
    loadUrls();
  }, []);

    useEffect(() => {
  const handleFocus = () => {
    loadUrls();
  };

  window.addEventListener("focus", handleFocus);

  return () => {
    window.removeEventListener("focus", handleFocus);
  };
}, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedUrl = originalUrl.trim();

    if (!trimmedUrl) {
      setError("Please enter a URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ originalUrl: trimmedUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to shorten URL.");
      }

      setUrls((previous) => [
        data,
        ...previous.filter((item) => item.shortCode !== data.shortCode)
      ].slice(0, 100));

      setOriginalUrl("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink(shortUrl, shortCode) {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedCode(shortCode);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      setError("Copy failed. Please copy the link manually.");
    }
  }

  return (
    <main className="page">
      <nav className="navbar">
        <a className="brand" href="/">
          <span className="brand-icon">↗</span>
          LinkVault
        </a>
        <span className="nav-label">Simple. Fast. Shareable.</span>
      </nav>

      <section className="hero">
        <span className="eyebrow">YOUR LINKS, SIMPLIFIED</span>
        <h1>Short links.<br />Big possibilities.</h1>
        <p className="subtitle">
          Turn long URLs into clean, shareable links in seconds.
        </p>

        <form className="shorten-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="originalUrl">
            Enter your long URL
          </label>

          <input
            id="originalUrl"
            type="url"
            placeholder="https://example.com/your/very/long/url"
            value={originalUrl}
            onChange={(event) => setOriginalUrl(event.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>
            
        {error && <p className="error-message">{error}</p>}

        <p className="hint">
          Paste a complete URL starting with https:// or http://
        </p>
      </section>

      <section className="dashboard">
        <div className="section-heading">
          <div>
            <span className="eyebrow">YOUR WORKSPACE</span>
            <h2>Recent links</h2>
          </div>
          <span className="link-count">{urls.length} links shown</span>
        </div>
 <button onClick={clearHistory}>
                Clear All History
                  </button>
        {fetching ? (
          <div className="empty-state">Loading your links...</div>
        ) : urls.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">↗</span>
            <h3>Your first short link starts here</h3>
            <p>Paste a URL above to see it appear in your workspace.</p>
          </div>
        ) : (
          <div className="link-list">
            {urls.map((url) => (
              <article className="link-card" key={url.shortCode}>
                <div className="link-details">
                  <a
  className="short-link"
  href={getShortUrl(url.shortCode)}
  target="_blank"
  rel="noreferrer"
>
  {getShortUrl(url.shortCode)}
</a>

                  <p className="original-link" title={url.originalUrl}>
                    {url.originalUrl}
                  </p>

                  <div className="link-meta">
                    <span>{url.clicks || 0} clicks</span>
                    <span>
                      {url.createdAt
                        ? new Date(url.createdAt).toLocaleDateString()
                        : "Just now"}
                    </span>
                  </div>
                </div>

                <button
                  className="copy-button"
                  type="button"
                  onClick={() =>
                    copyLink(
                      getShortUrl(url.shortCode),
                      url.shortCode
                    )
                  }
                >
                  {copiedCode === url.shortCode ? "Copied!" : "Copy link"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer>
        <span>Made with care using the MERN stack.</span>
        <span>LinkVault © {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
function getShortUrl(shortCode) {
  if (window.location.hostname === "localhost") {
    return `http://localhost:5000/${shortCode}`;
  }

  return `${window.location.origin}/${shortCode}`;
}

export default App;

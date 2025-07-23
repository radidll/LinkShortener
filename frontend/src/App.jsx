import React, { useState, useEffect } from "react";

const API_URL = "http://localhost:8000";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  const [inputUsername, setInputUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isRegister, setIsRegister] = useState(false);

  const [originalUrl, setOriginalUrl] = useState("");
  const [shortenedLinks, setShortenedLinks] = useState(() => {
    const saved = username ? localStorage.getItem(`shortenedLinks_${username}`) : null;
    return saved ? JSON.parse(saved) : [];
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const localStorageKey = `shortenedLinks_${username}`;

  const saveLinksToLocalStorage = (links) => {
    if (username) {
      localStorage.setItem(localStorageKey, JSON.stringify(links));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inputUsername, password }),
      });
      if (!res.ok) throw new Error("Registration failed");
      setMessage("Registration successful! Please log in.");
      setIsRegister(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: inputUsername, password }),
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();

      setToken(data.access_token);
      setUsername(inputUsername);

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", inputUsername);

      setMessage("Successfully Logged In");

      fetchLinks(data.access_token, inputUsername);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUsername("");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setMessage("The Log Out has been made, the link history is protected.");
  };

  const handleShorten = async () => {
    if (!originalUrl) {
      setError("Please enter a URL");
      return;
    }
    if (!token) {
      setError("You Must Login First");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${API_URL}/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ original_url: originalUrl }),
      });
      if (!res.ok) throw new Error("Shorten fails");
      const data = await res.json();

      const updatedLinks = [data, ...shortenedLinks];
      setShortenedLinks(updatedLinks);
      saveLinksToLocalStorage(updatedLinks);

      setOriginalUrl("");
      setMessage("Link başarıyla Shortenıldı");
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchLinks = async (authToken, user) => {
    try {
      const res = await fetch(`${API_URL}/links`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error("You Do Not Have Any Past Links");
      const data = await res.json();

      setShortenedLinks(data);
      localStorage.setItem(`shortenedLinks_${user}`, JSON.stringify(data));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token && username) {
      fetchLinks(token, username);
    }
  }, [token, username]);

  // Ortak stil objeleri
  const inputStyle = {
    padding: "10px 15px",
    borderRadius: 10,
    border: "none",
    marginBottom: 12,
    width: "100%",
    fontSize: 16,
    outline: "none",
    boxShadow: "0 0 8px rgba(255,255,255,0.1)",
    backgroundColor: "#222",
    color: "white",
  };

  const buttonStyle = {
    padding: "10px 25px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(45deg, #6a11cb, #2575fc)",
    color: "white",
    fontWeight: "600",
    boxShadow: "0 4px 15px rgba(39, 115, 254, 0.4)",
    transition: "all 0.3s ease",
  };

  const buttonHoverStyle = {
    filter: "brightness(1.1)",
  };

  const [loginBtnHover, setLoginBtnHover] = useState(false);
  const [registerBtnHover, setRegisterBtnHover] = useState(false);
  const [shortenBtnHover, setShortenBtnHover] = useState(false);
  const [logoutBtnHover, setLogoutBtnHover] = useState(false);

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "30px auto",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#121212",
        color: "white",
        padding: 25,
        borderRadius: 12,
        minHeight: "90vh",
        position: "relative",
      }}
    >
      {token && (
        <button
          onClick={handleLogout}
          style={{
            ...buttonStyle,
            position: "absolute",
            top: 20,
            right: 20,
            borderRadius: 20,
            padding: "10px 20px",
            ...(logoutBtnHover ? buttonHoverStyle : {}),
          }}
          onMouseEnter={() => setLogoutBtnHover(true)}
          onMouseLeave={() => setLogoutBtnHover(false)}
        >
          Log Out
        </button>
      )}

      <h1 style={{ textAlign: "center", marginBottom: 30 }}>Link Shortener</h1>

      {!token ? (
        <>
          {!isRegister ? (
            <form onSubmit={handleLogin} style={{ marginBottom: 20, position: "relative" }}>
              <h2 style={{ marginBottom: 15 }}>Login</h2>



              <input
                type="text"
                placeholder="Username"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                style={inputStyle}
                required
              />
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
                <button
                  type="submit"
                  style={{
                    ...buttonStyle,
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    borderRadius: "0 10px 10px 0",
                    padding: "10px 20px",
                    ...(loginBtnHover ? buttonHoverStyle : {}),
                  }}
                  onMouseEnter={() => setLoginBtnHover(true)}
                  onMouseLeave={() => setLoginBtnHover(false)}
                >
                  Login
                </button>
              </div>

              <p style={{ marginTop: 25 }}>
                Don't you have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6a11cb",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: "600",
                    padding: 0,
                  }}
                >
                  Sign Up
                </button>
              </p>
              {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
              {message && <p style={{ color: "#4caf50" }}>{message}</p>}
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ marginBottom: 20 }}>
              <h2 style={{ marginBottom: 15 }}>Sign Up</h2>
              <input
                type="text"
                placeholder="Username"
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value)}
                style={inputStyle}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  width: "100%",
                  marginTop: 10,
                  ...(registerBtnHover ? buttonHoverStyle : {}),
                }}
                onMouseEnter={() => setRegisterBtnHover(true)}
                onMouseLeave={() => setRegisterBtnHover(false)}
              >
                Sign Up
              </button>
              <p style={{ marginTop: 25 }}>
                Do you already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6a11cb",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontWeight: "600",
                    padding: 0,
                  }}
                >
                  Login
                </button>
              </p>
              {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
              {message && <p style={{ color: "#4caf50" }}>{message}</p>}
            </form>
          )}
        </>
      ) : (
        <>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontWeight: "600", fontSize: 18, color: "white" }}>
              Welcome , <span style={{ color: "#6a11cb" }}>{username}</span>
            </span>
          </div>

          <div style={{ display: "flex", marginBottom: 20, gap: 8 }}>
            <input
              type="url"
              placeholder=" Long Url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              style={{ ...inputStyle, flexGrow: 1 }}
            />
            <button
              onClick={handleShorten}
              style={{
                ...buttonStyle,
                borderRadius: 20,
                padding: "10px 20px",
                ...(shortenBtnHover ? buttonHoverStyle : {}),
              }}
              onMouseEnter={() => setShortenBtnHover(true)}
              onMouseLeave={() => setShortenBtnHover(false)}
            >
              Shorten
            </button>
          </div>

          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
          {message && <p style={{ color: "#4caf50" }}>{message}</p>}

          
        

          <ul style={{ listStyle: "none", padding: 0 }}>
            {shortenedLinks.map(({ short_url, original_url, click_count }, idx) => (
              <li
                key={idx}
                style={{
                  padding: 10,
                  borderBottom: "1px solid #444",
                  marginBottom: 10,
                  borderRadius: 8,
                  backgroundColor: "#222",
                }}
              >
                <a
                  href={short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: "600", color: "#6a11cb" }}
                >
                  {short_url}
                </a>
                <p style={{ color: "#ccc", marginTop: 4 }}>Orijinal URL: {original_url}</p>
                <p style={{ color: "#ccc" }}>Number of Clicks: {click_count}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

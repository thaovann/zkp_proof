import React, { useState } from "react";
import "./App.css"; // Thêm CSS để cải thiện giao diện

function App() {
  const [p, setP] = useState("");
  const [q, setQ] = useState("");
  const [message, setMessage] = useState(null); // State for success/failure message
  const [error, setError] = useState(null); // State for error handling

  const handleGenerateProof = async () => {
    // Validate that p and q are numbers and not empty
    if (!p || !q || isNaN(p) || isNaN(q)) {
      setError("Vui lòng nhập các giá trị hợp lệ cho p và q.");
      setMessage(null); // Clear previous success message
      return;
    }

    try {
      // Clear previous messages
      setError(null);
      setMessage(null);

      // Gửi yêu cầu đến API backend
      const response = await fetch("http://localhost:3001/api/check-lottery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p: Number(p), q: Number(q) }), // Ensure p and q are sent as numbers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Có lỗi xảy ra khi xác minh.");
      }

      const data = await response.json();

      // Kiểm tra nếu người dùng trúng số
      if (data.isWinner) {
        setMessage("Chúc mừng! Bạn đã trúng số!");
      } else {
        setMessage("Rất tiếc, bạn không trúng số.");
      }
    } catch (error) {
      setError("Lỗi khi gọi API: " + error.message);
    }
  };

  return (
    <div className="app">
      <div className="form-container">
        <h1>ZKP Lotto</h1>
        <input
          type="number"
          placeholder="Nhập số bí mật p"
          value={p}
          onChange={(e) => setP(e.target.value)}
        />
        <input
          type="number"
          placeholder="Nhập số bí mật q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={handleGenerateProof}>Kiểm tra kết quả</button>
        {error && <div className="error-message">{error}</div>}
        {message && (
          <div className={`message ${message.includes("Chúc mừng") ? "success" : "failure"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

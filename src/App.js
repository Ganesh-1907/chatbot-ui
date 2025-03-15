import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { TypingIndicator, MessageInput } from "@chatscope/chat-ui-kit-react";

function App() {
  const [schema, setSchema] = useState("");
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // Stores chat history
  const [loading, setLoading] = useState(false); // Loader state
  const chatContainerRef = useRef(null); // Ref for chat container

  const handleGenerateSQL = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/generate-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schema_input: schema,
          query_input: query,
        }),
      });

      const data = await response.json();
      const generatedSQL = data.generated_sql || "Error generating SQL";

      // Add new chat entry
      setChatHistory((prevChat) => [
        ...prevChat,
        { schema, question: query, response: generatedSQL },
      ]);
    } catch (error) {
      console.error("Error fetching SQL:", error);
    }
    setLoading(false);
  };

  const handleClear = () => {
    setSchema("");
    setQuery("");
  };

  // Auto-scroll to the bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory,loading]);

  return (
    <div className="container">
      <h2>SQL Query Generator</h2>

      {/* Chat Display */}
      <div className="display">
        <div className="chat-container" ref={chatContainerRef}>
          {chatHistory.length > 0 ? (
            chatHistory.map((item, index) => (
              <div key={index} className="chat-entry">
                <div className="schema">{item.schema}</div>
                <div className="question">{item.question}</div>
                <div className="response">{item.response}</div>
              </div>
            ))
          ) : (
            <div className="empty-chat">HEY ! ASK ME ANYTHING</div>
          )}
          {loading && <TypingIndicator className="loader" content="Typing..." />} {/* Loader */}
        </div>
      </div>

      {/* Fixed Input Fields */}
      <form onSubmit={handleGenerateSQL} className="input-section">
        <textarea
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
          placeholder="Enter your database or Table Schema..."
          rows="5"
          required
        />
        <br />
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query in natural language..."
          rows="2"
          required
        />
        <div className="button-group">
          <button className="btn" type="submit">Generate SQL</button>
          <button className="btn clear-btn" type="button" onClick={handleClear}>Clear</button>
        </div>
      </form>
    </div>
  );
}

export default App;

import React, { useEffect, useRef, useState } from "react";

const SERVER_URL = "wss://back3.scalcraft.com/";

export default function WebSocketIndicator() {
  const [status, setStatus] = useState("Connecting");
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("Connected");
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "welcome") {
          console.log("[Server Notice]:", parsed.message);
        }
      } catch (err) {
        // Non-JSON message handler if needed
      }
    };

    ws.onerror = () => {
      setStatus("Error");
    };

    ws.onclose = () => {
      setStatus("Disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  // Helper for status dot color
  const getStatusColor = () => {
    switch (status) {
      case "Connected":
        return "#22c55e"; // Green
      case "Connecting":
        return "#eab308"; // Yellow/Amber
      case "Error":
        return "#ef4444"; // Red
      default:
        return "#6b7280"; // Gray
    }
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontFamily: "sans-serif", fontSize: "14px" }}>
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: getStatusColor(),
          display: "inline-block",
          boxShadow: "0 0 4px rgba(0,0,0,0.1)",
        }}
      />
      <span>
        Server: <strong>{status}</strong>
      </span>
    </div>
  );
}
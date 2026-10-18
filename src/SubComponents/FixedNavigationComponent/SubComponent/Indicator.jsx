
import React, { useEffect, useState } from "react";

const SERVER_URL = "wss://back3.scalcraft.com/";

export default function WebSocketIndicator() {
  const [status, setStatus] = useState("Connecting");

  useEffect(() => {
    let ws
    let reconnectTimer
    let heartbeatTimer
    let reconnectDelay = 3000;
    let disposed = false;

    function connect() {
      if (disposed) return;

      setStatus("Connecting");
      ws = new WebSocket(SERVER_URL);

      ws.onopen = () => {
        setStatus("Connected");
        reconnectDelay = 3000;

        // Detect a connection that stops responding.
        heartbeatTimer = setInterval(() => {
          if (ws?.readyState !== WebSocket.OPEN) {
            clearInterval(heartbeatTimer);
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);

          if (parsed.type === "welcome") {
            console.log("[Server Notice]:", parsed.message);
          }
        } catch {
          // Ignore non-JSON messages.
        }
      };

      ws.onerror = () => {
        setStatus("Error");
      };

      ws.onclose = () => {
        clearInterval(heartbeatTimer);

        if (disposed) return;

        setStatus("Disconnected");

        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
          connect();
        }, reconnectDelay);
      };
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      clearInterval(heartbeatTimer);
      ws?.close();
    };
  }, []);

  const color =
    status === "Connected"
      ? "#22c55e"
      : status === "Connecting"
        ? "#eab308"
        : status === "Error"
          ? "#ef4444"
          : "#6b7280";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "sans-serif",
        fontSize: 14,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: color,
          display: "inline-block",
        }}
      />
      <span>
        Server: <strong>{status}</strong>
      </span>
    </div>
  );
}

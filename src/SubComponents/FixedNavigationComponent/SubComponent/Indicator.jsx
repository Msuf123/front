
import React, { useEffect, useState } from "react";

const SERVER_URL = "wss://back3.scalcraft.com/";

export default function WebSocketIndicator() {
  const [status, setStatus] = useState("Connecting");

  useEffect(() => {
    let ws;
    let reconnectTimer;
    let heartbeatTimer;
    let reconnectDelay = 3000;
    let disposed = false;

    const log = (event, details = "") => {
      console.log(
        `[WebSocket ${new Date().toISOString()}] ${event}`,
        details
      );
    };

    function connect() {
      if (disposed) return;

      log("Connecting", SERVER_URL);
      setStatus("Connecting");

      try {
        ws = new WebSocket(SERVER_URL);
      } catch (error) {
        log("Connection creation failed", error);
        setStatus("Error");
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        log("Connected", SERVER_URL);
        setStatus("Connected");
        reconnectDelay = 3000;

        clearInterval(heartbeatTimer);

        heartbeatTimer = setInterval(() => {
          if (ws?.readyState !== WebSocket.OPEN) {
            log("Heartbeat check failed: socket is not open");
            clearInterval(heartbeatTimer);
            return;
          }

          log("Heartbeat check: socket is open");
        }, 10000);
      };

      ws.onmessage = (event) => {
        log("Message received", event.data);

        try {
          const parsed = JSON.parse(event.data);

          if (parsed.type === "welcome") {
            log("Server welcome", parsed.message);
          }
        } catch {
          log("Received non-JSON message");
        }
      };

      ws.onerror = (event) => {
        log("Connection error", event);
        setStatus("Error");
      };

      ws.onclose = (event) => {
        clearInterval(heartbeatTimer);

        log("Connection closed", {
          code: event.code,
          reason: event.reason || "(no reason provided)",
          wasClean: event.wasClean,
        });

        if (disposed) return;

        setStatus("Disconnected");
        scheduleReconnect();
      };
    }

    function scheduleReconnect() {
      if (disposed) return;

      const delay = reconnectDelay;

      log("Reconnecting scheduled", `${delay}ms`);
      reconnectTimer = setTimeout(() => {
        reconnectDelay = Math.min(reconnectDelay * 2, 30000);
        connect();
      }, delay);
    }

    connect();

    return () => {
      disposed = true;
      clearTimeout(reconnectTimer);
      clearInterval(heartbeatTimer);

      log("Component unmounted; closing WebSocket");
      ws?.close(1000, "Component unmounted");
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

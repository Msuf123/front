
import React, { useEffect, useState } from "react";
import { aiInputSearch, antibiotics, apiUrl, dataBack, organismName } from "../../../Atoms/atoms";
import { useAtomValue } from "jotai";
import { useSetAtom } from "jotai/react";

const SERVER_URL = "wss://back3.scalcraft.com/";
export default function WebSocketIndicator({ onNewDataAvailable }) {
  const [status, setStatus] = useState("Connecting");

  // Read current values from Jotai atoms
  const organism = useAtomValue(organismName);
  const antibiotic = useAtomValue(antibiotics);
  const query = useAtomValue(aiInputSearch);
  const API_URL = useAtomValue(apiUrl);

  // Setters for updating state after the automatic API call
  const setReportData = useSetAtom(dataBack);
 

  useEffect(() => {
    let ws;
    let reconnectTimer;
    let heartbeatTimer;
    let reconnectDelay = 3000;
    let disposed = false;

    const log = (event, details = "") => {
      console.log(`[WebSocket ${new Date().toISOString()}] ${event}`, details);
    };

    // Function to automatically trigger the API fetch using atom values
    const triggerFetch = async () => {
      const trimmedOrganism = organism?.trim();
      const trimmedAntibiotic = antibiotic?.trim();
      const trimmedQuery = query?.trim() || "";

      if (!trimmedOrganism || !trimmedAntibiotic) {
        console.warn("WebSocket triggered data fetch, but organism or antibiotic is missing in atoms.");
        return;
      }

      log("Triggering automatic API request due to NEW_DATA_AVAILABLE");
      setSplitTheScreen(false);
      setReportData(null);

      try {
        const response = await fetch(`${API_URL}data/testResult`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organism: trimmedOrganism,
            antibiotic: trimmedAntibiotic,
            query: trimmedQuery,
          }),
        });

        const result = await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error(result.message || "Unable to generate the report.");
        }

        setReportData(result.data);
        log("Automatic report data successfully fetched and updated.");
      } catch (err) {
        console.error("Automatic fetch failed:", err.message);
        setSplitTheScreen(false);
      }
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
            clearInterval(heartbeatTimer);
            return;
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        log("Message received", event.data);

        try {
          const parsed = JSON.parse(event.data);

          if (parsed.type === "welcome") {
            log("Server welcome", parsed.message);
          }

          if (parsed.event === "NEW_DATA_AVAILABLE") {
            setReportData(null)
            // Automatically make the API request instead of showing an alert
            triggerFetch();
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
      ws?.close(1000, "Component unmounted");
    };
  }, [organism, antibiotic, query, API_URL]); // Re-bind/reference latest atom values safely

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
import { useState, useEffect } from "react";
import styled from "styled-components";
import { requestNotificationPermission } from "@/config/firebaseConfig";
import { api } from "@/lib/api";

const NotificationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
`;

const NotificationButton = styled.button<{ $enabled: boolean }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${(props) =>
    props.$enabled
      ? `
      background: #10b981;
      color: white;
      &:hover {
        background: #059669;
      }
    `
      : `
      background: #6b7280;
      color: white;
      &:hover {
        background: #4b5563;
      }
    `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationIcon = styled.span<{ $enabled: boolean }>`
  font-size: 1rem;
  ${(props) => (props.$enabled ? "color: #10b981;" : "color: #6b7280;")}
`;

const NotificationStatus = styled.span<{ $enabled: boolean }>`
  font-size: 0.75rem;
  ${(props) => (props.$enabled ? "color: #10b981;" : "color: #6b7280;")}
`;

export default function NotificationControls() {
  const [notificationState, setNotificationState] = useState<
    "default" | "granted" | "denied" | "requesting"
  >("default");
  const [token, setToken] = useState<string | null>(null);

  // Check current notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationState(
        Notification.permission === "granted"
          ? "granted"
          : Notification.permission === "denied"
            ? "denied"
            : "default",
      );
    }
  }, []);

  const handleRequestPermission = async () => {
    if (notificationState === "requesting") return;

    // If notifications are currently denied, guide user to browser settings
    if (notificationState === "denied") {
      alert(
        "Notifications are currently blocked.\n\n" +
        "To enable notifications:\n" +
        "1. Click the lock/shield icon in your browser's address bar\n" +
        "2. Set 'Notifications' to 'Allow'\n" +
        "3. Refresh the page and click 'Enable Notifications' again"
      );
      return;
    }

    setNotificationState("requesting");

    try {
      const fcmToken = await requestNotificationPermission();

      if (fcmToken) {
        // Save token to backend
        try {
          await api.post("/notifications/fcm-token", { token: fcmToken });
          console.log("FCM Token saved to backend:", fcmToken);
        } catch (apiError) {
          console.error("Failed to save FCM token to backend:", apiError);
          // Continue anyway since we have the token locally
        }

        setToken(fcmToken);
        setNotificationState("granted");
      } else {
        setNotificationState("denied");
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      setNotificationState("denied");
    }
  };

  const getButtonText = () => {
    switch (notificationState) {
      case "granted":
        return "🔔 Notifications On";
      case "denied":
        return "🔕 Enable in Browser";
      case "requesting":
        return "⏳ Requesting...";
      default:
        return "🔔 Enable Notifications";
    }
  };

  const getStatusText = () => {
    switch (notificationState) {
      case "granted":
        return "Enabled";
      case "denied":
        return "Blocked - Click to Enable";
      case "requesting":
        return "Requesting...";
      default:
        return "Click to Enable";
    }
  };

  return (
    <NotificationContainer>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.25rem",
        }}
      >
        <NotificationButton
          $enabled={notificationState === "granted"}
          onClick={handleRequestPermission}
          disabled={notificationState === "requesting"}
          title={
            notificationState === "denied" 
              ? "Notifications were blocked. Click to open browser settings to re-enable them."
              : "Click to enable browser notifications"
          }
        >
          {getButtonText()}
        </NotificationButton>
        <NotificationStatus $enabled={notificationState === "granted"}>
          Status: {getStatusText()}
        </NotificationStatus>
      </div>
    </NotificationContainer>
  );
}

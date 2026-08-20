import { Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import TopBar from "../components/TopBar.jsx";
import { useSocket } from "../context/SocketContext.jsx";

export default function ControlCenterLayout() {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const handler = () => setNotificationCount((n) => n + 1);
    socket.on("notification:new", handler);
    return () => socket.off("notification:new", handler);
  }, [socket]);

  function handleBellClick() {
    setNotificationCount(0);
    navigate("/control/notifications");
  }

  return (
    <div className="h-screen flex flex-col bg-base">
      <TopBar notificationCount={notificationCount} onBellClick={handleBellClick} />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

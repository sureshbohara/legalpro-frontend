"use client";
import { Bell, Moon, Sun, Globe, User, LogOut, Lock, Menu, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { notificationService } from "@/services/notificationService";
import { Notification } from "@/types";
import Link from "next/link";
import GlobalSearchModal from "@/components/GlobalSearchModal"; 
import toast from "react-hot-toast";

interface HeaderProps {
  onMenuClick?: () => void; 
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotif, setIsLoadingNotif] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = localStorage.getItem("darkMode") === "enabled";
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
  
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoadingNotif(true);
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setIsLoadingNotif(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read", error);
      toast.error("Failed to update notifications");
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await notificationService.markAsRead(notif.id);
        setNotifications(prev => 
          prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
    setShowNotifications(false);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode ? "enabled" : "disabled");
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (!mounted) return null;

  const displayName = user?.name || "User";
  const displayRole = user?.roles?.[0]?.name || "Administrator";
  const userInitial = displayName.charAt(0).toUpperCase();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 transition-colors">
      

      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Hamburger Menu */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu size={22} />
        </button>
        
        <GlobalSearchModal />
      </div>


      <div className="flex items-center gap-2 md:gap-3">
      
  
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="hidden sm:inline text-sm font-medium">{darkMode ? "Dark" : "Light"}</span>
        </button>


        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors"
          title="View Public Website"
        >
          <Globe size={18} />
          <span className="text-sm font-medium">Website</span>
        </a>

        
        <div className="relative">
          <button
            onClick={() => { 
              setShowNotifications(!showNotifications); 
              setShowProfile(false); 
              if (!showNotifications && unreadCount > 0) loadNotifications(); 
            }}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between bg-gray-50 dark:bg-slate-800/50">
                <h6 className="font-semibold text-gray-800 dark:text-white text-sm">Notifications</h6>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 flex items-center gap-1 font-medium transition-colors"
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600">
                {isLoadingNotif ? (
                  <div className="p-8 text-center text-gray-500 text-sm">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <Link 
                      key={notif.id} 
                      href={notif.link || '#'}
                      onClick={() => handleNotificationClick(notif)}
                      className={`block p-4 border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-sm font-semibold ${!notif.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></span>}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1.5">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                        {notif.time}
                      </p>
                    </Link>
                  ))
                )}
              </div>
              
              <div className="p-2 border-t border-gray-200 dark:border-slate-700 text-center bg-gray-50 dark:bg-slate-800/50">
                <Link 
                  href="/activity-logs" 
                  onClick={() => setShowNotifications(false)} 
                  className="text-xs text-green-600 dark:text-green-400 hover:underline font-medium"
                >
                  View All Activity
                </Link>
              </div>
            </div>
          )}
        </div>

  
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {userInitial}
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300">
              {displayName}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{displayRole}</p>
              </div>
              <div className="py-1">
                <Link 
                  href="/profile" 
                  onClick={() => setShowProfile(false)} 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <User size={16} /> Update Profile
                </Link>
                <Link 
                  href="/profile/password" 
                  onClick={() => setShowProfile(false)} 
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Lock size={16} /> Change Password
                </Link>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
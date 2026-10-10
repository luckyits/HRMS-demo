import { ScopeBadge } from '@/components/common/ScopeBadge'
import { useDemo } from '@/context/DemoContext'
import { useTheme } from '@/context/ThemeContext'
import { NotificationService } from '@/services/notificationService'
import type { Scope } from '@/types'
import {
  Bell,
  Check,
  ChevronDown,
  Globe,
  LogOut,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface TopBarProps {
  onToggleSidebar?: () => void
}

export const TopBar: React.FC<TopBarProps> = () => {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { settings, resetDemoData } = useDemo()

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => NotificationService.getAll())

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('hrms_language', lng)
    setLangMenuOpen(false)
  }

  const handleMarkAllRead = () => {
    const updated = NotificationService.markAllAsRead()
    setNotifications(updated)
  }

  // Derive active scope
  let currentScope: Scope = 'All'
  if (settings.role === 'Manager') currentScope = 'Team'
  if (settings.role === 'Employee') currentScope = 'Self'

  return (
    <header className="h-16 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left: Global Search & Active Scope */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-12 py-1.5 text-xs sm:text-sm bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground bg-muted rounded border border-border">
            Ctrl+K
          </kbd>
        </div>
        <div className="hidden lg:block shrink-0">
          <ScopeBadge scope={currentScope} />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="uppercase font-semibold">{i18n.language}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {langMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-card border border-border rounded-xl shadow-lg py-1 z-40 text-xs">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-muted ${
                  i18n.language === 'en' ? 'font-semibold text-primary' : 'text-foreground'
                }`}
              >
                <span>English (EN)</span>
                {i18n.language === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('hi')}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-muted ${
                  i18n.language === 'hi' ? 'font-semibold text-primary' : 'text-foreground'
                }`}
              >
                <span>हिन्दी (HI)</span>
                {i18n.language === 'hi' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('gu')}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-muted ${
                  i18n.language === 'gu' ? 'font-semibold text-primary' : 'text-foreground'
                }`}
              >
                <span>ગુજરાતી (GU)</span>
                {i18n.language === 'gu' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground transition relative"
            title={t('notifications')}
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-card border border-border rounded-xl shadow-xl z-40 text-xs">
              <div className="flex items-center justify-between p-3 border-b border-border">
                <span className="font-semibold text-foreground">{t('notifications')}</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-primary hover:underline text-[11px]"
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">{t('noNotifications')}</p>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3 hover:bg-muted/50 transition cursor-pointer ${
                        !n.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-medium text-foreground">{n.title}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 pl-1.5 pr-2 py-1 rounded-lg border border-border bg-background hover:bg-muted transition text-left"
          >
            <img
              src={settings.currentUser.avatar}
              alt={settings.currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-border"
            />
            <div className="hidden sm:block text-left pr-1">
              <p className="text-xs font-semibold leading-none text-foreground">
                {settings.currentUser.name}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {settings.role}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 z-40 text-xs">
              <div className="px-3 py-2 border-b border-border">
                <p className="font-semibold text-foreground">{settings.currentUser.name}</p>
                <p className="text-muted-foreground text-[11px] truncate">
                  {settings.currentUser.email}
                </p>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-primary">
                  <span>ID: {settings.currentUser.empId}</span>
                  <span>•</span>
                  <span>{settings.companyType} Template</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    alert('Profile settings screen')
                    setProfileMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted text-foreground"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{t('profile')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetDemoData()
                    setProfileMenuOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-muted text-rose-600 dark:text-rose-400"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('resetDemo')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

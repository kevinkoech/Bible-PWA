import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Label } from '../components/ui/Label';
import { Switch } from '../components/ui/Switch';
import { Select, SelectItem } from '../components/ui/Select';
//import { Button } from '../ui/Button';
import { Button } from '../components/ui/button';

const BIBLE_VERSIONS = [
  { value: 'kjv', label: 'King James Version (KJV)' },
  { value: 'web', label: 'World English Bible (WEB)' },
  { value: 'asv', label: 'American Standard Version (ASV)' },
  { value: 'bbe', label: 'Bible in Basic English (BBE)' },
  { value: 'ylt', label: "Young's Literal Translation (YLT)" },
];

const THEMES = ['light', 'dark', 'system'];

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [bibleVersion, setBibleVersion] = useState('kjv');
  const [theme, setTheme] = useState('system');
  const [notificationTime, setNotificationTime] = useState('09:00');

  useEffect(() => {
    const savedVersion = localStorage.getItem('bible_version') || 'kjv';
    const savedNotifications = localStorage.getItem('notifications_enabled') === 'true';
    const savedTime = localStorage.getItem('notification_time') || '09:00';
    const savedTheme = localStorage.getItem('theme') || 'system';

    setBibleVersion(savedVersion);
    setNotificationsEnabled(savedNotifications);
    setNotificationTime(savedTime);
    setTheme(savedTheme);
  }, []);

  const handleNotificationToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    localStorage.setItem('notifications_enabled', enabled ? 'true' : 'false');
  };

  const handleVersionChange = (version: string) => {
    setBibleVersion(version);
    localStorage.setItem('bible_version', version);
  };

  const handleTimeChange = (time: string) => {
    setNotificationTime(time);
    localStorage.setItem('notification_time', time);
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    localStorage.setItem('theme', value);
  };

  const handleClearCache = () => {
    localStorage.removeItem('daily_verse');
    localStorage.removeItem('verse_history');
    localStorage.removeItem('bible_version');
    localStorage.removeItem('theme');
    setNotificationsEnabled(false);
    setBibleVersion('kjv');
    setTheme('system');
    setNotificationTime('09:00');
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      {/* Bible Version */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bible Version</CardTitle>
          <CardDescription>Choose your preferred Bible translation</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={bibleVersion} onValueChange={handleVersionChange}>
            {BIBLE_VERSIONS.map((version) => (
              <SelectItem key={version.value} value={version.value}>
                {version.label}
              </SelectItem>
            ))}
          </Select>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Receive daily verse notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="cursor-pointer">
              Enable daily notifications
            </Label>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>

          {notificationsEnabled && (
            <div className="space-y-2">
              <Label htmlFor="notification-time">Notification Time</Label>
              <input
                id="notification-time"
                type="time"
                value={notificationTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the app's appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={theme} onValueChange={handleThemeChange}>
            {THEMES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </Select>
        </CardContent>
      </Card>

      {/* Clear Cache */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your cached data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleClearCache} className="w-full bg-red-600 text-white hover:bg-red-700">
            Clear Cache
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

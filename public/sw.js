// Minimal Service Worker for the Thai vocab app.
// Currently it only handles in-page reminder messages: when the page posts
// `{ type: 'show-reminder', body }`, it surfaces a system notification.
// Real backend-driven push (Web Push API + VAPID) is intentionally out of scope.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', event => {
  const data = event.data
  if (!data || data.type !== 'show-reminder') return
  const title = data.title || '英文學習提醒'
  const body = data.body || '今天還沒複習喔！'
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon.png',
      badge: '/icon.png',
      tag: 'study-reminder',
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      for (const c of clients) {
        if ('focus' in c) return c.focus()
      }
      return self.clients.openWindow('/app')
    })
  )
})

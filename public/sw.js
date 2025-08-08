self.addEventListener('push', function(event) {
  const data = event.data.json();

  event.waitUntil(
      (async () => {
        // تخزين في localStorage (من خلال client)
        const allClients = await self.clients.matchAll({ includeUncontrolled: true });
        for (const client of allClients) {
          client.postMessage({ type: 'new-notification', payload: data.body });
        }

        // عرض الإشعار
        self.registration.showNotification(data.title, {
          body: data.body,
          icon: data.icon || 'logo.png'
        });
      })()
  );
});


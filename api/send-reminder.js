// api/send-reminder.js
import { supabase } from '../supabaseClient.js';
import webpush from 'web-push';

// Configure VAPID keys
webpush.setVapidDetails(
  'mailto:you@example.com',
  'BOWP9TLniGm1C2pR7r9yCF4gWxlrxbTZqvCTX1lEK0n3hloeizZ_W3zPXxxkCzesiM788wtiedxG2Iq6VPlAQ64',
  'k-5QT2A3zMm1tJyCHA7Q0ej5lmntj_VHY_H5bNOiTRQ'
);


export default async function handler(req, res) {
  try {
    // 1. Fetch all subscriptions from the Supabase table
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('subscription');

    if (error) {
      console.error('Failed to fetch subscriptions:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch subscriptions' });
    }

    // 2. Send a notification to each subscriber
    const notificationPayload = JSON.stringify({
      title: "تذكير: تقرير الأربعاء",
      body: "لا تنسى تقرير لهذا اليوم!",
      icon: "/logo.png"
    });

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub.subscription, notificationPayload);
      } catch (pushError) {
        console.error('Failed to send push notification:', pushError);
      }
    }

    res.status(200).json({ success: true, message: `Sent reminder to ${subscriptions.length} users.` });
  } catch (err) {
    console.error('Internal server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
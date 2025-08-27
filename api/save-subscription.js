import { supabase } from '../supabaseClient.js';
import webpush from 'web-push';




webpush.setVapidDetails(
  'mailto:you@example.com',
  'BOWP9TLniGm1C2pR7r9yCF4gWxlrxbTZqvCTX1lEK0n3hloeizZ_W3zPXxxkCzesiM788wtiedxG2Iq6VPlAQ64',
  'k-5QT2A3zMm1tJyCHA7Q0ej5lmntj_VHY_H5bNOiTRQ'
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const subscription = req.body;
    const { userId, isAdmin } = req.body; 
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ success: false, message: 'بيانات الاشتراك غير صالحة' });
  }

  try {
    // Check if the subscription already exists
    const { data: existingSubs, error: selectError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscription->>endpoint', subscription.endpoint) // Use ->> for JSONB queries
      .limit(1);

    if (selectError) {
      console.error('Supabase select error:', selectError);
      return res.status(500).json({ error: 'حدث خطأ داخلي' });
    }
    let isNewSubscription = false;
    if (existingSubs.length === 0) {
      // If subscription doesn't exist, insert the full JSON object
        let insertObject = {
        subscription: subscription,
        };
    
    // Check if the user is an admin and include their ID
        if (isAdmin) {
        insertObject.user_id = userId;
        }
      const { data, error: insertError } = await supabase
        .from('subscriptions')
        .insert([insertObject]);
      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return res.status(500).json({ error: 'فشل حفظ الاشتراك' });
      }
      isNewSubscription = true;
    }


    // Attempt to send a confirmation notification
    const notificationPayload = {
      title: "✅ تم الاشتراك بنجاح!",
      body: "سيصلك إشعار التذكير يوم الأربعاء بإذن الله.",
      icon: "logo.png"
    };

    await webpush.sendNotification(subscription, JSON.stringify(notificationPayload));

    if (isNewSubscription) {
        res.status(201).json({ success: true, message: '✅ تم الاشتراك بنجاح!' });
    } else {
        res.status(200).json({ success: true, message: '✅ الاشتراك موجود مسبقاً.' });
    }

  } catch (err) {
    console.error('فشل إرسال الإشعار:', err);
    res.status(200).json({ success: true, message: 'تم الحفظ، لكن فشل إرسال الإشعار.' });
  }
}
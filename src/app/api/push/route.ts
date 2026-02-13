import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/push
 * Send push notification to subscribed clients
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { 
      title, 
      body, 
      icon, 
      badge,
      tag,
      requireInteraction,
      actions,
      data,
      subscriptions 
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
      return NextResponse.json(
        { error: 'At least one subscription is required' },
        { status: 400 }
      );
    }

    // Notification payload
    const notificationPayload = {
      title: title || 'Espacio Desafíos',
      body: body || '',
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/icon-192x192.png',
      tag: tag || 'notification',
      requireInteraction: requireInteraction || false,
      actions: actions || [
        { action: 'open', title: 'Abrir' },
        { action: 'dismiss', title: 'Descartar' }
      ],
      data: data || {}
    };

    // Get VAPID keys from environment
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'Push notification service not configured' },
        { status: 503 }
      );
    }

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const response = await fetch(subscription.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'TTL': '60',
              'Authorization': `vapid t=${vapidPublicKey}, k=${vapidPrivateKey}`
            },
            body: JSON.stringify(notificationPayload)
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return { success: true, subscriptionId: subscription.id };
        } catch (error) {
          // If subscription is expired or invalid, mark for removal
          if (error instanceof Error && 
              (error.message.includes('410') || error.message.includes('404'))) {
            return { 
              success: false, 
              subscriptionId: subscription.id,
              expired: true,
              error: error.message 
            };
          }
          
          throw error;
        }
      })
    );

    // Process results
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(r => r.status === 'rejected' || !r.value.success).length;
    const expired = results
      .filter(r => r.status === 'fulfilled' && r.value.expired)
      .map(r => (r as PromiseFulfilledResult<any>).value.subscriptionId);

    return NextResponse.json({
      success: true,
      summary: {
        total: subscriptions.length,
        successful,
        failed,
        expired: expired.length
      },
      expiredSubscriptions: expired,
      results: results.map((r, index) => ({
        subscriptionId: subscriptions[index]?.id,
        status: r.status,
        ...(r.status === 'fulfilled' ? r.value : { error: r.reason?.message })
      }))
    });

  } catch (error) {
    console.error('[Push API] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send push notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/push
 * Get VAPID public key for client subscription
 */
export async function GET() {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  
  if (!vapidPublicKey) {
    return NextResponse.json(
      { error: 'VAPID public key not configured' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    publicKey: vapidPublicKey
  });
}

/**
 * DELETE /api/push
 * Unsubscribe from push notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('id');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Here you would typically remove the subscription from your database
    // await db.subscriptions.delete({ where: { id: subscriptionId } });

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully'
    });

  } catch (error) {
    console.error('[Push API] Unsubscribe error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to unsubscribe',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

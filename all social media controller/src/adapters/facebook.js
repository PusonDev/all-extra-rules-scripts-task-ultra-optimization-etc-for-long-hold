/**
 * Meta Facebook Page Dispatcher
 * Uses official Meta Graph API v21.0 (100% Free)
 */
export async function sendFacebook({ pageAccessToken, pageId, text, mediaUrl, linkUrl }) {
  if (!pageAccessToken || !pageId) {
    return {
      success: false,
      skipped: true,
      platform: 'facebook',
      error: 'Missing FACEBOOK_PAGE_ACCESS_TOKEN or FACEBOOK_PAGE_ID'
    };
  }

  try {
    let endpoint = `https://graph.facebook.com/v21.0/${pageId}/feed`;
    const params = new URLSearchParams({ access_token: pageAccessToken });

    if (mediaUrl) {
      endpoint = `https://graph.facebook.com/v21.0/${pageId}/photos`;
      params.set('url', mediaUrl);
      params.set('caption', text);
    } else {
      params.set('message', text);
      if (linkUrl) {
        params.set('link', linkUrl);
      }
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      body: params
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.error) {
      return {
        success: false,
        platform: 'facebook',
        error: result.error?.message || `Facebook Graph API failed (${response.status})`
      };
    }

    return {
      success: true,
      platform: 'facebook',
      id: result.post_id || result.id
    };
  } catch (err) {
    return { success: false, platform: 'facebook', error: err.message };
  }
}

/**
 * Meta Instagram Business / Creator Dispatcher
 * Uses official Instagram Graph API v21.0 (100% Free)
 * Note: Instagram Graph API requires a publicly reachable mediaUrl (image).
 */
export async function sendInstagram({ accessToken, igUserId, text, mediaUrl }) {
  if (!accessToken || !igUserId) {
    return {
      success: false,
      skipped: true,
      platform: 'instagram',
      error: 'Missing INSTAGRAM_ACCESS_TOKEN (or FACEBOOK_PAGE_ACCESS_TOKEN) or INSTAGRAM_USER_ID'
    };
  }

  if (!mediaUrl) {
    return {
      success: false,
      platform: 'instagram',
      error: 'Instagram Graph API requires mediaUrl (a public image URL)'
    };
  }

  try {
    // Step 1: Create media container
    const createParams = new URLSearchParams({
      image_url: mediaUrl,
      caption: text.slice(0, 2200),
      access_token: accessToken
    });

    const createRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media`, {
      method: 'POST',
      body: createParams
    });

    const createData = await createRes.json().catch(() => ({}));
    if (!createRes.ok || createData.error || !createData.id) {
      return {
        success: false,
        platform: 'instagram',
        error: createData.error?.message || `Instagram container creation failed (${createRes.status})`
      };
    }

    // Step 2: Publish media container
    const publishParams = new URLSearchParams({
      creation_id: createData.id,
      access_token: accessToken
    });

    const publishRes = await fetch(`https://graph.facebook.com/v21.0/${igUserId}/media_publish`, {
      method: 'POST',
      body: publishParams
    });

    const publishData = await publishRes.json().catch(() => ({}));
    if (!publishRes.ok || publishData.error || !publishData.id) {
      return {
        success: false,
        platform: 'instagram',
        error: publishData.error?.message || `Instagram publish failed (${publishRes.status})`
      };
    }

    return {
      success: true,
      platform: 'instagram',
      id: publishData.id
    };
  } catch (err) {
    return { success: false, platform: 'instagram', error: err.message };
  }
}

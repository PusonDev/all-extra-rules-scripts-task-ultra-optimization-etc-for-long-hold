/**
 * LinkedIn Personal Profile & Organization Page Dispatcher
 * Uses official LinkedIn UGC Posts API (100% Free)
 */
export async function sendLinkedIn({ accessToken, personUrn, text, mediaUrl, linkUrl, title }) {
  if (!accessToken || !personUrn) {
    return {
      success: false,
      skipped: true,
      platform: 'linkedin',
      error: 'Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN'
    };
  }

  if (text.length > 3000) {
    return {
      success: false,
      platform: 'linkedin',
      error: `Post exceeds LinkedIn 3,000 character limit (${text.length} chars)`
    };
  }

  try {
    const endpoint = 'https://api.linkedin.com/v2/ugcPosts';
    const author = personUrn.startsWith('urn:li:') ? personUrn : `urn:li:person:${personUrn}`;
    const shareUrl = linkUrl || mediaUrl;

    const requestBody = {
      author,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: shareUrl ? 'ARTICLE' : 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (shareUrl) {
      requestBody.specificContent['com.linkedin.ugc.ShareContent'].media = [
        {
          status: 'READY',
          description: { text: text.slice(0, 150) },
          originalUrl: shareUrl,
          title: { text: title || 'ZenVQ Update' }
        }
      ];
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        platform: 'linkedin',
        status: response.status,
        error: errText || `LinkedIn API failed (${response.status})`
      };
    }

    const restliId = response.headers.get('x-restli-id');
    const data = await response.json().catch(() => ({}));
    return {
      success: true,
      platform: 'linkedin',
      id: restliId || data.id || 'posted'
    };
  } catch (err) {
    return { success: false, platform: 'linkedin', error: err.message };
  }
}

/**
 * Telegram Channel / Group Dispatcher
 * Uses official Telegram Bot API (100% Free, unlimited, zero third-party dependency)
 */
export async function sendTelegram({ token, chatId, text, mediaUrl, parseMode }) {
  if (!token || !chatId) {
    return {
      success: false,
      skipped: true,
      platform: 'telegram',
      error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID'
    };
  }

  try {
    if (mediaUrl) {
      const captionLimit = 1024;
      const needsFollowUp = text.length > captionLimit;
      const caption = needsFollowUp ? `${text.slice(0, captionLimit - 3)}...` : text;

      const photoBody = {
        chat_id: chatId,
        photo: mediaUrl,
        caption
      };
      if (parseMode) photoBody.parse_mode = parseMode;

      const photoRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(photoBody)
      });

      const photoResult = await photoRes.json();
      if (!photoRes.ok || !photoResult.ok) {
        return {
          success: false,
          platform: 'telegram',
          error: photoResult.description || `Telegram sendPhoto failed (${photoRes.status})`
        };
      }

      if (needsFollowUp) {
        const msgBody = { chat_id: chatId, text };
        if (parseMode) msgBody.parse_mode = parseMode;
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(msgBody)
        });
      }

      return {
        success: true,
        platform: 'telegram',
        messageId: photoResult.result?.message_id
      };
    }

    const body = {
      chat_id: chatId,
      text,
      disable_web_page_preview: false
    };
    if (parseMode) body.parse_mode = parseMode;

    let response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    let result = await response.json();

    // If HTML/Markdown parse_mode fails on special characters, retry cleanly as plain text
    if ((!response.ok || !result.ok) && parseMode && String(result.description || '').includes("can't parse entities")) {
      delete body.parse_mode;
      response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      result = await response.json();
    }

    if (!response.ok || !result.ok) {
      return {
        success: false,
        platform: 'telegram',
        error: result.description || `Telegram API request failed (${response.status})`
      };
    }

    return {
      success: true,
      platform: 'telegram',
      messageId: result.result?.message_id
    };
  } catch (err) {
    return { success: false, platform: 'telegram', error: err.message };
  }
}

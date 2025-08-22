function stripAds(obj) {
  if (!obj || typeof obj !== 'object') return;

  const adKeys = new Set([
    'adPlacements','adBreaks','adSlots','adInfo','adEngagement',
    'playerAds','ads','adPayload','adSignalsInfo'
  ]);

  for (const k of Object.keys(obj)) {
    try {
      if (adKeys.has(k)) {
        delete obj[k];
        continue;
      }
      const v = obj[k];
      if (Array.isArray(v)) {
        for (let i = v.length - 1; i >= 0; i--) {
          const item = v[i];
          if (item && typeof item === 'object') {
            // Loại object có key ads
            const keys = Object.keys(item);
            if (keys.some(x => adKeys.has(x) || /ad|promotion/i.test(x))) {
              v.splice(i, 1);
              continue;
            }
            stripAds(item);
          }
        }
      } else if (v && typeof v === 'object') {
        // Loại object thuần quảng cáo
        const keys = Object.keys(v);
        if (keys.some(x => adKeys.has(x) || /ad|promotion/i.test(x))) {
          delete obj[k];
        } else {
          stripAds(v);
        }
      }
    } catch (_) {}
  }
}

try {
  const isBinary = $response?.bodyBytes && !$response.body;
  let text = isBinary ? new TextDecoder('utf-8').decode($response.bodyBytes) : $response.body || '{}';
  let data = JSON.parse(text);

  // Một số response đặt payload trong data.playabilityStatus, streamingData, playerAds
  stripAds(data);

  // Dọn cờ gợi ý quảng cáo nếu có
  if (data?.playbackTracking) delete data.playbackTracking;
  if (data?.adSafetyReason) delete data.adSafetyReason;

  const out = JSON.stringify(data);
  if (isBinary) {
    $done({ bodyBytes: new TextEncoder().encode(out) });
  } else {
    $done({ body: out });
  }
} catch (e) {
  console.log('[yt_player_adblock] parse error:', e);
  $done({});
}

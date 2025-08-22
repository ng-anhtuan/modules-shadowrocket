
function stripAds(obj) {
  if (!obj || typeof obj !== "object") return;

  const adKeys = [
    "adPlacements", "adBreaks", "adSlots", "adInfo", "adEngagement",
    "playerAds", "ads", "adPayload", "adSafetyReason", "promotedItem"
  ];

  for (const k in obj) {
    try {
      if (adKeys.includes(k) || /ad|promotion/i.test(k)) {
        delete obj[k];
        continue;
      }
      const v = obj[k];
      if (Array.isArray(v)) {
        obj[k] = v.filter(it => {
          if (typeof it === "object") {
            const s = JSON.stringify(it);
            if (/\"ad|promotion\"/i.test(s)) return false;
            stripAds(it);
          }
          return true;
        });
      } else if (typeof v === "object") {
        stripAds(v);
      }
    } catch (_) {}
  }
}

try {
  const isBinary = $response?.bodyBytes && !$response.body;
  let text = isBinary ? new TextDecoder("utf-8").decode($response.bodyBytes) : $response.body || "{}";
  let data = JSON.parse(text);

  // Xóa quảng cáo
  stripAds(data);

  // Unlock Premium-like features
  if (data?.playabilityStatus) {
    data.playabilityStatus.miniplayer = { miniplayerRenderer: { playbackMode: "VISIBLE" } };
  }
  if (data?.streamingData) {
    data.streamingData.adaptiveFormats?.forEach(f => {
      if (f.itag === 140) f.audioQuality = "AUDIO_QUALITY_MEDIUM"; // giữ nhạc ổn định
    });
  }
  if (data?.playerConfig) {
    data.playerConfig.backgroundPlayEnabled = true;
  }
  if (data?.playbackTracking) {
    delete data.playbackTracking; // bớt tracking
  }

  // Gắn cờ background/PiP
  if (data?.responseContext) {
    data.responseContext.mainAppWebResponseContext = data.responseContext.mainAppWebResponseContext || {};
    data.responseContext.mainAppWebResponseContext.backgroundPlayEnabled = true;
    data.responseContext.mainAppWebResponseContext.pipEnabled = true;
  }

  const out = JSON.stringify(data);
  if (isBinary) {
    $done({ bodyBytes: new TextEncoder().encode(out) });
  } else {
    $done({ body: out });
  }
} catch (e) {
  console.log("[YouTube.js] error:", e);
  $done({});
}

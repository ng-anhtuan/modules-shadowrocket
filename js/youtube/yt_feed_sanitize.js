function looksLikeAd(item) {
  if (!item || typeof item !== 'object') return false;
  const s = JSON.stringify(item);
  // Heuristic đơn giản: chứa "ad"/"promo" đặc trưng
  return /"ad(|s|Break|Placements|Slot)"|"promoted"|"promotion"/i.test(s);
}

function cleanArray(arr) {
  if (!Array.isArray(arr)) return;
  for (let i = arr.length - 1; i >= 0; i--) {
    const it = arr[i];
    if (looksLikeAd(it)) {
      arr.splice(i, 1);
    } else if (it && typeof it === 'object') {
      sanitize(it);
    }
  }
}

function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (Array.isArray(v)) {
      cleanArray(v);
    } else if (v && typeof v === 'object') {
      // Nếu object này nhìn giống slot quảng cáo → xóa
      if (looksLikeAd(v)) {
        delete obj[k];
      } else {
        sanitize(v);
      }
    }
  }
}

try {
  const isBinary = $response?.bodyBytes && !$response.body;
  let text = isBinary ? new TextDecoder('utf-8').decode($response.bodyBytes) : $response.body || '{}';
  let data = JSON.parse(text);

  sanitize(data);

  const out = JSON.stringify(data);
  if (isBinary) {
    $done({ bodyBytes: new TextEncoder().encode(out) });
  } else {
    $done({ body: out });
  }
} catch (e) {
  console.log('[yt_feed_sanitize] parse error:', e);
  $done({});
}

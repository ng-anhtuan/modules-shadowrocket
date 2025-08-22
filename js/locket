// Ánh xạ User-Agent -> entitlement/subscription
const mapping = {
  '%E8%BD%A6%E7%A5%A8%E7%A5%A8': ['vip+watch_vip'], // App tiếng Trung
  'Locket': ['Gold']                                // App Locket
};

// Lấy UA và response body gốc
let ua = $request.headers["User-Agent"] || $request.headers["user-agent"];
let obj = JSON.parse($response.body);

// Thêm thông báo
obj.Attention = "Chúc mừng bạn! Vui lòng không bán hoặc chia sẻ cho người khác!";

// Dữ liệu subscription giả lập
let subscriptionInfo = {
  is_sandbox: false,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  period_type: "normal",
  expires_date: "2099-12-18T01:04:17Z",
  grace_period_expires_date: null,
  unsubscribe_detected_at: null,
  original_purchase_date: "2024-07-28T01:04:18Z",
  purchase_date: "2024-07-28T01:04:17Z",
  store: "app_store"
};

// Dữ liệu entitlement giả lập
let entitlementInfo = {
  grace_period_expires_date: null,
  purchase_date: "2024-07-28T01:04:17Z",
  product_identifier: "com.locket02.premium.yearly",
  expires_date: "2099-12-18T01:04:17Z"
};

// Kiểm tra UA có khớp trong mapping không
let match = Object.keys(mapping).find(key => ua.includes(key));

if (match) {
  // Nếu UA khớp
  let [entitlementName] = mapping[match];

  // Dùng entitlementName làm product_identifier
  entitlementInfo.product_identifier = entitlementName;

  // Gán subscription và entitlement
  obj.subscriber.subscriptions[entitlementName] = subscriptionInfo;
  obj.subscriber.entitlements[entitlementName] = entitlementInfo;

} else {
  // Nếu UA không khớp, gán mặc định
  obj.subscriber.subscriptions["com.locket02.premium.yearly"] = subscriptionInfo;
  obj.subscriber.entitlements["pro"] = entitlementInfo;
}

// Trả về response mới
$done({ body: JSON.stringify(obj) });

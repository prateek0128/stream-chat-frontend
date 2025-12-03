export const chatApiKey = "7qrbeexuf6p8";
export const chatUserId = "ronit63";
export const chatUserName = "Ronit";
export const chatUserToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoicm9uaXQ2In0.uTpL9ex-jSfY-nCBIIHk7LcpBfL2HvTHl0GYVbT6LvQ";

// 👉 CHANGE THIS: use your PC's LAN IP or ngrok https URL
// Example: Metro shows "Metro waiting on exp://192.168.1.23:8081" → use that IP
export const BASE_URL = "https://1b8de8268e1b.ngrok-free.app";

// User tokens for all predefined users (you'll need to generate these from your Stream Chat dashboard)
export const userTokens = {
  "ronit63": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoicm9uaXQ2In0.uTpL9ex-jSfY-nCBIIHk7LcpBfL2HvTHl0GYVbT6LvQ",
  "priya_patel": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoicHJpeWFfcGF0ZWwifQ.placeholder_token_for_priya",
  "ananya_dev": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYW5hbnlhX2RldiJ9.placeholder_token_for_ananya",
  "arjun_designer": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXJqdW5fZGVzaWduZXIifQ.placeholder_token_for_arjun",
  "kavya_pm": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoia2F2eWFfcG0ifQ.placeholder_token_for_kavya",
  "deepika_qa": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZGVlcGlrYV9xYSJ9.placeholder_token_for_deepika",
  "vikram_backend": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidmlrcmFtX2JhY2tlbmQifQ.placeholder_token_for_vikram",
  "sneha_mobile": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoic25laGFfbW9iaWxlIn0.placeholder_token_for_sneha",
  "rahul_devops": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoicmFodWxfZGV2b3BzIn0.placeholder_token_for_rahul",
  "ishita_ux": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiaXNoaXRhX3V4In0.placeholder_token_for_ishita",
  "amit_sales": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYW1pdF9zYWxlcyJ9.placeholder_token_for_amit",
  "neha_hr": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoibmVoYV9ociJ9.placeholder_token_for_neha",
  "karan_finance": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoia2FyYW5fZmluYW5jZSJ9.placeholder_token_for_karan",
  "pooja_marketing": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoicG9vamFfbWFya2V0aW5nIn0.placeholder_token_for_pooja",
  "rohit_support": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoicm9oaXRfc3VwcG9ydCJ9.placeholder_token_for_rohit"
};

// Helper function to get token for a user
export const getUserToken = (userId) => {
  return userTokens[userId] || null;
};

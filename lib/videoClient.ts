// lib/videoClient.ts
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";
import { chatApiKey, BASE_URL } from "../config/chatConfig";

// optional: share same fetch helper as chat
async function fetchVideoToken(userId: string) {
  try {
    const res = await fetch(`${BASE_URL}/video/token`, {
      // or reuse /stream/token if you used single endpoint
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      // Try fallback to /stream/token endpoint
      const fallbackRes = await fetch(`${BASE_URL}/stream/token`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!fallbackRes.ok) {
        throw new Error(`Video token HTTP ${res.status}: ${await res.text()}`);
      }
      
      const { token } = await fallbackRes.json();
      if (!token) throw new Error("No video token from fallback backend");
      return token;
    }
    
    const { token } = await res.json();
    if (!token) throw new Error("No video token from backend");
    return token;
  } catch (error) {
    console.error('Failed to fetch video token:', error);
    throw error;
  }
}

// cache in module scope (per app process)
let cachedClient: StreamVideoClient | null = null;

export async function getVideoClient(userId: string, name?: string) {
  try {
    const user = {
      id: String(userId),
      name: name || String(userId),
    };

    const token = await fetchVideoToken(user.id);

    // ✅ IMPORTANT: use getOrCreateInstance, not `new StreamVideoClient`
    const client = StreamVideoClient.getOrCreateInstance({
      apiKey: chatApiKey,
      user,
      token,
    });

    cachedClient = client;
    return client;
  } catch (error) {
    console.error('Failed to create video client:', error);
    throw error;
  }
}

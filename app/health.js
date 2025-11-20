import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { BASE_URL } from "@/config/chatConfig";
import { fonts } from "@/config/fonts";

export default function Health() {
  const [out, setOut] = useState("Loading…");
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/health`);
        const json = await res.json();
        setOut(JSON.stringify(json));
      } catch (e) {
        setOut(String(e));
      }
    })();
  }, []);
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Text selectable style={{ fontFamily: fonts.regular }}>{BASE_URL}/health</Text>
      <Text style={{ marginTop: 8, fontFamily: fonts.regular }} selectable>
        {out}
      </Text>
    </View>
  );
}

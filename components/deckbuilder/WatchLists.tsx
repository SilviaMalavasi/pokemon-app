import React from "react";
import ThemedText from "@/components/base/ThemedText";
import ThemedButton from "@/components/base/ThemedButton";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useUserDatabase } from "@/components/context/UserDatabaseContext";

export default function WatchLists() {
  const router = useRouter();
  const { watchLists, isLoadingWatchLists } = useUserDatabase();
  return (
    <View>
      <ThemedText
        type="subtitle"
        style={{ marginBottom: 16 }}
      >
        WatchLists
      </ThemedText>
      {isLoadingWatchLists ? (
        <ThemedText>Loading watchlists...</ThemedText>
      ) : watchLists.length === 0 ? (
        <ThemedText>No watchlists yet.</ThemedText>
      ) : (
        watchLists.map((wl) => (
          <ThemedButton
            key={wl.id}
            type="outline"
            size="large"
            icon="arrow"
            title={wl.name}
            onPress={() =>
              router.push({ pathname: "/(tabs)/watchlistst/[watchlistId]", params: { watchlistId: String(wl.id) } })
            }
            style={{ marginBottom: 16 }}
          />
        ))
      )}
    </View>
  );
}

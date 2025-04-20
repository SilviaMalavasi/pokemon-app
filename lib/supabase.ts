import "react-native-url-polyfill/auto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or anonymous key in environment variables.");
}

let supabase: SupabaseClient;

if (Platform.OS === "ios" || Platform.OS === "android") {
  // Only import AsyncStorage on native
  const AsyncStorage = require("@react-native-async-storage/async-storage").default;
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} else {
  // Web: do not use AsyncStorage
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

import { AuthContext, useAuth } from "@/contexts/auth";
import { TerritoryContext } from "@/contexts/territory";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/auth");
    } else {
      router.replace("/(tabs)");
    }
  }, [user, isLoading]);

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthContext>
          <TerritoryContext>
            <RootLayoutNav />
          </TerritoryContext>
        </AuthContext>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

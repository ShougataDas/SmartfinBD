import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { theme } from "@/constants/theme";
import { AppNavigator } from "@/navigation/AppNavigator";
import { StoreProvider } from "@/store/StoreProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StoreProvider>
        <PaperProvider theme={theme}>
          <StatusBar style="light" backgroundColor={theme.colors.primary} />
          <AppNavigator />
          <Toast />
        </PaperProvider>
      </StoreProvider>
    </GestureHandlerRootView>
  );
}

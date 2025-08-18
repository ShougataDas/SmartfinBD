import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import DashboardScreen from "@/screens/DashboardScreen";
import InvestmentScreen from "@/screens/InvestmentScreen";
import ChatScreen from "@/screens/ChatScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { RegisterScreen } from "@/screens/auth/RegisterScreen";
import { FinancialProfileScreen } from "@/screens/profile/FinancialProfileScreen";
import { RiskAssessmentScreen } from "@/screens/profile/RiskAssessmentScreen";
import { InvestmentDetailsScreen } from "@/screens/investment/InvestmentDetailsScreen";
import { SanchayapatraDetailsScreen } from "@/screens/investment/SanchayapatraDetailsScreen";
import { EditProfileScreen } from "@/screens/profile/EditProfileScreen";

import { theme } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";

export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  FinancialProfile: undefined;
  RiskAssessment: undefined;
  EditProfile: undefined;
  InvestmentDetails: { investmentId: string };
  SanchayapatraDetails: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Investment: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
};

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "view-dashboard" : "view-dashboard-outline";
              break;
            case "Investment":
              iconName = focused ? "chart-line" : "chart-line-variant";
              break;
            case "Chat":
              iconName = focused ? "chat" : "chat-outline";
              break;
            case "Profile":
              iconName = focused ? "account" : "account-outline";
              break;
            default:
              iconName = "circle";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "ড্যাশবোর্ড" }}
      />
      <Tab.Screen
        name="Investment"
        component={InvestmentScreen}
        options={{ title: "বিনিয়োগ" }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "চ্যাট" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "প্রোফাইল" }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="FinancialProfile"
            component={FinancialProfileScreen}
            options={{
              headerShown: true,
              title: "আর্থিক প্রোফাইল",
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: theme.colors.onPrimary,
            }}
          />
          <Stack.Screen
            name="RiskAssessment"
            component={RiskAssessmentScreen}
            options={{
              headerShown: true,
              title: "ঝুঁকি মূল্যায়ন",
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: theme.colors.onPrimary,
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerShown: true,
              title: "প্রোফাইল সম্পাদনা",
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: theme.colors.onPrimary,
            }}
          />
          <Stack.Screen
            name="InvestmentDetails"
            component={InvestmentDetailsScreen}
            options={{
              headerShown: true,
              title: "বিনিয়োগের বিস্তারিত",
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: theme.colors.onPrimary,
            }}
          />
          <Stack.Screen
            name="SanchayapatraDetails"
            component={SanchayapatraDetailsScreen}
            options={{
              headerShown: true,
              title: "সঞ্চয়পত্র বিস্তারিত",
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: theme.colors.onPrimary,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
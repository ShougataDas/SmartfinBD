import React from "react";
import { ScrollView, View, StyleSheet, Alert } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  List,
  Avatar,
  Surface,
  Text,
  Divider,
  Switch,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { theme, spacing } from "@/constants/theme";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/formatters";

const ProfileScreen: React.FC = () => {
  const { user, updateUser } = useUserStore();
  const { logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  const handleLogout = () => {
    Alert.alert("লগ আউট", "আপনি কি নিশ্চিত যে লগ আউট করতে চান?", [
      { text: "বাতিল", style: "cancel" },
      { text: "লগ আউট", style: "destructive", onPress: logout },
    ]);
  };

  const profileStats = [
    {
      title: "মোট বিনিয়োগ",
      value: formatCurrency(user?.totalInvestment || 0),
      icon: "chart-line",
      color: theme.colors.primary,
    },
    {
      title: "মাসিক সঞ্চয়",
      value: formatCurrency(user?.monthlySavings || 0),
      icon: "piggy-bank",
      color: theme.colors.secondary,
    },
    {
      title: "লক্ষ্য অর্জন",
      value: `${user?.goalProgress || 0}%`,
      icon: "target",
      color: theme.colors.tertiary,
    },
  ];

  const menuItems = [
    {
      title: "আর্থিক প্রোফাইল",
      description: "আপনার আর্থিক তথ্য আপডেট করুন",
      icon: "account-edit",
      onPress: () => {},
    },
    {
      title: "ঝুঁকি মূল্যায়ন",
      description: "আপনার ঝুঁকি নেওয়ার ক্ষমতা পরীক্ষা করুন",
      icon: "scale-balance",
      onPress: () => {},
    },
    {
      title: "বিনিয়োগ লক্ষ্য",
      description: "আপনার আর্থিক লক্ষ্য নির্ধারণ করুন",
      icon: "bullseye-arrow",
      onPress: () => {},
    },
    {
      title: "রিপোর্ট ও বিশ্লেষণ",
      description: "আপনার বিনিয়োগের বিস্তারিত রিপোর্ট",
      icon: "file-chart",
      onPress: () => {},
    },
    {
      title: "নিরাপত্তা",
      description: "পাসওয়ার্ড ও নিরাপত্তা সেটিংস",
      icon: "shield-account",
      onPress: () => {},
    },
    {
      title: "সাহায্য ও সহায়তা",
      description: "সাহায্য কেন্দ্র ও যোগাযোগ",
      icon: "help-circle",
      onPress: () => {},
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <Surface style={styles.profileHeader} elevation={2}>
        <View style={styles.profileInfo}>
          <Avatar.Text
            size={80}
            label={user?.name?.charAt(0) || "U"}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Title style={styles.userName}>{user?.name || "ব্যবহারকারী"}</Title>
            <Text variant="bodyMedium" style={styles.userEmail}>
              {user?.email || "user@example.com"}
            </Text>
            <Text variant="bodySmall" style={styles.userPhone}>
              {user?.phone || "+880 1XXX-XXXXXX"}
            </Text>
          </View>
        </View>
        <Button
          mode="outlined"
          onPress={() => {}}
          style={styles.editButton}
          icon="pencil"
        >
          সম্পাদনা
        </Button>
      </Surface>

      {/* Profile Stats */}
      <View style={styles.statsContainer}>
        {profileStats.map((stat, index) => (
          <Card key={index} style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Icon name={stat.icon} size={24} color={stat.color} />
              <Text variant="bodySmall" style={styles.statTitle}>
                {stat.title}
              </Text>
              <Text variant="titleMedium" style={styles.statValue}>
                {stat.value}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>অ্যাকাউন্ট সেটিংস</Title>
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <List.Item
                title={item.title}
                description={item.description}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={item.icon}
                    color={theme.colors.primary}
                  />
                )}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={item.onPress}
                style={styles.menuItem}
              />
              {index < menuItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      {/* App Settings */}
      <Card style={styles.menuCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>অ্যাপ সেটিংস</Title>

          <List.Item
            title="নোটিফিকেশন"
            description="পুশ নোটিফিকেশন চালু/বন্ধ করুন"
            left={(props) => (
              <List.Icon {...props} icon="bell" color={theme.colors.primary} />
            )}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            )}
            style={styles.menuItem}
          />

          <Divider />

          <List.Item
            title="বায়োমেট্রিক লগইন"
            description="ফিঙ্গারপ্রিন্ট/ফেস আইডি দিয়ে লগইন"
            left={(props) => (
              <List.Icon
                {...props}
                icon="fingerprint"
                color={theme.colors.primary}
              />
            )}
            right={() => (
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
              />
            )}
            style={styles.menuItem}
          />

          <Divider />

          <List.Item
            title="ভাষা"
            description="বাংলা"
            left={(props) => (
              <List.Icon
                {...props}
                icon="translate"
                color={theme.colors.primary}
              />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
            style={styles.menuItem}
          />
        </Card.Content>
      </Card>

      {/* About & Legal */}
      <Card style={styles.menuCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>সম্পর্কে</Title>

          <List.Item
            title="অ্যাপ সম্পর্কে"
            description="SmartFin BD v1.0.0"
            left={(props) => (
              <List.Icon
                {...props}
                icon="information"
                color={theme.colors.primary}
              />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
            style={styles.menuItem}
          />

          <Divider />

          <List.Item
            title="গোপনীয়তা নীতি"
            description="আমাদের গোপনীয়তা নীতি পড়ুন"
            left={(props) => (
              <List.Icon
                {...props}
                icon="shield-check"
                color={theme.colors.primary}
              />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
            style={styles.menuItem}
          />

          <Divider />

          <List.Item
            title="ব্যবহারের শর্তাবলী"
            description="সেবার শর্তাবলী দেখুন"
            left={(props) => (
              <List.Icon
                {...props}
                icon="file-document"
                color={theme.colors.primary}
              />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
            style={styles.menuItem}
          />
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Card style={[styles.menuCard, styles.lastCard]}>
        <Card.Content>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor={theme.colors.error}
            icon="logout"
          >
            লগ আউট
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileHeader: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  userInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  userName: {
    color: theme.colors.onSurface,
    fontWeight: "bold",
  },
  userEmail: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  userPhone: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  editButton: {
    alignSelf: "flex-start",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  statContent: {
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  statTitle: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  statValue: {
    color: theme.colors.onSurface,
    fontWeight: "bold",
    marginTop: spacing.xs,
  },
  menuCard: {
    margin: spacing.md,
    marginTop: 0,
  },
  lastCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    color: theme.colors.onSurface,
  },
  menuItem: {
    paddingVertical: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.sm,
  },
});

export default ProfileScreen;

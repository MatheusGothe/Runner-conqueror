import { useAuth } from "@/contexts/auth";
import { useTerritory } from "@/contexts/territory";
import { useRouter } from "expo-router";
import { Award, LogOut, MapPin, TrendingUp } from "lucide-react-native";
import React from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { getUserStats, activities } = useTerritory();
  const router = useRouter();
  if (!user) return null;

  const stats = getUserStats(user.id);
  const userActivities = activities.filter((a) => a.userId === user.id);

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair da sua conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  const formatArea = (area: number) => {
    if (area > 1000000) {
      return `${(area / 1000000).toFixed(2)} km²`;
    }
    return `${Math.round(area)} m²`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MapPin size={24} color="#FF6B6B" />
            <Text style={styles.statValue}>{stats.territoriesOwned}</Text>
            <Text style={styles.statLabel}>Territórios</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color="#4ECDC4" />
            <Text style={styles.statValue}>{formatArea(stats.totalArea)}</Text>
            <Text style={styles.statLabel}>Área Total</Text>
          </View>

          <View style={styles.statCard}>
            <Award size={24} color="#FFA07A" />
            <Text style={styles.statValue}>{stats.totalConquests}</Text>
            <Text style={styles.statLabel}>Conquistas</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividades Recentes</Text>
          {userActivities.length > 0 ? (
            <View style={styles.activities}>
              {userActivities
                .slice(-5)
                .reverse()
                .map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <MapPin size={16} color="#FF6B6B" />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>
                        {activity.territoryCreated
                          ? "Território Conquistado"
                          : "Atividade"}
                      </Text>
                      <Text style={styles.activityDate}>
                        {new Date(activity.startedAt).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </Text>
                    </View>
                    {activity.territoryCreated && (
                      <View style={styles.activityBadge}>
                        <Award size={14} color="#fff" />
                      </View>
                    )}
                  </View>
                ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Nenhuma atividade registrada</Text>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  content: {
    padding: 20,
    gap: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#888",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  activities: {
    gap: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  activityDate: {
    fontSize: 12,
    color: "#888",
  },
  activityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    paddingVertical: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FF6B6B",
  },
});

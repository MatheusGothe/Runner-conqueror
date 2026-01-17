import { useTerritory } from "@/contexts/territory";
import { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { Crown, Trophy } from "lucide-react-native";
import React, { useMemo } from "react";
import { FlatList, SafeAreaView, StyleSheet, Text, View } from "react-native";

interface RankingUser {
  user: User;
  territoriesCount: number;
  totalArea: number;
}

export default function RankingScreen() {
  const { territories } = useTerritory();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const usersData = await AsyncStorage.getItem("@territory_users");
      return usersData ? JSON.parse(usersData) : [];
    },
  });

  const ranking = useMemo(() => {
    const userStats: RankingUser[] = users.map((user: User) => {
      const userTerritories = territories.filter((t) => t.ownerId === user.id);
      return {
        user,
        territoriesCount: userTerritories.length,
        totalArea: userTerritories.reduce((sum, t) => sum + t.area, 0),
      };
    });

    return userStats.sort((a, b) => {
      if (b.territoriesCount !== a.territoriesCount) {
        return b.territoriesCount - a.territoriesCount;
      }
      return b.totalArea - a.totalArea;
    });
  }, [users, territories]);

  const formatArea = (area: number) => {
    if (area > 1000000) {
      return `${(area / 1000000).toFixed(1)} km²`;
    }
    return `${Math.round(area)} m²`;
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: RankingUser;
    index: number;
  }) => (
    <View style={styles.rankItem}>
      <View style={styles.rankPosition}>
        {index === 0 ? (
          <Crown size={24} color="#FFD700" />
        ) : (
          <Text style={styles.rankNumber}>{index + 1}</Text>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.user.name}</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>
            {item.territoriesCount} território
            {item.territoriesCount !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statText}>{formatArea(item.totalArea)}</Text>
        </View>
      </View>

      <View style={styles.score}>
        <Text style={styles.scoreText}>{item.territoriesCount}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Trophy size={32} color="#FF6B6B" />
        <View>
          <Text style={styles.title}>Ranking Semanal</Text>
          <Text style={styles.subtitle}>Dominação de territórios</Text>
        </View>
      </View>

      {ranking.length > 0 ? (
        <FlatList
          data={ranking}
          renderItem={renderItem}
          keyExtractor={(item) => item.user.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.empty}>
          <Trophy size={64} color="#333" />
          <Text style={styles.emptyText}>
            Nenhum território conquistado ainda
          </Text>
          <Text style={styles.emptySubtext}>
            Seja o primeiro a dominar uma área!
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  list: {
    padding: 20,
    gap: 12,
  },
  rankItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  rankPosition: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 13,
    color: "#888",
  },
  statDivider: {
    fontSize: 13,
    color: "#666",
  },
  score: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#fff",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
});

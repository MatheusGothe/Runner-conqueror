
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0a0a0a",
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: "#0a0a0a",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    loadingText: {
      fontSize: 16,
      color: "#888",
    },
    errorContainer: {
      flex: 1,
      backgroundColor: "#0a0a0a",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
      gap: 16,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: "bold" as const,
      color: "#fff",
    },
    errorText: {
      fontSize: 14,
      color: "#888",
      textAlign: "center",
      lineHeight: 20,
    },
    permissionButton: {
      backgroundColor: "#FF6B6B",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 8,
    },
    permissionButtonText: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: "#fff",
    },
    map: {
      flex: 1,
    },
    centerButton: {
      position: "absolute",
      top: 60,
      right: 20,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#1a1a1a",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    controls: {
      position: "absolute",
      bottom: 100,
      left: 20,
      right: 20,
    },
    trackingInfo: {
      backgroundColor: "#1a1a1a",
      borderRadius: 20,
      padding: 16,
      gap: 12,
    },
    trackingHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    recordingIndicator: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    recordingDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: "#FF6B6B",
    },
    recordingText: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: "#fff",
    },
    pointsCount: {
      fontSize: 14,
      color: "#888",
    },
    controlButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingVertical: 16,
      borderRadius: 16,
    },
    startButton: {
      backgroundColor: "#FF6B6B",
    },
    stopButton: {
      backgroundColor: "#FF6B6B",
    },
    controlButtonText: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: "#fff",
    },
    stats: {
      position: "absolute",
      top: 60,
      left: 20,
      flexDirection: "row",
      backgroundColor: "#1a1a1a",
      borderRadius: 16,
      padding: 12,
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    statItem: {
      alignItems: "center",
      paddingHorizontal: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold" as const,
      color: "#fff",
    },
    statLabel: {
      fontSize: 11,
      color: "#888",
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      backgroundColor: "#2a2a2a",
    },
    joystickContainer: {
      position: "absolute",
      bottom: 120,
      left: 20,
      width: 120,
      height: 120,
      backgroundColor: "rgba(0,0,0,0.35)",
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
    },
    
    joystickButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.9)",
      justifyContent: "center",
      alignItems: "center",
    },
    
    joystickArrow: {
      fontSize: 18,
      fontWeight: "bold",
      color: "#333",
    },
    
  });
  
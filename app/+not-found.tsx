import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { ZapOff } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <ZapOff size={64} color="#666" />
        <Text style={styles.title}>Página não encontrada</Text>
        <Text style={styles.text}>
          Esta tela não existe.
        </Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Voltar ao mapa</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0a0a0a',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#fff',
  },
  text: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
});

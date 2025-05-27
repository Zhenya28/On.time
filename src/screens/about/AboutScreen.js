import React from 'react';
import { ScrollView, StyleSheet, View, Image, Linking } from 'react-native';
import { Text, List, Surface, Button } from 'react-native-paper';
import theme from '../../styles/theme';

const AboutScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>On.Time</Text>
          <Text style={styles.version}>Wersja 1.0.0</Text>
        </View>
      </Surface>

      <List.Section>
        <List.Subheader style={styles.sectionHeader}>O aplikacji</List.Subheader>
        <View style={styles.contentCard}>
          <Text style={styles.description}>
            On.Time to kompleksowe narzędzie do zarządzania czasem i zadaniami, 
            które pomoże Ci zwiększyć produktywność i lepiej organizować swój dzień.
          </Text>
        </View>
      </List.Section>

      <List.Section>
        <List.Subheader style={styles.sectionHeader}>Główne funkcje</List.Subheader>
        <View style={styles.contentCard}>
          <List.Item
            title="Zarządzanie zadaniami"
            description="Twórz, edytuj i organizuj swoje zadania z łatwością"
            left={props => <List.Icon {...props} icon="checkbox-marked-circle-outline" />}
          />
          <List.Item
            title="Kalendarz"
            description="Planuj swoje zadania w przejrzystym widoku kalendarza"
            left={props => <List.Icon {...props} icon="calendar" />}
          />
          <List.Item
            title="Timer Pomodoro"
            description="Zwiększ swoją produktywność dzięki technikom zarządzania czasem"
            left={props => <List.Icon {...props} icon="timer" />}
          />
          <List.Item
            title="Powiadomienia"
            description="Otrzymuj przypomnienia o ważnych zadaniach i wydarzeniach"
            left={props => <List.Icon {...props} icon="bell" />}
          />
        </View>
      </List.Section>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 On.Time. Wszelkie prawa zastrzeżone.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    elevation: 4,
  },
  logoContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  description: {
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
});

export default AboutScreen; 
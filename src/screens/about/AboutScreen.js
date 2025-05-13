import React from 'react';
import { ScrollView, StyleSheet, View, Image, Linking } from 'react-native';
import { Text, List, Surface, Button } from 'react-native-paper';
import theme from '../../styles/theme';

// Компонент AboutScreen
// Відображає інформацію про додаток, його основні функції та версію
// Доступний через розділ налаштувань
const AboutScreen = () => {
  return (
    // Контейнер з можливістю прокрутки для всього вмісту
    <ScrollView style={styles.container}>
      {/* Верхня частина екрану з назвою додатку та версією */}
      <Surface style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>On.Time</Text>
          <Text style={styles.version}>Wersja 1.0.0</Text>
        </View>
      </Surface>

      {/* Секція з загальним описом додатку */}
      <List.Section>
        <List.Subheader style={styles.sectionHeader}>O aplikacji</List.Subheader>
        <View style={styles.contentCard}>
          <Text style={styles.description}>
            On.Time to kompleksowe narzędzie do zarządzania czasem i zadaniami, 
            które pomoże Ci zwiększyć produktywność i lepiej organizować swój dzień.
          </Text>
        </View>
      </List.Section>

      {/* Секція з переліком основних функцій додатку */}
      <List.Section>
        <List.Subheader style={styles.sectionHeader}>Główne funkcje</List.Subheader>
        <View style={styles.contentCard}>
          {/* Елемент списку для функції управління завданнями */}
          <List.Item
            title="Zarządzanie zadaniami"
            description="Twórz, edytuj i organizuj swoje zadania z łatwością"
            left={props => <List.Icon {...props} icon="checkbox-marked-circle-outline" />}
          />
          {/* Елемент списку для функції календаря */}
          <List.Item
            title="Kalendarz"
            description="Planuj swoje zadania w przejrzystym widoku kalendarza"
            left={props => <List.Icon {...props} icon="calendar" />}
          />
          {/* Елемент списку для функції таймера Pomodoro */}
          <List.Item
            title="Timer Pomodoro"
            description="Zwiększ swoją produktywność dzięki technikom zarządzania czasem"
            left={props => <List.Icon {...props} icon="timer" />}
          />
          {/* Елемент списку для функції сповіщень */}
          <List.Item
            title="Powiadomienia"
            description="Otrzymuj przypomnienia o ważnych zadaniach i wydarzeniach"
            left={props => <List.Icon {...props} icon="bell" />}
          />
        </View>
      </List.Section>

      {/* Нижній колонтитул з копірайтом */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 On.Time. Wszelkie prawa zastrzeżone.</Text>
      </View>
    </ScrollView>
  );
};

// Стилі для компонентів екрану "Про додаток"
const styles = StyleSheet.create({
  // Стиль для основного контейнера
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Стиль для верхньої частини з заголовком
  headerContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    elevation: 4, // Тінь для Android
  },
  // Стиль для контейнера з логотипом
  logoContainer: {
    alignItems: 'center',
  },
  // Стиль для назви додатку
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  // Стиль для версії додатку
  version: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  // Стиль для заголовків секцій
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  // Стиль для картки вмісту
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  // Стиль для тексту опису
  description: {
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  // Стиль для нижнього колонтитула
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  // Стиль для тексту в нижньому колонтитулі
  footerText: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
});

export default AboutScreen;
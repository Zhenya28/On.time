import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Text, Button, IconButton, Portal, Dialog, TextInput, Snackbar, Surface } from 'react-native-paper';
import { usePomodoro } from '../../context/PomodoroContext';
import theme from '../../styles/theme';
import Svg, { Circle } from 'react-native-svg';

// Кольори для різних типів сесій Pomodoro
// Допомагають візуально розрізняти режими таймера
const SESSION_COLORS = {
  work: '#FF486A',      // Червоний для робочої сесії
  shortBreak: '#24A19C', // Бірюзовий для короткої перерви
  longBreak: '#218EFD',  // Синій для довгої перерви
};

// Компонент PomodoroScreen
// Відображає таймер Pomodoro з можливістю налаштування тривалості сесій
// Дозволяє відстежувати робочі сесії та перерви за методикою Pomodoro
const PomodoroScreen = () => {
  // Отримуємо всі необхідні функції та стани з контексту Pomodoro
  const { 
    settings,           // Налаштування таймера
    updateSettings,     // Функція оновлення налаштувань
    isRunning,          // Стан роботи таймера (запущений/зупинений)
    currentSession,     // Поточний тип сесії (робота/коротка перерва/довга перерва)
    timeLeft,           // Залишок часу в секундах
    sessionsCompleted,  // Кількість завершених робочих сесій
    startTimer,         // Функція запуску таймера
    pauseTimer,         // Функція паузи таймера
    resetTimer,         // Функція скидання таймера
    skipSession,        // Функція пропуску поточної сесії
    SESSION_TYPES       // Константи типів сесій
  } = usePomodoro();

  // Локальні стани для керування інтерфейсом
  const [settingsVisible, setSettingsVisible] = useState(false);  // Видимість діалогу налаштувань
  const [workDuration, setWorkDuration] = useState(settings.workDuration.toString());  // Тривалість робочої сесії
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration.toString());  // Тривалість короткої перерви
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration.toString());  // Тривалість довгої перерви
  const [snackbarVisible, setSnackbarVisible] = useState(false);  // Видимість snackbar повідомлення
  const [snackbarMessage, setSnackbarMessage] = useState('');  // Текст snackbar повідомлення

  // Функція форматування часу в секундах у формат MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Функція обчислення прогресу для кругового індикатора
  // Повертає значення від 0 до 1, що відображає пройдену частину поточної сесії
  const getProgress = () => {
    let totalSeconds;
    
    // Визначаємо загальну тривалість поточної сесії в секундах
    switch (currentSession) {
      case SESSION_TYPES.WORK:
        totalSeconds = settings.workDuration * 60;
        break;
      case SESSION_TYPES.SHORT_BREAK:
        totalSeconds = settings.shortBreakDuration * 60;
        break;
      case SESSION_TYPES.LONG_BREAK:
        totalSeconds = settings.longBreakDuration * 60;
        break;
      default:
        totalSeconds = settings.workDuration * 60;
    }
    
    // Обчислюємо прогрес на основі залишку часу відносно загальної тривалості
    const progress = (totalSeconds - timeLeft) / totalSeconds;
    return progress;
  };

  // Функція для отримання кольору поточної сесії
  // Використовується для візуального відображення типу сесії
  const getCurrentSessionColor = () => {
    switch (currentSession) {
      case SESSION_TYPES.WORK:
        return SESSION_COLORS.work;
      case SESSION_TYPES.SHORT_BREAK:
        return SESSION_COLORS.shortBreak;
      case SESSION_TYPES.LONG_BREAK:
        return SESSION_COLORS.longBreak;
      default:
        return SESSION_COLORS.work;
    }
  };

  // Компонент вкладки для перемикання типу сесії
  // Дозволяє користувачу вибирати між робочою сесією та перервами
  const SessionTab = ({ title, type, current }) => (
    <TouchableOpacity
      style={[
        styles.sessionTab,
        current === type && styles.activeSessionTab,
        current === type && {
          // Динамічно встановлюємо колір фону та рамки залежно від типу сесії
          backgroundColor: 
            type === SESSION_TYPES.WORK 
              ? SESSION_COLORS.work 
              : type === SESSION_TYPES.SHORT_BREAK
                ? SESSION_COLORS.shortBreak
                : SESSION_COLORS.longBreak,
          borderColor: 
            type === SESSION_TYPES.WORK 
              ? SESSION_COLORS.work 
              : type === SESSION_TYPES.SHORT_BREAK
                ? SESSION_COLORS.shortBreak
                : SESSION_COLORS.longBreak,
        }
      ]}
      onPress={() => {
        // При зміні типу сесії скидаємо таймер та перемикаємося на новий тип
        if (current !== type) {
          resetTimer();
          skipSession(type);
        }
      }}
      disabled={isRunning}  // Вимикаємо кнопку під час роботи таймера
    >
      <Text style={[
        styles.sessionTabText,
        current === type && styles.activeSessionTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Функція збереження налаштувань таймера
  // Викликається при натисканні кнопки "Зберегти" в діалозі налаштувань
  const handleSaveSettings = () => {
    // Перетворюємо введені значення в числа
    const workValue = parseInt(workDuration);
    const shortBreakValue = parseInt(shortBreakDuration);
    const longBreakValue = parseInt(longBreakDuration);
    
    // Валідація введених значень
    if (isNaN(workValue) || workValue <= 0 || 
        isNaN(shortBreakValue) || shortBreakValue <= 0 || 
        isNaN(longBreakValue) || longBreakValue <= 0) {
      // Якщо значення недійсні, показуємо повідомлення про помилку
      setSnackbarMessage('Wszystkie wartości muszą być dodatnimi liczbami');
      setSnackbarVisible(true);
      return;
    }
    
    // Оновлюємо налаштування в контексті Pomodoro
    updateSettings({
      ...settings,
      workDuration: workValue,
      shortBreakDuration: shortBreakValue,
      longBreakDuration: longBreakValue,
    });
    
    // Закриваємо діалог налаштувань
    setSettingsVisible(false);
  };

  // Функція для отримання заголовка поточної сесії
  // Використовується для відображення типу сесії на таймері
  const getSessionTitle = () => {
    switch (currentSession) {
      case SESSION_TYPES.WORK:
        return 'Czas pracy';
      case SESSION_TYPES.SHORT_BREAK:
        return 'Krótka przerwa';
      case SESSION_TYPES.LONG_BREAK:
        return 'Długa przerwa';
      default:
        return 'Pomodoro';
    }
  };

  // Компонент кругового прогресу
  // Відображає візуальний прогрес поточної сесії у вигляді кола
  const CircularProgress = ({ progress, size, strokeWidth }) => {
    // Обчислюємо параметри кола для SVG
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference * (1 - progress);
    const currentColor = getCurrentSessionColor();
    
    return (
      <Svg width={size} height={size}>
        {/* Фонове коло (сіре) */}
        <Circle
          stroke={'#E8E8E8'}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Коло прогресу (кольорове) */}
        <Circle
          stroke={currentColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
    );
  };

  // Рендеримо інтерфейс екрану Pomodoro
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: getCurrentSessionColor() }]}>
    <View style={styles.container}>
      {/* Панель вкладок для перемикання між типами сесій */}
      <View style={styles.tabs}>
        <SessionTab
          title="Praca"
          type={SESSION_TYPES.WORK}
          current={currentSession}
        />
        <SessionTab
          title="Krótka przerwa"
          type={SESSION_TYPES.SHORT_BREAK}
          current={currentSession}
        />
        <SessionTab
          title="Długa przerwa"
          type={SESSION_TYPES.LONG_BREAK}
          current={currentSession}
        />
      </View>

      {/* Контейнер з таймером та круговим індикатором прогресу */}
      <View style={styles.timerContainer}>
        <View style={styles.progressContainer}>
          <CircularProgress
            progress={getProgress()}
            size={280}
            strokeWidth={16}
          />
          <View style={styles.timeTextContainer}>
              <Text style={[styles.timeText, { color: getCurrentSessionColor() }]}>{formatTime(timeLeft)}</Text>
              <Text style={[styles.sessionTitle, { color: getCurrentSessionColor() }]}>{getSessionTitle()}</Text>
          </View>
        </View>
      </View>

      {/* Контейнер зі статистикою (кількість завершених сесій) */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getCurrentSessionColor() }]}>{sessionsCompleted}</Text>
          <Text style={styles.statLabel}>Ukończone sesje</Text>
        </View>
      </View>

      {/* Панель керування таймером (запуск/пауза, скидання, налаштування) */}
      <View style={styles.controlsContainer}>
          {isRunning ? (
            <IconButton
              icon="pause"
              size={50}
              onPress={pauseTimer}
              style={styles.controlButton}
            />
          ) : (
        <IconButton
              icon="play"
              size={50}
              onPress={startTimer}
          style={styles.controlButton}
        />
          )}
          <IconButton
            icon="refresh"
            size={50}
            onPress={resetTimer}
            style={styles.controlButton}
          />
        <IconButton
          icon="cog"
            size={50}
          onPress={() => setSettingsVisible(true)}
          style={styles.controlButton}
        />
      </View>

      {/* Діалогове вікно налаштувань таймера */}
      <Portal>
          <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Ustawienia timera</Dialog.Title>
          <Dialog.Content>
              {/* Налаштування тривалості робочої сесії */}
              <View style={styles.settingsGroup}>
                <Text style={styles.settingLabel}>Czas pracy (minuty)</Text>
              <TextInput
                value={workDuration}
                onChangeText={setWorkDuration}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={theme.colors.primary}
              />
            </View>
            
              {/* Налаштування тривалості короткої перерви */}
              <View style={styles.settingsGroup}>
                <Text style={styles.settingLabel}>Czas krótkiej przerwy (minuty)</Text>
              <TextInput
                value={shortBreakDuration}
                onChangeText={setShortBreakDuration}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={theme.colors.primary}
              />
            </View>
            
              {/* Налаштування тривалості довгої перерви */}
              <View style={styles.settingsGroup}>
                <Text style={styles.settingLabel}>Czas długiej przerwy (minuty)</Text>
              <TextInput
                value={longBreakDuration}
                onChangeText={setLongBreakDuration}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  activeOutlineColor={theme.colors.primary}
              />
            </View>
          </Dialog.Content>
          
            {/* Кнопки дій діалогу */}
            <Dialog.Actions style={styles.dialogActions}>
              <Button 
                mode="outlined" 
                onPress={() => setSettingsVisible(false)}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                Anuluj
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSaveSettings}
                style={styles.saveButton}
                labelStyle={styles.saveButtonLabel}
              >
                Zapisz
              </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar для відображення повідомлень про помилки */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
    </SafeAreaView>
  );
};

// Стилі для компонентів екрану Pomodoro
const styles = StyleSheet.create({
  // Безпечна зона для пристроїв з вирізами екрану
  safeArea: {
    flex: 1,
  },
  // Основний контейнер
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Контейнер для вкладок перемикання типу сесії
  tabs: {
    flexDirection: 'row',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  // Стиль окремої вкладки
  sessionTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  // Стиль активної вкладки
  activeSessionTab: {
    borderWidth: 0,
  },
  // Стиль тексту вкладки
  sessionTabText: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '500',
  },
  // Стиль тексту активної вкладки
  activeSessionTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Контейнер для таймера
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Контейнер для кругового індикатора прогресу
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Контейнер для тексту таймера (розміщується по центру кругового індикатора)
  timeTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  // Стиль тексту часу
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  // Стиль заголовка сесії
  sessionTitle: {
    fontSize: 18,
    marginTop: 8,
  },
  // Контейнер для статистики
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
  },
  // Стиль елемента статистики
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  // Стиль значення статистики
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Стиль підпису статистики
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  // Контейнер для кнопок керування
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  // Стиль кнопки керування
  controlButton: {
    marginHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  // Стиль діалогового вікна
  dialog: {
    backgroundColor: 'white',
    borderRadius: theme.roundness,
  },
  // Стиль заголовка діалогу
  dialogTitle: {
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  // Стиль групи налаштувань
  settingsGroup: {
    marginBottom: theme.spacing.m,
  },
  // Стиль підпису налаштування
  settingLabel: {
    fontSize: 16,
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    fontWeight: '500',
  },
  // Стиль поля введення
  input: {
    backgroundColor: theme.colors.surface,
  },
  // Стиль панелі дій діалогу
  dialogActions: {
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    justifyContent: 'flex-end',
  },
  // Стиль кнопки скасування
  cancelButton: {
    marginRight: theme.spacing.s,
    borderColor: theme.colors.darkGray,
  },
  // Стиль тексту кнопки скасування
  cancelButtonLabel: {
    color: theme.colors.darkGray,
  },
  // Стиль кнопки збереження
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  // Стиль тексту кнопки збереження
  saveButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PomodoroScreen;
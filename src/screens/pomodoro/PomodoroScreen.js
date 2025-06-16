import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Text, Button, IconButton, Portal, Dialog, TextInput, Snackbar, Surface } from 'react-native-paper';
import { usePomodoro } from '../../context/PomodoroContext';
import theme from '../../styles/theme';
import Svg, { Circle } from 'react-native-svg';

const SESSION_COLORS = {
  work: '#FF486A',      
  shortBreak: '#24A19C', 
  longBreak: '#218EFD', 
};

const PomodoroScreen = () => {
  const { 
    settings, 
    updateSettings, 
    isRunning, 
    currentSession, 
    timeLeft, 
    sessionsCompleted, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    skipSession, 
    SESSION_TYPES 
  } = usePomodoro();

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [workDuration, setWorkDuration] = useState(settings.workDuration.toString());
  const [shortBreakDuration, setShortBreakDuration] = useState(settings.shortBreakDuration.toString());
  const [longBreakDuration, setLongBreakDuration] = useState(settings.longBreakDuration.toString());
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    let totalSeconds;
    
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
    
    const progress = (totalSeconds - timeLeft) / totalSeconds;
    return progress;
  };

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

  const SessionTab = ({ title, type, current }) => (
    <TouchableOpacity
      style={[
        styles.sessionTab,
        current === type && styles.activeSessionTab,
        current === type && {
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
        if (current !== type) {
          resetTimer();
          skipSession(type);
        }
      }}
      disabled={isRunning}
    >
      <Text style={[
        styles.sessionTabText,
        current === type && styles.activeSessionTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const handleSaveSettings = () => {
    const workValue = parseInt(workDuration);
    const shortBreakValue = parseInt(shortBreakDuration);
    const longBreakValue = parseInt(longBreakDuration);
    
    if (isNaN(workValue) || workValue <= 0 || 
        isNaN(shortBreakValue) || shortBreakValue <= 0 || 
        isNaN(longBreakValue) || longBreakValue <= 0) {
      setSnackbarMessage('Wszystkie wartości muszą być dodatnimi liczbami');
      setSnackbarVisible(true);
      return;
    }
    
    updateSettings({
      ...settings,
      workDuration: workValue,
      shortBreakDuration: shortBreakValue,
      longBreakDuration: longBreakValue,
    });
    
    setSettingsVisible(false);
  };

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
  const CircularProgress = ({ progress, size, strokeWidth }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference * (1 - progress);
    const currentColor = getCurrentSessionColor();
    
    return (
      <Svg width={size} height={size}>
        <Circle
          stroke={'#E8E8E8'}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: getCurrentSessionColor() }]}>
    <View style={styles.container}>
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

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getCurrentSessionColor() }]}>{sessionsCompleted}</Text>
          <Text style={styles.statLabel}>Ukończone sesje</Text>
        </View>
      </View>

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

        {/* Dialogowe okno ustawień */}
      <Portal>
          <Dialog visible={settingsVisible} onDismiss={() => setSettingsVisible(false)} style={styles.dialog}>
            <Dialog.Title style={styles.dialogTitle}>Ustawienia timera</Dialog.Title>
          <Dialog.Content>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    marginVertical: 16,
    marginHorizontal: 16,
  },
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
  activeSessionTab: {
    borderWidth: 0,
  },
  sessionTabText: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '500',
  },
  activeSessionTabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  sessionTitle: {
    fontSize: 18,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  controlButton: {
    marginHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: theme.roundness,
  },
  dialogTitle: {
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  settingsGroup: {
    marginBottom: theme.spacing.m,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: theme.spacing.s,
    color: theme.colors.text,
    fontWeight: '500',
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  dialogActions: {
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGray,
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: theme.spacing.s,
    borderColor: theme.colors.darkGray,
  },
  cancelButtonLabel: {
    color: theme.colors.darkGray,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PomodoroScreen;

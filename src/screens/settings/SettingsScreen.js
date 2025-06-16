import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Button, Divider, Snackbar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import EditNameModal from '../../components/settings/EditNameModal';
import theme from '../../styles/theme';

const SettingsScreen = ({ navigation }) => {
  const { user, logout, updateUserName } = useAuth();
  const { clearAllTasks } = useTask();
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        await clearAllTasks();
    
      } else {
        setSnackbarMessage('Wystąpił błąd podczas wylogowywania');
        setSnackbarVisible(true);
      }
    } catch (error) {
      setSnackbarMessage('Wystąpił błąd podczas wylogowywania');
      setSnackbarVisible(true);
    }
      };

  const handleClearTasks = async () => {
    const result = await clearAllTasks();
    if (result?.success) {
      setSnackbarMessage('Wszystkie zadania zostały usunięte');
      setSnackbarVisible(true);
    }
  };

  const handleUpdateName = async (newName) => {
    const result = await updateUserName(newName);
    if (result.success) {
      setSnackbarMessage('Imię zostało zaktualizowane');
      setSnackbarVisible(true);
      setEditNameVisible(false);
    } else {
      setSnackbarMessage('Wystąpił błąd podczas aktualizacji imienia');
      setSnackbarVisible(true);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <List.Section>
          <List.Subheader>Konto użytkownika</List.Subheader>
          <List.Item
            title="Imię"
            description={user?.displayName || 'Nie podano'}
            left={props => <List.Icon {...props} icon="account" />}
            right={props => <List.Icon {...props} icon="pencil" />}
            onPress={() => setEditNameVisible(true)}
          />
          <List.Item
            title="Email"
            description={user?.email}
            left={props => <List.Icon {...props} icon="email" />}
          />
          <Divider />
          <List.Item
            title="Wyczyść wszystkie zadania"
            description="Usuń wszystkie zapisane zadania"
            left={props => <List.Icon {...props} icon="delete" />}
            onPress={handleClearTasks}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Aplikacja</List.Subheader>
          <List.Item
            title="O aplikacji"
            description="Informacje o aplikacji On.Time"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('About')}
          />
        </List.Section>

        <View style={styles.logoutContainer}>
          <Button 
            mode="contained" 
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Wyloguj się
          </Button>
        </View>
      </ScrollView>

      <EditNameModal
        visible={editNameVisible}
        onDismiss={() => setEditNameVisible(false)}
        onSave={handleUpdateName}
        currentName={user?.displayName}
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
      }}
    >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  logoutContainer: {
    padding: 16,
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: '#FF486A',
  },
});

export default SettingsScreen; 

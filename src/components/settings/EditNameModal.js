import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal, Portal, TextInput, Button, Text } from 'react-native-paper';
import theme from '../../styles/theme';

const EditNameModal = ({ visible, onDismiss, onSave, currentName }) => {
  const [name, setName] = useState(currentName || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Imię nie może być puste');
      return;
    }
    onSave(name.trim());
    setName('');
    setError('');
  };

  const handleDismiss = () => {
    setName(currentName || '');
    setError('');
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Zmień imię</Text>
        
        <TextInput
          label="Imię"
          value={name}
          onChangeText={setName}
          style={styles.input}
          error={!!error}
          autoFocus
          left={<TextInput.Icon icon="account" />}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleDismiss}
            style={styles.button}
          >
            Anuluj
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
          >
            Zapisz
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.primary,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    marginLeft: 8,
  },
});

export default EditNameModal; 
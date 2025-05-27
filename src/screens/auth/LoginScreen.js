import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import theme from '../../styles/theme';

// Схема валідації
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Nieprawidłowy adres e-mail')
    .required('To pole jest wymagane'),
  password: Yup.string()
    .min(6, 'Hasło musi mieć co najmniej 6 znaków')
    .required('To pole jest wymagane'),
});

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [visible, setVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const onDismissSnackBar = () => setVisible(false);
  
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Обробка входу в систему
  const handleLogin = async (values) => {
    try {
      const result = await login(values.email, values.password);
      if (!result.success) {
        setErrorMessage(result.error || 'Logowanie nie powiodło się');
        setVisible(true);
      }
    } catch (error) {
      setErrorMessage('Wystąpił błąd. Spróbuj ponownie.');
      setVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Logo size={120} color={theme.colors.primary} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Logowanie</Text>
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                <TextInput
                  label="E-mail"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                <TextInput
                  label="Hasło"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={secureTextEntry}
                  error={touched.password && errors.password}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={secureTextEntry ? "eye" : "eye-off"}
                      onPress={toggleSecureEntry}
                    />
                  }
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Zaloguj się
                </Button>
              </>
            )}
          </Formik>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Nie masz konta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Zarejestruj się</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'OK',
          onPress: onDismissSnackBar,
        }}
      >
        {errorMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.l,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.s,
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    padding: theme.spacing.l,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.l,
    textAlign: 'center',
    color: theme.colors.text,
  },
  input: {
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginBottom: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  button: {
    marginTop: theme.spacing.m,
    borderRadius: theme.roundness,
    paddingVertical: theme.spacing.xs,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 2,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.l,
  },
  registerText: {
    color: theme.colors.text,
  },
  registerLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
});

export default LoginScreen;
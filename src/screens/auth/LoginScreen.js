import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext'; // Імпорт хука для доступу до функцій авторизації.
import Logo from '../../components/Logo'; // Імпорт компонента логотипу.
import theme from '../../styles/theme'; // Імпорт теми для стилізації.

// Схема валідації полів форми входу за допомогою Yup.
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Nieprawidłowy adres e-mail') // Перевірка формату email.
    .required('To pole jest wymagane'),  // Поле є обов'язковим.
  password: Yup.string()
    .min(6, 'Hasło musi mieć co najmniej 6 znaków') // Мінімальна довжина пароля.
    .required('To pole jest wymagane'),             // Поле є обов'язковим.
});

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth(); // Отримуємо функцію login з контексту AuthContext.
  const [visible, setVisible] = useState(false); // Стан для керування видимістю Snackbar.
  const [errorMessage, setErrorMessage] = useState(''); // Стан для повідомлення про помилку в Snackbar.
  const [secureTextEntry, setSecureTextEntry] = useState(true); // Стан для керування видимістю тексту пароля.

  // Функція для приховування Snackbar.
  const onDismissSnackBar = () => setVisible(false);

  // Функція для перемикання видимості текстового поля пароля.
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Обробник входу в систему.
  const handleLogin = async (values) => {
    try {
      // Викликаємо функцію login з AuthContext для аутентифікації користувача.
      const result = await login(values.email, values.password);
      if (!result.success) {
        setErrorMessage(result.error || 'Logowanie nie powiodło się'); // Встановлюємо повідомлення про помилку.
        setVisible(true); // Показуємо Snackbar.
      }
    } catch (error) {
      setErrorMessage('Wystąpił błąd. Spróbuj ponownie.'); // Загальне повідомлення про помилку.
      setVisible(true);
    }
  };

  return (
    // KeyboardAvoidingView допомагає запобігти перекриттю полів введення клавіатурою.
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* ScrollView дозволяє прокручувати вміст, якщо він не поміщається на екрані. */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Logo size={120} color={theme.colors.primary} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Logowanie</Text>
          {/* Formik використовується для управління станом форми та її валідацією. */}
          <Formik
            initialValues={{ email: '', password: '' }} // Початкові значення полів форми.
            validationSchema={LoginSchema}              // Схема валідації.
            onSubmit={handleLogin}                      // Обробник відправки форми.
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                {/* Поле введення для Email. */}
                <TextInput
                  label="E-mail"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email} // Відображаємо помилку, якщо поле було торкнуто і є помилка.
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />}
                />
                {/* Відображення тексту помилки для поля Email. */}
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                {/* Поле введення для пароля. */}
                <TextInput
                  label="Hasło"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={secureTextEntry} // Приховує текст пароля.
                  error={touched.password && errors.password}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    // Іконка для перемикання видимості пароля.
                    <TextInput.Icon
                      icon={secureTextEntry ? "eye" : "eye-off"}
                      onPress={toggleSecureEntry}
                    />
                  }
                />
                {/* Відображення тексту помилки для поля пароля. */}
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {/* Кнопка для відправки форми входу. */}
                <Button
                  mode="contained"
                  onPress={handleSubmit} // Викликає функцію відправки форми.
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Zaloguj się
                </Button>
              </>
            )}
          </Formik>

          {/* Контейнер для посилання на реєстрацію. */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Nie masz konta?</Text>
            {/* Кнопка для переходу на екран реєстрації. */}
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Zarejestruj się</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Snackbar для відображення повідомлень про помилки. */}
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

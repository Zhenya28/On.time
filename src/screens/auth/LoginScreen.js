import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import theme from '../../styles/theme';

// Схема валідації форми входу
// Визначає правила перевірки для полів електронної пошти та пароля
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Nieprawidłowy adres e-mail')      // Перевірка формату електронної пошти
    .required('To pole jest wymagane'),        // Поле не може бути порожнім
  password: Yup.string()
    .min(6, 'Hasło musi mieć co najmniej 6 znaków')  // Мінімальна довжина пароля
    .required('To pole jest wymagane'),        // Поле не може бути порожнім
});

// Компонент екрану входу
// Дозволяє користувачу увійти в систему за допомогою електронної пошти та пароля
const LoginScreen = ({ navigation }) => {
  // Отримуємо функцію входу з контексту авторизації
  const { login } = useAuth();
  // Стани для керування відображенням Snackbar з повідомленнями про помилки
  const [visible, setVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Стан для перемикання відображення/приховування пароля
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Функція для закриття Snackbar
  const onDismissSnackBar = () => setVisible(false);
  
  // Функція для перемикання режиму відображення пароля
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Функція обробки входу в систему
  // Викликається при відправці форми
  const handleLogin = async (values) => {
    try {
      // Викликаємо функцію входу з контексту авторизації
      const result = await login(values.email, values.password);
      // Якщо вхід не успішний, показуємо повідомлення про помилку
      if (!result.success) {
        setErrorMessage(result.error || 'Logowanie nie powiodło się');
        setVisible(true);
      }
    } catch (error) {
      // Обробка непередбачених помилок
      setErrorMessage('Wystąpił błąd. Spróbuj ponownie.');
      setVisible(true);
    }
  };

  // Рендерим інтерфейс екрану входу
  return (
    // KeyboardAvoidingView для правильного відображення при відкритій клавіатурі
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* ScrollView для забезпечення прокрутки на малих екранах */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Контейнер для логотипу */}
        <View style={styles.logoContainer}>
          <Logo size={120} color={theme.colors.primary} />
        </View>

        {/* Контейнер для форми входу */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Logowanie</Text>
          
          {/* Formik для керування формою та валідацією */}
          <Formik
            initialValues={{ email: '', password: '' }} // Початкові порожні значення
            validationSchema={LoginSchema}             // Схема валідації
            onSubmit={handleLogin}                     // Функція обробки відправки форми
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                {/* Поле для введення електронної пошти */}
                <TextInput
                  label="E-mail"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  left={<TextInput.Icon icon="email" />} // Іконка електронної пошти
                />
                {/* Відображення помилки для поля електронної пошти */}
                {touched.email && errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}

                {/* Поле для введення пароля */}
                <TextInput
                  label="Hasło"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={secureTextEntry}
                  error={touched.password && errors.password}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />} // Іконка замка
                  right={
                    <TextInput.Icon
                      icon={secureTextEntry ? "eye" : "eye-off"} // Іконка показу/приховування пароля
                      onPress={toggleSecureEntry}
                    />
                  }
                />
                {/* Відображення помилки для поля пароля */}
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {/* Кнопка для відправки форми входу */}
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

          {/* Блок з посиланням на екран реєстрації */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Nie masz konta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Zarejestruj się</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Snackbar для відображення повідомлень про помилки */}
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

// Стилі для компонентів екрану входу
const styles = StyleSheet.create({
  // Основний контейнер
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Контейнер для прокрутки з центруванням вмісту
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.l,
  },
  // Контейнер для логотипу
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  // Стиль логотипу
  logo: {
    width: 100,
    height: 100,
  },
  // Стиль для назви додатку
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: theme.spacing.s,
  },
  // Контейнер для форми з тінню та заокругленими кутами
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
  // Стиль заголовка форми
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.l,
    textAlign: 'center',
    color: theme.colors.text,
  },
  // Стиль полів введення
  input: {
    marginBottom: theme.spacing.s,
    backgroundColor: theme.colors.background,
  },
  // Стиль тексту помилок
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginBottom: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  // Стиль кнопки входу
  button: {
    marginTop: theme.spacing.m,
    borderRadius: theme.roundness,
    paddingVertical: theme.spacing.xs,
  },
  // Стиль тексту кнопки
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 2,
  },
  // Контейнер для блоку реєстрації
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.l,
  },
  // Стиль тексту "Немає облікового запису?"
  registerText: {
    color: theme.colors.text,
  },
  // Стиль посилання на реєстрацію
  registerLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
});

export default LoginScreen;
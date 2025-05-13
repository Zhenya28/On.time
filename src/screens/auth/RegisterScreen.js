import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import theme from '../../styles/theme';

// Схема валідації форми реєстрації
// Визначає правила перевірки для полів імені, електронної пошти, пароля та підтвердження пароля
const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('To pole jest wymagane'),  // Ім'я користувача обов'язкове
  email: Yup.string()
    .email('Nieprawidłowy adres e-mail')                // Перевірка формату електронної пошти
    .required('To pole jest wymagane'),                 // Поле не може бути порожнім
  password: Yup.string()
    .min(6, 'Hasło musi mieć co najmniej 6 znaków')     // Мінімальна довжина пароля
    .required('To pole jest wymagane'),                 // Поле не може бути порожнім
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Hasła nie są zgodne')  // Паролі повинні співпадати
    .required('To pole jest wymagane')                  // Поле не може бути порожнім
});

// Компонент екрану реєстрації
// Дозволяє користувачу створити новий обліковий запис з ім'ям, електронною поштою та паролем
const RegisterScreen = ({ navigation }) => {
  // Отримуємо функцію реєстрації з контексту авторизації
  const { register } = useAuth();
  // Стани для керування відображенням Snackbar з повідомленнями про помилки
  const [visible, setVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  // Стани для перемикання відображення/приховування паролів
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);

  // Функція для закриття Snackbar
  const onDismissSnackBar = () => setVisible(false);
  
  // Функція для перемикання режиму відображення основного пароля
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Функція для перемикання режиму відображення підтвердження пароля
  const toggleSecureConfirmEntry = () => {
    setSecureConfirmTextEntry(!secureConfirmTextEntry);
  };

  // Функція обробки реєстрації користувача
  // Викликається при відправці форми
  const handleRegister = async (values) => {
    try {
      // Викликаємо функцію реєстрації з контексту авторизації
      const result = await register(values.name, values.email, values.password);
      // Якщо реєстрація не успішна, показуємо повідомлення про помилку
      if (!result.success) {
        setErrorMessage(result.error || 'Rejestracja nie powiodła się');
        setVisible(true);
      }
    } catch (error) {
      // Обробка непередбачених помилок
      setErrorMessage('Wystąpił błąd. Spróbuj ponownie.');
      setVisible(true);
    }
  };

  // Рендерим інтерфейс екрану реєстрації
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

        {/* Контейнер для форми реєстрації */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Rejestracja</Text>
          
          {/* Formik для керування формою та валідацією */}
          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }} // Початкові порожні значення
            validationSchema={RegisterSchema}  // Схема валідації
            onSubmit={handleRegister}          // Функція обробки відправки форми
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                {/* Поле для введення імені */}
                <TextInput
                  label="Imię"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={touched.name && errors.name}
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />} // Іконка користувача
                />
                {/* Відображення помилки для поля імені */}
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}

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

                {/* Поле для підтвердження пароля */}
                <TextInput
                  label="Potwierdź hasło"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry={secureConfirmTextEntry}
                  error={touched.confirmPassword && errors.confirmPassword}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock-check" />} // Іконка перевірки пароля
                  right={
                    <TextInput.Icon
                      icon={secureConfirmTextEntry ? "eye" : "eye-off"} // Іконка показу/приховування пароля
                      onPress={toggleSecureConfirmEntry}
                    />
                  }
                />
                {/* Відображення помилки для поля підтвердження пароля */}
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                {/* Кнопка для відправки форми реєстрації */}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Zarejestruj się
                </Button>
              </>
            )}
          </Formik>

          {/* Блок з посиланням на екран входу */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Masz już konto?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Zaloguj się</Text>
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

// Стилі для компонентів екрану реєстрації
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
  // Стиль кнопки реєстрації
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
  // Контейнер для блоку входу
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.l,
  },
  // Стиль тексту "Вже є обліковий запис?"
  loginText: {
    color: theme.colors.text,
  },
  // Стиль посилання на вхід
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
});

export default RegisterScreen;
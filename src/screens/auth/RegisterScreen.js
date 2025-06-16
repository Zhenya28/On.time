import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext'; // Імпорт хука для доступу до функцій авторизації.
import Logo from '../../components/Logo'; // Імпорт компонента логотипу.
import theme from '../../styles/theme'; // Імпорт теми для стилізації.

// Схема валідації полів форми реєстрації за допомогою Yup.
const RegisterSchema = Yup.object().shape({
  name: Yup.string().required('To pole jest wymagane'),
  email: Yup.string()
    .email('Nieprawidłowy adres e-mail')
    .required('To pole jest wymagane'),
  password: Yup.string()
    .min(6, 'Hasło musi mieć co najmniej 6 znaków')
    .required('To pole jest wymagane'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Hasła nie są zgodne') // Перевірка, що паролі співпадають.
    .required('To pole jest wymagane')
});

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth(); // Отримуємо функцію `register` з контексту авторизації.
  const [visible, setVisible] = useState(false); // Стан для керування видимістю `Snackbar`.
  const [errorMessage, setErrorMessage] = useState(''); // Стан для повідомлення про помилку в `Snackbar`.
  const [secureTextEntry, setSecureTextEntry] = useState(true); // Стан для відображення/приховування пароля.
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true); // Стан для відображення/приховування підтвердження пароля.

  // Функція для приховування `Snackbar`.
  const onDismissSnackBar = () => setVisible(false);

  // Функція для перемикання видимості текстового поля пароля.
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // Функція для перемикання видимості текстового поля підтвердження пароля.
  const toggleSecureConfirmEntry = () => {
    setSecureConfirmTextEntry(!secureConfirmTextEntry);
  };

  // Обробник реєстрації користувача.
  const handleRegister = async (values) => {
    try {
      // Викликаємо функцію реєстрації з `AuthContext`.
      const result = await register(values.name, values.email, values.password);
      if (!result.success) {
        setErrorMessage(result.error || 'Rejestracja nie powiodła się'); // Встановлюємо повідомлення про помилку.
        setVisible(true); // Показуємо `Snackbar`.
      }
    } catch (error) {
      setErrorMessage('Wystąpił błąd. Spróbuj ponownie.');
      setVisible(true);
    }
  };

  return (
    // `KeyboardAvoidingView` допомагає уникнути перекриття полів введення клавіатурою.
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* `ScrollView` дозволяє прокручувати вміст екрану, якщо він не поміщається. */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Logo size={120} color={theme.colors.primary} />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Rejestracja</Text>

          {/* `Formik` використовується для управління станом форми, її валідацією та відправкою. */}
          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }} // Початкові значення полів форми.
            validationSchema={RegisterSchema}                                        // Схема валідації.
            onSubmit={handleRegister}                                                // Обробник відправки форми.
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <>
                {/* Поле введення для імені. */}
                <TextInput
                  label="Imię"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={touched.name && errors.name} // Відображаємо помилку, якщо поле було торкнуто і є помилка.
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}

                {/* Поле введення для Email. */}
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

                {/* Поле введення для пароля. */}
                <TextInput
                  label="Hasło"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={secureTextEntry} // Визначає, чи текст прихований.
                  error={touched.password && errors.password}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    /* Іконка для перемикання видимості пароля. */
                    <TextInput.Icon
                      icon={secureTextEntry ? "eye" : "eye-off"}
                      onPress={toggleSecureEntry}
                    />
                  }
                />
                {touched.password && errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {/* Поле введення для підтвердження пароля. */}
                <TextInput
                  label="Potwierdź hasło"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry={secureConfirmTextEntry} // Визначає, чи текст прихований.
                  error={touched.confirmPassword && errors.confirmPassword}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock-check" />}
                  right={
                    /* Іконка для перемикання видимості підтвердження пароля. */
                    <TextInput.Icon
                      icon={secureConfirmTextEntry ? "eye" : "eye-off"}
                      onPress={toggleSecureConfirmEntry}
                    />
                  }
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}

                {/* Кнопка для відправки форми реєстрації. */}
                <Button
                  mode="contained"
                  onPress={handleSubmit} // Викликає функцію відправки форми.
                  style={styles.button}
                  labelStyle={styles.buttonLabel}
                >
                  Zarejestruj się
                </Button>
              </>
            )}
          </Formik>

          {/* Контейнер для посилання на екран входу, якщо користувач вже має акаунт. */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Masz już konto?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Zaloguj się</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* `Snackbar` для відображення повідомлень про помилки. */}
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.l,
  },
  loginText: {
    color: theme.colors.text,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: theme.spacing.xs,
  },
});

export default RegisterScreen;

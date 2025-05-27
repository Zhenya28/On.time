# On.Time

On.Time to kompleksowa aplikacja mobilna do zarządzania czasem i zadaniami, stworzona, aby pomóc użytkownikom w zwiększaniu produktywności i lepszej organizacji codziennych obowiązków. Aplikacja oferuje intuicyjny interfejs do tworzenia i śledzenia zadań, a także wbudowany Timer Pomodoro.

## Funkcje

*   **Zarządzanie zadaniami:** Łatwe dodawanie, edytowanie, usuwanie i oznaczanie zadań jako ukończone.
*   **Priorytety zadań:** Możliwość ustawienia priorytetów (Wysoki, Średni, Niski) dla lepszej organizacji.
*   **Terminy wykonania i przypomnienia:** Ustawianie daty i godziny wykonania zadań oraz opcja włączenia przypomnień.
*   **Widok Kalendarza:** Przeglądanie zadań zaplanowanych na konkretne dni.
*   **Filtrowanie zadań:** Filtrowanie listy zadań według statusu (Wszystkie, Aktywne, Ukończone, Dzisiaj) i priorytetu (Priorytetowe).
*   **Timer Pomodoro:** Wbudowany timer wykorzystujący technikę Pomodoro do efektywnej pracy z przerwami.
*   **Uwierzytelnianie użytkowników:** Rejestracja i logowanie użytkowników (realizowane przez Firebase Auth).
*   **Synchronizacja danych:** Zadania są przechowywane lokalnie przy użyciu AsyncStorage i powiązane z użytkownikiem (poprzez email), co umożliwia ich persystencję między sesjami.
*   **Powiadomienia lokalne:** Planowanie i anulowanie przypomnień o zadaniach (przy użyciu Expo Notifications).
*   **Ustawienia konta:** Możliwość zmiany nazwy użytkownika i wylogowania.

## Użycie

Po uruchomieniu aplikacji, zarejestruj nowe konto lub zaloguj się.

*   **Zakładka Zadania:** Tutaj możesz przeglądać, dodawać i zarządzać swoimi zadaniami. Użyj przycisku `+` na dole, aby dodać nowe zadanie.
*   **Zakładka Kalendarz:** Zobacz swoje zadania rozłożone na dni w kalendarzu.
*   **Zakładka Pomodoro:** Użyj timera do pracy w skupieniu z przerwami.
*   **Zakładka Ustawienia:** Zarządzaj swoim kontem.

## Technologie

*   React Native
*   Expo
*   Firebase Authentication
*   React Native Paper (UI Library)
*   React Navigation
*   Async Storage
*   Expo Notifications
*   date-fns
*   formik, yup (walidacja formularzy)
*   react-native-calendars
*   react-native-svg
*   react-native-gesture-handler

## Struktura Projektu

```
OnTime/
├── assets/
├── components/        # Reużywalne komponenty UI (np. modale, elementy listy)
├── context/           # Konteksty React (np. AuthContext, TaskContext)
├── navigation/        # Konfiguracja nawigacji
├── screens/           # Ekrany aplikacji (np. TasksScreen, CalendarScreen)
├── services/          # Usługi zewnętrzne (np. firebase.js)
├── styles/            # Wspólne style i motyw (theme.js)
├── utils/             # Funkcje pomocnicze
├── App.js             # Główny komponent aplikacji
├── package.json
├── readme.md
└── ...inne pliki konfiguracyjne
```

import {
  addMilliseconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  addISOWeekYears,
  addSeconds
} from 'date-fns';

// Модуль для роботи з датами
// Імпортує та перевидає функції з бібліотеки date-fns для додавання часових проміжків до дат
// Дозволяє централізовано імпортувати потрібні функції для роботи з датами в додатку

// Функції для додавання різних часових інтервалів до дати:
// addMilliseconds - додає мілісекунди
// addSeconds - додає секунди
// addMinutes - додає хвилини
// addHours - додає години
// addDays - додає дні
// addWeeks - додає тижні
// addMonths - додає місяці
// addQuarters - додає квартали (3 місяці)
// addYears - додає роки
// addISOWeekYears - додає роки за стандартом ISO тижнів

// Перевидаємо функції для використання в інших частинах додатку
export {
  addMilliseconds,
  addMinutes,
  addHours,
  addDays,
  addWeeks,
  addMonths,
  addQuarters,
  addYears,
  addISOWeekYears,
  addSeconds
};
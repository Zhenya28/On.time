import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, Icon, IconButton } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import theme from '../../styles/theme';

// Компонент TaskItem
// Відображає окреме завдання у списку з можливістю свайпу для видалення
// та функціями відмітки завдання як виконаного
const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
  // Функція рендерингу дій при свайпі вправо
  // Відображає кнопку видалення з анімацією
  const renderRightActions = (progress, dragX) => {
    // Створюємо анімацію масштабування під час свайпу
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    // Повертаємо анімований компонент кнопки видалення
    return (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => onDelete(task.id)}
      >
        <Animated.View style={[styles.deleteActionContent, { transform: [{ scale }] }]}>
          <IconButton
            icon="trash-can-outline"
            size={24}
            color="white"
            style={styles.deleteIcon}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // Функція для отримання кольору відповідно до пріоритету завдання
  // Повертає різні кольори для різних рівнів пріоритету
  const getPriorityColor = () => {
    if (task.completed) return theme.colors.disabled;
    
    switch (task.priority) {
      case 'high':
        return '#FF486A';
      case 'medium':
        return '#FBA518';
      case 'low':
        return '#72BF78';
      default:
        return theme.colors.accent;
    }
  };

  // Функція форматування дати та часу
  // Перетворює дату з ISO формату у читабельний рядок
  const formatDateTime = () => {
    if (!task.dueDate) return null;
    
    try {
      const date = new Date(task.dueDate);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      const dateStr = `${day}.${month}`;
      const timeStr = `${hours}:${minutes}`;
      
      return `${dateStr}, ${timeStr}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  // Отримуємо відформатований рядок дати та часу
  const dateTimeString = formatDateTime();

  // Рендерим інтерфейс елемента завдання
  return (
    <View style={styles.itemWrapper}>
      {/* Компонент свайпу для видалення завдання */}
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableRightOpen={() => onDelete(task.id)}
        rightThreshold={40}
        overshootRight={false}
      >
        {/* Основний контейнер завдання */}
        <TouchableOpacity 
          style={styles.container}
          onPress={() => onEdit(task)}
          activeOpacity={0.7}
        >
          {/* Контейнер для чекбоксу */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => onToggleComplete(task.id)}
          >
            {/* Чекбокс з динамічним стилем залежно від пріоритету та стану */}
            <View style={[
              styles.checkbox,
              { borderColor: getPriorityColor() },
              task.completed && { backgroundColor: getPriorityColor() }
            ]}>
              {/* Відмітка виконання (видима тільки якщо завдання виконане) */}
              {task.completed && (
                <View style={styles.checkmark} />
              )}
            </View>
          </TouchableOpacity>

          {/* Контейнер для вмісту завдання */}
          <View style={styles.contentContainer}>
            {/* Заголовок завдання */}
            <Text 
              style={[
                styles.title,
                task.completed && styles.completedTitle
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            
            {/* Опис завдання (умовно видимий) */}
            {task.description && (
              <Text 
                style={[
                  styles.description,
                  task.completed && styles.completedDescription
                ]}
                numberOfLines={1}
              >
                {task.description}
              </Text>
            )}

            {/* Дата та час виконання (умовно видимі) */}
            {dateTimeString && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[
                  styles.dateTime,
                  task.completed && styles.completedDateTime
                ]}>
                  {dateTimeString}
                </Text>
                {/* Іконка нагадування (видима, якщо нагадування включене) */}
                {task.reminder && (
                  <Icon
                    source="clock-outline"
                    size={14}
                    color={task.completed ? theme.colors.disabled : theme.colors.primary}
                    style={{ marginLeft: 8, marginBottom: -1 }}
                  />
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
};

// Стилі для компонентів елемента завдання
const styles = StyleSheet.create({
  // Зовнішня обгортка елемента з відступами
  itemWrapper: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  // Основний контейнер елемента завдання
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#24A19C',
    borderRadius: 8,
    minHeight: 64,
  },
  // Контейнер для чекбоксу з відступами
  checkboxContainer: {
    alignSelf: 'center',
    marginRight: 12,
    padding: 4,
  },
  // Стиль для самого чекбоксу
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Стиль для відмітки виконання всередині чекбоксу
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: 'white',
  },
  // Контейнер для вмісту завдання
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  // Стиль для заголовка завдання
  title: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  // Стиль для заголовка виконаного завдання
  completedTitle: {
    textDecorationLine: 'line-through',
    color: theme.colors.disabled,
  },
  // Стиль для опису завдання
  description: {
    fontSize: 14,
    color: theme.colors.darkGray,
    marginBottom: 2,
  },
  // Стиль для опису виконаного завдання
  completedDescription: {
    textDecorationLine: 'line-through',
    color: theme.colors.disabled,
  },
  // Стиль для дати та часу
  dateTime: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  // Стиль для дати та часу виконаного завдання
  completedDateTime: {
    color: theme.colors.disabled,
  },
  // Стиль для дії видалення при свайпі
  deleteAction: {
    backgroundColor: '#FF486A',
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Стиль для вмісту дії видалення
  deleteActionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Стиль для іконки видалення
  deleteIcon: {
    margin: 0,
  },
});

export default TaskItem;
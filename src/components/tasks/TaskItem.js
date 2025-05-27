import React from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, Icon, IconButton } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import theme from '../../styles/theme';

// Komponent dla wyświetlania jednego zadania
const TaskItem = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

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

  // Get priority color for checkbox
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

  // Format date and time
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

  const dateTimeString = formatDateTime();

  return (
    <View style={styles.itemWrapper}>
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableRightOpen={() => onDelete(task.id)}
        rightThreshold={40}
        overshootRight={false}
      >
        <TouchableOpacity 
          style={styles.container}
          onPress={() => onEdit(task)}
          activeOpacity={0.7}
        >
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => onToggleComplete(task.id)}
          >
            <View style={[
              styles.checkbox,
              { borderColor: getPriorityColor() },
              task.completed && { backgroundColor: getPriorityColor() }
            ]}>
              {task.completed && (
                <View style={styles.checkmark} />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.contentContainer}>
            <Text 
              style={[
                styles.title,
                task.completed && styles.completedTitle
              ]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            
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

            {dateTimeString && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[
                  styles.dateTime,
                  task.completed && styles.completedDateTime
                ]}>
                  {dateTimeString}
                </Text>
                {task.reminder && (
                  <Icon
                    source="clock-outline"
                    size={14}
                    color={task.completed ? theme.colors.disabled : theme.colors.primary}
                    style={{ marginLeft: 6, marginBottom: -1 }}
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

const styles = StyleSheet.create({
  itemWrapper: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
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
  checkboxContainer: {
    alignSelf: 'center',
    marginRight: 12,
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: theme.colors.disabled,
  },
  description: {
    fontSize: 14,
    color: theme.colors.darkGray,
    marginBottom: 2,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: theme.colors.disabled,
  },
  dateTime: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  completedDateTime: {
    color: theme.colors.disabled,
  },
  deleteAction: {
    backgroundColor: '#FF486A',
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    margin: 0,
  },
});

export default TaskItem;
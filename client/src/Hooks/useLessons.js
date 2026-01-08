// useLessons.js
import { useState, useEffect } from 'react';

export const useLessons = (moduleId) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      setError(null);
      try {
        // Mock lessons data
        const mockLessons = [
          { 
            id: 1, 
            title: 'Introduction to Solar Energy',
            description: 'Learn about solar power basics',
            duration: 15,
            points: 50,
            type: 'video',
            completed: true,
            locked: false
          },
          { 
            id: 2, 
            title: 'Wind Energy Systems',
            description: 'Understanding wind turbines',
            duration: 20,
            points: 75,
            type: 'interactive',
            completed: false,
            locked: false
          },
          { 
            id: 3, 
            title: 'Renewable Energy Quiz',
            description: 'Test your knowledge',
            duration: 10,
            points: 100,
            type: 'quiz',
            completed: false,
            locked: true
          }
        ];
        setLessons(mockLessons);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLessons();
  }, [moduleId]);

  const completeLesson = (lessonId) => {
    setLessons(prev =>
      prev.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, completed: true }
          : lesson
      )
    );
  };

  const unlockLesson = (lessonId) => {
    setLessons(prev =>
      prev.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, locked: false }
          : lesson
      )
    );
  };

  return {
    lessons,
    loading,
    error,
    completeLesson,
    unlockLesson
  };
};
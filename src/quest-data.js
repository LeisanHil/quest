// Заполни этот файл, когда будут готовы загадки, ответы и точки маршрута.
// У каждого ответа можно указать несколько допустимых вариантов — без учёта регистра и «ё/е».
export const quest = {
  title: 'Квест для Полины',
  subtitle: 'Четыре точки на карте, немного наблюдательности и много любви от подруг.',
  dateLabel: 'особенный день',
  final: {
    title: 'Ты справилась!',
    message: 'Твой подарок уже ждёт. Открывай его — и пусть этот день запомнится надолго.',
    prizeUrl: '#'
  },
  stages: [
    {
      riddleTitle: 'Первая остановка', riddle: 'Здесь появится первая загадка.', riddleAnswers: ['ответ 1'],
      latitude: null, longitude: null, radiusMeters: 80,
      locationPrompt: 'Ты разгадала место? Иди туда и подтверди, что ты на месте.',
      locationQuestion: 'Здесь появится вопрос-код для первой точки.', codeAnswers: ['код 1']
    },
    {
      riddleTitle: 'Вторая остановка', riddle: 'Здесь появится вторая загадка.', riddleAnswers: ['ответ 2'],
      latitude: null, longitude: null, radiusMeters: 80,
      locationPrompt: 'Нашла вторую точку? Подтверди своё местоположение.',
      locationQuestion: 'Здесь появится вопрос-код для второй точки.', codeAnswers: ['код 2']
    },
    {
      riddleTitle: 'Третья остановка', riddle: 'Здесь появится третья загадка.', riddleAnswers: ['ответ 3'],
      latitude: null, longitude: null, radiusMeters: 80,
      locationPrompt: 'Ты близко. Подтверди, что ты у третьей точки.',
      locationQuestion: 'Здесь появится вопрос-код для третьей точки.', codeAnswers: ['код 3']
    },
    {
      riddleTitle: 'Финальная остановка', riddle: 'Здесь появится последняя загадка.', riddleAnswers: ['ответ 4'],
      latitude: null, longitude: null, radiusMeters: 80,
      locationPrompt: 'Последняя точка найдена? Подтверди это.',
      locationQuestion: 'Здесь появится финальный вопрос-код.', codeAnswers: ['код 4']
    }
  ]
};

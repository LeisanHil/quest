import './styles.css';

const startButton = document.querySelector('#start-button');
const status = document.querySelector('#status');

startButton.addEventListener('click', () => {
  status.textContent = 'Маршрут появится здесь после настройки заданий.';
});

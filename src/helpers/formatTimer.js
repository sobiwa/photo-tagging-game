export default function formatTimer(time) {
  if (!time) return '00:00:00';
  function addZeroes(num) {
    if (!num) return '00';
    const newNum = Math.round(num);
    if (newNum < 10) return `0${newNum}`;
    return `${newNum}`;
  }
  const totalSeconds = time / 1000;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${addZeroes(hours)}:${addZeroes(minutes)}:${addZeroes(seconds)}`;
}

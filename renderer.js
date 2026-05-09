const func = async () => {
  const response = await window.versions.ping();
  console.log(response);
};
func();

const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

let totalSeconds = 30 * 60; // 30 minutes
let remaining = totalSeconds;
let timesUp = false;
const countdown = document.getElementById('countdown');
const progress = document.getElementById('progress');

function updateTimer() {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  var countdownText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  if (timesUp) countdownText = `-${countdownText}`;
  countdown.textContent = countdownText;
  if (!timesUp) {
    // Progress width
    const percent = (remaining / totalSeconds) * 100;
    progress.style.width = `${percent}%`;
    // Color thresholds
    if (remaining <= 60) {
      // Last minute = red
      progress.style.backgroundColor = '#ff4444';
      countdown.style.color = '#ff4444';
    } else if (remaining <= 180) {
      // Last 3 minutes = yellow
      progress.style.backgroundColor = '#ffcc00';
      countdown.style.color = '#ffcc00';
    } else {
      // Normal = green
      progress.style.backgroundColor = '#33ff33';
      countdown.style.color = '#33ff33';
    }
  }
  if (remaining > 0) {
    if (timesUp) {
      remaining++;
    } else {
      remaining--;
    }
  } else {
  	timesUp = true;
  	remaining++;
  }
}
var countdownTimer = null;
window.electronApi.onSetCountdownStartTime((value) => {
  totalSeconds = value;
  if (remaining > totalSeconds)
    remaining = totalSeconds;
  updateTimer();
});
window.electronApi.onSetCountdownRemainingTime((value) => {
  remaining = value;
  if (remaining > totalSeconds)
    totalSeconds = remaining;
  updateTimer();
});
window.electronApi.onStartCountdown(() => {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = setInterval(updateTimer, 1000);
});
window.electronApi.onStopCountdown(() => {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;
});
const time = document.getElementById('time');
setInterval(() => {
  const timeString = new Date().toTimeString();
  time.innerText = timeString.substring(0, timeString.indexOf(' ')); // Omit timezone
}, 200);

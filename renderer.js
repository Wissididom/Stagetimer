const func = async () => {
  const response = await window.versions.ping();
  console.log(response);
};
func();

const information = document.getElementById('info')
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`

//const TOTAL_SECONDS = 30 * 60; // 30 minutes
const TOTAL_SECONDS = 4 * 60; // 4 minutes
let remaining = TOTAL_SECONDS;
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
    const percent = (remaining / TOTAL_SECONDS) * 100;
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
updateTimer();
setInterval(updateTimer, 1000);
const time = document.getElementById('time');
setInterval(() => {
  const timeString = new Date().toTimeString();
  time.innerText = timeString.substring(0, timeString.indexOf(' ')); // Omit timezone
}, 200);

const statusEl = document.getElementById('status');

const screenSelect = document.getElementById('screenSelect');

const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');

const API_BASE = 'http://localhost:3000';

function setStatus(data) {
  statusEl.textContent =
    typeof data === 'string'
      ? data
      : JSON.stringify(data, null, 2);
}

async function api(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json'
      },
      ...options
    });

    const data = await response.json();

    setStatus(data);

    return data;
  } catch (err) {
    console.error(err);
    setStatus(err.message);
  }
}

async function loadScreens() {
  const screens = await api('/screens');

  if (!Array.isArray(screens)) {
    return;
  }

  screenSelect.innerHTML = '';

  for (const screen of screens) {
    const option = document.createElement('option');

    option.value = screen.id;

    option.textContent =
      `${screen.label || 'Display'} (${screen.size.width}x${screen.size.height})`;

    screenSelect.appendChild(option);
  }
}

function getTimePayload() {
  return {
    min: Number(minutesInput.value),
    sec: Number(secondsInput.value)
  };
}

document
  .getElementById('refreshScreensBtn')
  .addEventListener('click', loadScreens);

document
  .getElementById('showScreenBtn')
  .addEventListener('click', async () => {
    await api('/screen/show', {
      method: 'POST',
      body: JSON.stringify({
        id: Number(screenSelect.value)
      })
    });
  });

document
  .getElementById('closeScreenBtn')
  .addEventListener('click', async () => {
    await api('/screen/close', {
      method: 'POST'
    });
  });

document
  .getElementById('setStartBtn')
  .addEventListener('click', async () => {
    await api('/countdown/start-time', {
      method: 'POST',
      body: JSON.stringify(getTimePayload())
    });
  });

document
  .getElementById('setRemainingBtn')
  .addEventListener('click', async () => {
    await api('/countdown/remaining-time', {
      method: 'POST',
      body: JSON.stringify(getTimePayload())
    });
  });

document
  .getElementById('startBtn')
  .addEventListener('click', async () => {
    await api('/countdown/start', {
      method: 'POST'
    });
  });

document
  .getElementById('stopBtn')
  .addEventListener('click', async () => {
    await api('/countdown/stop', {
      method: 'POST'
    });
  });

loadScreens();

const MAX_DELAY_BETWEEN_KEYS = 500; // 0.5 sec
const TRIGGER_KEY_ID = 68; // Letter "d"
const REQUIRED_NUMBER_OF_CLICKS = 3;
const APP_BASE_URL = 'https://katalogue-app.herokuapp.com';
const SAVE_LINK_BTN_ID = 'store-link-btn';
const NOTIFICATION_DISPLAY_TIMEOUT = 3000;

const shouldSaveLink = keyPresses =>
  keyPresses.length >= REQUIRED_NUMBER_OF_CLICKS;
const setReference = ref =>
  new Promise((res, rej) => {
    try {
      chrome.storage.sync.set({ currentReference: ref }, res);
    } catch (e) {
      rej(e);
    }
  });

const getReference = () =>
  new Promise((res, rej) => {
    try {
      chrome.storage.sync.get(['currentReference'], ({ currentReference }) =>
        res(currentReference)
      );
    } catch (e) {
      rej(e);
    }
  });

const saveLink = async () => {
  const currentReference = await getReference();
  let body = {
    title: document.title,
    url: document.location.toString(),
  };
  if (currentReference) {
    body = {
      ...body,
      reference: currentReference,
    };
  }

  const response = await fetch(`${APP_BASE_URL}/api/v1/save`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const { reference: newReference } = await response.json();
  if (!currentReference) {
    await setReference(newReference);
  }
};
const showSuccessMessage = () => {
  const notification = document.createElement('div');
  notification.innerText = 'Saved 👍';
  notification.id = 'success_notification';
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.right = '10px';
  notification.style.width = '80px';
  notification.style.height = '30px';
  notification.style.backgroundColor = '#333';
  notification.style.color = '#e7ebf3';
  notification.style.display = 'flex';
  notification.style.alignItems = 'center';
  notification.style.justifyContent = 'center';
  notification.style.zIndex = '99999999999';
  document.body.appendChild(notification);
  setTimeout(
    () => document.getElementById('success_notification').remove(),
    NOTIFICATION_DISPLAY_TIMEOUT
  );
};

(function main() {
  let keyPresses = [];
  let timeout = null;
  const onKeyDown = e => {
    if (e.keyCode !== TRIGGER_KEY_ID) {
      return;
    }
    if (timeout) {
      clearTimeout(timeout);
    }

    keyPresses.push('click');
    timeout = setTimeout(() => (keyPresses = []), MAX_DELAY_BETWEEN_KEYS);
    if (!shouldSaveLink(keyPresses)) {
      return;
    }
    saveLink();
    showSuccessMessage();
  };
  document.addEventListener('keyup', onKeyDown, false);
})();

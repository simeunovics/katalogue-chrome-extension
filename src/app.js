const MAX_DELAY_BETWEEN_KEYS = 1000;
const TRIGGER_KEY_ID = 221;
const REQUIRED_NUMBER_OF_CLICKS = 2;
const APP_BASE_URL = 'https://katalogue-app.herokuapp.com';
const SAVE_LINK_BTN_ID = 'store-link-btn';
const NOTIFICATION_DISPLAY_TIMEOUT = 3000;

const recordKeyPress = ({ keyCode }, keyPresses) => {
  if (keyCode === TRIGGER_KEY_ID) {
    keyPresses.push('click');
  }
};
const shouldSaveLink = keyPresses =>
  keyPresses.length >= REQUIRED_NUMBER_OF_CLICKS;
const setReference = ref =>
  new Promise((res, rej) => {
    chrome.storage.sync.set({ currentReference: ref }, res);
  });

const getReference = () =>
  new Promise((res, rej) => {
    chrome.storage.sync.get(['currentReference'], ({ currentReference }) =>
      res(currentReference)
    );
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
  const content = await response.json();
  const { reference: newReference } = content;
  if (!currentReference) {
    await setReference(newReference);
  }
  console.log({ response, content });
};
const showSuccessMessage = () => {
  const notification = document.createElement('div');
  notification.innerText = 'Saved ✓';
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
  const keyPresses = [];
  setInterval(() => {
    keyPresses.pop();
  }, MAX_DELAY_BETWEEN_KEYS);
  const onKeyDown = e => {
    if (e.keyCode !== TRIGGER_KEY_ID) {
      return;
    }

    recordKeyPress(e, keyPresses);
    if (shouldSaveLink(keyPresses)) {
      saveLink();
      showSuccessMessage();
    }
  };
  document.addEventListener('keyup', onKeyDown, false);
})();

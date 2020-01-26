chrome.storage.sync.get(
  ['currentReference'],
  ({ currentReference }) =>
    (document.getElementById('reference-link-display').innerText =
      currentReference || 'N/A')
);

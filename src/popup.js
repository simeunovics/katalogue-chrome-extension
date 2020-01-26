const REFERENCE_ID_HOLDER = 'reference-link-display';
const SUBMIT_BTN = 'submit-btn';

chrome.storage.sync.get(
  ['currentReference'],
  ({ currentReference }) =>
    (document.getElementById(REFERENCE_ID_HOLDER).value =
      currentReference || '')
);
document.getElementById(SUBMIT_BTN).onclick = function() {
  const newReference = document.getElementById(REFERENCE_ID_HOLDER).value;
  chrome.storage.sync.set({ currentReference: newReference });
  const oldText = this.innerText;
  this.innerText = 'Saved 👍';
  setTimeout(() => {
    this.innerText = oldText;
  }, 1000);
};

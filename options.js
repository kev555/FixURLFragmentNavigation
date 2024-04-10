// Saves options to chrome.storage
const saveOptions = () => {
    const disScrollResChoice = document.getElementById('disScrollResOpt').checked;
    const enPreScrollOptChoice = document.getElementById('enPreScrollOpt').checked;

    console.log("wtf", disScrollResChoice, enPreScrollOptChoice);
  
    chrome.storage.local.set(
      { disScrollResOpt: disScrollResChoice, enPreScrollOpt: enPreScrollOptChoice},
      () => {
        // Update status to let user know options were saved.
        const status = document.getElementById('statusToast');
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 850);
      }
    );
  };
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  const restoreOptions = () => {
    chrome.storage.local.get(
      { disScrollResOpt: false, enPreScrollOpt: false },
      (items) => {
        document.getElementById('disScrollResOpt').checked = items.disScrollResOpt;
        document.getElementById('enPreScrollOpt').checked = items.enPreScrollOpt;
      }
    );
  };
  
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.getElementById('save').addEventListener('click', saveOptions); // save option and give toast status message


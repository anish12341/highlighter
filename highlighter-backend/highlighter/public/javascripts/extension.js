const passToExtension = (userData) => {
  console.log('I am in extension file', userData);
  chrome.runtime.sendMessage('dlimceipmmicbhhdjonaojcboeddhmmf',{'message':'userData','data': userData});
}
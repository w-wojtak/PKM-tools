
/**
 * Sends text, URL, and a flag indicating whether to include the link, to the Node.js server.
 * This function makes an HTTP POST request to the server's '/save-text' endpoint.
 * It submits the data as a JSON object, which includes the text extracted from a webpage,
 * the URL of the webpage, and a boolean flag to specify if the URL should be included in the save operation.
 * The server response is logged to the console. If any error occurs during the request or processing,
 * it is caught and logged to the console.
 * 
 * @param {string} text - The text to be sent to the server.
 * @param {string} url - The URL of the webpage from which the text is taken.
 * @param {boolean} includeLink - A flag to indicate if the URL should be included in the save.
 */

function sendTextToServer(text, url, includeLink) {
    fetch('http://localhost:3000/save-text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text, url: url, includeLink: includeLink })
    })
    .then(response => response.text())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}


/**
 * Sets up an event listener that activates when the DOM content is fully loaded.
 * This function initializes a button (`saveTextButton`) and a checkbox (`includeLinkCheckbox`) from the document.
 * When the `saveTextButton` is clicked, it executes a series of operations to capture the selected text 
 * from the currently active tab in a Chrome browser. It then potentially appends the URL of the active tab 
 * to this text, depending on the state of the `includeLinkCheckbox`. Finally, it calls `sendTextToServer` function,
 * passing the selected text, the URL of the active tab, and the state of the checkbox as arguments.
 * 
 * The function uses the Chrome Extension API to interact with the browser's tabs. It queries the currently active tab,
 * executes a script to get the currently selected text on the page, and then processes this text based on user input 
 * from the checkbox. This is primarily used for capturing and optionally associating web content with its source URL 
 * before sending it to a server for processing or storage.
 */


document.addEventListener('DOMContentLoaded', function() {
    var saveButton = document.getElementById('saveTextButton');
    var includeLinkCheckbox = document.getElementById('includeLinkCheckbox');

    saveButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var activeTab = tabs[0];
            chrome.tabs.executeScript(
                activeTab.id,
                {code: 'window.getSelection().toString();'},
                function(selection) {
                    var selectedText = selection[0];
                    var activeTabUrl = activeTab.url;
                    if (includeLinkCheckbox.checked) {
                        selectedText += "\n\n" + activeTab.url + "\n\n";
                    }
                    sendTextToServer(selectedText, activeTabUrl, includeLinkCheckbox.checked);
                }
            );
        });
    }, false);
}, false);





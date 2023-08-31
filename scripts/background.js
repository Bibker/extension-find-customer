var data = 'null';
//IT RUNS , WHEN IT RECEIVES MESSGAE FROM CONTENT
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        data = message;
        console.log(data);
    })
    // IT SENDS MESSAGE TO THE CONTENT(CUSTOMER DETAILS)
chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {

    chrome.tabs.sendMessage(tab.id, data)
    console.log("Message Sent to Container");
}
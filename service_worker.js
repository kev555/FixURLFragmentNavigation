
console.log("service worker ran");
// background script only runs once, you must set all appropriate listeners and logic within them at extension / browser load time

async function injectFunc(tab)
{
    let allUrls = "not_undefined";

    try {
        allUrls = await chrome.storage.local.get("urls");   // resolves to results object if successful
    } 
    catch (err) {
        console.log("err with .get:", err);                 // if the storage.local.get operation fails, catch the rejected promise
    };

    if (allUrls === undefined){  
        console.log(" -> 'Managed storage is not set' - add 'storage' to manifest permissions");
    }
    else if (Object.keys(allUrls).length === 0){            // empty object = no records
        console.log("no records found");
    }
    else {                                                  // results object returned
        
        allUrls = allUrls["urls"]; // extract the urls records object
        console.log("allUrls : ", allUrls);
        
        var url = new URL(tab.url);
        var hostname = url.hostname;
        
        if (allUrls.hasOwnProperty(hostname)) {  // grab the record
            
            console.log("URL found!");

            var hostOptions = allUrls[hostname];

            chrome.scripting.executeScript({
                args: [hostOptions[0], hostOptions[1]],
                target: { tabId: tab.id, allFrames: true, },
                func: startProg,
            });

            // try {
            //     chrome.scripting.executeScript({
            //         //args: ["disScrollResOpt", "enPreScrollOpt"],
            //         target: { tabId: tab.id, allFrames: true, },
            //         func: startProg,
            //     });
            // } catch (err) {
            //     console.log("failed to execute script : ", err);
            // }
        }

    }
};

chrome.tabs.onUpdated.addListener( async function myListener(tabId, changeInfo, tab) {
    console.log("onUpdate fired");
    // will fire 5 times for a newly opened tab, and 3 times for a refresh of current activetab
    
    if (changeInfo.status == "complete"){
        console.log("changeInfo.status == complete"); // also log: changeInfo.url, tab.url
        // will fire once for new tab and once for a reload, and only after the page has fully loaded
        
        // onUpdate keeps runuing everytime the page scrolls, causeing 5x the amount of scrolls to be run
        // So needed to remove the listener, wait a little bit for the scrolling to complete, then re-add it, 
        // however the inject function was running asynchronously, so needed to convert to async and await it

        chrome.tabs.onUpdated.removeListener(myListener); 
        // this removes the listener of the entire background worker!! not just this run of it!!!
        // the background script only runs once, you must set all appropriate listeners at run time.
        
        await injectFunc(tab);
        console.log("should be synchronous now");

        setTimeout(() => {
            console.log("timeout complete");
            chrome.tabs.onUpdated.addListener(myListener); // wait 3s then re-add the listener
        }, 3000);
    }
});


// Added fucntionalilty to allow adding many websites to the options page with specific settings for each. 
// Changed from a content script to a service worker, which is injected in user defined websites

// this function moved from content script
function startProg(disScrollResOpt = false, enPreScrollOpt = false){

    // document.body.style.backgroundColor = 'blue';
    // console.log("check 1", disScrollResOpt, enPreScrollOpt);

    // disable scroll restoratioin
    // this uses only the Window.history part of the standarized js Web API, so will work across browsers easily
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/history
    // And it doesn't require any additional permissions in the manifest as it's not part of the extensioins API
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API
    if (disScrollResOpt){
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }
    
    // enable pre scroll
    // again this only uses Web API
    if (enPreScrollOpt){
        // enable manual pre scrolling
        var height = document.body.scrollHeight;
        var jump_num = 50;                          // 25 might be sufficient .. test 
        var spacer = height / jump_num;             // scrollHeight start value (the value does change during scroll but this seems to work) 
        var originalHash = window.location.hash;    // original anchor
        var x = 0;

        var intervalID = setInterval(function () {
            window.scrollBy(0, spacer);             // scroll 1/50th each time

            if (++x === jump_num) {
                console.log("page fully loaded");

                if (!originalHash) { 
                    // if there was no anchor
                    // jump back to the top of the page after loading with single "#"
                    // for some reason a single # will not be added unless there is already a hash value, so add a dummy value first (##)
                    document.location.hash = "##";
                    document.location.hash = "#";
                }
                else {
                    // if there was an anchor
                    // document.location.hash = originalHash; // !!! wont work as this is the same hash value that's already in the URL
                    // clear it with a dummy value (##)
                    document.location.hash = '##';
                    document.location.hash = originalHash;
                }

                window.clearInterval(intervalID);
                intervalID = null;
            }
        }, 10);
    }

    console.log("helllloooo 2");
};


// chrome.tabs.onCreated.addListener((tab) => { console.log("working") });
// Don't use this as the onCreated event might not get the new URL string ("the tab's URL may not be set at the time this event fired")

// chrome.webNavigation.onHistoryStateUpdated.addListener((e) => {console.log("111", e)});
// this is also an option using "webNavigation.onHistoryStateUpdated", but doesn't seem reliable

// onUpdated event is best, this way:
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status == 'complete' ){
//         console.log("222")
//     }
// });

/////////////// onUpdated info:
// onUpdated takes a listener callback, listener recieves:
// tabId - integer.     The ID of the updated tab.
// changeInfo - object. The properties of the tab that changed.
// tab - tabs.Tab.      All properties of the tab.
// changeInfo contains:
// status - Optional - string.  The status of the tab. Can be either loading or complete.
// url - Optional - string.     The tab's URL, if it has changed.
///////////////



// Other possible tab listeners:
// https://developer.chrome.com/docs/extensions/reference/api/tabs#event

// chrome.tabs.onActivated.addListener(
//     callback: function,
//   )
//   Fires when the active tab in a window changes. 
// Note that the tab's URL may not be set at the time this event fired, but you can listen to onUpdated events so as to be notified when a URL is set.

// chrome.tabs.onCreated.addListener(
//     callback: function,
//   )
//   Fired when a tab is created. 
// Note that the tab's URL and tab group membership may not be set at the time this event is fired, but you can listen to onUpdated events so as to be notified when a URL is set or the tab is added to a tab group.


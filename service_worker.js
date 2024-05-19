
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
        //console.log("allUrls : ", allUrls);
        
        var url = new URL(tab.url);
        var hostname = url.hostname;
        
        if (allUrls.hasOwnProperty(hostname)) {  // grab the record

            console.log("URL found!");
            var hostOptions = allUrls[hostname];

            chrome.scripting.executeScript({
                args: [hostOptions[0], hostOptions[1]],
                target: { tabId: tab.tabId, allFrames: true, },
                func: startProg,
            });
        }

    }
};

// chrome.webNavigation.onCompleted.addListener( (details) => {
//         console.log("nav completed: ", details);
// });
// this is firing for every frame in the page, even a blank new tab in chrome has 3 frames
// there is frameType: "sub_frame" and frameType: "outermost_frame", 
// seems the outermost_frame just fires once so should be fine to simple filter by this
// Also it does not fire at all for a in-page renaivigation like onUpdated does,
// so re-scrolling doesn't occur so there is no need for removing / re addind listener.

// chrome.webNavigation.onCommitted.addListener( (details) => {
//     if(details.transitionType == "reload"){
//         console.log("reload")
//     };
// });
// this works well, no mis-triggers.
// but what is the use case? ie in what situations will the user want to reload
// should the reload jump back to where the user has scrolled to in the page or to where the url anchor is?
// also what if they have selected to disable chrome scroll restoration?

// Actually webNavigation.onCompleted also fires for a reload, whic is not ideal
// Could possibly use onCommitted details.transitionType = reload to cacel out onCompleted's reload trigger


chrome.webNavigation.onCompleted.addListener( async (details) => {
    if (details.frameType == "outermost_frame"){
        await injectFunc(details);
    };
});

function startProg(disScrollResOpt = false, enPreScrollOpt = false){
    // document.body.style.backgroundColor = 'blue';

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
    
    // enable pre scroll, again this only uses Web API, no manifest permissions needed for this specifically
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



//////

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


// chrome.webNavigation.onCreatedNavigationTarget.addListener(function lala3(details){

//     console.log("created navigation target (can be tab OR window)");

// });
// Only fires from:
// right click -> new tab
// right click -> new window

// does not fire from a link that opens in the same active tab
// does not fire from manually opening a tab/window
// does not fire from opening a bookmark, even in a new tab
// not very useful


// chrome.tabs.onActivated.addListener(function lala2(){

//     console.log("tab activated");

// });
// This seems to work well but scrolling will not be able to happen in the background,
// ie if a user opens a page in a new tab in advance before navigating to it



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


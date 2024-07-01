
console.log("service worker ran");

// Background scripts only runs once per extension / browser load time, unlike content scripts which run once per page
// Listeners set here however can continually listen to events from every new and existing page.

// Using the correct listener to begin the processes is vital - I want the scrolling logic to run ONLY after the page has fully loaded.
// See devnotes.txt for listening methods I've tested. 
// webNavigation.onCompleted seems to be the best (with the "outermost_frame" check)

chrome.webNavigation.onCompleted.addListener( async (tabDetails) => {
    if (tabDetails.frameType == "outermost_frame"){
        await checkURL(tabDetails);
    };
});

async function checkURL(tabDetails)
{
    let globalObject = await getGlobalObject();
    console.log(globalObject);
    if (globalObject) {
        let allUrls = globalObject["urls"];                     // extract the url records object from the global db object
        let newUrl = new URL(tabDetails.url);                   // this parsing should never fail as it's coming directly from tab... right?
        let newHostname = newUrl.hostname;

        if (newHostname.slice(0, 4) === "www.") {               // remove "www." subdomain if present, keeps everything uniform
            newHostname = newHostname.slice(4, newHostname.length);
        };

        if (allUrls.hasOwnProperty(newHostname)) {              // if record found for this url, run logic depending on user-defined options
            console.log("URL was found in db");
            let urlOptions = allUrls[newHostname];
            chrome.scripting.executeScript( {
                args: [urlOptions[0], urlOptions[1]],
                target: { tabId: tabDetails.tabId, allFrames: true, },
                func: injectFunc,
            });
        } else {
            console.log("URL was not found in db");
        }
    }
};

async function getGlobalObject(){
    let allUrls = "not_undefined";
    try {
        allUrls = await chrome.storage.local.get("urls");       // resolves to results object if successful, undefined if no storage set
    } catch(err) {
        console.log("error with storage.local.get:", err);      // if the storage.local.get fails, catch rejected promise
        return false;
    };

    if (allUrls === undefined) {
        console.log("Managed storage is not set");
        return false;
    } else if (Object.keys(allUrls).length === 0) {             // an empty object was returned == no records
        console.log("no records found");
        return false;
    } else {                                                    // a results object was returned
        return allUrls;
    }
}

function injectFunc(disScrollResOpt = false, enPreScrollOpt = false) {
    // document.body.style.backgroundColor = 'blue';  // one can directly edit the webpage from this function
    // disabling scroll restoratioin, see dev note 1
    if (disScrollResOpt){
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }

    // enable pre scrolling, again this only uses Web API, no specific manifest permissions needed for this
    if (enPreScrollOpt) {
        const scrollIncrements = 20;
        let eachIncrement = document.body.scrollHeight / scrollIncrements;             
        let originalHashAnchor = window.location.hash;
        let x = 0;
        
        let intervalID = setInterval(function () {
            window.scrollBy({
                top: eachIncrement,
                left: 0,
                behavior: "instant",
              });
            
            if (++x === scrollIncrements) {
                console.log("page fully loaded");
                if (!originalHashAnchor) {
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "instant",
                    });
                } else {
                    // document.location.hash = originalHashAnchor; - won't work, clear it first with a dummy value (##)
                    document.location.hash = '##';
                    document.location.hash = originalHashAnchor;
                }
                
                window.clearInterval(intervalID);
                intervalID = null;
            }
        }, 15);
    }
};


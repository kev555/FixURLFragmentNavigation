
console.log("service worker ran");
// background script only runs once, you must set all appropriate listeners and logic within them at extension / browser load time

async function injectFunc(tab)
{
    let allUrls = "not_undefined";
    try {
        allUrls = await chrome.storage.local.get("urls");   // resolves to results object if successful
    } catch (err) {
        console.log("err with .get:", err);                 // if the storage.local.get operation fails, catch the rejected promise
    };

    if (allUrls === undefined) {
        console.log(" -> 'Managed storage is not set' - add 'storage' to manifest permissions");
    } else if (Object.keys(allUrls).length === 0) {         // empty object = no records
        console.log("no records found");
    } else {                                                // results object returned
        // extract the urls records object
        allUrls = allUrls["urls"];
        //console.log("allUrls : ", allUrls);
        
        var url = new URL(tab.url); // this parsing shouldn't ever fail because it's coming directly from the tab... right?

        // console.log(url);

        var hostname = url.hostname;
        
        ////// check for the "www." subdomain as it is commonly forgotten OR added unintentionally
        // the js URL interface will include www. as part of the returned "hostname", so,
        // use substring to check if hostname has or hasn't got www. at the start, 
        // perpare both cases based on that, and then check the db for both

        let hostameWithWWW;
        let hostnameWithoutWWW;
        let wwwCheck = hostname.slice(0, 3)

        if (wwwCheck === "www.") {
            hostameWithWWW = hostname;
            hostnameWithoutWWW = hostname.slice(3, hostname.length);
        }
        else {
            hostnameWithoutWWW = hostname;
            hostameWithWWW = "www." + hostname;
        }

        console.log(hostameWithWWW, hostnameWithoutWWW);

        if (allUrls.hasOwnProperty(hostameWithWWW)) {
            runProg(hostameWithWWW);
        }
        if (allUrls.hasOwnProperty(hostnameWithoutWWW)) {
            runProg(hostnameWithoutWWW);
        }

        function runProg(hostname){
            console.log("URL found!");
            var hostOptions = allUrls[hostname];

            chrome.scripting.executeScript( {
                args: [hostOptions[0], hostOptions[1]],
                target: { tabId: tab.tabId, allFrames: true, },
                func: startProg,
            });
        }
    }
};

chrome.webNavigation.onCompleted.addListener( async (details) => {
    if (details.frameType == "outermost_frame"){
        await injectFunc(details);
    };
});

function startProg(disScrollResOpt = false, enPreScrollOpt = false) {
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
    if (enPreScrollOpt) {
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
                } else {
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
};




async function listURLs(){
    // browser.storage.local.get('keys')'s return value:
    // A Promise that resolves to a results object, containing every object in 'keys' that was found in the storage area. 
    // If 'keys' is an object, keys that are not found in the storage area will have their values given by the keys object.
    // If the operation failed, the promise is rejected with an error message.
    // If managed storage is not set, undefined will be returned.

    let allUrls = "not_undefined";
    try {
        allUrls = await chrome.storage.local.get("urls");   // resolves to results object if successful
        // destructure with { urls }? - NO - I want to check for undefined saftely!

        if (allUrls === undefined){  // if nothing found
            console.log(" -> 'Managed storage is not set'.. I think you need to add 'storage' to manifest permissions");
        }
        else if (Object.keys(allUrls).length === 0){ 
            document.getElementById("listOfSaved").innerHTML = "no records";
        }
        else {  // if results object returned
            // console.log(456, allUrls);
            var allURLsRetrieved = allUrls["urls"]; // extract the urls records object
            
            // create a html table with the results then add it to the DOM
            let text = "<table border='1'> <th>Url</th>  <th>Disable Auto Scroll </th> <th>Enable Pre Scroll</th> ";
            for (let x in allURLsRetrieved) {text += "<tr><td>" + "(www.)" + x + "</td> <td>" + allURLsRetrieved[x][0] + "</td> <td>" + allURLsRetrieved[x][1] + "</td> </tr>";}
            text += "</table>";
            document.getElementById("listOfSaved").innerHTML = text;
        }
    } 
    catch (err) {
        console.log("err with .get:", err);  // if the storage.local.get operation fails, catch the rejected promise
    };
};


async function saveNewURL() {

    function toastMessage(newMessage, shouldClear = true){
        // toast success message and reset all fields
        let status = document.getElementById('statusToast');
        let urlString = document.getElementById('urlString');
        let disAutoScroll = document.getElementById('disAutoScroll');
        let enPreScroll = document.getElementById('enPreScroll');

        if (shouldClear){
            disAutoScroll.checked = false;
            enPreScroll.checked = false;
            urlString.value = '';
        }

        status.textContent = newMessage;
        setTimeout(() => { status.textContent = ''; }, 1000);
    };


    // browser.storage.local.set's return value:
    // A Promise that is fulfilled with no arguments if the operation succeeds. 
    // If the operation fails, the promise is rejected with an error message.
    // ..."fulfilled with no arguments"... does this mean "undefined"?

    let urlString = document.getElementById('urlString').value;
    console.log("url entered: ", urlString);

    let disAutoScroll = document.getElementById('disAutoScroll').checked;
    let enPreScroll = document.getElementById('enPreScroll').checked;

    try {
        var isParsable = false;
        var correctProtocol = false;

        if (!URL.canParse(urlString)){
            urlString = "https:" + urlString;
            if (!URL.canParse(urlString)){
                toastMessage("the URL string is malformed", false);
            } else {
                isParsable = true;
            }
        } else {
            isParsable = true;
        }
        console.log("parsable check passed, check protocol next: ");
        
        var urlObj = new URL(urlString);
        console.log(999, urlObj.protocol);
        
        // check if they evener an unsupported protocol suc as ftp://
        if (urlObj.protocol !== "http:" && urlObj.protocol !== "https:") {
            toastMessage("only http or https protocols allowed", false);
        } else {
            correctProtocol = true;
        }

        if (isParsable && correctProtocol){
            console.log("attempting to add the URL");


            console.log(1, urlObj.hostname);
            
            // firstly remove "www." subdomain if present
            if (urlObj.hostname.slice(0, 4) === "www.") {
                urlObj.hostname = urlObj.hostname.slice(4, urlObj.hostname.length);
                console.log(2, urlObj.hostname)
            };
            await tryToAdd(urlObj);
        }

    } catch (err) {
        console.log("error with parsing the URL entered: ", err)
    }

    async function tryToAdd(urlObj)
    {
        try {
            let allUrls = await chrome.storage.local.get("urls");
            // resolves to results object if successful, an empty object if no records
            // result won't be: {url123: [true, false], url456: [true, false]}, rather: {urls: {url123: [true, false], url456: [true, false]}}
            // could destructure like: "let { urls } = await ..." if necessary

            // add a "urls" sub-object if it doesn't already exist (ie. no records saved yet), to avoid trying to access an undefined object later
            if (allUrls["urls"] == undefined){ allUrls["urls"] = {}; }
            allUrls["urls"][urlObj.hostname] = [disAutoScroll, enPreScroll];  // add the url record to the "urls" sub-object

            let setNewUrlCheck = "not_undefined";
            setNewUrlCheck = await chrome.storage.local.set(allUrls);         // set the sub-object into the chrome storage object
            // .set takes "An object containing one or more key/value pairs to be stored. If an item is in storage, its value is updated" ("urls" is the key)
            // again, this will pull {"urls": allURLsRetrieved} out of allObjects and store it as a key object pair in the chrome storage object

            console.log("setNewData result (undefined == success.): ", setNewUrlCheck); // "undefined" = success.
            if (setNewUrlCheck === undefined){ toastMessage('Url saved', true); }

        } catch (err) {
            console.log("err with adding record to local db (storage.local.set):", err)
        }
    }
    
    listURLs();
};

document.addEventListener('DOMContentLoaded', listURLs); // after page has loaded fill the URL list
document.getElementById('save').addEventListener('click', saveNewURL); // save url and give toast message


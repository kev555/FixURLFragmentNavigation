
// storage.local.get(keys) - weird behaviour difficult to understand:
// You can't try to grab the entire object ie. "chrome.storage.local.get("allObjects")" - it won't work
// Chrome takes the object and stores the key value pairs individually, not the object itself
// So if you want to store multiple seperate objects you would need to wrap them like: allObjects: {all_urls: all_urls_data, other_object: other_object_data}
// Then you can do: chrome.storage.local.get("all_urls") - to get back an object: {all_urls: all_urls_data}


// From the mozilla documents for browser.storage.local.get()'s arguments:
// keys: A key (string) or keys (an array of strings, or an object specifying default values) to identify the item(s) to be retrieved from storage. 
// "object specifying default values" -- I was trying to use an object that didn't spicify default values - bugs were v. confusing!

// If you pass an empty object or [empty?] array here, an empty object will be retrieved.

// If you pass null, or an undefined value, the entire storage contents will be retrieved.
// SO if you want the entire contents of the chrome storage object (ie. allObjects) use: chrome.storage.local.get(null), this will return: 
// {all_urls: all_urls_data, other_object: other_object_data}


// So my data structure when saving a new url will be:
// allObjects will be a js object of which the first key / value pair will be:
// key: "urls", value: a sub-object 
// this sub-object will contain all the url records as keys value pairs.
// each key of the sub-object will be the url as a string (without "http:" / "https:"). 
// each value of the sub-object will be the options as an array - [boolean, boolean]
// individual url records can then be retrived using the url as a string (without "http:" / "https:")
// so simply: allUrls = chrome.storage.local.get("urls") 
// then: allUrls["example.com"]

async function listURLs(){
    // browser.storage.local.get('keys')'s return value:
    // A Promise that resolves to a results object, containing every object in 'keys' that was found in the storage area. 
    // If 'keys' is an object, keys that are not found in the storage area will have their values given by the keys object.
    // If the operation failed, the promise is rejected with an error message.
    // If managed storage is not set, undefined will be returned.

    let allUrls = "not_undefined";


    console.log(" -> 'Managed storage is not set'.. I think you need to add 'storage' to manifest permissions");
    console.log(" -> 'Managed storage is not set'.. I think you need to add 'storage' to manifest permissions");

    try {
        allUrls = await chrome.storage.local.get("urls");   // resolves to results object if successful
        console.log("1111", allUrls); // will { urls } destructure allUrls["urls"] properly here?? - test

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
            for (let x in allURLsRetrieved) {text += "<tr><td>" + x + "</td> <td>" + allURLsRetrieved[x][0] + "</td> <td>" + allURLsRetrieved[x][1] + "</td> </tr>";}
            text += "</table>";
            document.getElementById("listOfSaved").innerHTML = text;
        }
    } 
    catch (err) {
        console.log("err with .get:", err);  // if the storage.local.get operation fails, catch the rejected promise
    };
};


async function saveNewURL() {

    function toastSuccess(){
        // toast success message and reset all fields
        let status = document.getElementById('statusToast');
        let urlString = document.getElementById('urlString');
        let disAutoScroll = document.getElementById('disAutoScroll');
        let enPreScroll = document.getElementById('enPreScroll');

        status.textContent = 'Url saved';
        disAutoScroll.checked = false;
        enPreScroll.checked = false;
        urlString.value = '';
        
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
        let setNewUrlCheck = "not_undefined";

        let urlObj = new URL(urlString); // causing some problems

        let allUrls = await chrome.storage.local.get("urls");
        // resolves to results object if successful, an empty object if no records
        // result won't be: {url123: [true, false], url456: [true, false]}, rather: {urls: {url123: [true, false], url456: [true, false]}}
        // could destructure like: "let { urls } = await ..." if necessary

        // add a "urls" sub-object if it doesn't already exist (ie. no records saved yet), to avoid trying to access an undefined object later
        if (allUrls["urls"] == undefined){ allUrls["urls"] = {}; }
        allUrls["urls"][urlObj.hostname] = [disAutoScroll, enPreScroll];  // add the url record to the "urls" sub-object
        
        setNewUrlCheck = await chrome.storage.local.set(allUrls);         // set the sub-object into the chrome storage object
        // .set takes "An object containing one or more key/value pairs to be stored. If an item is in storage, its value is updated" ("urls" is the key)
        // again, this will pull {"urls": allURLsRetrieved} out of allObjects and store it as a key object pair in the chrome storage object

        console.log("setNewData result (undefined == success.): ", setNewUrlCheck); // "undefined" = success.
        if (setNewUrlCheck === undefined){ toastSuccess(); }
    }
    catch (err) {
        console.log("err with .set:", err)
    }

    listURLs();
};

document.addEventListener('DOMContentLoaded', listURLs); // after page has loaded fill the URL list
document.getElementById('save').addEventListener('click', saveNewURL); // save url and give toast message


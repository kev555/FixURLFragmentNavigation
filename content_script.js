

// chrome.storage.local.get doesn't return a promise automatically. Promisify it:
function getData(){
    return new Promise((resolve, reject) => {
        chrome.storage.local.get( ["disScrollResOpt", "enPreScrollOpt"], function(items) {
            if (items){resolve(items)}
            else(reject)
        });
    })
};

async function startProg(){
    var items = await getData();

    var disScrollResOpt = false;
    var enPreScrollOpt = false;
    disScrollResOpt = items["disScrollResOpt"];
    enPreScrollOpt = items["enPreScrollOpt"];

    console.log('Settings retrieved', disScrollResOpt, enPreScrollOpt);


    console.log('testttt');

    if (disScrollResOpt){
        // disable scroll restoratioin
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
    }

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
};

startProg();


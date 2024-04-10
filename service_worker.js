
const filter ={
    url: [
        {
            urlMatches: 'https://youtube.com/',
            pathContains: 'shorts'
        }
    ]
};

chrome.webNavigation.onHistoryStateUpdated.addListener((e) => {console.log("sadgasfgasgf", e)});

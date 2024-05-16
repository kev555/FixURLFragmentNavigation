
# FixURLFragmentNavigation

Chomre extension to fix scrolling problems

URL Fragment Navigation uses '#' in an HTMLAnchorElement to scroll the user to a specific part of a webpage when they open a link wit a # in it.
https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/hash

I found some webpages which use this do not sroll to the correct place.
This has been frustrating as it affect the Node API docs.
It seems to be cause by the page not being loaded into the memory of the browser or browser tab until the user has scrolled over it.
It seems that some sections of the webpage only load when scrolled into the viewport.
One common cause could be "lazyloading of images", but there are no imgaes on this page. Checking networking montioring I see no additional fetch/xhr requests while manually scrolling. However the scoll bar is clearly getting smaller so more text is filling out one way or anoher.
This makes the scoll action when clicking a hash anchor fall too short or too long, because the size of the webpage is changing during the scroll action itself.

Or sometimes caused by chrome automatically restoring previous scroll position, ignoring the archor in the requested URl.

Some of the cases can be solved simply by truning off "Scroll Restoration":
https://developer.chrome.com/blog/history-api-scroll-restoration

However when it is caused by the page not being fully loaded into memory it's a more involved solution.
This solution I've found is to quickly pre scroll the entire page forcing all elements quickly load (<500ms).
This combined with disabling Chromes Scroll Restoration seems to fix everything.

Additional webpages I found that have scolling issues:
Problem caused by Scroll Restoration: https://naninovel.com/guide/naninovel-scripts#visual-editor
-



TO DO / ISSUES:



// After testing onCreated it doesn't fire for re-navigating already loaded pages and page refreshs (I think - test and clarify refresh)
// ouUpdated does fire for both these cases. However, the way I'm currently using it is possibly not very efficent:

// Possible issues:
// Every time the page finishes updating (eg. scrolling to a new section (automatically or manually)) the injectFunc runs.
// This includes a db call and checking all properties for the webpages URL, even if checked previously for the same webpage. 
// This will possibly mean multiplpe runs for pages that use lazy loading or maybe autoplay sites like soundcloud or youtube shorts.

// Additionally it's unnecessarily re-scrolling the whole page just for re-navigation with the same page
// if a page is already fully scrolled and loaded, no need to scroll again

// Also the tab is currently processing the scrolling in the background (when opened in the background) and then re scrolling again when user switches to it (becomes active tab)

// Ideally it could check if a new tab is in the list of user sites once at the start using onCreated then use ouUpdated for everything afterwards.
// But there is a lot of unknown situations that might cause problems, espically with how I am removing and re adding of the onUpdated listener while the scrolling is happening

// Also possible would be to use onActivated to avoid processing the tab in the background and only process it when activated.
// But how would thins work for re-scrolling and for refreshes?
// Seem I wold have to be doing multiple checks within listeners and blocking some of all of other based on situations.
// For now the logic works although not perfectly efficent. But to make it perfectly efficent feels like it will be very complex
// How efficent does it need to be? It's just scrolling a page... 

// webNavigation.onHistoryStateUpdated might be another solution .. need a fair bit of fiddling to test most efficent solution....



// TO DO;

// add support for www. sub domain as not supported yet becasue the js URL interface rips it out - should be easy fix
// remove need for user to enter http or https while adding a record in the options page (js URL interface parsing requires http to parse, but no need for the user to need to enter this..)
// video of before and after scrolling and navigating around the Node docs to show the drastic improvvment...
// use destructuring the .get and use an object literal for .set, inteased of wrapping them with outer objects


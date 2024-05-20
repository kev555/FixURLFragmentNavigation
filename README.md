
# FixURLFragmentNavigation
# Chomre extension to fix anchor navigation / scrolling problems.

## Problem Description and Diagnosis

### Fragment naviation Problem:

URL Fragment Navigation uses '#' in an HTMLAnchorElement to scroll the user to a specific part of a webpage when they open a link with a # in it.
https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/hash

I've encountered some webpages that use this feature which do not scroll to the correct place.
The naviagtion jumps multiple paragraphs / sections before or after the position of the intended anchor.
Most notably the official NodeJS docs have this issue on Chrome.

To replicat go to a section such as: https://nodejs.org/api/http.html. 
And then click one of the navigation links such as Class: http.ClientRequest or Class: http.Server.
It will jump usually to multiple sections before the target.
I've personally found this very frustrating while using using and learning the api.

The issue seems to be caused by the page not being loaded into the memory of the browser / tab until the user has scrolled over it.
I assume some sections of the page load into memory only when scrolled into the viewport.
One common cause may be "lazyloading of images", but the issue happens on pages with no images also.
Checking networking montioring I see no additional fetch/xhr requests while scrolling.
The scroll bar does get smaller while scrolling so it's clear more content is being added to the view while scrolling.

This solution I've found is to implement a "Pre Scrolling" feature which quickly scrolls the entire page when it is first opened, 
This forces all elements to load into the viewport, which then ensures that clicking an archor brings the users to the correct place.
This feature takes less than 500ms. COuld be shortened.


### Scroll Restoration: problem:

An additional webpage I found that has scolling issues is: 
https://naninovel.com/guide/naninovel-scripts#visual-editor

Upon testing this problem was actually caused by Chrome's "Scroll Restoration" feature.
https://developer.chrome.com/blog/history-api-scroll-restoration

This can be solved simply by turning off "Scroll Restoration".

## Extension features
- Allow user to turn off "Scroll Restoration" for specific sites.
- Allow user to turn on "Pre Scrolling" feature for specific sites.
- Create an editable list of URLs and their scroll options in the Options page.



## TO DO / ISSUES:

 - ~~Updated fires for many cases, currently usage could probably be more efficent. Every time the page finishes updating (eg. scrolling to a new section (automatically or manually)) the injectFunc runs. This includes a db call and checking all properties for the webpages URL, even if checked previously for the same webpage. This will possibly mean multiplpe runs for pages that use lazy loading or maybe autoplay sites like soundcloud or youtube shorts. Additionally it's unnecessarily re-scrolling the whole page just for re-navigation with the same page. Also the tab is currently processing the scrolling in the background (when opened in the background) and then re scrolling again when user switches to it (becomes active tab)~~

-> much improved by using webNavigation.onCompleted with "outermost_frame", also doesn't re-scroll when the tab becomes active - perfect.

- Add features to the Options page: delete a url, edit a url, delete all records. It overwrites by default, so clicking edit should simply fill the html form with the details, not a lot of extra logic needed for edit
- ~~Add support for www sub domain as not supported yet becasue the js URL interface rips it out - easy fix~~
- ~~Remove need for user to enter http or https while adding a record in the options page (js URL interface parsing requires http to parse, but no need for the user to need to enter this..) - easy fix~~ -> new logic: strip the www before saving (if enterd), prevents duplicates and no need to double check the db. Simply strip "www" from the url string grabbed from new tab before checking (if it's in the url). If a user saves "wwwgoogle.com", it will be saved and displayed as "google.com", this is ok. -> Added "(www)" to each url record in html table, to notify the user that both with or without "www" is acceptable
- Video of before and after scrolling and navigating around the Node docs to show the drastic improvevment...
- More testing including testing for problems of the interaction when both options are enabled.
- ~~Remove unnessary permisisons form manifest, tabs, active tab~~
- Add ability to specify URL paths to be scrolled, instead of entire URL
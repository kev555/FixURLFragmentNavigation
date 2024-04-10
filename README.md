
# FixURLFragmentNavigation

Super simple Chomre extension to fix scrolling problems on the Nodejs docs/api pages

When browsing the docs there are 2 problems with links using URL Fragment Navigation ('#' in an HTMLAnchorElement)
https://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement/hash

1. when clicking a hash anchor from a doc page you are currently on it sometimes does not scroll to the correct position
2. when opening a new tab via a link with a hash anchor it does not scroll to the correct position

Number 2 can be solved by truning off "Scroll Restoration":
https://developer.chrome.com/blog/history-api-scroll-restoration

Number 1 is more cumbersome:
It seems that some sections of the webpage only load when scrolled into the viewport
This makes the scoll action when clicking a hash anchor fall too short or too long, because the size of the webpage is changing during the scroll action itself.

One common cause could be "lazyloading of images", but there are no imgaes on this page. Checking networking montioring I see no additional fetch/xhr requests while manually scrolling. However the scoll bar is clearly getting smaller so more text is filling out one way or anoher.

This solution I've found is to quickly pre scroll the entire page forcing all elements quickly load (<500ms).
This combined with disabling Scroll Restoration seems to fix everything.




////////
Additional webpages I found that have scolling issues:

Problem caused by Scroll Restoration: https://naninovel.com/guide/naninovel-scripts#visual-editor




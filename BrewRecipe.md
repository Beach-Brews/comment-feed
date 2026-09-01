# Brew Recipe for Comment Feed

## Bugs

* Readme Updates
  * Mention visible to all users
  * Mention 60 second cache
  * Mention Old Reddit r/SUBREDDIT/comments (not just /comments)
  * Mention desktop Ctrl/Cmd+Click
* Images, links and other formatting does not render properly
  * Need to add a markdown parser
* Expand view does not go to current page / comment. Closing does not stay in same (when available, not possible on iOS)
* Automoderator appearing in comment list still?

## Features
* Mod actions / Reports - Allow moderators to see comment reports and action on comments (approve/remove) directly from the comment feed.
* Performance Improvements - Processing the comment list can be a bit slow. I want to speed this up
  * Separate API for title and user snoo? (idea is to fetch local if userId/postId not in map) Skeleton screen data?
  * Batch multiple comment APIs at once?
  * Hashsets to store mapped data (update every 5 min or so via scheduler, or custom cache?)
    * userset, userId, snoovatar + karma + notes + etc.
    * postset, postId, title + score + locked + archived + etc.
      * onPostUpdwte/delete/modaction - update set
    * hourly rebuild could work too?? mostly to clear unused data / deleted accounts?
* User Flair
* Mod easy access to Mod Notes and User Age/Karma.* Realtime Updates - I would love to have comments "appear" in the feed the second they are posted.
* Font-Size Controls

## Ready for Testing
* Update notification for mods
* Scroll to top when next page loads
* Expanded Nav missing on iOS chrome
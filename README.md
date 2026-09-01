# Subreddit Comment Feed

Displays a feed of the most recent comments on your subreddit for all users. Selecting a comment 
links you to the comment. Expanded view (bottom left button) shows up to 25 comments at a time. 
Moderators can see reports, with Mod Actions (approve/remove) coming soon.

*Tip:* You can Ctrl/Cmd + Click on the *permalink* to open the comment in a new tab!

![Subreddit Comment Feed Inline](https://i.redd.it/m19roj146ylh1.png)
![Subreddit Comment Feed Expanded](https://i.redd.it/ixybc6exlzlh1.png)

## Creating the Comment Feed Post

After installing the app, you can create a new Comment Feed post using the "three-dot" menu 
on the main subreddit page, and choosing "Create Comment Feed". A new post will be created which
will show the most recent comment first.

![Create Comment Feed](https://i.redd.it/uti4j3vamzlh1.png)

Please reach out on [r/CommentFeedApp](https://www.reddit.com/r/CommentFeedApp/) if you have any issues or want to request new features!

## How Does it Work?

On install, "new" posts are scanned and comments added until the comment list is 
populated with 1000 comments. From there, every new comment submitted will be 
"tracked" by the app. Removed, spam, and deleted comments do not display. Comment data is cached for
60 seconds.

## Working Recipe (Feature Roadmap)
* Mod Actions - Remove comments directly from the comment list.
* Markdown/Image Support - Ensure formatted text and images appear as expected.
* User Flair - Display user flair
* Mod Notes - Easy access to mod notes
* Realtime Updates - Enable realtime stream mode, where comments appear the second they are added.

## Settings

* **Comment Count** - The max number of comments the app tracks at once. Min: 5, Max: 5000, Default: 1000
* **User Ignore List** - A comma separated list of usernames to ignore / filter from the comment feed. Automod comments are automatically filtered. NOTE: Comments for ignored users already tracked by the app will not be removed. As more comments are added by users, the ignored users will eventually "roll off" the tracked list.
* **Log Level** -  Controls the level of log messages. Warn (default) should be used for performance reasons. The app developer may have you change the log level if receiving support.

## Source Code

The source code for Comment Feed is [open source](https://github.com/Beach-Brews/comment-feed).
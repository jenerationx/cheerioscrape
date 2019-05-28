# Mongo News Scraper with Cheerio

## Overview

In this assignment, I created a web app that lets users view and leave comments on the latest Runner news. But I did not actually write any articles; instead, I used Mongoose and Cheerio to scrape news from runnersworld.com 

## How it works:
- Scrape new articles from Runner's World by clicking the "Scrape Articles" button
- Save an article by clicking on that article's "Save Article" button
- Go to the article's link by clicking on the article's title
- Go to all of your saved articles by clicking the "Saved Articles" link in the Navbar
- Write or delete notes on the article by going to the Saved Articles page and clicking the "Article Notes" button
- Delete articles from the Saved Articles page by clicking the "Delete from Saved" button
- Return to the homepage by clicking the "Home" link in the Navbar

## Live App
[Click here to go to the live app!](https://cheerioscrape1127.herokuapp.com/)
![Screenshot of Mongo Runners](https://github.com/jenerationx/cheerioscrape/blob/master/public/images/screenshot.png)

## Technologies Utilized
- nodeJS
- express
- express-handlebars
- mongoose
- cheerio
- axios
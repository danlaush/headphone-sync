import checkbox, { Separator } from "./inquirer-checkbox-ordered.mjs";
import jsdom from "jsdom";
import sanitize from "sanitize-filename";
import fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import path from "path";
import { modifyFileSpeed } from "./ffmpeg.mjs";
import "dotenv/config";
const { JSDOM } = jsdom;
const { STORE } = process.env;
// const STORE = "/Volumes/XTRAINERZ/";

const podcasts = [
  {
    xmlUrl: "https://feeds.megaphone.fm/recodedecode",
    text: "Decoder with Nilay Patel",
  },
  {
    xmlUrl: "https://feeds.simplecast.com/N5eKDxJI",
    text: "You Are Not So Smart",
  },
  {
    xmlUrl: "https://podcast.darknetdiaries.com",
    text: "Darknet Diaries",
  },
  {
    xmlUrl: "http://risky.biz/feeds/risky-business/",
    text: "Risky Business",
  },
  {
    xmlUrl: "https://feeds.feedburner.com/dancarlin/history?format=xml",
    text: "Dan Carlin&#39;s Hardcore History",
  },
  {
    xmlUrl: "https://podcasts.files.bbci.co.uk/p02tb8vq.rss",
    text: "World Business Report",
  },
  {
    xmlUrl: "https://feeds.megaphone.fm/vergecast",
    text: "The Vergecast",
  },
  {
    xmlUrl: "https://feeds.megaphone.fm/pivot",
    text: "Pivot",
  },
  {
    xmlUrl:
      "https://www.patreon.com/rss/triforcepodcast?auth=oRmyg9f6HhtgRN1diqyq9ADaUiY9iJtk",
    text: "Triforce! Early! Access!",
  },
  {
    xmlUrl: "https://feeds.megaphone.fm/STU4418364045",
    text: "Waveform: The MKBHD Podcast",
  },
  {
    xmlUrl: "https://publicfeeds.net/f/6661/wired-podcast",
    text: "The WIRED Podcast",
  },
  {
    xmlUrl: "https://feeds.npr.org/510289/podcast.xml",
    text: "Planet Money",
  },
  {
    xmlUrl: "https://feeds.simplecast.com/Y8lFbOT4",
    text: "Freakonomics Radio",
  },
  {
    xmlUrl: "https://shoptalkshow.com/feed/podcast",
    text: "ShopTalk",
  },
];

const podcastsShort = [
  {
    xmlUrl: "https://feeds.megaphone.fm/recodedecode",
    text: "Decoder with Nilay Patel",
  },
];

(async function append() {
  console.log("loading podcasts");
  // const choices = podcasts.map(p=>({name: p.text, value: p.xmlUrl}))

  // const answer = await checkbox({
  //     message: 'Select podcasts',
  //     choices,
  // });

  // console.log('answer')
  // console.log({answer})

  /**
   * recentPodcasts = [{
   *   name: 'The Vergecast'
   *   episodes: [
   *     { title: 'Episode one', downloadUrl: 'https://...' },
   *   ]
   * }]
   */
  const recentPodcasts = await Promise.all(
    podcasts.map(async (p) => {
      return loadPodcastFeedDom(p.xmlUrl).then((dom) => {
        return {
          name: p.text,
          episodes: getTitlesFromXml(dom),
        };
      });
    })
  );

  const choices = recentPodcasts.flatMap((p) => {
    return [
      new Separator(p.name),
      ...p.episodes.map((e) => ({
        name: e.title,
        value: {
          fileName: sanitize(`${p.name} - ${e.title}.mp3`),
          downloadUrl: e.downloadUrl,
        },
      })),
    ];
  });

  const downloadList = await checkbox({
    message: "Which podcasts would you like to download?",
    choices,
    pageSize: 70,
  });

  downloadList.sort(sortByPosition)

  await Promise.all(
    downloadList.map(async ({ value: {fileName, downloadUrl}, position }) => {
        const orderedFileName = `${position} - ${fileName}`
      await downloadFile(orderedFileName, downloadUrl);
      await modifyFileSpeed(orderedFileName, 1.5);
    })
  );

  fs.readdir(STORE, {}, (err, files) => {
    console.log("files found:");
    console.log(files);
  });
})();

function sortByPosition(a, b) {
    return a.position > b.position
}

const downloadFile = async (fileName, downloadUrl) => {
  console.log("Fetching", fileName);
  const res = await fetch(downloadUrl);
  console.log("Fetched", fileName);
  const destination = path.resolve(STORE, fileName);
  const fileStream = fs.createWriteStream(destination, { flags: "wx" });
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
  console.log("Saved", fileName);
};

function getTitlesFromXml(dom) {
  const items = dom.window.document.querySelectorAll("item");
  const titles = Array.from(items)
    .map((p) => {
      return {
        title: p.querySelector("title").textContent,
        // pubDate: p.querySelector('pubDate').textContent,
        // description: p.querySelector('description').textContent,
        downloadUrl: p.querySelector("enclosure").getAttribute("url"),
      };
    })
    .slice(0, 3);
  return titles;
}

async function loadPodcastFeedDom(url) {
  return fetch(url)
    .then((response) => response.text())
    .then((str) => new JSDOM(str, { contentType: "application/xml" }));
}

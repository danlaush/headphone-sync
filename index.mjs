import checkbox, { Separator } from '@inquirer/checkbox';
import jsdom from 'jsdom'
const { JSDOM } = jsdom;

const podcasts = [{
    xmlUrl:"https://feeds.megaphone.fm/recodedecode",
    text:"Decoder with Nilay Patel"
},
{
    xmlUrl:"https://feeds.simplecast.com/N5eKDxJI",
    text:"You Are Not So Smart"
},
{
    xmlUrl:"https://podcast.darknetdiaries.com",
    text:"Darknet Diaries"
},
{
    xmlUrl:"http://risky.biz/feeds/risky-business/",
    text:"Risky Business"
},
{
    xmlUrl:"https://feeds.feedburner.com/dancarlin/history?format=xml",
    text:"Dan Carlin&#39;s Hardcore History"
},
{
    xmlUrl:"https://podcasts.files.bbci.co.uk/p02tb8vq.rss",
    text:"World Business Report"
},
{
    xmlUrl:"https://feeds.megaphone.fm/vergecast",
    text:"The Vergecast"
},
{
    xmlUrl:"https://feeds.megaphone.fm/pivot",
    text:"Pivot"
},
{
    xmlUrl:"https://www.patreon.com/rss/triforcepodcast?auth=oRmyg9f6HhtgRN1diqyq9ADaUiY9iJtk",
    text:"Triforce! Early! Access!"
},
{
    xmlUrl:"https://feeds.megaphone.fm/STU4418364045",
    text:"Waveform: The MKBHD Podcast"
},
{
    xmlUrl:"https://publicfeeds.net/f/6661/wired-podcast",
    text:"The WIRED Podcast"
},
{
    xmlUrl:"https://feeds.npr.org/510289/podcast.xml",
    text:"Planet Money"
},
{
    xmlUrl:"https://feeds.simplecast.com/Y8lFbOT4",
    text:"Freakonomics Radio"
},
{
    xmlUrl:"https://shoptalkshow.com/feed/podcast",
    text:"ShopTalk"
}];

const podcastsShort = [{
    xmlUrl:"https://feeds.megaphone.fm/recodedecode",
    text:"Decoder with Nilay Patel"
},];

(async function main() {
    console.log('loading podcasts')
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
    const recentPodcasts = await Promise.all(podcasts.map(async p => {
        return loadPodcastFeedDom(p.xmlUrl).then(dom => {
            return {
                name: p.text,
                episodes: getTitlesFromXml(dom)
            }
        })

    }))

    const choices = recentPodcasts.flatMap(p => {
        return [
            new Separator(p.name),
            ...p.episodes.map(e => ({name: e.title, value: e.downloadUrl}))
        ]
    })


    // const RSS_URL = 'https://feeds.megaphone.fm/recodedecode'
    // const recentPodcasts = await loadPodcastFeedDom(RSS_URL)
    //     .then(dom => getTitlesFromXml(dom));
    // console.log({choices})

    const downloadList = await checkbox({
        message: 'Which podcasts would you like to download? \nMore text\n',
        choices,
        pageSize: 70
    })
    console.log({downloadList})
})();

function getTitlesFromXml(dom) {
    const items = dom.window.document.querySelectorAll("item");
    // console.log(items.entries())
    const titles = Array.from(items).map(p => {
        return {
            title: p.querySelector('title').textContent,
            // pubDate: p.querySelector('pubDate').textContent,
            // description: p.querySelector('description').textContent,
            downloadUrl: p.querySelector('enclosure').getAttribute('url')
        }
    }).slice(0, 3)
    return titles
}

async function loadPodcastFeedDom(url) {
    return fetch(url)
        .then(response => response.text())
        .then(str => new JSDOM(str, {contentType: 'application/xml'}))
}
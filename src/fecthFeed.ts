import { XMLParser } from "fast-xml-parser";

export async function fetchFeed(feedURL: string):Promise <RSSFeed> {
    try {
        const response = await fetch(feedURL, {
            headers: {
                "User-Agent": "gator"
            }
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const XMLdata: string = await response.text();

        const xmlParser = new XMLParser();
        const jsObj = xmlParser.parse(XMLdata);

        const RSSchannel = jsObj.rss?.channel;
        if (RSSchannel === undefined) {
            throw new Error("<channel> field not found.");
        }

        const {title, link, description} = RSSchannel;
        if (!(title && link && description)) {
            throw new Error("One or more metadata fields not found.");
        }

        if (Array.isArray(RSSchannel.item) === false) {
            RSSchannel.item = [];
        }
        const items_bucket: RSSItem[] = [];
        for (const item of RSSchannel.item) {
            if(item.title.trim() && item.link.trim() && item.description.trim() && item.pubDate.trim()) {
                items_bucket.push({
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    pubDate: item.pubDate
                });
            }
        }

        return {
            channel: {
                title: title,
                link: link,
                description: description,
                item: items_bucket
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error:  ${error.message}`);
        } else {
            throw new Error("Generic error during XML fetch.")
        }
    }
}

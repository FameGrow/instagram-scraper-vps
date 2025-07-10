const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrapeUser(username) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();
  const cookies = JSON.parse(fs.readFileSync("cookies.json", "utf8"));
  await page.setCookie(...cookies);

  try {
    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "networkidle2"
    });

    const data = await page.evaluate(() => {
      const script = Array.from(document.querySelectorAll("script")).find(s =>
        s.textContent.includes("__NEXT_DATA__")
      );

      if (!script) return null;

      const json = JSON.parse(script.textContent);
      const edges = json.props.pageProps.graphql?.user?.edge_owner_to_timeline_media?.edges || [];

      return edges.map(({ node }) => ({
        id: node.id,
        shortcode: node.shortcode,
        url: `https://www.instagram.com/p/${node.shortcode}/`,
        thumbnail: node.thumbnail_src,
        caption: node.edge_media_to_caption.edges?.[0]?.node?.text || ""
      }));
    });

    await browser.close();
    return data || [];
  } catch (error) {
    console.error("Scraping error:", error);
    await browser.close();
    return [];
  }
}

module.exports = scrapeUser;
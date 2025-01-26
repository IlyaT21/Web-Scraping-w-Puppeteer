import puppeteer from "puppeteer";

// Launch the browser and open a new blank page
const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: false,
});
const page = await browser.newPage();

// Navigate the london Craigslist page
await page.goto("https://london.craigslist.org/");

// Select all job listings in London
await page.locator('a[data-alltitle="all jobs"]').click();

// Wait for all elements to load
await page.waitForSelector(".cl-search-result .cl-app-anchor");
//Take all elements
const elements = await page.$$(".cl-search-result .cl-app-anchor");

for (let i = 0; i < elements.length; i++) {
  // Get the current element (use `locator.nth(i)` for better handling with Puppeteer v20+)
  const element = elements[i];

  // Wait for navigation when clicking
  await Promise.all([
    element.click(),
    page.waitForNavigation({ waitUntil: "domcontentloaded" }),
  ]);

  // Extract inner text of `.postingtitletext`
  await page.waitForSelector(".postingtitletext");
  const postingTitle = await page.$eval(".postingtitletext", (el) =>
    el.textContent.trim()
  );

  console.log(`Posting Title ${i + 1}:`, postingTitle);

  // Navigate back to the previous page
  await page.goBack({ waitUntil: "networkidle2" });

  // Wait for elements to reappear before proceeding to the next iteration
  await page.waitForSelector(".cl-search-result .cl-app-anchor");
}

console.log("Inner texts:", elements);

// await browser.close();

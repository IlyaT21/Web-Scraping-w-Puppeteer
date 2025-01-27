import puppeteer from "puppeteer";

// Launch the browser and open a new blank page
const browser = await puppeteer.launch({
  headless: false,
  defaultViewport: false,
});
const page = await browser.newPage();

// Navigate the list of all Roman Emperors
await page.goto("https://en.wikipedia.org/wiki/List_of_Roman_emperors");

// Wait for all <a> elements inside <th> with specific style to load
await page.waitForSelector(
  'th[style="text-align:center; background:#F8F9FA"] a'
);

// Take all matching <a> elements
const elements = await page.$$(
  'th[style="text-align:center; background:#F8F9FA"] a'
);

// Filter and log only <a> elements with innerText of 2 characters or less
for (let i = 0; i < elements.length; i++) {
  const innerText = await elements[i].evaluate((el) => el.innerText.trim());

  if (innerText.length > 4) {
    console.log(`Element ${i + 1}: Text = "${innerText}"`);
  }
}

// for (let i = 0; i < elements.length; i++) {
//   // Get the current element (use `locator.nth(i)` for better handling with Puppeteer v20+)
//   const element = elements[i];

//   // Wait for navigation when clicking
//   await Promise.all([
//     element.click(),
//     page.waitForNavigation({ waitUntil: "domcontentloaded" }),
//   ]);

//   // Extract inner text of `.mw-page-title-main`
//   await page.waitForSelector(".mw-page-title-main");
//   const postingTitle = await page.$eval(".mw-page-title-main", (el) =>
//     el.textContent.trim()
//   );

//   console.log(`Posting Title ${i + 1}:`, postingTitle);

//   // Navigate back to the previous page
//   await page.goBack({ waitUntil: "networkidle2" });

//   // Wait for elements to reappear before proceeding to the next iteration
//   await page.waitForSelector("td .mw-file-description");
// }

// await browser.close();

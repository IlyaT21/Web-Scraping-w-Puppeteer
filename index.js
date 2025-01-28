import puppeteer from "puppeteer";
import { writeFile } from "fs/promises";

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
  'th[style="text-align:center; background:#F8F9FA"] a[title]'
);

// Take all matching <a> elements
const elements = await page.$$(
  'th[style="text-align:center; background:#F8F9FA"] a[title]'
);

// List of all the emperors after filtering the elements array
let emperors = [];

// Initiate variable for file writing
const data = [];

// Filter and log only <a> elements with innerText of 4 characters or less
for (let i = 0; i < elements.length; i++) {
  const innerText = await elements[i].evaluate((el) => el.innerText.trim());

  if (innerText.length > 4) {
    emperors.push(elements[i]);
  }
}

for (let i = 0; i < 3; i++) {
  // Click on the element
  await emperors[i].click();

  // Wait for the .infobox-above element to load on the new page
  await page.waitForSelector(".infobox-above");

  // Extract the innerText of the .infobox-above element
  const infoboxText = await page.$eval(".infobox-above", (el) =>
    el.innerText.trim()
  );

  // Log the extracted text
  console.log(`Emperor ${i + 1}: .infobox-above Text = "${infoboxText}"`);
  data.push(infoboxText);

  // Go back to the previous page to process the next emperor
  await page.goBack();

  emperors = await page.$$(
    'th[style="text-align:center; background:#F8F9FA"] a[title]'
  );
}

// Write the data to a file
try {
  await writeFile("output.txt", data.join("\n"));
  console.log("Data written to output.txt successfully!");
} catch (err) {
  console.error("Error writing to file:", err);
}

// await browser.close();

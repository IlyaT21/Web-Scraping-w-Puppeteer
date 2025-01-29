import puppeteer from "puppeteer";
import fs from "fs";
import PDFDocument from "pdfkit";

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

// Create a single PDF document
const pdfDoc = new PDFDocument();
const pdfFileName = "all_roman_emperors.pdf";

// Write the PDF to a file
pdfDoc.pipe(fs.createWriteStream(pdfFileName));

// Add a title to the PDF
pdfDoc
  .fontSize(16)
  .text("Roman Emperors", { underline: true, align: "center" })
  .moveDown();

// Filter and log only <a> elements with innerText of 4 characters or less
for (let i = 0; i < elements.length; i++) {
  const innerText = await elements[i].evaluate((el) => el.innerText.trim());

  if (innerText.length > 4) {
    emperors.push(elements[i]);
  }
}

// Loop through the Emperors
for (let i = 0; i < 3; i++) {
  // Click on the element
  await emperors[i].click();

  // Wait for the table to load
  await page.waitForSelector("table.infobox.vcard");

  // Take all rows
  const rows = await page.$$("table.infobox.vcard tr");

  // Iterate through each row and extract data from <th> and <td>
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    // Initialize variables for the row data
    let thText = "";
    let tdText = "";

    // Check for <th> and extract its text
    const thExists = await row.$("th");
    if (thExists) {
      thText = await row.$eval("th", (th) => th.innerText.trim());
    }

    // Check for <td> and extract its text
    const tdExists = await row.$("td");
    if (tdExists) {
      tdText = await row.$eval("td", (td) => td.innerText.trim());
    }

    // Log the results
    console.log(`Row ${i + 1}:`);
    console.log(`  TH: ${thText}`);
    console.log(`  TD: ${tdText}`);

    // Add the row's data to the PDF
    pdfDoc
      .fontSize(10)
      .text(`${thText}`, { underline: true })
      .moveDown(0.5)
      .text(`${tdText}`)
      .moveDown(1);
  }

  // Go back to the previous page to process the next emperor
  await page.goBack();

  // Refresh the emperors list since the page was reloaded
  emperors = await page.$$(
    'th[style="text-align:center; background:#F8F9FA"] a[title]'
  );
}

// Finalize the PDF
pdfDoc.end();
console.log(`PDF created successfully: ${pdfFileName}`);

// await browser.close();

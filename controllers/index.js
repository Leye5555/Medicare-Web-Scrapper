import puppeteer from "puppeteer";
import fs from "fs";

// puppeteer function
const puppeteerFxn = async (obj) => {
  try {
    const writeStream = fs.createWriteStream("appeal.csv");
    const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
    const page = await browser.newPage();
    await page.goto(process.env.baseUrl);
    await page.type("#edit-appeal-number", obj["appeal-number"]);
    await page.type("#edit-contract-number", obj["contract-number"]);
    // await page.$eval("#edit-date-type", obj["date-type"]);
    await page.type("#edit-start-date", obj["start-date"]);
    await page.type("#edit-end-date", obj["end-date"]);

    // wait for click and navigation
    await Promise.all([page.click("#edit-submit"), page.waitForNavigation()]);

    // get table headers
    const tableHeaders = await page.$$eval("#data-table tr > th", (el) =>
      el.map((e) => e.textContent).join(",")
    );
    // write table headers
    writeStream.write(tableHeaders + "\n");

    if (obj.dtIndex !== "") {
      // get table records
      const selector = "#data-table tbody tr td";

      const tableRecords = await page.$$eval(selector, (el) =>
        el.map((e) => e.textContent)
      );
      let sample = "";
      for (let i = 0; i < tableRecords.length; i++) {
        if ((i + 1) % 12 === 0) {
          sample = sample + tableRecords[i] + "\n";
        } else {
          sample = sample + tableRecords[i] + ",";
        }
      }

      writeStream.write(sample.slice(0, sample.length));

     

      if (obj.dtIndex > 1) {
        // ensure that the selected number of data sets is not more than the number available on the page
        let indexNum = await page.$$eval("a[data-dt-idx]", (el) =>
          el.map((e) => e.textContent)
        );
        indexNum.shift();
        indexNum.pop();
        let isSmaller = true; // data index is smaller than the largest page index

        if (Number(indexNum[indexNum.length - 1]) < obj.dtIndex) {
          isSmaller = false; // it is no longer true that data index is smaller than the largest page index
        }

        let j = 1;
        while (
          j <
          (isSmaller
            ? Number(obj.dtIndex)
            : Number(indexNum.sort((a, b) => b - a)[0]))
        ) {
          // limit the loop to the size of the dataIdx or the largest page index
          // wait for click and navigation

          await page.click(`a[data-dt-idx]:nth-of-type(${j + 1})`);
          // get table records
          const moreTableRecords = await page.$$eval(selector, (el) =>
            el.map((e) => e.textContent)
          );
          let moreSample = "";
          for (let i = 0; i < moreTableRecords.length; i++) {
            if ((i + 1) % 12 === 0) {
              moreSample = moreSample + moreTableRecords[i] + "\n";
            } else {
              moreSample = moreSample + moreTableRecords[i] + ",";
            }
          }
          writeStream.write(moreSample.slice(0, moreSample.length));
          j++;
        }
      }
    } else {
      if (obj.dtSingle > 1) {
        // ensure that the selected number of data sets is not more than the number available on the page
        let indexNum = await page.$$eval("a[data-dt-idx]", (el) =>
          el.map((e) => e.textContent)
        );
        indexNum.shift();
        indexNum.pop();
        let isSmaller = true; // data index is smaller than the largest page index

        if (Number(indexNum[indexNum.length - 1]) < obj.dtSingle) {
          isSmaller = false; // it is no longer true that data index is smaller than the largest page index
        }
        // get table records
        let num = isSmaller ? obj.dtSingle : Number(indexNum[indexNum.length - 1]);
        await page.click(`a[data-dt-idx]:nth-of-type(${num})`);

        const selector = "#data-table tbody tr td";

        const tableRecords = await page.$$eval(selector, (el) =>
          el.map((e) => e.textContent)
        );
        let sample = "";
        for (let i = 0; i < tableRecords.length; i++) {
          if ((i + 1) % 12 === 0) {
            sample = sample + tableRecords[i] + "\n";
          } else {
            sample = sample + tableRecords[i] + ",";
          }
        }

        writeStream.write(sample.slice(0, sample.length));
      } else {
        const selector = "#data-table tbody tr td";
        const firstTableRecords = await page.$$eval(selector, (el) =>
          el.map((e) => e.textContent)
        );
        let firstSample = "";
        for (let i = 0; i < firstTableRecords.length; i++) {
          if ((i + 1) % 12 === 0) {
            firstSample = firstSample + firstTableRecords[i] + "\n";
          } else {
            firstSample = firstSample + firstTableRecords[i] + ",";
          }
        }

        writeStream.write(firstSample.slice(0, firstSample.length));
      }
    }

    //close browser
    await browser.close();
    return "done";
  } catch (err) {
    console.log(err);
  }
};

export default puppeteerFxn;

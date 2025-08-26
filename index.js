const fs = require('fs');
const xlsx = require('xlsx');
const puppeteer = require("puppeteer");
console.log("google maps parser!")

console.log("Чтение файла")
const data = fs.readFileSync('./test.csv', 'utf-8');

const row = data.split("\n").map(row => row.split(';').map(cell => cell.trim()));
const header = row[0];
const InputArr = row.slice(1).map(row => {

  let obj = {};
  header.forEach((header, index) => {
    obj[header] = row[index];
  })

  return obj

});
console.log(InputArr)
console.log("Конец чтения файла")

console.log("Запуск браузера")
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222', // Адрес запущенного браузера
    headless: false,
});

  const page = await browser.newPage();
 

  const screenSize = await page.evaluate(() => {
    return { width: window.screen.availWidth, height: window.screen.availHeight };
  });
// Размер окна
  await page.setViewport({
    width: screenSize.width,
    height: screenSize.height,
  });
console.log("Пытаемся виткрыть")

const MiddleEnd = [];
  for(const item of InputArr){
    await page.goto(`https://www.google.com/maps/search/${item.keyword}/${item.coordinate}`);
     await page.waitForSelector('a[class="hfpxzc"]') 

    
    //------------------samoscrutka--------------
console.log("Прокрутка")

async function scrollUntilNoMoreResults(page, scrollContainerSelector) {
  await page.evaluate(async (selector) => {
    const scrollable = document.querySelector(selector);
    if (!scrollable) return;

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    let noMoreResults = false;

    while (!noMoreResults) {
      scrollable.scrollTop += 500;
      await sleep(500);

      // Проверяем, появился ли текст "Больше результатов нет."
      if (document.querySelector('span.HlvSq')) {
        noMoreResults = true;
      }
    }
  }, scrollContainerSelector);
}

// пример использования:
await scrollUntilNoMoreResults(page, 'div[role="feed"]');

//--------------Конец самокрутки
console.log("начало сбора информации")

const selector = 'div[class="NrDZNb"]'; 
const selCount = await page.evaluate((selector) => {
  return document.querySelectorAll(selector).length;
}, selector);

const siteSelector = 'a[class="lcr4fd S9kvJb "]';
const sitesCount = await page.evaluate((siteSelector) => {
  return document.querySelectorAll(siteSelector).length;
}, siteSelector);
console.log(`Количество элементов с селектором "${selector}": ${selCount}`);
console.log(`Количество сайтов"${siteSelector}": ${sitesCount}`);
console.log(selCount)
console.log(sitesCount)

for (let i = 0; i < selCount; i++) {
  


  const data = await page.evaluate((i, item) => {
    // выбираем карточку по индексу
    const card = document.querySelectorAll('div.lI9IFe')[i];
    if (!card) return { name: 'N/D', site: 'N/D', firstSpan: 'N/D' };

    // название компании
    const name = card.querySelector('div.qBF1Pd.fontHeadlineSmall')?.innerText || 'N/D';
    const site = card.querySelector('a.lcr4fd.S9kvJb')?.href || 'N/D';


   


    const review = card.querySelector('span.UY7F9')?.innerText || 'N/D';
    const mark = card.querySelector('span.MW4etd')?.innerText || 'N/D';
    const phone = card.querySelector('span.UsdlK')?.innerText || 'N/D';
    const adress = card.querySelectorAll('div[class="W4Efsd"] div[class="W4Efsd"] span')[2]?.innerText || 'N/D';
    const type = card.querySelector('div[class="W4Efsd"] div[class="W4Efsd"] span')?.innerText || 'N/D';
    const region = item.name;


    return { name, site, review, mark, phone,adress, type, region };

   
  }, i, item);

  console.log(`Собрано для профиля ${i + 1}:`, data);
MiddleEnd.push(data)

}

console.log(MiddleEnd)

  }





const worksheet = xlsx.utils.json_to_sheet(MiddleEnd);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Indonesian Companies");
xlsx.writeFile(workbook, "Indonesian companies.xlsx");


await browser.disconnect();
})();



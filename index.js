const fs = require('fs');
const path = require('path')
const xlsx = require('xlsx');
const puppeteer = require("puppeteer");
const { resolve } = require('path');
console.log("google maps parser!")

//-------функция крутки
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
//-----функция крутки
//---------------Фунцкиця поиска текст
async function waitForText(page, selector, text, timeout = 5000) {
  await page.waitForFunction(
    (selector, text) => {
      const el = document.querySelector(selector);
      return el && el.innerText.trim().includes(text);
    },
    { timeout },
    selector,
    text
  );
}
//-------------функция поиска текста
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

console.log("Запись бэкапа");
fs.writeFile(path.resolve(__dirname, "backup.csv"), 'name;site;backupSite;review;mark;phone;adress;type;region;cardName;cardSite;' + "\n", (err) => {
  if(err){
    throw err;
  }
  console.log("файл бэкапа создан")
} )


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
const errBook = [];
let schet = 1;
let numberOfSites = 0;
let companiesCount = 0;
  for(const item of InputArr){
    await page.goto(`https://www.google.com/maps/search/${item.keyword}/${item.coordinate}`);
  const found = await Promise.any([
  page.waitForSelector('a.hfpxzc', { timeout: 5000 }),
  page.waitForSelector('h1.DUwDvf', { timeout: 5000 })
]);
 

    if( !await page.$('a[class="hfpxzc"]')) {
    console.log('скипаемся')
    console.log(`просмотренно ${schet} координат `);
    schet = schet + 1;
    }
    // начало крутки:
    if (await page.$('a[class="hfpxzc"]')){
      console.log("всё ок, крутим")
        console.log("Прокрутка")
  try {
    await scrollUntilNoMoreResults(page, 'div[role="feed"]');
  }
  catch (err){
    console.log(`ошибка при прокрутке блока ${item.coordinate}`)
   const errCoor = item.coordinate;
   errBook.push({ coordinate: errCoor });
  }

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
numberOfSites = numberOfSites + sitesCount;


for (let i = 0; i < selCount; i++) {
 console.log("Новый сбор гоев")

  // try {await page.waitForSelector('span.a5H0ec');}
  // catch(err){
  //   console.log("недождались селектора")
  // }

  const data = await page.evaluate((i, item) => {
    // выбираем карточку по индексу
    const card = document.querySelectorAll('div.lI9IFe')[i];
    if (!card) return { name: 'N/D', site: 'N/D', firstSpan: 'N/D' };
       // const open = document.querySelectorAll('a.hfpxzc')[i].click();

    // название компании
    
    
    const name = card.querySelector('div.qBF1Pd.fontHeadlineSmall')?.innerText || 'N/D';
    const site = card.querySelector('a.lcr4fd.S9kvJb')?.href || 'N/D';
    const backupSite = card.querySelector('a.lcr4fd.S9kvJb')?.href || 'N/D';
    const review = card.querySelector('span.UY7F9')?.innerText || 'N/D';
    const mark = card.querySelector('span.MW4etd')?.innerText || 'N/D';
    const phone = card.querySelector('span.UsdlK')?.innerText || 'N/D';
    const adress = card.querySelectorAll('div[class="W4Efsd"] div[class="W4Efsd"] span')[2]?.innerText || 'N/D';
    const type = card.querySelector('div[class="W4Efsd"] div[class="W4Efsd"] span')?.innerText || 'N/D';
    const buttonSite = card.querySelector('a[data-value="Сайт"]')?.href || 'N/D';
    const pichture = card.querySelector('div[class="SpFAAb"] img')?.src || 'N/D';
    const region = item.name;
    const cardName = "N/D";
    const cardSite = "N/D";
    const shortSite = "N/D";

    return { name, site, backupSite, review, mark, phone,adress, type, region, cardName, cardSite, shortSite, buttonSite,pichture};
    //return {cardName, cardSite, shortsite, region}
   
  }, i, item);

  const checkName = data.name;
  const picture = data.pichture;
    const cards = await page.$$('a.hfpxzc');
if (picture != "N/D"){
  
let tryID = 0;
let errID = 0;
  while( tryID < 8){
    try{
      await cards[i].click();
      console.log(`Прокликиваем ${errID}-й раз`);
      await waitForText(page, 'h1.DUwDvf.lfPIob', `${checkName}`, 1000);
      tryID = 8;
    }
    catch(err) {
      errID = errID + 1;
      tryID = errID;
      console.log(`ошибка на попытке ${errID}`)
      if(errID == 8){
        console.log("а не пойти ли вам нбибу?")
        console.log(`ошибка при прокрутке блока ${item.coordinate}`)
        const errCoor = item.coordinate;
        const errText = "не смог прожать вот этов вот всё";
        const errCompany = checkName;
        errBook.push({ coordinate: errCoor,
                        text: errText,
                        company: errCompany
          });
      }
    }
  }

}
console.log('Нашли шпигуна');
console.log(`
⠄⠄⠄⠄⠄⠄⠄⣠⣴⣶⣿⣿⡿⠶⠄⠄⠄⠄⠐⠒⠒⠲⠶⢄⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⣠⣾⡿⠟⠋⠁⠄⢀⣀⡀⠤⣦⢰⣤⣶⢶⣤⣤⣈⣆⠄⠄⠄⠄
⠄⠄⠄⠄⢰⠟⠁⠄⢀⣤⣶⣿⡿⠿⣿⣿⣊⡘⠲⣶⣷⣶⠶⠶⠶⠦⠤⡀⠄
⠄⠔⠊⠁⠁⠄⠄⢾⡿⣟⡯⣖⠯⠽⠿⠛⠛⠭⠽⠊⣲⣬⠽⠟⠛⠛⠭⢵⣂
⡎⠄⠄⠄⠄⠄⠄⠄⢙⡷⠋⣴⡆⠄⠐⠂⢸⣿⣿⡶⢱⣶⡇⠄⠐⠂⢹⣷⣶
⡇⠄⠄⠄⠄⣀⣀⡀⠄⣿⡓⠮⣅⣀⣀⣐⣈⣭⠤⢖⣮⣭⣥⣀⣤⣤⣭⡵⠂
⣤⡀⢠⣾⣿⣿⣿⣿⣷⢻⣿⣿⣶⣶⡶⢖⣢⣴⣿⣿⣟⣛⠿⠿⠟⣛⠉⠄⠄
⣿⡗⣼⣿⣿⣿⣿⡿⢋⡘⠿⣿⣿⣷⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀⠄
⣿⠱⢿⣿⣿⠿⢛⠰⣞⡛⠷⣬⣙⡛⠻⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⠿⠛⣓⡀
⢡⣾⣷⢠⣶⣿⣿⣷⣌⡛⠷⣦⣍⣛⠻⠿⢿⣶⣶⣶⣦⣤⣴⣶⡶⠾⠿⠟⠁
⣿⡟⣡⣿⣿⣿⣿⣿⣿⣿⣷⣦⣭⣙⡛⠓⠒⠶⠶⠶⠶⠶⠶⠶⠶⠿⠟⠄⠄  ТЫ ГОЙ
  `)


  const cardData = await page.evaluate(() => {
        const cardName = document.querySelector('h1.DUwDvf')?.innerText || 'N/D';
        const cardSite = document.querySelector('a.CsEnBe')?.href || 'N/D суйта';
        const cardAdress = document.querySelector('button[data-item-id="address"] div[class^="Io6YTe"]')?.innerText || 'N/D';
        const shortsite = document.querySelector('div[class="rogA2c ITvuef"] div')?.innerText || 'N/D';
        
       // document.querySelector('button.VfPpkd-icon-LgbsSe').click();
    return {cardName, cardSite, cardAdress, shortsite,}
   }, )

//console.log(cardData);
let checkSite = cardData.cardSite;
if (checkSite != 'N/D суйта'){
  data.site = cardData.cardSite;
}
data.cardName = cardData.cardName;
data.cardSite = cardData.cardSite;
data.shortSite = cardData.shortsite;
companiesCount = companiesCount + 1;
console.log(`Насчитали аккаунтов: ${companiesCount}`)
  
//console.log(`Собрано для профиля ${i + 1}:`, data);
MiddleEnd.push(data)
fs.appendFile(path.resolve(__dirname, "backup.csv"), `${data.name};${data.site};${data.backupSite};${data.review};${data.mark};${data.phone};${data.adress};${data.type};${data.region};${data.cardName};${data.cardSite}` + "\n", (err) => {
    if(err){
    throw err;
  }
  console.log("промежуточная запись бекапа");
  
})

}

console.log(`найденно компаний:${MiddleEnd.length}`)
console.log(`найдено сайтов:${numberOfSites }`)
console.log(`просмотренно ${schet} координат `);
schet = schet + 1;


} }

console.log(MiddleEnd)

console.log(`найденно компаний:${MiddleEnd.length}`)
console.log(`найдено сайтов:${numberOfSites }`)
console.log(`просмотренно ${schet} координат `);



const worksheet = xlsx.utils.json_to_sheet(MiddleEnd);
const worksheet2 = xlsx.utils.json_to_sheet(errBook);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "Indonesian Companies");
xlsx.utils.book_append_sheet(workbook, worksheet2, "Errors");
xlsx.writeFile(workbook, "Indonesian companies.xlsx");

console.log(`
  
  ⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠄⣠⣶⣾⣿⣿⣿⣿⣿⣿⣷⣶⣄⡀⠄⠄⠄⠄⠄
⣿⣿⣿⣿⣿⣿⣿⣿⠃⢀⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⠄⠄⠄⠄
⣿⣿⣿⣿⣿⣿⣿⠏⣠⡾⠛⠛⠛⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⠄⠄
⣿⣿⣿⣿⣿⣿⠏⣼⣿⣶⣿⣿⣦⣤⣀⣠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⡀
⣿⣿⣿⣿⣿⡏⣼⣿⡿⠿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠉⠛⠻⣿⣿⣿⣿⣿⡷
⣿⣿⣿⣿⡏⣾⣿⣿⣿⣷⣶⣤⣤⣽⣿⣿⣿⣿⣿⣿⣿⣇⠄⠄⠈⢿⣿⣿⣿⡇
⣿⣿⣿⢣⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣟⣻⣿⣿⣿⣷⣦⡀⠛⣿⣿⠃
⣿⣿⢋⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣍⠻⢿⣿⣿⣷⠄⣸⣿⠄
⣿⣿⣼⣿⣿⣿⣿⣿⣿⣿⣇⣤⣿⡟⠻⣿⣿⣿⣿⣿⣿⣷⣤⣽⣿⣿⣿⣿⣿⠄
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢶⡿⢹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠄
⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⣿⣿⣿⣿⣷⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡏⠄⠄
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣬⣍⠛⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠁⠄⠄
⡏⡿⣿⣿⣿⣿⣿⣿⣏⣁⡹⠿⣿⣤⣙⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠁⠄⠄⠄⠘
⡇⠻⠿⣿⣿⣿⣿⣿⣿⣿⣿⣧⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⡇⠄⠄⠄⠄⢀
⣿⠄⠄⠉⠉⠻⣿⣿⣿⣿⡝⠻⣿⢛⡛⠻⣿⣿⣿⣿⣿⣿⡿⣆⠑⢎⠄⢀⡃⣼


Пора баиньки
  `)



await browser.disconnect();
})();



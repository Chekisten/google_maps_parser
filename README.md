# google_maps_parser

масштаб карты 1км

const data = document.querySelectorAll('div.lI9IFe');

  return Array.from(data).map(card => {
    
    const name = data.querySelector('div.qBF1Pd.fontHeadlineSmall')?.innerText || 'N/D';
    const site = data.querySelector('a.lcr4fd.S9kvJb')?.href || 'N/D';
    const review = data.querySelector('span.UY7F9')?.innerText || 'N/D';
    const mark = data.querySelector('span.MW4etd')?.innerText || 'N/D';
    const phone = data.querySelector('span.UsdlK')?.innerText || 'N/D';
    const adress = data.querySelectorAll('div[class="W4Efsd"] div[class="W4Efsd"] span')[2]?.innerText || 'N/D';
    const type = data.querySelector('div[class="W4Efsd"] div[class="W4Efsd"] span')?.innerText || 'N/D';
 
    return {  name, site, review, mark, phone, adress, type };
  });
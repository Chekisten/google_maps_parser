const fs = require('fs');
const xlsx = require('xlsx');


console.log(`
⣿⣿⣿⣿⣿⣿⣿⠛⢩⣴⣶⣶⣶⣌⠙⠫⠛⢋⣭⣤⣤⣤
⣿⣿⣿⣿⣿⡟⢡⣾⣿⠿⣛⣛⣛⣛⣛⡳⠆⢻⣿⣿⣿⠿⠿⠷⡌
⣿⣿⣿⣿⠏⣰⣿⣿⣴⣿⣿⣿⡿⠟⠛⠛⠒⠄⢶⣶⣶⣾⡿⠶⠒⠲⠌
⣿⣿⠏⣡⢨⣝⡻⠿⣿⢛⣩⡵⠞⡫⠭⠭⣭⠭⠤⠈⠭⠒⣒⠩⠭⠭⣍⠒⠈
⡿⢁⣾⣿⣸⣿⣿⣷⣬⡉⠁⠄⠁⠄⠄⠄⠄⠄⠄⠄⣶⠄⠄⠄⠄⠄⠄⠄⠄⢀
⢡⣾⣿⣿⣿⣿⣿⣿⣿⣧⡀⠄⠄⠄⠄⠄⠄⠄⢀⣠⣿⣦⣤⣀⣀⣀⣀⠄
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣶⣶⡶⢇⣰⣿⣿⣟⠿⠿⠿⠿⠟
⣿⣿⣿⣿⣿⣿⣿⡟⢛⡛⠿⠿⣿⣧⣶⣶⣿⣿⣿⣿⣿⣷⣼⣿⣿⣿⣧
⠘⢿⣿⣿⣿⣿⣿⡇⢿⡿⠿⠦⣤⣈⣙⡛⠿⠿⠿⣿⣿⣿⣿⠿⠿⠟⠛⡀
⠄⠄⠉⠻⢿⣿⣿⣷⣬⣙⠳⠶⢶⣤⣍⣙⡛⠓⠒⠶⠶⠶⠶⠖⢒⣛⣛⠁
⠄⠄⠄⠄⠄⠈⠛⠛⠿⠿⣿⣷⣤⣤⣈⣉⣛⣛⣛⡛⠛⠛⠿⠿⠿⠟⢋
⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠄⠈⠉⠉⣻⣿⣿⣿⣿⡿⠿⠛⠃⠄⠙`)

//----------------------------------------------------------------------------
console.log("Чтение 1-го файла")
const data = fs.readFileSync('./first.csv', 'utf-8');

const row = data.split("\n").map(row => row.split(';').map(cell => cell.trim()));
const header = row[0];
const arr1 = row.slice(1).map(row => {

  let obj = {};
  header.forEach((header, index) => {
    obj[header] = row[index];
  })

  return obj

});
//console.log(InputArr)
console.log("Конец чтения 1-го файла")
//---------------------------------------------------------------------

console.log("Чтение 2-го файла")
const data2 = fs.readFileSync('./second.csv', 'utf-8');

const row2 = data2.split("\n").map(row2 => row2.split(';').map(cell => cell.trim()));
const header2 = row2[0];
const arr2 = row2.slice(1).map(row2 => {

  let obj2 = {};
  header2.forEach((header2, index) => {
    obj2[header2] = row2[index];
  })

  return obj2

});
console.log("Конец чтения 2-го файла")



//console.log(arr2)

// Типа мерджить будем


const seen = new Set(arr1.map(o => `${o.name}|${o.adress}`));

arr2.forEach(obj => {
  const key = `${obj.name}|${obj.adress}`;
  if (!seen.has(key)) {
    arr1.push(obj);
    seen.add(key);
  }
});

console.log(arr1);

const worksheet = xlsx.utils.json_to_sheet(arr1);
const workbook = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(workbook, worksheet, "google maps Companies");
xlsx.writeFile(workbook, "Merged_comp.xlsx");
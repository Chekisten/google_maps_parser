const fs = require('fs');
const xslx = require('xlsx')
console.log("google maps parser!")


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
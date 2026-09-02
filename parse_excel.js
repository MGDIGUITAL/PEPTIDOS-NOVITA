const xlsx = require('xlsx');
const fs = require('fs');

const workbook = xlsx.readFile('C:\\Users\\pc\\Downloads\\logistica_blue_express_tarifas (1).xlsx');
const result = {};

for (const sheetName of workbook.SheetNames) {
  result[sheetName] = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
}

fs.writeFileSync('d:\\joyeria\\blue_express_tarifas.json', JSON.stringify(result, null, 2));
console.log(`Parsed ${Object.keys(result).length} sheets`);

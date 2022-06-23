const fs = require('fs');
const fileData = JSON.parse(fs.readFileSync('./lemmas.json'));

const compactData = fileData.map(item => [
  item.id,
  item.reference,
  item.position,
  item.translation,
  item.spaceAfter,
  item.words,
  item.lemma,
  item.morph,
]);

fs.writeFileSync('./compact.json', JSON.stringify(compactData));
import fs from 'fs';

const bible = fs.readFileSync(__dirname + '/kjv.xml', 'utf8');

export { bible }

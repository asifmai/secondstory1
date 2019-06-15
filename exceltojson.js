const exceltojson = require('xlsx-to-json-lc');

module.exports = (inputFile, outputFile) => {
  return new Promise(async (resolve, reject) => {
    try {
      exceltojson({
        input: inputFile,
        output: outputFile,
        sheet: 'Sheet1',
      }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
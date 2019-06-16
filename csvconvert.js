const fs = require('fs');

module.exports = (data) => new Promise((resolve, reject) => {
  try {
    // const data = JSON.parse(fs.readFileSync('results.json'));
    fs.writeFileSync('results.csv', 'url,email1,link1,email2,link2,email3,link3,email4,link4,email5,link5\n');
    
    for (let i = 0; i < data.length; i++) {
      let writeString = `${data[i].url},`;
      for (let a = 0; a < data[i].emails.length; a++) {
        writeString += `${data[i].emails[a]},`;
        writeString += `${data[i].links[a]},`;
      }
      writeString += '\n';
      fs.appendFileSync('results.csv', writeString);
    }
    resolve(true);
  } catch (error) {
    reject(error);
  }
});

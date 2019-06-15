const puppeteer = require('puppeteer');
const loginCredentials = {
  user: 'cameron@secondstoryrealty.com',
  pass: 'seRl-Uc-ma-Ho-his',
};
const xlstojson = require('./exceltojson');
const fs = require('fs');

(async () => {
  try {
    console.log('Started Scraping at: ', new Date());
    const data = await xlstojson('data.xlsx', 'data.json');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--window-size=1366,768', '--no-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1366,
      height: 768
    });
    const response = await page.goto(data[0].url, {
      // timeout: 0,
      waitUntil: 'networkidle2'
    });
    await page.waitForSelector('input#si-email');
    await page.type('input#si-email', loginCredentials.user);
    
    await page.waitForSelector('input#si-password');
    await page.type('input#si-password', loginCredentials.pass);

    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle2', 
        timeout: 0
      }),
      page.click('button.log-in'),
    ]);
    for (let i = 0; i < data.length; i++) {   
      console.log(i, 'Now of link #: ', i);
      const response = await page.goto(data[i].url, {
        timeout: 0,
        waitUntil: 'networkidle2'
      });
      
      if (response.status() === 403) {
        console.log('Your ip Blocked by Website...');
      } else {
        let nodes = await page.$$('.row.saved-search.collapse');
        let to = nodes.length;
        if (to > 5) to = 5;
        data[i].emails = [];
        data[i].links = [];
        console.log(i, 'Nodes to scan: ', to);
        for (let a = 0; a < to; a++) {
          if (a !== 0) {
            const response = await page.goto(data[i].url, {
              timeout: 0,
              waitUntil: 'networkidle2'
            });
            nodes = await page.$$('.row.saved-search.collapse');
          }
          const email = await nodes[a].$eval('select.change-frequency option[selected="selected"]', elm => elm.innerText.trim());
          let link = '';
          const detailPage = 'https://www.secondstoryrealty.com' + await nodes[a].$eval('a.savedSearchName', elm => elm.getAttribute('href'));
          await page.goto(detailPage, {waitUntil:'networkidle2', timeout: 0});
          const foundHref = await page.$('.tabs dd:nth-of-type(2) a');
          if (foundHref) {
            link = await page.$eval('.tabs dd:nth-of-type(2) a', elm => elm.getAttribute('href'));
            link = 'https://www.secondstoryrealty.com' + link
          }
          data[i].emails.push(email);
          data[i].links.push(link);
        }
        fs.writeFileSync('results.json', JSON.stringify(data));
        fs.writeFileSync('currentstatus.txt', `Done with URL # ${i}`, 'utf-8');
      }
    }
    await page.close();
    await browser.close();
    console.log('Finished Scraping at: ', new Date());
    return 'Completed...';
  } catch (error) {
    return error;
  }
})();
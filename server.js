const fs = require('fs');
const Path = require('path');
const path = Path.resolve(__dirname, `sitemap.xml`);
const logError = Path.resolve(__dirname, 'errorLog.txt');
const CronJob = require('cron').CronJob;

/* ---- servic that run app after time defined ---- */
new CronJob('0 */5 * * * *', function () {
    runCrowler = () => {
        console.log('crowler run on api to genereate sitemap.xml');

        // destination.txt will be created or overwritten by default.
        fs.copyFileSync('sitemap.xml', `sitemap-backup-${new Date().toLocaleString()}.xml`);
        console.log('sitemap.xml was copied to backup');

        setTimeout(() => {
            const getContent = function (url) {
                // return new pending promise
                return new Promise((resolve, reject) => {
                    // select http or https module, depending on reqested url
                    const lib = url.startsWith('https') ? require('https') : require('http');
                    const request = lib.get(url, (response) => {
                        // handle http errors
                        if (response.statusCode < 200 || response.statusCode > 299) {
                            if (response.code == 'ENOTFOUND' && response.statusCode > 399) {
                                let errorLog = new Error(`
                                Failed to load page, status code: ${response.statusCode} 
                                Date Time Error: ${new Date().toLocaleString()}
                                ${url}
                                `)
                                fs.appendFileSync(logError, errorLog, 'utf-8', (err) => {
                                    if (err) throw err;
                                })
                            }
                        }
                        // temporary data holder
                        const body = [];
                        // on every content chunk, push it to the data array
                        response.on('data', (chunk) => body.push(chunk));
                        // we are done, resolve promise with those joined chunks
                        response.on('end', () => resolve(body.join('')));
                    });
                    // handle connection errors of the request
                    request.on('error', (err) => reject(err))
                })
            };

            const getAllCategories = function (url) {
                // return new pending promise
                return new Promise((resolve, reject) => {
                    // select http or https module, depending on reqested url
                    const lib = url.startsWith('https') ? require('https') : require('http');
                    const request = lib.get(url, (response) => {
                        // handler len of pages 
                        // handle http errors
                        if (response.statusCode < 200 || response.statusCode > 299) {
                            reject()
                        }
                        // temporary data holder
                        const body = [];
                        // on every content chunk, push it to the data array
                        response.on('data', (chunk) => body.push(chunk));
                        // we are done, resolve promise with those joined chunks
                        response.on('end', () => resolve(body.join('')));
                    });
                    // handle connection errors of the request
                    request.on('error', (err) => reject(err))
                })
            };

            getContent('https://www.fastshop.com.br/wcs/resources/v1/products/topCategory')
                .then((html) => {
                    if (fs.existsSync('sitemap.xml')) {
                        fs.unlink('sitemap.xml', function (err) {
                            if (err) throw err;
                            // if no error, file has been deleted successfully
                            console.log('File deleted!');
                        });
                    }
                    let body = ''
                    body += html
                    body = JSON.parse(body)
                    arrayCategories = []
                    var qtdP = 50 * 2
                    var status = 0

                    var header = `
                                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
                                                    `
                    var footer = `
                                </urlset>`

                    fs.appendFileSync(path, header, 'utf-8', (err) => {
                        if (err) throw err;
                    })
                    for (let i = 0; i < body.departaments.length; i++) {
                        arrayCategories.push(body.departaments[i].uniqueID)
                    }

                    const listCategories = arrayCategories

                    for (let i = 0; i < qtdP; i++) {

                        for (let indice = 0; indice < listCategories.length; indice++) {
                            getContent(`https://www.fastshop.com.br/wcs/resources/v1/products/byCategory/${listCategories[indice]}?pageNumber=${i}`)
                                .then((html) => {
                                    let body = ''
                                    body += html
                                    body = JSON.parse(body)
                                    status = 0

                                    if (body.products) {

                                        for (let i = 0; i < body.products.length; i++) {

                                            let priority = '0.8'
                                            let url = `https://www.fastshop.com.br/web/p/d/14788_PRD/${pipeShortDescription(body.products[i].shortDescription)}`
                                            let changeFreq = 'daily'
                                            let urlImage = `https://www.fastshop.com.br${body.products[i].thumbnail}`
                                            let titleImage = body.products[i].shortDescription

                                            if (priority, url, changeFreq, urlImage, titleImage == 'undefined') {
                                                url = 'https://www.fastshop.com.br/web/p/d/14788_PRD/'
                                                let priority = '0.8'
                                                let url = 'https://www.fastshop.com.br'
                                                let changeFreq = 'daily'
                                                let urlImage = `https://www.fastshop.com.br`
                                                let titleImage = ''
                                            }

                                            objXMl = {
                                                unit: `   <url>
                                                            <loc>
                                                            ${url}
                                                            </loc>
                                                            <priority>${priority}</priority>
                                                            <changefreq>${changeFreq}</changefreq>
                                                            <image:image>
                                                                <image:loc>
                                                                ${urlImage}
                                                                </image:loc>
                                                                <image:title>
                                                                ${titleImage}
                                                                </image:title>
                                                            </image:image>
                                                       </url>
                                                    `
                                            }

                                            var arrayXML = []
                                            arrayXML.push(objXMl.unit)
                                            arrayXML.reduce((x, y) => x.includes(y) ? x : [...x, y], []) // remove item duplicate

                                            fs.appendFileSync(path, arrayXML, 'utf-8', (err) => {
                                                if (err) throw err;
                                            })

                                        }

                                        const used = process.memoryUsage().heapUsed / 1024 / 1024;
                                        console.log(`Stream script uses approximately ${used.toFixed(0)} MB`)

                                    } else {
                                        return
                                    }
                                })
                                .catch((err) => console.error(err));
                        }

                    }

                    setTimeout(() => {

                        fs.appendFileSync(path, footer, 'utf-8', (err) => {
                            if (err) throw err;
                        })

                        console.log(`script finalizado`)

                    }, 30000 * 3);

                })
                .catch((err) => console.error(err));

            /* --- utils methods --- */
            // pipe to shortDescription
            pipeShortDescription = (str) => {
                return str.toString().toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[àáâãäå]/g, 'a')
                    .replace(/[éê]/g, 'e')
                    .replace(/[îé]/g, 'i')
                    .replace(/[ôóõ]/g, 'o')
                    .replace(/[ûú]/g, 'u')
                    .replace(/[ç]/g, 'c')
                    .replace(/[^\w\-]+/g, '')
                    .replace(/\-\-+/g, '-')
                    .replace(/^-+/, '')
                    .replace(/-+$/, '')
            }
        }, 3000);

    }
    runCrowler()
}, null, true, 'America/Sao_Paulo');



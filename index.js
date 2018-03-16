/* --- No third party module required: https is part of the Node.js API because is native --- */
const https = require("https");
const fs = require('fs')
const Path = require('path')
const path = Path.resolve(__dirname, 'sitemap.xml')

// method to get all categories Promise
getAllCategories = () => {
    return new Promise((resolve, reject) => {
        const urlCategory = "https://www.fastshop.com.br/wcs/resources/v1/products/topCategory";
        https.get(urlCategory, res => {
            res.setEncoding("UTF-8");
            let body = "";
            res.on("data", data => {
                body += data
            });
            res.on("end", () => {
                return resolve(body)
            })
        })
    })
}

//invoke here the return of promise and cascate methods
getAllCategories()
    .then((body) => {
        body = JSON.parse(body)
        body = body.departaments
        arrayOfCategories = []
        for (let i = 0; i < body.length; i++) {
            arrayOfCategories.push(body[i].uniqueID)
            setTimeout(() => {
                callHandShake(arrayOfCategories);
            }, 2000)
        }
    })

// method to get all products based on list
getAllProducts = (idCategory) => {

    for (let i = 0; i < 3; i++) {
        let more = ''
        const urlCategory = `https://www.fastshop.com.br/wcs/resources/v1/products/byCategory/${idCategory}?pageNumber=${more++}`
        https.get(urlCategory, res => {
            res.setEncoding("UTF-8");
            let body = "";
            res.on("data", data => {
                body += data;
            });
            res.on("end", () => {

                body = JSON.parse(body)
                var arrayXML = []

                for (let i = 0; i < body.products.length; i++) {

                    let priority = '0.8'
                    let url = `https://www.fastshop.com.br/web/p/d/14788_PRD/${pipeShortDescription(body.products[i].shortDescription)}`
                    let changeFreq = 'daily'
                    let urlImage = `https://www.fastshop.com.br${body.products[i].thumbnail}`
                    let titleImage = body.products[i].shortDescription

                    objXMl = {
                        unit: `
                            <url>
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

                    arrayXML.push(objXMl.unit)
                    fs.appendFileSync(path, arrayXML, 'utf-8', (err) => {
                        if (err) throw err;
                    })

                    const used = process.memoryUsage().heapUsed / 1024 / 1024;
                    console.log(`Stream The script uses approximately ${used.toFixed(0)} MB`)

                }
            })
        })
        
    }

    

}

// handshake between two func
function callHandShake(arrayOfCategories) {
    arrayOfCategories = ["22002", "22008"]
    for (let i = 0; i < arrayOfCategories.length; i++) {
        getAllProducts(arrayOfCategories[i])
    }
}


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
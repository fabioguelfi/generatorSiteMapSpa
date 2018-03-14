/* --- No third party module required: https is part of the Node.js API because is native --- */
const https = require("https");

// method to get all categories
getAllCategories = () => {
    const urlCategory = "https://www.fastshop.com.br/wcs/resources/v1/products/topCategory";
    https.get(urlCategory, res => {
        res.setEncoding("UTF-8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            console.log(body) // need return this obj for this method
            // for (let i = 0; i < body.departaments.length; i++) {
            //     let uniqueId = body.departaments[i].uniqueID
            //     console.log(uniqueId)
            // }
        });
    });
}

let idCategory = '22004' // mock but need return array of idUniq from category

getAllProducts = (idCategory) => {
    const urlCategory = `https://www.fastshop.com.br/wcs/resources/v1/products/byCategory/${idCategory}?pageNumber=0`;
    https.get(urlCategory, res => {
        res.setEncoding("UTF-8");
        let body = "";
        res.on("data", data => {
            body += data;
        });
        res.on("end", () => {
            body = JSON.parse(body);
            for (let i = 0; i < body.products.length; i++) {
                for (let i = 0; i < body.products.length; i++) {
                    let priority = '0.8';
                    let url = `https://www.fastshop.com.br/web/p/d/14788_PRD/${pipeShortDescription(body.products[i].shortDescription)}`
                    let changeFreq = 'daily'
                    let urlImage = `https://www.fastshop.com.br${body.products[i].thumbnail}`
                    let titleImage = body.products[i].shortDescription

                    // exemple sitemap
                    // need generate obj with all categories and products to write in filesystem
                    console.log(
                        `
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
                    )
                }
            }
        });
    });
}

// get id and put in method tha will find for id and generate list
generateXmlInRam = () => {
    
}

// methos that create stream and write file.xml


/* --- call methods --- */

// method that return all categories
getAllCategories()

// method that return all producs
//getAllProducts(idCategory)

// generete all sitemap in ram
//generateXmlInRam()

// method that create a stream and write new file.xml 
//generateSiteMapXml() 


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
        .replace(/-+$/, '');
}
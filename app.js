const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const lodash = require('lodash')
const open = require('open');
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const longjohn = require('longjohn');
 
app.use(cors())

const PORT = 8000


const MongoURL = 'mongodb://localhost:27017'
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(MongoURL);
}

const categoriasURL = 'https://www.mercadolibre.com.ar/categorias#nav-header'
async function checkCategories() {
    try {
        let response = await axios(categoriasURL);
        let html = response.data
        let $ = cheerio.load(html)
        $('.categories__container', html).each( async function () {
            let categoryName =  lodash.kebabCase(lodash.deburr($(this).find('.categories__title a').text()))
            for (const category of $(this).children().find('.categories__item')) {
                let subcategory = lodash.kebabCase(lodash.deburr($(this).find('a').text()))
                let url =  $(category).find('a').attr('href')
                checkSubcategories (url, categoryName).then().catch(
                    console.log("checkSubcategories():  " + url)
                )
            }
        })
    } catch (error) {
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>> ERROR @ CATEGORY <<<<<<<<<<<<<<<<<<<<<<<<<")
        console.log("categoriasURL:  " + url)
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        console.log()
    }
}



async function checkSubcategories (url, categoryName){
    if (typeof url === 'string'){
        try {
            let response = await axios(url);
            let html = response.data
            $ = cheerio.load(html)
            if ($('.ui-search-filter-dl .ui-search-filter-dt-title:contains("Categorías")').length) {
                for (const subcategory of $('.ui-search-filter-dl .ui-search-filter-dt-title:contains("Categorías")').parent().children().find('.ui-search-filter-container')){
                    let subcategoryName = lodash.kebabCase(lodash.deburr($(subcategory).find('.ui-search-filter-name').text()))
                    let subcategoryURL = $(subcategory).find('a').attr('href')
                    checkSubcategories (subcategoryURL, subcategoryName).then().catch(process.stdout.write(""))
                }
            } else if($('.ui-search-result__wrapper .ui-search-styled-label:contains("MÁS VENDIDO")').length) {
                let productURL = $('.ui-search-result__wrapper .ui-search-styled-label:contains("MÁS VENDIDO")').closest('.ui-search-result__wrapper').find('a').attr('href')
                try {
                    let response = await axios(productURL);
                    let html = response.data
                    $ = cheerio.load(html)
                    
                    console.log()
                    if(!$('.ui-pdp-promotions-pill-label__target').attr('href')){
                        console.log(">><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<>><<")
                        console.log(">><<>><<>><<>><<>><<>><<>><<>><<>><<>>checkSubcategories  URL NOT FOUND <<>><<>><<>><<>><<>><<>><<")
                        await open('https://sindresorhus.com', {app: {name: 'firefox'}});
                    }else{
                        console.log("============================ MAS VENDIDO ============================")
                        console.log($('.ui-pdp-promotions-pill-label__target').attr('href'))
                        console.log("=====================================================================")
                    }
                    
                    console.log()

                } catch (error) {
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>> ERROR @ MAS VISTO <<<<<<<<<<<<<<<<<<<<<<<<<")
                    console.log(Object.getOwnPropertyNames(error.response.statusText));
                    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
                    console.log()
                }
        
            }else{
                console.log("XXXXXXXXXXXXXXXXXXXXXXXXX ERROR @ CHEERIO XXXXXXXXXXXXXXXXXXXXXXXXXX")
                console.log("            NO SE ENCONTRARON NI CATEGORIAS NI MAS VENDIDO          ")
                console.log(url)
                console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
                console.log()
            }
        } catch (error) {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>> ERROR @ SUBCATEGORY <<<<<<<<<<<<<<<<<<<<<<<<")
            //console.log(Object.getOwnPropertyNames(error));
            console.log(error.message)
            console.log(url)
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
        }
        
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}


checkCategories()






app.get('/', function (req, res) {
    res.json('Bienvenido a MasVendidosAPI - MercadoLibre Tracker')
})



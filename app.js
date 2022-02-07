const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')
const lodash = require('lodash')
const app = express()
const cors = require('cors')
app.use(cors())
const mongoose = require('mongoose')
const PORT = 8000

const url = 'mongodb://localhost/'

const categoriasURL = 'https://www.mercadolibre.com.ar/categorias#nav-header'


async function checkCategories() {
    try {
        let response = await axios(categoriasURL);
        let html = response.data
        let $ = cheerio.load(html)
        let categories = {}
        let subcategories = {}


        $('.categories__container', html).each( async function () {
            let categoryName =  lodash.kebabCase(lodash.deburr($(this).find('.categories__title a').text()))
            $(this).children().find('.categories__item').each(async function(){
                let subcategory = lodash.kebabCase(lodash.deburr($(this).find('a').text()))
                let subcatList
                try {
                    let subcategoryFetch = await axios($(this).find('a').attr('href'));
                    console.log('CAT   ' + $(this).find('a').attr('href'))
                    subcatList = await checkSubcategories (subcategoryFetch)
                } catch (error) {
                    console.log("error @ checkCategories")
                }
            })
        })

    } catch (error) {
        console.log(error)
    }
}



async function checkSubcategories (fetched){
    let html = fetched.data
    let subcatList = {}
    $ = cheerio.load(html)
    if ($('.ui-search-filter-dl .ui-search-filter-dt-title:contains("Categorías")').length) {
        $('.ui-search-filter-dl .ui-search-filter-dt-title:contains("Categorías")').parent().children().find('.ui-search-filter-container').each( async function(){
            let subcategoryName = lodash.kebabCase(lodash.deburr($(this).find('.ui-search-filter-name').text()))

            try {
                let url = await $(this).find('a').attr('href')
                let fetchedData = await fetchSubcat(url) //<------ DOESN'T RETURN ANYTHING, IN FACT
                console.log(fetchedData)                 //        IT STOPS EXECUTION ALL TOGETHER
            } catch (error) {
                console.log("error @ checkSubcategories")
            }
            
        })

    } else {
        //functionThatSavesTheMostSoldLink()
    }
}

async function fetchSubcat(url){
    try {
        let subcategoryFetch = await axios(url); //<------ DOESN'T RETURN ANYTHING, IN FACT
        let subcatList                           //        IT STOPS EXECUTION ALL TOGETHER
        subcatList = await checkSubcategories (subcategoryFetch)
        return subcatList
    } catch (error) {
        console.log('error @ fetchSubcat')
    }
}


checkCategories()






app.get('/', function (req, res) {
    checkCategories()
    res.json('Bienvenido a MasVendidosAPI - MercadoLibre Tracker')
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))

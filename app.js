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
            let category =  lodash.kebabCase(lodash.deburr($(this).find('.categories__title a').text()))
            $(this).children().find('.categories__item').each(async function(){
                let subcategory = lodash.kebabCase(lodash.deburr($(this).find('a').text()))
                
                try {
                    let subcategoryFetch = await axios($(this).find('a').attr('href'));
                    console.log('CAT   ' + $(this).find('a').attr('href'))
                    let res
                    res = checkSubcategories (subcategoryFetch)
                    
                    while(res.moreSubcat == true){
                        console.log(state)
                    }
                } catch (error) {

                }
            })
        })

    } catch (error) {
      console.log(error)
    }
}

async function checkSubcategories (fetched){
    let html = fetched.data
    $ = cheerio.load(html)
    if ($('.ui-search-filter-dl .ui-search-filter-dt-title:contains("Categorías")').length) {
        console.log($('.ui-search-filter-dl .ui-search-filter-dt-title:contains("Categorías")').children().length)
        $('.ui-search-filter-dl .ui-search-filter-dt-title:contains("Categorías")', html).children().find('.ui-search-link').each( async function(){
            console.log('SUBCAT')
            return {moreSubcat: true, url: $(this).attr('href')}
        })
    } else {
        console.log('chau')
        return {moreSubcat: false, url:$('.ui-search-styled-labelui-search-result__content ui-search-link .ui-search-styled-label')}
    }
}

app.get('/', function (req, res) {
    checkCategories()
    res.json('This is my webscraper')
})

checkCategories()

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))


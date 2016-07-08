'use strict';

var exports = module.exports = {}

const request = require('request')
const reflect = require('./util').reflect
const dedent = require('./util').dedent

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Functions that test the message for special formating *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
exports.testAll = function testAll(message) {
	let testFunctions = [this.magicCardTest(message), this.xkcdTest(message)]
	return Promise.all(testFunctions.map(reflect))
}

exports.magicCardTest = function magicCardTest(message) {

	let getCardInfo = cardName => new Promise((resolve, reject) => {
		const mtgApiPath = 'https://api.deckbrew.com/mtg/cards?name='
		const apiCardpath = mtgApiPath + cardName

		request.get(apiCardpath, (err, result, body) => {
			if (err) {
	        	console.log(err)
	        	return reject('API request returned an error.')
	      	}
	      	else if (result.statusCode == 200) {
	      		let parsedBody
	      		try {
	      			parsedBody = JSON.parse(body)
	      		}
	      		catch (e) {
					console.log(e)
					return reject('Error parsing API response: ' +  e.message ? e.message : '')
				}

				if (parsedBody.length) parsedBody = parsedBody[0] //We want the first result.
				else return reject('No result returned for this card.')

				let imgLink = ""
				if (parsedBody && parsedBody.editions) {
	  				for (let i=0; i<parsedBody.editions.length; i++) {
    					let img = parsedBody.editions[i].image_url
    					if (img.indexOf("multiverseid/0.jpg") == -1) {
      						imgLink = img
    					}
	  				}
				}

				return resolve(imgLink)
	        }
	        else {
	        	let parsedBody
	      		try {
	      			parsedBody = JSON.parse(body)[0]
	      		}
	      		catch (e) {
					console.log(e)
					return resolve('Error parsing API response: ' +  e.message ? e.message : '')
				}

				if (parsedBody) {
					let text = dedent(`Error:
					${(parsedBody.errors && parsedBody.errors.length) ? parsedBody.errors.join('\n') : ''}`)
	    			return resolve(text)
				}
				else return reject("An unknown API error was encountered.")
	        }
		})
	})

	return new Promise((resolve, reject) => {
		if (!message || !message.text) {
			return reject('No message received.')
		}

		console.log('Running Magic card test.')
		const magicCardTest = /(?:\[\[)([^\n\r\[\]]+)(?:\]\])/g

		let cardPromises = []
		for (let cardInfo = magicCardTest.exec(message.text); cardInfo != null; cardInfo = magicCardTest.exec(message.text)) {
			console.log("Fetching " + cardInfo[1])
			cardPromises.push(getCardInfo(cardInfo[1])) //Second entry in the array is the extracted string.
		}

		if (cardPromises.length) {
			let cardImages = Promise.all(cardPromises.map(reflect))
			.then(result => result.filter(elem => elem.status === 'resolved').map(elem => elem.result))
			return resolve(cardImages)
		}
		else {
			return reject('Message did not pass magic card test.')
		}
	})
}

exports.xkcdTest = function xkcdTest(message) {
	return new Promise((resolve, reject) => {
		console.log('Running XKCD test.')
		return reject('Message did not pass xkcd test (not implemented).')
	})
}

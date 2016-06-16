"use strict";

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
	return new Promise((resolve, reject) => {
		if (!message || !message.text) {
			return reject('No message received.')
		}

		console.log('Running Magic card test.')
		const magicCardTest = /(?:\[\[)([^\n\r\[\]]+)(?:\]\])/;

		if (magicCardTest.test(message.text)) {
			const cardInfo = magicCardTest.exec(message.text)
			const cardName = cardInfo[1] //Second entry in the array is the extracted string.

			let mtgApiPath = "https://api.deckbrew.com/mtg/cards?name="
	  		let apiCardpath = mtgApiPath + cardName

			request.get(apiCardpath, (err, result, body) => {
				if (err) {
		        	console.log(err)
		        	return resolve('API request returned an error.')
		      	}
		      	else if (result.statusCode == 200) {
		      		let parsedBody
		      		try {
		      			parsedBody = JSON.parse(body)[0]
		      		}
		      		catch (e) {
						console.log(e);
						return resolve('Error parsing API response: ' +  e.message ? e.message : '')
					}
		        	
		        	if (!parsedBody || !parsedBody.name || !parsedBody.text || !parsedBody.editions || !parsedBody.editions.length > 0) {
		        		return resolve('h0rsbot does not like this card.')
		        	}

		        	let text = dedent(`*Card name:* ${parsedBody.name}
					*Text:* ${parsedBody.text}
					*Image:* ${parsedBody.editions[parsedBody.editions.length-1].image_url}`)
					return resolve(text)
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

		        	let text = dedent(`Error:
					${(parsedBody.errors && parsedBody.errors.length) ? parsedBody.errors.join('\n') : ''}`)
		    		return resolve(text)
		        }
			});
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
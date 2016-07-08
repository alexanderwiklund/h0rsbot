'use strict';

const env = require('node-env-file')(__dirname + '/.env') //Load environment variables from file.
const messageTests = require('./message-tests') //All message tests with regexes are contained in this file.

//Load slack client.
const slack = require('@slack/client')
const CLIENT_EVENTS = slack.CLIENT_EVENTS
const RTM_EVENTS = slack.RTM_EVENTS

//Connect to slack using API token.
const token = process.env.SLACK_API_TOKEN || ''
const client = new slack.RtmClient(token, {logLevel: 'info'})
client.start()

let GENERAL_CHANNEL_ID = ''

client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`)

  var generalChannel = rtmStartData.channels.find((elem) => elem.name === 'general')
  GENERAL_CHANNEL_ID = generalChannel.id
})

// you need to wait for the client to fully connect before you can send messages
client.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {})

client.on(RTM_EVENTS.MESSAGE, function (message) {
	messageTests.testAll(message)
	.then((results) => {
		results.filter((result) => result.status === 'resolved')
		.forEach((testResult) => {
			console.log(testResult)
			if (testResult.result.length) {
				testResult.result.forEach(result => client.sendMessage(result, GENERAL_CHANNEL_ID, () => console.log('Message sent.')))
			}
			else {
				client.sendMessage(testResult.result, GENERAL_CHANNEL_ID, () => console.log('Message sent.'))
			}
			
		})
	})
})

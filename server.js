const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const redis = require('redis');

const server = http.createServer(app);
const redisCli = redis.createClient('14315', 'redis-14315.c17.us-east-1-4.ec2.cloud.redislabs.com');

let io = require('socket.io').listen(server);

redisCli.on('connect', () => {
	console.log('redis connected!');
});

// Run the app by serving the static files
// in the dist directory
app.use(express.static(__dirname + '/dist'));

const forceSSL = function () {
	return function (req, res, next) {
		if (req.headers['x-forwarded-proto'] !== 'https') {
			return res.redirect(
				['https://', req.get('Host'), req.url].join('')
			);
		}
		next();
	}
}

app.use(forceSSL());

app.get('/*', function (req, res) {
	res.sendFile(path.join(__dirname + '/dist/index.html'));
});
// Start the app by listening on the default
// Heroku port
server.listen(process.env.PORT || 8080);

io.on('connection', (socket) => {
	console.log('New user connected!');

	socket.on('online', (user) => {
		let sessionObj = {};
		sessionObj.user = user.username;
		sessionObj.socket = socket.id;
		let sessionObjString = JSON.stringify(sessionObj);
		redisCli.sadd(['onlineUsernames', user.username], (err, result) => {
			if (err) return console.log(err);
			if (result === 1) {
				redisCli.sadd(['online', sessionObjString], (err, result) => {
					if (err) return console.log(err);
					if (result === 1) {
						console.log('OK!');
					}
				});
				redisCli.smembers('online', (err, reply) => {
					if (err) return console.log(err);
					let resultJSON = parseResult(reply);
					io.emit('getOnlines', { init: false, session: resultJSON });
				});
			}
		});
	});

	socket.on('fetchChallenges', () => {
		redisCli.smembers('challenges', (err, reply) => {
			if (err) return console.log(err);
			let result = parseResult(reply);
			socket.emit('getChallenges', { init: true, challenges: result });
		});
	});

	socket.on('challenger', (challenge) => {
		const challengerObj = {
			challenged: challenge.challenged,
			challenger: challenge.challenger,
			accept: false
		};
		redisCli.sadd(['challenges', JSON.stringify(challengerObj)], (err, result) => {
			if (err) return console.log(err);
			if (result === 1) {
				redisCli.smembers('challenges', (err, reply) => {
					if (err) return console.log(err);
					let resultJSON = parseResult(reply);
					socket.broadcast.emit('getChallenges', {
						init: false,
						challenges: resultJSON
					});
				});
				redisCli.smembers('online', (err, reply) => {
					if (err) return console.log(err);
					let resultJSON = parseResult(reply);
					console.log('here waaaaaaaaaaaaaaaaaay!!!!');
					socket.emit('getOnlines', { init: false, session: resultJSON });
				});
			}
		});
	});

	socket.on('disconnect', function () {
		redisCli.smembers('online', (err, reply) => {
			if (err) return console.log(err);
			let onlineJSON = parseResult(reply);
			const item = onlineJSON.filter((item) => {
				return item.socket === socket.id;
			})[0];
			if (item) {
				redisCli.srem(['onlineUsernames', item.user], (err, result) => {
					if (err) return console.log(err);
					if (result === 1) {
						let itemToDelete = getItemByResult(reply, item.user);
						redisCli.srem(['online', itemToDelete], (err, result) => {
							if (err) return console.log(err);
							if (result === 1) {
								redisCli.smembers('online', (err, reply) => {
									if (err) return console.log(err);
									let onlineJSON = parseResult(reply);
									io.emit('getOnlines', { init: false, session: onlineJSON });
								});
							}
						});

					}
				});
			}
		});
	});
});

//******************************** Utils Methods ************************************************************* */
const parseResult = (array) => {
	const arrayResult = [];
	for (let item in array) {
		arrayResult.push(JSON.parse(array[item]));
	}
	return arrayResult;
}

const getItemByResult = (reply, username) => {
	let element = '';
	if (reply.length > 0) {
		reply.forEach((item) => {
			if (item.includes(username)) {
				element = item;
				return;
			}
		});
		return element;
	}

	return arrayResult;
}


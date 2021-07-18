;(() => {
	let xMin = 20,
		xMax = 80,
		yMin = 20,
		yMax = 80,
		xDurationMin = 3,
		xDurationMax = 12,
		yDurationMin = 3,
		yDurationMax = 12,
		size = '30rem'

	if (window.jQuery == null) throw 'JQuery required!'

	const randrange = (min, max) => Math.random() * (max - min) + min

	$(`
		<style>
			@import url(https://db.onlinewebfonts.com/c/2d814a09d668f730cc91d8d6e390dc08?family=OCR+A+Extended);
			
			@keyframes travel {
				from {
					left: 0;
					margin-left: 0;
				}
				to {
					left: 100%;
					margin-left: -${size};
				}
			}
			
			@keyframes bounce {
				from {
					top: 0;
					margin-top: 0;
				}
				to {
					top: 100%;
					margin-top: -${size};
				}
			}

			#container {
				position: absolute;
				top: 0;
				left: 0;
				bottom: 0;
				right: 0;
				z-index: 1000;
				perspective: 99999px;
				overflow: hidden;
			}

			.traveler {
				position: absolute;
				width: ${size};
				height: 100%;
				animation: 4s linear 0s infinite alternate travel;
			}
			
			.bouncer {
				position: absolute;
				width: 100%;
				height: ${size};
				animation: 4s linear 0s infinite alternate bounce;
				
				display: flex;
				align-items: center;
				justify-content: center;
				flex-wrap: nowrap;
			}

			.bouncer > .bouncyImage { 
				position: absolute;
				height: 100%;
				top: 0;
				left: 50%;
				transform: translateX(-50%);
			}

			.bouncer > .bouncyText {
				z-index: 100;
				font-family: "OCR A Extended",Helvetica,sans-serif;
				font-size: 5rem;
				color: white;
				text-shadow: 0.1rem 0.1rem black;
				flex: 0 0 auto;
			}
		</style>`).appendTo('head')

	$(`<div id="container"/>`).appendTo('body')

	window.createBouncingImage = ({ src, textElem = '', duration = -1 }) => {
		const img = $(`
			<div class="traveler" style="
				display: none;
				left: ${randrange(xMin, xMax)}%;
				animation-duration: ${randrange(xDurationMin, xDurationMax)}s;
				animation-direction: ${Math.random() > 0.5 ? 'alternate-reverse' : 'alternate'};
			">
				<div class="bouncer" style="
					top: ${randrange(yMin, yMax)}%;
					animation-duration: ${randrange(yDurationMin, yDurationMax)}s;
					animation-direction: ${Math.random() > 0.5 ? 'alternate-reverse' : 'alternate'};
				">
					<img class="bouncyImage" src="${src}"/>
					<div class="bouncyText">${textElem}</div>
				</div>
			</div>`)
			.appendTo('#container')
			.fadeIn('fast')
		if (duration > 0) setTimeout(() => img.fadeOut('slow', () => img.remove()), duration * 1000)
	}
})()

// StreamElements API looks like several APIs glued together by sleep deprived interns
// Luckily, I am excellent at working around problems
;(async () => {
	const {
		detail: { recents, currency, fieldData: config },
	} = await new Promise((callback) => window.addEventListener('onWidgetLoad', callback))

	const {
		includeFollowers,
		includeRedemptions,
		includeHosts,
		includeRaids,
		includeSubs,
		includeTips,
		includeCheers,
		giphyApiKey: key, //streamElements is overzealously replacing any {config}
		fallbackImage,
	} = config

	async function queryGiphy(query) {
		const gifs = await (
			await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${query}&limit=1&rating=pg-13`)
		).json()
		console.log(gifs)
		if (gifs.data.length < 1) return fallbackImage
		else return `https://media.giphy.com/media/${gifs.data[0].id}/giphy.gif`
	}

	async function processEvent(event) {
		const { name, amount, message, type } = event
		const imgSrc = await queryGiphy(name)
		const action = {
			follower: includeFollowers && `just followed!`,
			redemption: includeRedemptions && `just redeemed an item!`,
			subscriber: includeSubs && !event.gifted && `just donated ${amount} subs!`,
			host: includeHosts && `is hosting with ${amount} viewers!!`,
			cheer: includeCheers && `just cheered x${amount}!`,
			tip: includeTips && `just tipped ${amount}!`,
			raid: includeRaids && `just raided with ${amount} viewers!`,
		}[type]
		if (!action) return
		createBouncingImage({
			src: imgSrc,
			duration: 5,
			textElem: `
					<p style="text-shadow: inherit;"><b style="color: darkblue; text-shadow: 0.1rem 0.1rem white;">${name}</b> ${action}</p>
					${message ? `<p style="font-size:80%; text-shadow: inherit;">${message}</p>` : ''}
				`,
		})
	}

	// process recent events before widget loaded. I guess.
	recents.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)).forEach(processEvent)

	window.addEventListener('onEventReceived', ({ detail: { event, listener } }) => {
		// following logic in the default example
		if (event == null) return
		if (event.itemId != null) obj.detail.listener = 'redemption-latest'
		const match = listener.match(/^(.+)-latest$/)
		if (match == null) return

		event.type = match[1] // force event structure to match that provided by recents, I guess.
		processEvent(event)
	})
})()

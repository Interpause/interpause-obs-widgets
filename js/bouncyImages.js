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

			.bouncer > span {
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
		console.log('a')
		const img = $(`
			<div class="traveler" style="
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
					<span>${textElem}</span>
				</div>
			</div>`).appendTo('#container')
		if (duration > 0) setTimeout(() => img.remove(), duration * 1000)
	}
})()

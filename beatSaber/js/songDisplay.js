;(() => {
  if (window.jQuery == null) throw 'JQuery required!'

  $(`
		<style>
		@import url(https://db.onlinewebfonts.com/c/2d814a09d668f730cc91d8d6e390dc08?family=OCR+A+Extended);

			body {
				background-color: black;
				width: 100vw;
				height: 100vh;
				overflow: hidden;
				color: white;
				font-family: "OCR A Extended", Helvetica, sans-serif;
			}

			#progress-ring {
				height: 100%;
				position: absolute;
				right: 0;
				bottom: 0;
			}

			#progress-ring > circle {
				stroke: rgb(196, 255, 255);
				stroke-width: 3;
				fill: transparent;
				r: 28;
				cx: 50%;
				cy: 50%;

				transition: 0.5s stroke-dashoffset linear;
				transform: rotate(-90deg);
				transform-origin: 50% 50%;
			}

			#progress-ring > text {
				fill: rgb(196, 255, 255);
				font-size: 10;
				dominant-baseline: central;
				text-anchor: middle;
				text-shadow: 1px 1px black;
			}

			#song-image {
				height: 100%;
				border-radius: 0.75rem;
				display: inline;
			}

			#song-details {
				display: inline-flex;
				vertical-align: top;
				box-sizing: border-box;
				flex-direction: column;
				height: 100%;
				justify-content: space-between;
				padding: 0.25rem;
				border-radius: 0.75rem;
			}

			#song-details > p {
				margin: 0;
			}

			#song-container {
				text-align: right;
				padding: 0.5rem;
				position: absolute;
				top: 0;
				right: 0;
			}

		</style>`).appendTo('head')

  const container = $(`<div id="song-container"/>`).appendTo('body')

  function updateProgressRing(percent) {
    const circle = $('#progress-ring > circle')
    const arc = parseInt(circle.css('r')) * Math.PI * 2

    circle.css({
      strokeDasharray: `${arc} ${arc}`,
      strokeDashoffset: `${arc - percent * arc}`,
    })
  }

  async function renderOverlay(beatmap) {
    const {
      songName,
      songSubName,
      songAuthorName,
      levelAuthorName,
      songCover,
      songHash,
      songBPM,
      noteJumpSpeed,
      difficulty,
    } = beatmap

    let key = `${songName}${noteJumpSpeed}${levelAuthorName}` // idk placeholder
    try {
      key = (
        await (
          await fetch(`https://api.beatsaver.com/maps/hash/${songHash}`)
        ).json()
      ).id
    } catch (e) {
      console.warn(e)
    }

    // will be false if the overlay isn't rendered at all so it works
    if ($('#song-hash').text().split(' ')[0] == key) return

    console.log('rendering expensive overlay')

    container.empty()
    $(
      `
				<h3 style="margin:0; line-height: 1.5;">${songName}</h3>
				<div style="position: relative; height: 6rem;">
					<div id="song-details" class="rainbow-bg">
						<p id="song-hash">${key} &#x1F511;</p>
						<p>${levelAuthorName} &#x1F9EE;</p>
						<p>${songAuthorName} &#x1F3BC;</p>
						<p>BPM: ${Math.floor(songBPM)} | NJS: ${noteJumpSpeed} | ${
        difficulty == 'ExpertPlus' ? 'Expert+' : difficulty
      }</p>
					</div>
					<img id="song-image" src="data:image/png;base64,${songCover}"/>
          <!--
					<svg id="progress-ring" viewBox="0 0 64 64">
						<circle/>
						<text x="50%" y="50%">0:00</text>
					</svg>
          -->
				</div>
				`
    )
      .css({ display: 'none' })
      .appendTo(container)
      .fadeIn('slow')

    updateProgressRing(0)
  }

  function updateCut(msg) {
    //TODO: some sort of overlay for score, rank, energy bar, spin speed etc but you too noob so don't show for now
  }

  let timer = undefined
  const timeOffset = -1
  let time = timeOffset

  const getTimerUpdater = (length) =>
    setInterval(() => {
      time += 1
      if (time * 1000 > length) return
      updateProgressRing((time / length) * 1000)
      $('#progress-ring text').text(
        `${(time / 60) | 0}:${`${time % 60 | 0}`.padStart(2, '0')}`
      )
    }, 1000)

  function startSong({ beatmap }) {
    hideQueue()
    renderOverlay(beatmap)

    if (timer) clearInterval(timer)
    time = timeOffset
    timer = getTimerUpdater(beatmap.length)
  }

  function endSong() {
    showQueue()
    if (timer) clearInterval(timer)
    container.children().fadeOut('slow', () => container.empty())
  }

  function pauseSong() {
    if (timer) clearInterval(timer)
  }

  function resumeSong({ beatmap: { length } }) {
    if (timer) clearInterval(timer)
    timer = getTimerUpdater(length)
  }

  function connectToBeatSaber() {
    const ws = new WebSocket('ws://localhost:6557/socket')

    ws.onerror = (e) => console.error(e)

    ws.onclose = (e) => {
      console.warn(e)
      console.log(`Reconnecting`)
      connectToBeatSaber()
      ws.close()
    }

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      switch (msg.event) {
        case 'hello':
          console.log('Connected!')
          break
        case 'songStart':
          startSong(msg.status)
          break
        case 'menu':
          endSong()
          break
        case 'pause':
          pauseSong()
          break
        case 'resume':
          resumeSong(msg.status)
          break
        case 'noteCut':
          updateCut(msg)
          break
      }
    }
  }
  ;(async () => connectToBeatSaber())()

  /* test */
  /*
	const props = {
		songName: 'Isogrid Room',
		songSubName: 'MetaTTT',
		songAuthorName: 'Interpause',
		levelAuthorName: 'Interpause',
		songCover:
			'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',
		songHash: '69420',
		songBPM: '666',
		noteJumpSpeed: '69',
		difficulty: 'ExpertPlus',
		paused: 1234,
		start: 2456,
		length: 300000,
	}
	*/
  /*
	console.log('render 1: initial')
	renderOverlay(props)
	console.log('render 2: should not render as unchanged hash')
	renderOverlay(props)
	console.log('render 3: should render as overlay removed')
	container.empty()
	renderOverlay(props)
	*/
  /*
	console.log('Start Song')
	startSong({ beatmap: props })
	;(async () => {
		await new Promise((callback) => setTimeout(callback, 5000))
		console.log('Pause Song')
		pauseSong()
		await new Promise((callback) => setTimeout(callback, 5000))
		console.log('Resume Song')
		resumeSong({ beatmap: props })
		await new Promise((callback) => setTimeout(callback, 5000))
		console.log('End Song')
		endSong()
	})()
	*/
  /*
	;(async () => {
		for (let i = 0; i < 1000; i++) {
			await new Promise((callback) => setTimeout(callback, 200))
			updateProgressRing(i/100)
		}
	})()
	*/
})()

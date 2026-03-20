const worldMusic = new Audio('./music/05 - Littleroot Town.mp3')
const battleMusic = new Audio('./music/09 - Battle! (Wild Pokemon).mp3')
const victoryMusic = new Audio('./music/10 - Victory! (Wild Pokemon).mp3')

worldMusic.loop = true
battleMusic.loop = true

let musicStarted = false;

window.addEventListener('keydown', () => {
	if (!musicStarted) {
		worldMusic.play();
		musicStarted = true;
	}
});
let fadeOpacity = 0;
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

const collisionsMAP = []
for (let i =0; i < collisions.length; i+=412 ) {
	collisionsMAP.push(collisions.slice(i,412 + i ))
}

const battlezonesMAP = []
for (let i =0; i < battlezones.length; i+=412 ) {
	battlezonesMAP.push(battlezones.slice(i,412 + i ))
}

class boundary {
	static width = 32
	static height = 32
	constructor({position}) {
		this.position = position
		this.width = 32
		this.height = 32
	}
	draw( ) {
		c.fillStyle ='rgba(255,0,0,0)'
		c.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
}
const boundaries =[]
const offset = {
	x:-8000,
	y:-7000
}
collisionsMAP.forEach((row, i) => {
	row.forEach((symbol,j) => {
		if (symbol !== 0)
		boundaries.push(new boundary({position: {
			x: j*boundary.width + offset.x,
			y: i*boundary.height +offset.y
			}
		})
		)
	})
})

const battlezone = []

battlezonesMAP.forEach((row, i) => {
	row.forEach((symbol,j) => {
		if (symbol !== 0)
			battlezone.push(new boundary({position: {
						x: j*boundary.width + offset.x,
						y: i*boundary.height +offset.y
					}
				})
			)
	})
})


console.log(boundaries)
c.fillStyle="white"
c.fillRect(0, 0, canvas.width, canvas.height)

const image = new Image ()
image.src = './img/world.png'

const playerdownImage = new Image()
playerdownImage.src = './img/player(down).png'
const playerupImage = new Image()
playerupImage.src = './img/player(up).png'
const playerleftImage = new Image()
playerleftImage.src = './img/player(left).png'
const playerrightImage = new Image()
playerrightImage.src = './img/player(right).png'

class Sprite {
	constructor({
					position,
					velocity,
					image,
					frames = { max: 1 },
					sprites,
					scale = 1
				}) {
		this.position = position
		this.image = image
		this.frames = {...frames, val: 0, elapsed: 0 }
		this.scale = scale
		this.health = 45
		this.opacity = 1
		this.isEnemy = false

		const setSize = () => {
			this.width = (this.image.width / this.frames.max) * this.scale
			this.height = this.image.height * this.scale
		}

		if (this.image.complete) {
			setSize()
		} else {
			this.image.onload = setSize
		}
		this.animate =false
		this.sprites = sprites
		this.scale = scale
	}

	draw() {

		c.save()
		c.globalAlpha = this.opacity

		c.drawImage(
			this.image,
			this.frames.val * (this.image.width / this.frames.max),
			0,
			this.image.width / this.frames.max,
			this.image.height,
			this.position.x,
			this.position.y,
			(this.image.width / this.frames.max) * this.scale,
			this.image.height * this.scale
		)

		c.restore()

		if (this.animate){
			if (this.frames.max>0 ){this.frames.elapsed++}
			if (this.frames.elapsed% 10 ===0) {
				if (this.frames.val < this.frames.max - 1) this.frames.val++
				else this.frames.val = 0
			}
		}
	}
	attack({ attack, recipient }) {
		const tl = gsap.timeline()

		tl.to(this.position, {
			x: this.position.x - 20
		})
			.to(this.position, {
				x: this.position.x + 40,
				duration:0.1,
				onComplete: () => {

					recipient.health -= attack.damage
					if(recipient.health < 0) recipient.health = 0

					let bar

					if(recipient === bulbasaur){
						gsap.to('#healthopp',{
							width: (recipient.health / 45) * 100 + '%'
						})
					}else{
						gsap.to('#healthown',{
							width: (recipient.health / 45) * 100 + '%'
						})
					}

					gsap.to(bar,{
						width: (recipient.health / 45) * 100 + '%'
					})

					gsap.to(recipient.position,{
						x:recipient.position.x+20,
						repeat:3,
						yoyo:true,
						duration:0.05
					})

					if(recipient.health <= 0){
						recipient.faint()
					}
				}
			})
			.to(this.position, {
				x: this.position.x
			})
	}
	faint(){
		gsap.to(this.position,{
			y:this.position.y + 20
		})

		gsap.to(this,{
			opacity:0
		})

		setTimeout(()=>{

			if(this === bulbasaur){
				battleMusic.pause()
				victoryMusic.currentTime = 0
				victoryMusic.play()
			}

			endBattle()

		},1000)
	}
}
const player = new Sprite({
	position: {
		x:canvas.width/ 2 - 50 / 4,
		y:canvas.height/ 2 - 32/ 2
	},
	image: playerdownImage,
	frames: {
		max:3,
		val:1
	},
	sprites: { up:playerupImage, down:playerdownImage,right:playerrightImage,left:playerleftImage },
	scale : 0.9
})
const background =new Sprite({
	position: {
		x: offset.x,
		y: offset.y
	},
	image: image
})
const keys ={
	w:{
		pressed: false
	},
	a:{
		pressed: false
	},
	s:{
		pressed: false
	},
	d:{
		pressed: false
	},
}
let battleCooldown = 0;
const movables =[background, ...boundaries, ...battlezone]
function rectangularcollision({rectangle1,rectangle2}){
	return (rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
		rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
		rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
		rectangle1.position.y + rectangle1.height >= rectangle2.position.y)
}
const battle ={
	initiated: false
}



let lastkey = ''
window.addEventListener('keydown', (e) => {
	switch(e.key) {
		case 'w' :
			keys.w.pressed = true
			lastkey = 'w'
			break
		case 's' :
			keys.s.pressed = true
			lastkey ='s'
			break
		case 'a' :
			keys.a.pressed = true
			lastkey = 'a'
			break
		case 'd' :
			keys.d.pressed = true
			lastkey = 'd'
			break
	}
})
window.addEventListener('keyup', (e) => {
	switch(e.key) {
		case 'w' :
			keys.w.pressed = false
			break
		case 's' :
			keys.s.pressed = false
			break
		case 'a' :
			keys.a.pressed = false
			break
		case 'd' :
			keys.d.pressed = false
			break
	}
})



function animate () {
	const animationId = window.requestAnimationFrame(animate)
	background.draw()
	boundaries.forEach(boundary => {
		boundary.draw()
		if (
			rectangularcollision({
			rectangle1 : player,
			rectangle2 : boundary
		})) {console.log('colliding')}
	})
	battlezone.forEach(battlecone => {
		battlecone.draw()
	})
	player.draw()

	if (battle.initiated) return

	if (keys.w.pressed || keys.s.pressed || keys.a.pressed || keys.d.pressed){
		for (let i  = 0; i < battlezone.length; i++) { const battleZone = battlezone[i]
			const overlappingArea =
				(Math.min(
						player.position.x + player.width,
						battleZone.position.x + battleZone.width
					) -
					Math.max(player.position.x, battleZone.position.x)) *
				(Math.min(
						player.position.y + player.height,
						battleZone.position.y + battleZone.height
					) -
					Math.max(player.position.y, battleZone.position.y))
			if (
				rectangularcollision({
				rectangle1 : player,
				rectangle2 : battleZone
			}) &&
			overlappingArea > 250 &&
			Math.random() <0.0025
		) {
			battle.initiated = true
				worldMusic.pause()
				victoryMusic.pause()
				battleMusic.currentTime = 0
				battleMusic.play()
				window.cancelAnimationFrame(animationId)
				gsap.to('#overlapping div', {
					opacity: 1,
					repeat: 3,
					yoyo: true,
					duration: 0.4,
					onComplete() {
						gsap.to('#overlapping div', {
							opacity: 1,
							duration: 0.2,
							onComplete() {
								animateBattle()
								gsap.to('#overlapping div', {
									opacity: 0,
									duration: 0.4
								})
							}
						})
					}
				})
			break
		}}
}

	let moving=true
		player.animate = false
	if(keys.w.pressed && lastkey === 'w') {
		player.animate = true
		player.image= player.sprites.up
		for (let i =0; i<boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectangularcollision({
					rectangle1: player,
					rectangle2: {
						...boundary, position: {
							x: boundary.position.x,
							y: boundary.position.y + 3
						}
					}
				})) {
				moving = false
				break
			}
		}
		if (moving)
			movables.forEach((movable) => {movable.position.y +=3})}

	else if(keys.s.pressed && lastkey ==='s'){
		player.animate = true
		player.image= player.sprites.down
		for (let i =0; i<boundaries.length; i++) {
			const boundary = boundaries[i]
			if (
				rectangularcollision({
					rectangle1: player,
					rectangle2: {
						...boundary, position: {
							x: boundary.position.x,
							y: boundary.position.y - 3
						}
					}
				})) {
				moving = false
				break
			}
		}
		if (moving)
	 		movables.forEach(movable => {movable.position.y -=3})}
	else if(keys.a.pressed && lastkey ==='a') {
		player.animate = true
		player.image= player.sprites.left
		for (let i =0; i<boundaries.length; i++) { const boundary=boundaries[i]
			if (
				rectangularcollision({
					rectangle1 : player,
					rectangle2 : {...boundary, position: {
							x:boundary.position.x +3,
							y:boundary.position.y
						}
					}
				})) {
				moving=false
				break
			}
		}
		if (moving)
			movables.forEach(movable => {movable.position.x +=3})}
	else if(keys.d.pressed && lastkey ==='d') {
		player.animate = true
		player.image= player.sprites.right
		for (let i =0; i<boundaries.length; i++) { const boundary=boundaries[i]
			if (
				rectangularcollision({
					rectangle1 : player,
					rectangle2 : {...boundary, position: {
							x:boundary.position.x -3,
							y:boundary.position.y
						}
					}
				})) {
				moving=false
				break
			}
		}
		if (moving)
			movables.forEach(movable => {movable.position.x -=3})}

}

animate()

const battleBackgroundImage=new Image()
battleBackgroundImage.src ='./img/BattleBackground.png'
const  bulbasaurImage=new Image()
bulbasaurImage.src ='./img/bulbasaur.png'
const  bulbasaurbackImage=new Image()
bulbasaurbackImage.src ='./img/bulbasaur_back.png'
const battleBackground = new Sprite({position:{x:0,y:0},image: battleBackgroundImage})
const bulbasaur = new Sprite({
	position:{x:675,y:100},
	image:bulbasaurImage,
	scale:2
})

bulbasaur.isEnemy = true
const bulbasaurback = new Sprite({position:{x:150,y:295},image:bulbasaurbackImage,scale:1.75})
let battleAnimationId
function animateBattle() {
	battleAnimationId = window.requestAnimationFrame(animateBattle)
	document.getElementById("attackBox").style.display = "flex"
	document.getElementById("healthownBox").style.display = "flex"
	document.getElementById("healthoppBox").style.display = "flex"
	c.drawImage(
		battleBackground.image,
		0,
		0,
		battleBackground.image.width,
		battleBackground.image.height,
		0,
		0,
		canvas.width,
		canvas.height-150,
	)
	bulbasaur.draw()
	bulbasaurback.draw()

}
document.querySelectorAll('button').forEach(button => {
	button.addEventListener('click', () => {

		if (!battle.initiated) return

		bulbasaurback.attack({
			attack:{
				name:'tackle',
				damage:35,
				type:'Normal'
			},
			recipient: bulbasaur
		})

		if (bulbasaur.health > 0){
			setTimeout(enemyAttack,1000)
		}
	})
})
function enemyAttack(){

	if (!battle.initiated) return
	if (bulbasaur.health <= 0) return
	if (bulbasaurback.health <= 0) return

	const moves = [
		{name:'tackle',damage:35},
		{name:'quick attack',damage:20}
	]

	const move = moves[Math.floor(Math.random()*moves.length)]

	bulbasaur.attack({
		attack: move,
		recipient: bulbasaurback
	})
}
addEventListener('click',() =>{
	console.log('clicked');

})
function endBattle(){
	battleMusic.pause()
	window.cancelAnimationFrame(battleAnimationId)

	battle.initiated = false

	gsap.to('#overlapping div',{
		opacity:1,
		onComplete(){

			document.getElementById("attackBox").style.display="none"
			document.getElementById("healthownBox").style.display="none"
			document.getElementById("healthoppBox").style.display="none"

			document.querySelector('#healthopp').style.width='100%'
			document.querySelector('#healthown').style.width='100%'

			bulbasaur.health = 45
			bulbasaurback.health = 45

			bulbasaur.opacity = 1
			bulbasaurback.opacity = 1
			gsap.to('#overlapping div',{
				opacity:0,
				onComplete(){


					animate()
					setTimeout(()=>{

						victoryMusic.pause()
						worldMusic.currentTime = 0
						worldMusic.play()

					},10000)

				}
			})
		}
	})
}

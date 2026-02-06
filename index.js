const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')
canvas.width = 1024
canvas.height = 576

const collisionsMAP = []
for (let i =0; i < collisions.length; i+=412 ) {
	collisionsMAP.push(collisions.slice(i,412 + i ))
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
		c.fillStyle ='rgba(255,0,0,0.0)'
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
	constructor (
	{ position, velocity, image, frames= {max: 1},sprites}
) {
		this.position = position
		this.image = image
		this.frames = {...frames, val: 0, elapsed: 0 }
		this.image.onload=() => {
			this.width= this.image.width /this.frames.max
			this.height= this.image.height
		}
		this.moving =false
		this.sprites=sprites
	}
	
	draw() {
	c.drawImage(this.image, this.frames.val * this.width, 0, this.image.width /this.frames.max, this.image.height,this.position.x,this.position.y,this.image.width /this.frames.max, this.image.height)
		if (this.moving){
		if (this.frames.max>0 ){this.frames.elapsed++}
		if (this.frames.elapsed% 10 ===0) {
			if (this.frames.val < this.frames.max) this.frames.val++
			else this.frames.val = 0
		}}

	}
}
const player = new Sprite({
	position: {
		x:canvas.width/ 2 - 50 / 4,
		y:canvas.height/ 2 - 32/ 2
	},
	image: playerdownImage,
	frames: {
		max:3
	},
	sprites: { up:playerupImage, down:playerdownImage,right:playerrightImage,left:playerleftImage },
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
const movables =[background, ...boundaries]
function rectangularcollision({rectangle1,rectangle2}){
	return (rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
		rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
		rectangle1.position.y <= rectangle2.position.y + rectangle2.height &&
		rectangle1.position.y + rectangle1.height >= rectangle2.position.y)
}
function animate () {
	window.requestAnimationFrame(animate)
	background.draw()
	boundaries.forEach(boundary => {
		boundary.draw()
		if (
			rectangularcollision({
			rectangle1 : player,
			rectangle2 : boundary
		})) {console.log('colliding')}
	})
	player.draw()
	let moving=true
		player.moving = false
	if(keys.w.pressed && lastkey === 'w') {
		player.moving = true
		player.image= player.sprites.up
		for (let i =0; i<boundaries.length; i++) { const boundary=boundaries[i]
			if (
			rectangularcollision({
				rectangle1 : player,
				rectangle2 : {...boundary, position: {
					x:boundary.position.x,
					y:boundary.position.y +3
				}
				}
			})
			) {
				console.log('colliding')
			moving=false
				break
			}
		}
		if (moving)
			movables.forEach((movable) => {movable.position.y +=3})
	}
	else if(keys.s.pressed && lastkey ==='s'){
		player.moving = true
		player.image= player.sprites.down
		for (let i =0; i<boundaries.length; i++) { const boundary=boundaries[i]
			if (
				rectangularcollision({
					rectangle1 : player,
					rectangle2 : {...boundary, position: {
							x:boundary.position.x,
							y:boundary.position.y -3
						}
					}
				})
			) {
				console.log('colliding')
				moving=false
				break
			}
		}
		if (moving)
	 		movables.forEach(movable => {movable.position.y -=3})}
	else if(keys.a.pressed && lastkey ==='a') {
		player.moving = true
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
				})
			) {
				console.log('colliding')
				moving=false
				break
			}
		}
		if (moving)
			movables.forEach(movable => {movable.position.x +=3})}
	else if(keys.d.pressed && lastkey ==='d') {
		player.moving = true
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
				})
			) {
				console.log('colliding')
				moving=false
				break
			}
		}
		if (moving)
			movables.forEach(movable => {movable.position.x -=3})}
}

animate()
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
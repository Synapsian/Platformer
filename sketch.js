let LocalPlayer = null;
let Gravity = 1
let Level = 0

let StaticObjects = {
  0: [],
  1: [],
}

let Camera = {x:0,y:0}

function setup() {
  createCanvas(400, 400);
  // Level 0
  level = 0
  new Static(0,450,[100,400],level)
  new Static(75,510,[50,400],level)
  new Static(150,450,[100,400],level)
  new Static(225,510,[50,400],level)
  new Static(300,450,[100,400],level)
  new Static(400,510,[100,400],level)
  new Static(500,450,[100,400],level)
  new Static(600,510,[100,400],level)
  new Static(700,450,[100,400],level)
  
  new Spike(75,300,20,level)
  new Spike(225,300,20,level)
  new Spike(400,300,20,level)
  new Spike(600,300,20,level)
  
  new Goal(700,150,level)
  
  // Level 1
  level = 1
  new Static(0,300,100,level)
  
  LocalPlayer = new Player(0,0);
}

class Static {
  constructor(x,y,size,level) {
    this.x = x
    this.y = y
    
    if (size instanceof Array) {
      this.size = size
    } else {
      this.size = [size,size]
    }
    
    StaticObjects[level].push(this)
  }
  render() {
    fill('white')
    rectMode(CENTER)
    rect(this.x,this.y,this.size[0],this.size[1])
  }
  checkCollision(x,y,size) {
    const rightBound = this.x + this.size[0]/2
    const leftBound = this.x - this.size[0]/2 
    const upperBound = this.y + this.size[1]/2
    const lowerBound = this.y - this.size[1]/2

      
    if (x + size/2 > leftBound && x - size/2 < rightBound && y - size/2 < upperBound && y + size/2 > lowerBound) {
      return true
    }
  }
  collide(object) {
    return
  }
}

class Spike extends Static {
  constructor(x,y,size,level) {
    super(x,y,size,level)
    this.hitboxSize = [this.size[0]/3,this.size[1]/3]
  }
  render() {
    rectMode(CENTER)
    fill('red')
    triangle(this.x + this.size[0]/2,this.y + this.size[1]/2,this.x - this.size[0]/2, this.y + this.size[1]/2, this.x, this.y - this.size[1]/2)
    //fill('lime')
    //rect(this.x,this.y,this.hitboxSize[0],this.hitboxSize[1])
  }
  checkCollision(x,y,size) {
    const rightBound = this.x + this.hitboxSize[0]/2
    const leftBound = this.x - this.hitboxSize[0]/2
    const upperBound = this.y + this.hitboxSize[1]/2
    const lowerBound = this.y - this.hitboxSize[1]/2
      
    if (x + size/2 > leftBound && x - size/2 < rightBound && y - size/2 < upperBound && y + size/2 > lowerBound) {
      return true
    }
  }
  collide(object) {
    if (object instanceof Player) {
      object.die()
      return
    }
  }
}

class Goal extends Static {
  constructor(x,y,level) {
    super(x,y,25,level)
  }
  render() {
    fill('lime')
    rectMode(CENTER)
    rect(this.x,this.y,this.size[0],this.size[1])
  }
  collide(object) {
    if (object instanceof Player) {
      Level++
      object.x = 0
      object.y = 0
      object.velocity[0] = 0
      object.velocity[1] = 0
      return
    }
  }
}

class Player {
  constructor(x,y) {
    this.x = x
    this.y = y
    this.speed = 5
    this.velocity = [0,0]
    this.coyoteTime = false
    
    this.size = 50
    
    this.state = {
      type: 'none',
      duration: 0
    }
  }
  render() {
    rectMode(CENTER)
    fill('lightblue')
    rect(this.x,this.y,this.size)
  }
  tick() {
    this.move()
    this.applyGravity()
    this.applyVelocity()
    this.render()
  }
  die() {
    this.x = 0
    this.y = 0
    this.velocity[0] = 0
    this.velocity[1] = 0
  }
  setState(type,duration) {
    this.state.type = type
    if (duration) {
      this.state.duration = duration
    } else {
      this.state.duration = 0
    }
  }
  _verticalCollisions(collided) {
    if (collided) {
      if (this.velocity[1] > 0) {
        this.setState('grounded',10)
      }
      this.velocity[1] = 0
    } else {
      if (this.state.type == 'grounded') {
        this.state.duration -= 1
        
        if (this.state.duration <= 0) {
          this.state.type = 'air'
        }
      } else {
        this.state.type = 'air'
      }
    }
  }
  applyVelocity() {
    // todo: fix gliding when between two close objects 
    
    const collidedX = (this.getCollisions(this.x + this.velocity[0],this.y).length > 0)
    const collidedY = (this.getCollisions(this.x,this.y + this.velocity[1]).length > 0)
    const collisionsXY = this.getCollisions(this.x + this.velocity[0],this.y + this.velocity[1])
    const collidedXY = (collisionsXY.length > 0)
    
    this._verticalCollisions(collidedY)
    
    if (collidedX) {
      this.velocity[0] = 0
    }
    
    if (!collidedX && !collidedY & collidedXY) {
      // Moving diagonally into platform
      if (collisionsXY.length == 1) {
        const platform = collisionsXY[0]
        const diff = this.x - platform.x
        
        if (this.velocity[0] < diff) {
          this.x = platform.x + platform.size[0]/2 + this.size/2 - this.speed
        } else {
          this.x = platform.x - platform.size[0]/2 - this.size/2 + this.speed
        }
        
      this.velocity[0] = 0
      this.velocity[1] = 0
      } 
    }
    
    this.x += this.velocity[0]
    this.y += this.velocity[1]
    
    if (this.y > height) { // this is temporary
      this.die()
    }
    
  }
  move() {
    if (keyIsDown(87) || keyIsDown(38)) {
      if (this.state.type == 'grounded') {
        this.state.duration = 0
        this.applyForce(0,-15) 
      }
    } // W
    if (keyIsDown(65) || keyIsDown(37)) { this.velocity[0] = -this.speed } // A
    else if (keyIsDown(68) || keyIsDown(39)) { this.velocity[0] = this.speed } // D
    else { this.velocity[0] = 0 }
  }
  applyGravity() {
    if (this.y >= height) {
      return
    }
    
    this.applyForce(0,Gravity)
  }
  applyForce(x,y) {
    this.velocity[0] += x
    this.velocity[1] += y
  }
  getCollisions(x,y) {
    let collisions = []
    
    for (const object of StaticObjects[Level]) {
      if (object.checkCollision(x,y,this.size)) {
        object.collide(this)
        collisions.push(object)
      }
    }
    return collisions
  }   
}

function draw() {
  background(220);
  fill('white')

  textSize(20)
  text('Level ' + Level,10,30)
  
  Camera.x = width/2 - LocalPlayer.x
  Camera.y = height/2 - LocalPlayer.y
  translate(Camera.x,Camera.y)
  
  //noStroke()
  if (LocalPlayer) {
    LocalPlayer.tick()
  }
  for (const object of StaticObjects[Level]) {
    object.render()
  }
}

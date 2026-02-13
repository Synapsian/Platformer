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
  new Static(100,300,100,level)
  new Static(300,250,100,level)
  new Static(300,100,20,level)
  new Static(320,180,20,level)
  
  new Goal(300,0,level)
  
  // Level 1
  level = 1
  new Static(100,300,100,level)
  
  LocalPlayer = new Player(100,100);
}

class Static {
  constructor(x,y,size,level) {
    this.x = x
    this.y = y
    this.size = size
    StaticObjects[level].push(this)
  }
  render() {
    fill('white')
    rectMode(CENTER)
    rect(this.x,this.y,this.size)
  }
  checkCollision(x,y,size) {
    const rightBound = this.x + this.size/2
    const leftBound = this.x - this.size/2
      
    const upperBound = this.y + this.size/2
    const lowerBound = this.y - this.size/2
      
    if (x + size/2 > leftBound && x - size/2 < rightBound && y - size/2 < upperBound && y + size/2 > lowerBound) {
      return true
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
    rect(this.x,this.y,this.size)
  }
}

class Platform extends Static {
  constructor(x,y,sizeX,sizeY,level) {
    
  }
}

class Player {
  constructor(x,y) {
    this.x = x
    this.y = y
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
    rect(this.x,this.y,this.size)
  }
  tick() {
    this.move()
    this.applyGravity()
    this.applyVelocity()
    this.render()
  }
  applyVelocity() {
    // todo: fix gliding when between two close objects 
    // todo: fix clipping into the corners of objects
    // X Check
    if (this.getCollisions(this.x + this.velocity[0],this.y).length > 0) {
      this.velocity[0] = 0
    }
    // Y Check
    if (this.getCollisions(this.x,this.y + this.velocity[1]).length > 0) {
      if (this.velocity[1] > 0) {
        this.state.type = 'grounded'
        this.state.duration = 10
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
    
    this.x += this.velocity[0]
    this.y += this.velocity[1]
    
    if (this.y > height) { // this is temporary
      this.y = -height
      this.velocity[1] = 20
      this.x = 100
    }
    
  }
  move() {
    if (keyIsDown(87)) {
      if (this.state.type == 'grounded') {
        this.state.duration = 0
        this.applyForce(0,-15) 
      }
    } // W
    if (keyIsDown(65)) { this.velocity[0] = -5 } // A
    else if (keyIsDown(68)) { this.velocity[0] = 5 } // D
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
        if (object instanceof Goal) {
          Level++
          this.x = 100
          this.y = 100
          return []
        }
        collisions.push(object)
      }
    }
    return collisions
  }   
}

function draw() {
  background(220);
  fill('white')
  
  Camera.x = width/2 - LocalPlayer.x
  Camera.y = height/2 - LocalPlayer.y
  translate(Camera.x,Camera.y)
  
  if (LocalPlayer) {
    LocalPlayer.tick()
  }
  
  for (const object of StaticObjects[Level]) {
    object.render()
  }
}

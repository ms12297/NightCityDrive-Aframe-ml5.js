// letiable to hold a reference to our A-Frame world
let world;
let mainMenu;

let menuText;
let textMenuCont;
let textMenu;
let textbgMenu;

let pointsLost = 0;

// let endMenu;
// let endBox;


let ground = [];
let borders = [];

let speed = 0.1;


let correct;
let wrong;
let song;
let soundplay = false;
let skybox;
let skyCanvas;

let xoff = 0.0, yoff = 10000; 
let t = 0;
let colorOffset = 0;

let gameOver = false;

let currentdatetime = new Date();

let startseconds;
let currentseconds;
let duration;


let score = 0;
let textCont;
let text;
let textbg;
let soundButton;

let skyCue = true;

let hit = false;

let skull;
let skullXcoord = -30;


let gameState = 0;
let playSong = false;


let platform;

let video;
let poseNet;
let poses = [];

let ready = false;
let wheelCont;
let wheel;
let wheelRot = 0;

let theta = 0;
let mappedTheta = 0;
let averageThetas = [];

let toRight = false;
let toLeft = false;


function sceneChange() {
  if(gameState==0){
    document.getElementById('main').setAttribute('visible', 'false')
    document.getElementById('menu').setAttribute('visible', 'true')
  }
  else if (gameState==1){
    document.getElementById('menu').setAttribute('visible', 'false')
    document.getElementById('main').setAttribute('visible', 'true')
  }
}

function preload() {
  correct = loadSound("sounds/correct.wav");
  correct.setVolume(0.5);
  wrong = loadSound("sounds/wrong.wav");
  wrong.setVolume(0.01);
  song = loadSound("sounds/song.mp3");
  song.setVolume(1);
}

function setup() {
  
  // noCanvas();
  skyCanvas = createCanvas(512,512).id();

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function (results) {
    poses = results;
  });

  colorMode(RGB);

  world = new World('main');
  world.setBackground(0, 0, 0);
  document.getElementById('main').setAttribute('visible', 'false');

  mainMenu = new World('menu');

  // main menu to game scene transition
  menuBox = new Box({
    x: 0, y: 1, z: -5,
    width: 0.5, height: 0.5, depth: 0.5,
    red: 255, green: 0, blue: 255,
    side: 'double',
    rotationY: 45,
    rotationZ: 30,
    metalness: 0.8,
    clickFunction: function (myBox) {
      console.log("CLICKED");
      gameState = 1;
      gameOver = false;
      skull.speed = 0.1;
      score = 0;
      pointsLost = 0;
      sceneChange();
    }
  });

  mainMenu.add(menuBox);
  

  // add welcome message and game title to main menu scene
  menuText = new Text({
    x: 0, y: 1.5, z: -7,
    text: "Click the box to start!",
    red: 255, green: 0, blue: 0,
    width: 5,
    height: 5,
    align: "center",
    wrapCount: "40",
    zOffset: 0.5,
    transparent: false,
    opacity: 1,
    side: "double",
    scaleX: 5, scaleY: 5, scaleZ: 5
  });

  textMenuCont = new Container3D({ x: 0, y: 2, z:0 });
  mainMenu.add(textMenuCont);

  textMenuCont.addChild(menuText);

  // add a black box behind the text
  textbgMenu = new Box({
    x: 0, y: 1.5, z: -7,
    width: 3, height: 0.5, depth: 0.1,
    red: 0, green: 0, blue: 0,
    opacity: 0.3,
  });
  textMenuCont.addChild(textbgMenu);


  skybox = new Box({
    x: 0, y: 0, z: 0,
    width: 1000, height: 1000, depth: 1000,
    asset: skyCanvas,
    red: 255, green: 255, blue: 255,
    side: 'double',
    shader: 'flat',
    dynamicTexture: true,
  });

  world.add(skybox);


  skull = new movingSkull(0, -2, skullXcoord, speed);
  platform = new MovingPlatform();  


  textCont = new Container3D({ x: 0, y: 2, z:0 });
  world.add(textCont);

  text = new Text({
		text: 'Score: ' + score,
		red: 255, green: 255, blue: 255,
		side: 'double',
		x: 0, y: 1.5, z: -7,
		scaleX: 10, scaleY: 10, scaleZ: 10
	});
	textCont.addChild(text);

  // add a black box behind the text
  textbg = new Box({
    x: 0, y: 1.5, z: -7,
    width: 3, height: 0.5, depth: 0.1,
    red: 0, green: 0, blue: 0,
    opacity: 0.3,
  });
  textCont.addChild(textbg);

  // 
  // 3d model

  wheelCont = new Container3D({ x: 0, y: 1, z:0 });
  world.add(wheelCont);

  wheel = new GLTF({
    asset: 'wheel',
    x: 0,
    y: 0,
    z: 0,
    rotationX:0,
    rotationY:0,
    rotationZ:0,
    scaleX:0.05,
    scaleY:0.05,
    scaleZ:0.05,
  });

  wheelCont.addChild(wheel);
  
  world.setUserPosition(0, 1, 0);
}

function modelReady() {
  // remove #status div
  select('#status').remove();
  ready = true;
}

function draw() {

  if (ready) {
    background(0, 0, 0, 50);
    for(let i = 0; i < width; i+=5) {
      for(let j = 0; j < height; j+=5) {
      
      if (skyCue) {
        // more purple sky
        fill((colorOffset + noise(i / 100, j / 100, t) * 360) %360, 40, 150);
        //(199,36,177)
      }
      else{
        fill((colorOffset + noise(i / 100, j / 100, t) * 360) %360, 70, 90);
      }
      noStroke();
      rect(i, j, 5, 5);
      }
    }  
    t = t + 0.003;
    colorOffset += 5;

    currentdatetime = new Date();
    currentseconds = currentdatetime.getTime() / 1000;

    duration = currentseconds - startseconds;

    if (gameState == 1) {
      menuText.setText("Press to restart");
      gameplayScreen();   
    }
  }
}

function gameplayScreen() {
  if (playSong == false) {
    startseconds = currentdatetime.getTime() / 1000;
    song.loop();
    song.setVolume(0.1);
    playSong = true;
  }

  skull.speed += 0.0007;

  // if (duration % 5 < 0.1 && gameOver == false) {
  //   startseconds = currentseconds-0.11;
  // }

  if (duration > (3.14 * 60)){
    song.stop();
  }
  
  let userPos = world.getUserPosition();

  platform.update();

  checkEdges();

  textCont.setPosition(userPos.x, 3, userPos.z - 5);
  text.setText("Score: " + score);
  
  let userRot = world.getUserRotation();
  let rotY = userRot.y * 180/3.142 //converstion from rad to degree - IMPORTANT
  textCont.setRotation(0, rotY, 0);

  if (score < 0 || pointsLost > 1) {
    text.setText("Last Chance!");
  }
  if (score < -1 || pointsLost > 2) {
    text.setText("You Lose!");
    gameOver = true;
    sceneChange();
  }
  if (score > 20) {
    text.setText("You Win!");
    noLoop();
    gameOver = true;
  }

  if (gameOver) {
    song.stop();
    skull.speed = 0;
    if (duration > 4) {
      gameState = 0;
      sceneChange();
    }
  }

  // setting new pos
  moveWheel();
  userPos = world.getUserPosition();
  world.setUserPosition(mappedTheta, userPos.y, userPos.z);
  // wheel follows the user, in front of the camera
  wheelCont.setPosition(mappedTheta, userPos.y - 0.4, userPos.z - 0.5);
  wheelCont.setRotation(0, rotY, theta);

  hit = skull.checkLane();

  if (hit) {
    textCont.setGreen(255);
    textCont.setRed(0); 
  }
  else {
    textCont.setRed(255);
    textCont.setGreen(0);
  }

  skull.move();
  skull.axe.spinX(8);

}


function runningAverage(arr, newVal) {
  if (arr.length > 0) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    sum += newVal;
    sum -= arr[0];
    arr.push(newVal);
    arr.shift();
    return sum / arr.length;
  }
  else {
    arr.push(newVal);
    return newVal;
  }
  
}


// a function to detect wrist movement and move the wheel
function moveWheel() {
   // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    let leftWrist = pose.leftWrist;
    let rightWrist = pose.rightWrist;

    // console.log(leftWrist, rightWrist);

    // right and left wrists are the objects given by the model
    let rx = rightWrist.x;
    let ry = rightWrist.y;
    let lx = leftWrist.x;
    let ly = leftWrist.y;
    
    // vertical and horizontal distance
    let dy = ly - ry;
    let dx = lx - rx;
    
    let newtheta = Math.atan2(dy, dx); // range (-PI, PI]
    newtheta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    
    // if considerable change in theta, update
    if (Math.abs(newtheta - theta) > 4) {
      theta = newtheta;
      // push to array
      if (averageThetas.length < 10) {
        averageThetas.push(theta);
      }
    }

    theta = runningAverage(averageThetas, theta);

    // mappedTheta = map(theta, 25, -25, -4, 4);

    // right condition
    if(theta < -25) {
        mappedTheta += 0.2;
        toRight = true;
        toLeft = false;
    } else if(toRight) {
        toRight = false;
    }
    
    // left condition
    if(theta > 25) {
        mappedTheta -= 0.2;
        toLeft = true;
        turningRight = false;
    } else if(toLeft) {
        toLeft = false;
    }

    // check edges 
    if (mappedTheta > 4.4) {
      mappedTheta = 4.4;
    }
    if (mappedTheta < -4.4) {
      mappedTheta = -4.4;
    }
    
  }
}


class movingSkull {
  constructor(x, y, z, speed) {
    this.speed = speed;

    // let this.lane be a random number between -1 and 1 (left, middle, right) 
    this.lane = (Math.floor(Math.random() * 3) - 1) * 3;

    this.demon = new Container3D({x: this.lane, y: y, z: z});

    world.add(this.demon);

    // 3d model
    this.skull = new GLTF({
      asset: 'skull_gltf',
      x: 0,
      y: 2,
      z: 0,
      scaleX:0.5,
      scaleY:0.5,
      scaleZ:0.5,
    });
    this.demon.addChild(this.skull);

    this.axe = new OBJ({
      asset: 'axe_obj',
      mtl: 'axe_mtl',
      x: -1.5,
      y: 4,
      z: -1.5,
      rotationZ:90,
      rotationX:90,
      scaleX:0.3,
      scaleY:0.3,
      scaleZ:0.3,
      
    });
    this.demon.addChild(this.axe);
  }

  move() {
    let mpz = this.demon.z;
    if (mpz < 0.5) {
      this.demon.setPosition(this.lane, -2, mpz + this.speed);
    }
    if (mpz >= 0.5) {
      this.demon.setPosition(this.lane, -2, skullXcoord);
      // randmoize the lane again
      this.lane = (Math.floor(Math.random() * 3) - 1) * 3;
      if (gameOver == false){
        if (!hit) {
          score += 1;
          pointsLost = 0;
          skyCue = true;
          correct.play();
          if (song.isPlaying() == false) {
            song.play();
          }
        }
        else{
          score -= 1;
          pointsLost += 1;
          skyCue = false;
          if (wrong.isPlaying() == false && song.isPlaying() == true) {
            wrong.play();
          }
          song.pause();
        }
      }
      else {
        skyCue = false;
      }
    }
  }

  checkLane() {
    let userPos = world.getUserPosition();
  
    if (this.demon.z > 0.5) {
      if (userPos.x < this.lane + 1.5 && userPos.x > this.lane - 1.5) {
        console.log("HIT");
        return true;
      }
      else {
        console.log("MISS");
        return false;
      }
    }
    else {
      return false;
    }
  }
}

function checkEdges() {
  let userPos = world.getUserPosition();
  let currZ = userPos.z;

  if (userPos.x < -4.5) {
    world.setUserPosition(-4.5, 1, currZ);
  }
  else if (userPos.x > 4.5) {
    world.setUserPosition(4.5, 1, currZ);
  }
  // else if (userPos.z < -4.5) {
  //   world.setUserPosition(currX, 1, -4.5);
  // }
  // else if (userPos.z > 4.5) {
  //   world.setUserPosition(currX, 1, 4.5);
  // }
}

class Tiles {
  constructor(x, y, z) {

    this.myBox = null;

    this.myBox = new Plane({
      x: x, y: y, z: z,
      width: 3, height: 3, depth: 3,
      asset: 'purpbox',
      rotationX: -90, metalness: 0.25
    });

    world.add(this.myBox);
  }

}

  class MovingPlatform {
	constructor() {
	  this.tiles = [];
	  this.plats = [];
  
	  // make 9 boxes in a 3x3 grid on the ground
	  for (let x = -1; x <= 1; x++) {
		for (let z = -6; z <= 6; z++) {
		  const tile = new Tiles(x * 3, 0, z * 3);
		  this.tiles.push(tile);
		}
	  }

	  this.speed = 0.2; // adjust the speed of the platform here
	}
  
	update() {
	  // move the tiles forward
	  for (let i = 0; i < this.tiles.length; i++) {
		const tile = this.tiles[i];
		tile.myBox.nudge(0, 0, this.speed);
		if (tile.myBox.getZ() > 13.5) {
		  tile.myBox.nudge(0, 0, -27);
		}
	  }
	}
}
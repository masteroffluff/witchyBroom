const gameState = {
  width: 512,
  height: 640,
  debug: false,
};
var isClicking = false;

// prevent addressbar on mobile
window.addEventListener("load", function () {
  // Set a timeout...
  setTimeout(function () {
    // Hide the address bar!
    window.scrollTo(0, 1);
  }, 0);
});

class GameScene extends Phaser.Scene {
  constructor() {
    super("Level");
  }
  preload() {
    this.load.image("mySpriteSheet", "./witch.png");
  }
  create() {
    gameState.active = false;

    const texture = this.textures.get("mySpriteSheet");

    // Manually add frames from the sheet
    texture.add("witch", 0, 0, 0, 31, 31); // x=0, y=0, width=32, height=32
    texture.add("skull", 0, 32, 0, 32, 32); // x=32, y=0, width=32, height=32
    texture.add("logo", 0, 0, 32, 160, 32); // x=0, y=32, width=160, height=32
    texture.add("star", 0, 64, 0, 5, 5); // x=0, y=32, width=160, height=32

    let graphics = this.add.graphics();
    graphics.fillStyle(0x0, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture("building", 32, 32);
    graphics.clear();
    this.add
      .image(gameState.width / 2, 40, "mySpriteSheet", "logo")
      .setScale(2)
      .setDepth(999);
    this.spaceBar = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

	

    this.stars = this.physics.add.group();
    for (let i = 0; i < 300; i++) {
      const star = this.stars.create(0, 0, "mySpriteSheet", "star");
      star.body.allowGravity = false;
      star.setRandomPosition();
      star.body.setVelocityX(Phaser.Math.Between(-10, -20));
      star.depth = -999;
    }
	this.buildings=this.physics.add.group();
	for (let i = 0; i < gameState.height/32+1; i++) {
		const building = this.buildings.create(i*32, gameState.height-40, "building");
		building.setScale(1,Phaser.Math.Between(50,150)/100)
		building.setOrigin(1,1)
		building.body.allowGravity = false;
		building.body.setVelocityX(-40);
		building.depth = 999;
	  }


    this.skulls = this.physics.add.group();
    let hole = Phaser.Math.Between(2, gameState.height / 64 - 3);

	gameState.active = true
	let wallCount = 0
    this.player = this.physics.add.sprite(50, 300, "mySpriteSheet", "witch");
    this.player.setScale(2);
    this.player.setCollideWorldBounds(true);
    const makeWalls = () => {
      for (let y = 0; y < gameState.height / 64-1; y++) {
        if (y === hole || y === hole + 1) {
          continue;
        }
        const skull = this.skulls.create(
          gameState.width + 10,
          y * 64,
          "mySpriteSheet",
          "skull"
        );
        skull.setOrigin(0);
        skull.body.allowGravity = false;
        skull.setScale(2);
        skull.body.setVelocityX(-40);
      }
	  
      hole = Phaser.Math.Between(
        Math.max(hole - 3, 2),
        Math.min(hole + 3, gameState.height / 64 - 2)
      );
	  wallCount++
    };
	function getTimer(){
		if(wallcount >= 20){

		}
	}
    this.time.addEvent({
      callback: makeWalls,
      delay: 7500,
      callbackScope: this,
      loop: true,
    });
	makeWalls()
  }

  update() {
	if(gameState.active){
    if (Phaser.Input.Keyboard.JustDown(this.spaceBar)) {
      this.player.setVelocityY(-200);
    }
    if (!this.input.activePointer.isDown && isClicking == true) {
      this.player.setVelocityY(-200);
      isClicking = false;
    } else if (this.input.activePointer.isDown && isClicking == false) {
      isClicking = true;
    }
}
    this.stars.children.each((star) => {
      if (star.x < 0) {
        star.x = gameState.width + 10;
        star.setRandomPosition(gameState.width, 0, 10, gameState.height);
        star.setVelocityX = Phaser.Math.Between(-10, -20);
      }
    });
	this.skulls.children.each((skull) =>{
		if(skull.x<-skull.width*2){
			skull.destroy()
		}
	})
	this.buildings.children.each((building) =>{
		if(building.x<-building.width*2){
			building.x = gameState.width
		}
	})
  }
}
var config = {
  type: Phaser.AUTO,
  width: 500,
  height: 600,
  backgroundColor: "222288",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      enableBody: true,
      debug: gameState.debug,
    },
  },
  scale: {
    // Fit to window
    mode: Phaser.Scale.FIT,
    // Center vertically and horizontally
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene],
};

game = new Phaser.Game(config);

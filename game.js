WebFontConfig = {
  google: { families: ["Creepster"] },
};
(function () {
  var wf = document.createElement("script");
  wf.src =
    ("https:" == document.location.protocol ? "https" : "http") +
    "://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
  wf.type = "text/javascript";
  wf.async = "true";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(wf, s);
})();
const textFormat =  {
	fontFamily: "Creepster",
	fontSize: 36,
	color: "#aa0000",
  }
// above taken from https://phasergames.com/using-google-fonts-phaser/


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
    this.load.spritesheet("buildings", "./buildings.png", {
      frameWidth: 32,
      frameHeight: 64,
    });
  }
  create() {
    gameState.active = false;

    const texture = this.textures.get("mySpriteSheet");

    // Manually add frames from the sheet
    texture.add("witch", 0, 0, 0, 31, 31); // x=0, y=0, width=32, height=32
    texture.add("skull", 0, 32, 0, 32, 32); // x=32, y=0, width=32, height=32
    texture.add("logo", 0, 0, 32, 160, 32); // x=0, y=32, width=160, height=32
    texture.add("star", 0, 64, 0, 5, 5); // x=0, y=64, width=5, height=5

    let graphics = this.add.graphics();
    graphics.fillStyle(0x0, 1);
    graphics.fillRect(0, gameState.height - 32, gameState.width, 32);
    graphics.depth = 500;
    graphics.generateTexture('bottom', gameState.width, 32);
	const floor = this.physics.add.staticGroup();
	floor.create(gameState.width / 2, gameState.height, 'bottom')

    // graphics.generateTexture("building", 32, 32);
    // graphics.clear();
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
    this.buildings = this.physics.add.group();
    for (let i = 0; i < gameState.width / 32 + 4; i++) {
      const building = this.buildings.create(
        i * 32,
        gameState.height - 24,
        "buildings"
      );
      //building.setScale(1,Phaser.Math.Between(50,150)/100)
      building.setOrigin(1, 1);
      building.setFrame(Phaser.Math.Between(0, 10));
      building.flipX = Phaser.Math.Between(0, 1) === 0;
      building.body.allowGravity = false;
      building.body.setVelocityX(-40);
      building.depth = 999;
    }

    this.skulls = this.physics.add.group();
    let hole = Phaser.Math.Between(2, gameState.height / 64 - 3);

    gameState.active = true;
    this.wallCount = 0;

    this.player = this.physics.add.sprite(50, 300, "mySpriteSheet", "witch");
    this.player.setScale(2);
	
	this.player.body.setSize(this.player.width/2, this.player.height/2);
	this.player.body.setOffset(this.player.width / 4, this.player.height / 4);

    this.player.setCollideWorldBounds(true);
	this.score = 0
	this.scoreText = this.add.text(gameState.width/2,100,"Score:0",textFormat).setShadow(2, 2, '#6abe30', 10, true, true)
	this.scoreText.setOrigin(0.5,0.5)
	this.time.addEvent({
		callback: ()=>{
			if(gameState.active){
			this.score++
			this.scoreText.setText(`Score:${this.score}`)
			}
		},
		delay: 1000,
		callbackScope: this,
		loop: true,
	})


    const gameEnd = () => {
      gameState.active = false;
      this.player.destroy();
      this.add.text(150, 200, "Ding Dong, you died.\n Happy Halloween! \n\n\n\n\n CLick to continue", textFormat).setShadow(2, 2, '#6abe30', 10, true, true);;
      this.physics.pause();
	  this.input.on('pointerup', () => {
		this.scene.restart();
	  })
 
    };
    this.physics.add.overlap(this.player, this.skulls, gameEnd);
	this.physics.add.collider(this.player, floor, gameEnd);

    const makeWalls = () => {
      for (let y = 0; y < gameState.height / 64 ; y++) {
        if (y === hole || y === hole + 1) {
          continue;
        }
        const skull = this.skulls.create(
          gameState.width + 10,
          y * 64,
          "mySpriteSheet",
          "skull"
        );
        skull.setOrigin(0,0);
		skull.body.setSize(skull.width/2)
        skull.body.allowGravity = false;
        skull.setScale(2);
        skull.body.setVelocityX(-40);
      }

      hole = Phaser.Math.Between(
        Math.max(hole - 3, 2),
        Math.min(hole + 3, gameState.height / 64 - 2)
      );
      this.wallCount++;
    };
    const getTimer=()=> {
      if (this.wallcount >= 3) {
		return 5000
      } else {
		return 7500
	  }
    }
    this.time.addEvent({
      callback: makeWalls,
      delay: getTimer(),
      callbackScope: this,
      loop: true,
    });
    makeWalls();
  }

  update() {
    if (gameState.active) {
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
    this.skulls.children.each((skull) => {
      if (skull.x < -skull.width * 2) {
        skull.destroy();
      }
    });
    this.buildings.children.each((building) => {
      if (building.x < -building.width * 2) {
        building.x = gameState.width + 64;
        building.setFrame(Phaser.Math.Between(0, 10));
        building.flipX = Phaser.Math.Between(0, 1) === 0;
      }
    });
  }
}
var config = {
  type: Phaser.AUTO,
  width: gameState.width,
  height: gameState.height,
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

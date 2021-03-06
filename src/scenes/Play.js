// Points Breakdown -----------
//      Create a new spaceship type (w/ new artwork) that's smaller, moves faster, and is worth more points (20)
//      Implement a new timing/scoring mechanism that adds time to the clock for successful hits (20)
//      Implement mouse control for player movement and mouse click to fire (20)
//      Use Phaser's particle emitter to create a particle explosion when the rocket hits the spaceship (20)
//      Create and implement a new weapon (w/ new behavior and graphics) (20)
// --------------------------------------------------------------------------------
//      Total = 100
class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.image('specialSpaceship', './assets/specialSpaceship.png');
        this.load.image('particle', './assets/particle.png');
        // load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
    }

    create() {
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);

        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        // white borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);

        // add Rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket', 0, 0).setOrigin(0.5, 0);
        this.p1Rocket2 = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket', 0, 1).setOrigin(0.5, 0);
        this.p1Rocket3 = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket', 0, -1).setOrigin(0.5, 0);

        // add Spaceships (x3) + 1 Special Spaceship
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0);
        this.specialSpaceship = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*6, 'specialSpaceship', 0, 50, 5).setOrigin(0,0);

        // define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

//      I referenced this video for particles.
//      https://www.youtube.com/watch?v=JSrafZXuehQ&ab_channel=MitchellHudson
        this.particles = this.add.particles('particle');
        this.emitter = this.particles.createEmitter({
            x: 400,
            y: 300,
            speed: 200,
            lifespan: 500,
            blendMode: 'ADD',
            scale: {start: 1, end: 0},
            on: false
        });

        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        // initialize score
        this.p1Score = 0;

        // display score
        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig);
        // GAME OVER flag
        this.gameOver = false;

        // 60-second play clock
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ??? to Menu', scoreConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);
        
        this.timeLeft = this.add.text(borderUISize*5 + borderPadding * 2, borderUISize + borderPadding*2, Math.trunc(this.clock.getElapsedSeconds()), scoreConfig);
        console.log(this.clock.delay);
    }

    update() {
        // check key input for restart / menu
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.time.now = 0;
            this.scene.restart();
        }

        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }

        this.starfield.tilePositionX -= 4;  // update tile sprite
        this.timeLeft.text = Math.trunc(this.clock.getElapsedSeconds());
        if(!this.gameOver) {
            this.p1Rocket.update();             // update p1
            this.p1Rocket2.update();
            this.p1Rocket3.update();
            this.ship01.update();               // update spaceship (x3)
            this.ship02.update();
            this.ship03.update();
            this.specialSpaceship.update();
        }
        // check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
        if (this.checkCollision(this.p1Rocket, this.specialSpaceship)) {
            this.p1Rocket.reset();
            this.shipExplode(this.specialSpaceship);
        }
        
        if(this.checkCollision(this.p1Rocket2, this.ship03)) {
            this.p1Rocket2.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket2, this.ship02)) {
            this.p1Rocket2.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket2, this.ship01)) {
            this.p1Rocket2.reset();
            this.shipExplode(this.ship01);
        }
        if (this.checkCollision(this.p1Rocket2, this.specialSpaceship)) {
            this.p1Rocket2.reset();
            this.shipExplode(this.specialSpaceship);
        }

        if(this.checkCollision(this.p1Rocket3, this.ship03)) {
            this.p1Rocket3.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket3, this.ship02)) {
            this.p1Rocket3.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket3, this.ship01)) {
            this.p1Rocket3.reset();
            this.shipExplode(this.ship01);
        }
        if (this.checkCollision(this.p1Rocket3, this.specialSpaceship)) {
            this.p1Rocket3.reset();
            this.shipExplode(this.specialSpaceship);
        }
    }

    checkCollision(rocket, ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
            rocket.x + rocket.width > ship.x && 
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship. y) {
                return true;
        } else {
            return false;
        }
    }

    shipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0;                         
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');             // play explode animation
        boom.on('animationcomplete', () => {    // callback after anim completes
            ship.reset();                         // reset ship position
            ship.alpha = 1;                       // make ship visible again
            boom.destroy();                       // remove explosion sprite
        });
        // score add and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score; 
        this.clock.delay += this.p1Score * 1000;
        console.log(this.clock.delay);
        this.particles.emitParticleAt(ship.x, ship.y, 50);
        this.sound.play('sfx_explosion');
      }
}
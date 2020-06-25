const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const rows = 12;
const cols = 25;
const tileWidth = 50;
const tileHeight = 50;
const canvasWidth = tileWidth * cols;
const canvasHeight = tileHeight * rows;
const tileMap = create2dArray(rows, cols);
const ground = canvasHeight - 40;
const startX = canvasWidth / 2;
const startY = canvasHeight - 77;
const fontName = 'Bangers';
const second = 60;
const heartMaxGroundTime = second * 5;
const meteorMultiplier = 5;
const sizeMultiplier = 40;
const maxOnScreen = 5;
const collisionDetectionOffsetY = 5;
const collisionDetectionOffsetX = 20;
const heartSpeed = 1;
const pausedFontSize = 60;

let count = 0;
let paused = false;
let currentFrameLeft = 4;
let currentFrameRight = 0;
let currentDeathFrame = 0;
let animatingLeftDone = true;
let animatingRightDone = true;
let animatingWaveNumberDone = false;
let animatingDeath = false;
let incrementedWave = false;
let wave = 0;
let numOfMeteors = wave * meteorMultiplier;
let meteorsLeft = 0;
let meteorSpeed = 1;
let meteors = [];
let fires = [];
let fireTimer = 0;
let meteorsOnScreen = [];
let timerCount = 0;
let fontSizeTimer = 0;
let waveFontSize = 15;
let notDead = true;
let playing = true;
let gameOverTimer = 0;
let animatingGameOverDone = false;
let gameOverFontSize = 15;
let sessionHighScore = 0;
let hearts = [];
let heartSizeDown = false;
let heartSizeUp = false;
let heartSpeedTimer = 0;
let heartAddTimer = 0;

// Images
const dirtImage = new Image();
dirtImage.src = './assets/dirt.png';
const grassImage = new Image();
grassImage.src = './assets/grassy.png';
const cloudImage = new Image();
cloudImage.src = './assets/cloud.png';
const skyImage = new Image();
skyImage.src = './assets/bluesky.png';
const purpleGuyImage = new Image();
purpleGuyImage.src = './assets/purpleguy.png';
const meteorImage = new Image();
meteorImage.src = './assets/meteor.png';
const fireImage = new Image();
fireImage.src = './assets/fire.png';
const deathRightImage = new Image();
deathRightImage.src = './assets/deathfacingright.png';
const deathLeftImage = new Image();
deathLeftImage.src = './assets/deathfacingleft2.png';
const heartImage = new Image();
heartImage.src = './assets/heart.png';

// Animation Sheets
const meteorSprite = new SpriteSheet(meteorImage, 145, 18, 5, 1, 10);
const purpleGuySprite = new SpriteSheet(purpleGuyImage, 128, 23, 8, 1, 5);
const fireSprite = new SpriteSheet(fireImage, 115, 25, 5, 1, 10);
const deathRightSprite = new SpriteSheet(deathRightImage, 110, 23, 5, 1, 10);
const deathLeftSprite = new SpriteSheet(deathLeftImage, 110, 23, 5, 1, 10);

const imgArr = [dirtImage, grassImage, cloudImage, skyImage];

const direction = {
    right: false,
    left: false,
    standingRight: false,
    standingLeft: true
};

const player = {
    x: startX,
    y: startY,
    playerSpeed: 4,
    width: (tileWidth + 10),
    height: (tileHeight + 10),
    lives: 3,
    score: 0
};

window.addEventListener('keydown', e => {
    if (e.keyCode == 37) {
        direction.left = true;
        direction.standingLeft = false;
        direction.standingRight = false;
    }
    if (e.keyCode == 39) {
        direction.right = true;
        direction.standingLeft = false;
        direction.standingRight = false;
    }
    if (e.keyCode == 80) {
        paused ? paused = false : paused = true;
    }
});

window.addEventListener('keyup', e => {
    if (e.keyCode == 37) {
        direction.left = false;
        direction.standingLeft = true;
    }
    if (e.keyCode == 39) {
        direction.right = false;
        direction.standingRight = true;
    }
});

fillTileMap(tileMap);
console.log(tileMap);
styleAndCenterCanvas();
frame();

function create2dArray(rows, cols) {
    let arr = new Array(cols);
    for (let i = 0; i < arr.length; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

function styleAndCenterCanvas() {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.marginLeft = `${(window.innerWidth / 2) - (canvas.width / 2)}px`;
    canvas.style.border = '3px solid black';
}

function fillTileMap(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (j < 2) {
                let ran = Math.floor(Math.random() * 2);
                ran = ran == 0 ? 2 : 3;
                arr[i][j] = ran;
            } else if (j == arr[i].length - 1) {
                let ran = Math.floor(Math.random() * 2);
                arr[i][j] = ran;
            } else {
                arr[i][j] = 3;
            }
        }
    }
}

function initMeteorWave() {
    animatingWaveNumberDone = false;
    incrementedWave = false;
    numOfMeteors = wave * meteorMultiplier;
    let meteorMaxSize = wave * sizeMultiplier;
    meteorSpeed++;
    for (let i = 0; i < numOfMeteors; i++) {
        let size = getRandomNumber(30, meteorMaxSize);
        let nextMeteor = new Meteor(getRandomNumber(1, canvasWidth - size), -10, meteorSpeed, size, size * 0.62);
        meteors.push(nextMeteor);
    }
    meteorsLeft = meteors.length;
}

function animateWaveNumber() {
    fontSizeTimer++;
    if (fontSizeTimer == 2) {
        fontSizeTimer = 0;
        drawTextAlignCenter(`Wave ${wave}!`, waveFontSize, fontName, (canvasWidth / 2), canvasHeight / 2);
        waveFontSize++;
        if (waveFontSize == 60) {
            animatingWaveNumberDone = true;
            waveFontSize = 15;
        }
    } else {
        drawTextAlignCenter(`Wave ${wave}!`, waveFontSize, fontName, (canvasWidth / 2), canvasHeight / 2);
    }
}

function animateGameOver() {
    gameOverTimer++;
    if (gameOverTimer == 2) {
        gameOverTimer = 0;
        drawTextAlignCenter('Game Over!', gameOverFontSize, fontName, (canvasWidth / 2), canvasHeight / 2);
        gameOverFontSize++;
        if (gameOverFontSize == 60) {
            animatingGameOverDone = true;
            gameOverFontSize = 15;
        }
    } else {
        drawTextAlignCenter('Game Over!', gameOverFontSize, fontName, (canvasWidth / 2), canvasHeight / 2);
    }
}

function getRandomNumber(min, max) {
    let num = Math.floor((Math.random() * max) + min);
    return num;
}

function SpriteSheet(img, width, height, hMaxFrameLength, vMaxFrameLength, delay) {
    this.img = img;
    this.width = width;
    this.height = height;
    this.delay = delay;
    this.hMaxFrameLength = hMaxFrameLength;
    this.vMaxFrameLength = vMaxFrameLength;
    this.frameWidth = this.width / this.hMaxFrameLength;
    this.frameHeight = this.height / this.vMaxFrameLength;
}

function Sprite(x, y, startFrame, endFrame, spriteSheet) {
    this.x = x;
    this.y = y;
    this.startFrame = startFrame;
    this.endFrame = endFrame;
    this.spriteSheet = spriteSheet;
}

function Meteor(x, y, speed, width, height) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = width;
    this.height = height;
    this.currentFrame = 0;
    this.count = 0;
}

function Fire(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.currentFrame = 0;
    this.count = 0;
}

function Heart(x, y, speed, width, height) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.width = width;
    this.height = height;
    this.sizeChange = 0;
    this.heartSizeDown = false;
    this.heartSizeUp = false;
    this.onGround = false;
    this.groundTime = 0;
}

function performMeteorLogic() {
    if (meteors.length == 0) {
        if (meteorsOnScreen == 0) {
            fires = [];
            if (!incrementedWave) {
                wave++;
                incrementedWave = true;
            }
            if (!animatingWaveNumberDone) {
                animateWaveNumber();
            } else {
                initMeteorWave();
            }
        }
    } else {
        timerCount++;
        if (timerCount == second) {
            if (meteorsOnScreen.length < maxOnScreen) {
                meteorsOnScreen.push(meteors.pop());
                meteorsLeft = meteors.length;
            }
            timerCount = 0;
        }
    }
}

function performFireLogic() {
    if (fires.length > 0) {
        if (fireTimer == second) {
            fireTimer = 0;
            fires.shift();
        } else {
            fireTimer++;
        }
    }
}

function performHeartLogic() {
    heartAddTimer++;
    if (heartAddTimer == second) {
        heartAddTimer = 0;
        let ran = getRandomNumber(1, 100);
        if (ran <= 5) {
            hearts.push(new Heart(getRandomNumber(1, canvasWidth - tileWidth), -10, heartSpeed, tileWidth, tileHeight));
        }
    }

}

function animateHearts() {
    for (let i = 0; i < hearts.length; i++) {
        let nextHeart = hearts[i];
        if (nextHeart.sizeChange == 20) {
            nextHeart.heartSizeDown = true;
            nextHeart.heartSizeUp = false;
        } else if (nextHeart.sizeChange == 0) {
            nextHeart.heartSizeUp = true;
            nextHeart.heartSizeDown = false;
        }

        if (nextHeart.heartSizeDown) {
            nextHeart.sizeChange--;
            nextHeart.width = nextHeart.sizeChange + tileWidth;
            nextHeart.height = nextHeart.sizeChange + tileHeight;
        } else if (nextHeart.heartSizeUp) {
            nextHeart.sizeChange++;
            nextHeart.width = nextHeart.sizeChange + tileWidth;
            nextHeart.height = nextHeart.sizeChange + tileHeight;
        }
        ctx.drawImage(heartImage, 0, 0, heartImage.width, heartImage.height, nextHeart.x, nextHeart.y, nextHeart.width, nextHeart.height);
    }
}

function updateHeartsPosOnScreen() {
    for (let i = 0; i < hearts.length; i++) {
        let nextHeart = hearts[i];
        if (nextHeart.y < ground - 30) {
            nextHeart.y += nextHeart.speed;
        } else {
            nextHeart.y = ground - 30;
            if (!nextHeart.onGround) {
                nextHeart.onGround = true;
            }
        }
    }
}

function animateFires() {
    for (let i = 0; i < fires.length; i++) {
        let nextFire = fires[i];
        let frameX = nextFire.currentFrame;
        let sx = frameX * fireSprite.frameWidth;
        let sy = 0;
        let delay = fireSprite.delay;
        if (nextFire.count > delay) {
            nextFire.currentFrame++;
            nextFire.count = 0;
        } else {
            nextFire.count++;
        }
        if (nextFire.currentFrame == fireSprite.hMaxFrameLength) {
            nextFire.currentFrame = 0;
        }
        ctx.drawImage(fireSprite.img, sx, sy, fireSprite.frameWidth, fireSprite.frameHeight, nextFire.x, nextFire.y, nextFire.width, nextFire.height);
    }
}

function animateMeteors() {
    for (let i = 0; i < meteorsOnScreen.length; i++) {
        let nextMeteor = meteorsOnScreen[i];
        let frameX = nextMeteor.currentFrame;
        let sx = frameX * meteorSprite.frameWidth;
        let sy = 0;
        let delay = meteorSprite.delay;
        if (nextMeteor.count > delay) {
            nextMeteor.currentFrame++;
            nextMeteor.count = 0;
        } else {
            nextMeteor.count++;
        }
        if (nextMeteor.currentFrame == meteorSprite.hMaxFrameLength) {
            nextMeteor.currentFrame = 0;
        }
        ctx.drawImage(meteorSprite.img, sx, sy, meteorSprite.frameWidth, meteorSprite.frameHeight, nextMeteor.x, nextMeteor.y, nextMeteor.width, nextMeteor.height);
    }
}

function updateMeteorsPosOnScreen() {
    for (let i = meteorsOnScreen.length - 1; i >= 0; i--) {
        let nextMeteor = meteorsOnScreen[i];
        if (nextMeteor.y < ground) {
            nextMeteor.y += nextMeteor.speed;
        } else {
            nextMeteor.y = ground;
            fires.push(new Fire(nextMeteor.x, ground - 25, tileWidth, tileHeight));
            meteorsOnScreen.splice(i, 1);
            player.score++;
        }
    }
}

function drawPlayerSnapshot() {
    if (notDead) {
        if (direction.right) {
            let frameX = currentFrameRight;
            let sx = frameX * purpleGuySprite.frameWidth;
            let sy = 0;
            ctx.drawImage(purpleGuySprite.img, sx, sy, purpleGuySprite.frameWidth, purpleGuySprite.frameHeight, player.x, player.y, player.width, player.height);

        } else if (direction.left) {
            let frameX = currentFrameLeft;
            let sx = frameX * purpleGuySprite.frameWidth;
            let sy = 0;
            ctx.drawImage(purpleGuySprite.img, sx, sy, purpleGuySprite.frameWidth, purpleGuySprite.frameHeight, player.x, player.y, player.width, player.height);

        } else if (direction.standingRight) {
            drawStandingRight(player.x, player.y);

        } else if (direction.standingLeft) {
            drawStandingLeft(player.x, player.y);

        }

    } else {
        if (direction.standingRight) {
            let frameX = currentDeathFrame;
            let sx = frameX * deathRightSprite.frameWidth;
            let sy = 0;
            ctx.drawImage(deathRightSprite.img, sx, sy, deathRightSprite.frameWidth, deathRightSprite.frameHeight, player.x, player.y, player.width, player.height);

        } else {
            let frameX = currentDeathFrame;
            let sx = frameX * deathLeftSprite.frameWidth;
            let sy = 0;
            ctx.drawImage(deathLeftSprite.img, sx, sy, deathLeftSprite.frameWidth, deathLeftSprite.frameHeight, player.x, player.y, player.width, player.height);
        }
    }
}

function performPlayerLogic() {
    if (direction.right) {
        if (player.x < (canvasWidth - player.width)) {
            player.x += player.playerSpeed;
        } else {
            player.x = canvasWidth - player.width;
        }

        let frameX = currentFrameRight;
        let sx = frameX * purpleGuySprite.frameWidth;
        let sy = 0;
        let delay = purpleGuySprite.delay;
        if (count > delay) {
            currentFrameRight++;
            count = 0;
        } else {
            count++;
        }
        if (currentFrameRight > 3) {
            currentFrameRight = 0;
        }
        ctx.drawImage(purpleGuySprite.img, sx, sy, purpleGuySprite.frameWidth, purpleGuySprite.frameHeight, player.x, player.y, player.width, player.height);

    } else if (direction.left) {
        if (player.x > 0) {
            player.x -= player.playerSpeed;
        } else {
            player.x = 0;
        }

        let frameX = currentFrameLeft;
        let sx = frameX * purpleGuySprite.frameWidth;
        let sy = 0;
        let delay = purpleGuySprite.delay;
        if (count > delay) {
            currentFrameLeft++;
            count = 0;
        } else {
            count++;
        }
        if (currentFrameLeft == purpleGuySprite.hMaxFrameLength) {
            currentFrameLeft = 4;
        }
        ctx.drawImage(purpleGuySprite.img, sx, sy, purpleGuySprite.frameWidth, purpleGuySprite.frameHeight, player.x, player.y, player.width, player.height);
    } else if (direction.standingLeft) {
        drawStandingLeft(player.x, player.y);
    } else if (direction.standingRight) {
        drawStandingRight(player.x, player.y);
    }
}

function drawTileMap(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            let num = arr[i][j];
            ctx.drawImage(imgArr[num], i * tileWidth, j * tileHeight, tileWidth, tileHeight);
        }
    }
}

function drawStandingLeft(x, y) {
    let currentFrame = 4;
    let frameX = currentFrame;
    let sx = frameX * purpleGuySprite.frameWidth;
    let sy = 0;
    ctx.drawImage(purpleGuySprite.img, sx, sy, purpleGuySprite.frameWidth, purpleGuySprite.frameHeight, x, y, player.width, player.height);
}

function drawStandingRight(x, y) {
    ctx.drawImage(purpleGuySprite.img, 0, 0, purpleGuySprite.frameWidth, purpleGuySprite.frameHeight, x, y, player.width, player.height);
}

function drawDeathAnimation() {
    if (direction.standingLeft) {
        let frameX = currentDeathFrame;
        let sx = frameX * deathLeftSprite.frameWidth;
        let sy = 0;
        let delay = deathLeftSprite.delay;
        if (count > delay) {
            currentDeathFrame++;
            count = 0;
        } else {
            count++;
        }
        if (currentDeathFrame > deathLeftSprite.hMaxFrameLength) {
            currentDeathFrame = 0;
            animatingDeath = false;
        }
        ctx.drawImage(deathLeftSprite.img, sx, sy, deathLeftSprite.frameWidth, deathLeftSprite.frameHeight, player.x, player.y, player.width, player.height);
    } else {
        let frameX = currentDeathFrame;
        let sx = frameX * deathRightSprite.frameWidth;
        let sy = 0;
        let delay = deathRightSprite.delay;
        if (count > delay) {
            currentDeathFrame++;
            count = 0;
        } else {
            count++;
        }
        if (currentDeathFrame > deathRightSprite.hMaxFrameLength) {
            currentDeathFrame = 0;
            animatingDeath = false;
        }
        ctx.drawImage(deathRightSprite.img, sx, sy, deathRightSprite.frameWidth, deathRightSprite.frameHeight, player.x, player.y, player.width, player.height);
    }
}

function drawTextAlignCenter(text, size, font, x, y) {
    ctx.font = `${size}px ${font}`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

function drawText(text, size, font, x, y) {
    ctx.font = `${size}px ${font}`;
    ctx.textAlign = 'start';
    ctx.fillText(text, x, y);
}

function displayAllText() {
    drawText(`High Score: ${sessionHighScore}`, 20, fontName, 10, 25);
    drawText(`Wave: ${wave}`, 20, fontName, 10, 50);
    drawText(`Meteors Left: ${meteorsLeft}`, 20, fontName, 10, 75);
    drawText(`Lives: ${player.lives}`, 20, fontName, 10, 100);
    drawText(`Score: ${player.score}`, 20, fontName, 10, 125);
    drawText('[p] - pause', 20, fontName, canvasWidth - 100, 25);
}

function collisionDetection(elOne, elTwo) {
    if (((elOne.x + elOne.width - collisionDetectionOffsetX >= elTwo.x) && (elOne.x + collisionDetectionOffsetX <= elTwo.x + elTwo.width)) && ((elOne.y + elOne.height - collisionDetectionOffsetY >= elTwo.y) && (elOne.y + collisionDetectionOffsetY <= elTwo.y + elTwo.height))) {
        notDead = false;
        animatingDeath = true;
        return true;
    } else {
        return false;
    }
}

function heartCollisionDetection(elOne, elTwo) {
    if (((elOne.x + elOne.width - collisionDetectionOffsetX >= elTwo.x) && (elOne.x + collisionDetectionOffsetX <= elTwo.x + elTwo.width)) && ((elOne.y + elOne.height - collisionDetectionOffsetY >= elTwo.y) && (elOne.y + collisionDetectionOffsetY <= elTwo.y + elTwo.height))) {
        return true;
    } else {
        return false;
    }
}

function checkMeteorCollisions() {
    for (let i = 0; i < meteorsOnScreen.length; i++) {
        let currentMeteor = meteorsOnScreen[i];
        if (collisionDetection(player, currentMeteor)) {
            player.lives--;
        }
    }
}

function checkFireCollisions() {
    for (let i = 0; i < fires.length; i++) {
        let currentFire = fires[i];
        if (collisionDetection(player, currentFire)) {
            player.lives--;
        }
    }
}

function checkHeartCollisions() {
    for (let i = hearts.length - 1; i >= 0; i--) {
        let nextHeart = hearts[i];
        if (heartCollisionDetection(player, nextHeart)) {
            player.lives++;
            hearts.splice(i, 1);
        }
    }
}

function updateHeartGroundTime() {
    for (let i = hearts.length - 1; i >= 0; i--) {
        let nextHeart = hearts[i];
        if (nextHeart.onGround) {
            if (nextHeart.groundTime === heartMaxGroundTime) {
                hearts.splice(i, 1);
            } else {
                nextHeart.groundTime++;
            }
        }
    }
}

function gameOverLogic() {
    clear();
    drawTileMap(tileMap);
    animateMeteors();
    animateFires();
    animateHearts();
    displayAllText();


    if (!animatingGameOverDone) {
        animateGameOver();
    } else {
        resetAll();
    }
}

function resetPlayer() {
    player.x = startX;
    player.y = startY;
    notDead = true;
}

function resetWave() {
    meteors = [];
    meteorsOnScreen = [];
    fires = [];
    wave--;
    if (meteorSpeed > 1) {

        meteorSpeed--;
    }
}

function resetAll() {
    animatingGameOverDone = false;
    resetPlayer();
    resetWave();
    hearts = [];
    wave = 0;
    meteorSpeed = 1;
    player.lives = 3;
    if (player.score > sessionHighScore) {
        sessionHighScore = player.score;
        player.score = 0;
    } else {

        player.score = 0;
    }
}

function clear() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

function frame() {
    draw();
    requestAnimationFrame(frame);
}

function draw() {
    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    if (paused) {
        clear();
        drawTileMap(tileMap);
        animateMeteors();
        animateFires();
        animateHearts();
        drawPlayerSnapshot();
        displayAllText();
        drawTextAlignCenter('Paused', pausedFontSize, fontName, (canvasWidth / 2), canvasHeight / 2);
    } else {
        if (player.lives == 0) {
            gameOverLogic();
        } else {
            if (notDead) {
                clear();
                drawTileMap(tileMap);
                performPlayerLogic();
                performMeteorLogic();
                performFireLogic();
                performHeartLogic();
                animateMeteors();
                animateFires();
                animateHearts();
                updateMeteorsPosOnScreen();
                updateHeartsPosOnScreen();
                updateHeartGroundTime();
                checkMeteorCollisions();
                checkFireCollisions();
                checkHeartCollisions();
                displayAllText();
            } else {
                clear();
                drawTileMap(tileMap);
                animateMeteors();
                animateFires();
                animateHearts();
                displayAllText();
                if (animatingDeath) {
                    drawDeathAnimation();
                } else {
                    resetWave();
                    resetPlayer();
                }
            }
        }

    }

}

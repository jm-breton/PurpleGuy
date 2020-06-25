# About the project

Purple Guy is a 2d game in Javascript. I use the canvas element to draw a tile map which changes each time the page is reloaded. The tile images are positioned based on a somewhat random number generated for each index in the two-dimensional array. I made all images in Aseprite. The font I use in the game is loaded via webfontloader and is from google fonts.

The player, "Purple Guy", dodges asteroids by moving left or right. Asteroids come in waves with each wave having bigger, faster, and more asteroids than the last. Whenever an asteroid hits, it also causes a fire which if touched will cause the player to lose a life. Lives can be gained by collecting hearts. Hearts, however, disappear after a few seconds of being on the ground.

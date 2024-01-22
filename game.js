var map;
var player = {};
var enemies = [];
var items = [];

var width = 40;
var height = 24;

var gameField = $("#gameField");

$(document).ready(function () {
    initGame();
});

function initGame() {
    generateMap();
    placePlayer();
    placeEnemies(10);
    placeItems(2, "sword");
    placeItems(10, "health-potion");
    drawMap();
    setupControls();
}

function generateMap() {
    map = Array.from({ length: height }, () => Array(width).fill('#'));

    generateRooms();
    generatePassages();
}

function generateRooms() {
    var roomCount = getRandomInt(5, 10);

    for (var i = 0; i < roomCount; i++) {
        var roomWidth = getRandomInt(3, 8);
        var roomHeight = getRandomInt(3, 8);

        var roomX = getRandomInt(1, width - roomWidth - 1);
        var roomY = getRandomInt(1, height - roomHeight - 1);

        for (var y = roomY - 1; y < roomY + roomHeight + 1; y++) {
            for (var x = roomX - 1; x < roomX + roomWidth + 1; x++) {
                map[y][x] = '.';
            }
        }
    }
}

function placePlayer() {
    placeEntity(player, 'P');
}

function placeEnemies(count) {
    for (var i = 0; i < count; i++) {
        var enemy = {};
        placeEntity(enemy, 'E');
        enemies.push(enemy);
    }
}

function placeItems(count, type) {
    for (var i = 0; i < count; i++) {
        var item = { type: type };
        placeEntity(item, (type === 'sword') ? 'S' : 'H');
        items.push(item);
    }
}

function placeEntity(entity, symbol) {
    do {
        entity.x = getRandomInt(0, width);
        entity.y = getRandomInt(0, height);
    } while (map[entity.y][entity.x] !== '.');
    map[entity.y][entity.x] = symbol;
}

function drawMap() {
    gameField.empty();

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var tile = $("<div class='tile'></div>");

            switch (map[y][x]) {
                case "#":
                    tile.addClass("tile-wall");
                    break;
                case ".":
                    tile.addClass("tile-field");
                    break;
                case "P":
                    tile.addClass("tile-myhero");
                    break;
                case "E":
                    tile.addClass("tile-enemy");
                    break;
                case "S":
                    tile.addClass("tile-sword");
                    break;
                case "H":
                    tile.addClass("tile-potion");
                    break;
            }

            if (map[y][x] === 'E') {
                tile.append("<div class='health'></div>");
            }

            gameField.append(tile);
        }
    }
}

function setupControls() {
    $(document).keydown(function (e) {
        switch (e.which) {
            case 87: // W
                movePlayer(0, -1);
                break;
            case 65: // A
                movePlayer(-1, 0);
                break;
            case 83: // S
                movePlayer(0, 1);
                break;
            case 68: // D
                movePlayer(1, 0);
                break;
            case 32: // Space (attack)
                attack();
                break;
        }
        moveEnemies();
        checkGameConditions();
        drawMap();
    });
}

function movePlayer(dx, dy) {
    moveEntity(player, dx, dy, 'P');
}

function moveEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        var dx = getRandomInt(-1, 2);
        var dy = getRandomInt(-1, 2);
        moveEntity(enemies[i], dx, dy, 'E');
    }
}

function moveEntity(entity, dx, dy, symbol) {
    var newX = entity.x + dx;
    var newY = entity.y + dy;

    if (isValidMove(newX, newY)) {
        map[entity.y][entity.x] = '.';
        entity.x = newX;
        entity.y = newY;
        map[entity.y][entity.x] = symbol;
    }
}

function attack() {
    for (var i = 0; i < enemies.length; i++) {
        if (isAdjacent(player, enemies[i])) {
            reduceEnemyHealth(enemies[i]);
        }
    }
}

function reduceEnemyHealth(enemy) {
    var enemyHealth = 1;
    enemyHealth--;

    if (enemyHealth <= 0) {
        removeEnemy(enemy);
    }
}

function removeEnemy(enemy) {
    map[enemy.y][enemy.x] = '.';
    var index = enemies.indexOf(enemy);
    if (index !== -1) {
        enemies.splice(index, 1);
    }
}

function checkGameConditions() {
    for (var i = 0; i < items.length; i++) {
        if (items[i].x === player.x && items[i].y === player.y) {
            if (items[i].type === 'sword') {
                increaseAttackStrength();
            } else if (items[i].type === 'health-potion') {
                restorePlayerHealth();
            }
            map[player.y][player.x] = '.';
            items.splice(i, 1);
        }
    }

    for (var i = 0; i < enemies.length; i++) {
        if (isAdjacent(player, enemies[i])) {
            reducePlayerHealth();
            endGame();
            return;
        }
    }
}

function increaseAttackStrength() {
    player.attackStrength = (player.attackStrength || 0) + 1;
}

function restorePlayerHealth() {
    player.health = (player.health || 0) + 1;
}

function reducePlayerHealth() {
    player.health = (player.health || 0) - 1;
}

function endGame() {
    alert("Game Over! You were defeated by an enemy.");
    location.reload();
}

function isValidMove(x, y) {
    return x >= 0 && x < width && y >= 0 && y < height && map[y][x] !== "#";
}

function isAdjacent(entity1, entity2) {
    return Math.abs(entity1.x - entity2.x) <= 1 && Math.abs(entity1.y - entity2.y) <= 1;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePassages() {
    for (var i = 0; i < getRandomInt(3, 5); i++) {
        var passageX = getRandomInt(0, width);
        for (var y = 0; y < height; y++) {
            map[y][passageX] = '.';
        }
    }

    for (var i = 0; i < getRandomInt(3, 5); i++) {
        var passageY = getRandomInt(0, height);
        for (var x = 0; x < width; x++) {
            map[passageY][x] = '.';
        }
    }
}

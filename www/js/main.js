/* 難易度・アニメーション品質の取得・表示 */

var str = localStorage.getItem('parameters');
var parameters = JSON.parse(str);
var level = parameters.level;
var animation = parameters.animation;
document.write("<div style='position:absolute; left:5px; top:5px'>" + level + "<br>"
                + animation + "モード</div>");

switch(animation){
    case "きれい": 
        speed = 0.5;
    case "普通": 
        speed = 2;
    case "動作優先": 
        speed = 8;
}

/* カウントアップタイマーの設定 */
var count = 0;
function countup() {
    count++;
    document.form_count.counter.value = count;
}


/* canvasの初期設定 */
var canvas = document.getElementById('playField');
var ctx = canvas.getContext('2d');

function showObject(imgPath, x, y) {
    var img = new Image();
    img.src = imgPath;
    img.onload = function() {
        ctx.drawImage(img, x, y);
    }
}


/* オブジェクトの設定 */

var playField = {
    width: canvas.width, height: canvas.height
}

var ball = {
    x: 130, y: 250,
    width: 10, height: 10,
    speedx: -0.1*speed, speedy: 0.72*speed,
    reload: function(){
        ctx.clearRect(this.x, this.y, this.width, this.height);
        this.x += this.speedx;
        this.y += this.speedy;
        showObject(image['ball'], this.x,this.y);
    },
    speedUp: function(){
        this.speedx *= 1.2;
        this.speedy *= 1.2;
    }
};

var paddle = {
    x: 120, y: 450,
    width: 60, height: 10,
    buttonCount: 0,
    slide: function(direction){
        ctx.clearRect(this.x, this.y, this.width, this.height);
        if(direction == "right"){
            if(this.x + this.width + 20 <= playField.width) this.x += 20;
        }
        else{
            if(this.x >= 20) this.x -= 20;
        }
        showObject(image['paddle'], paddle.x, paddle.y);
    }
};

var Block = function(x, y, width, height, exist) {
    this.x; this.y;
    this.width = 30; this.height = 12;
    this.exist = false;
    this.erase = function(){
        ctx.clearRect(this.x, this.y, this.width, this.height);
    }
}

var block = new Array(12);
for(var i = 0; i < 12; i++){
    block[i] = new Array(9);
    for(var j = 0; j < 9; j++){
        block[i][j] = new Block;
        block[i][j].x = 20 + block[0][0].width * j;
        block[i][j].y = 50 + block[0][0].height * i;
    }
}

var image = {
    'ball'  : 'img/ball.png',
    'paddle': 'img/paddle.png',
    'RED'   : 'img/block_red.png',
    'YELLOW': 'img/block_gold.png',
    'GREEN' : 'img/block_green.png',
    'BLUE'  : 'img/block_blue.png',
    'WHITE' : 'img/block_silver.png'
};


/* レベル別設定 */

var color;
function initBlock(x, y, color){
    block[x][y].exist = true;
    showObject(image[color], block[x][y].x, block[x][y].y);
}

switch(level){
    case "LEVEL1":
        for(i = 4; i < 10; i++){
            if(i < 6)
                color = "RED";
            else if(i >= 6 && i < 8)
                color = "YELLOW";
            else
                color = "GREEN";
            for(j = 1; j < 8; j++)
                initBlock(i, j, color);
        }
        break;
    case "LEVEL2":
        var sum, dif;
        for(i = 1; i < 11; i++){
            for(j = 0; j < 9; j++){
                sum = i + j; dif = i - j;
                if(sum >= 4 && sum <= 14 && dif <= 6 && -dif <= 4)
                    initBlock(i, j, "BLUE");
            }
        }
        initBlock(5, 4, "RED");
        for(i = 7; i < 11; i++){
            for(j = 0; j < 9; j++){
                if((i + j == 15) || (i - j == 7))
                    initBlock(i, j, "RED");
            }
        }
        initBlock(2, 3, "WHITE"); initBlock(2, 5, "WHITE");
        initBlock(4, 3, "WHITE"); initBlock(4, 5, "WHITE");
        block[3][3].exist = false;    block[3][5].exist = false;
        block[4][1].exist = false;    block[4][7].exist = false;
        block[6][1].exist = false;    block[6][7].exist = false;
        block[7][3].exist = false;    block[7][5].exist = false;
        block[8][4].exist = false;
        initBlock(11, 4, "YELLOW");
        break;   
    case "LEVEL3":
        function GREENline(n){
            for(i = 1; i < 8; i++){
                initBlock(n, i, "GREEN");
                initBlock(i, n, "GREEN");
            }
        }
        GREENline(1); GREENline(7);
        for(i = 0; i < 9; i++){
            initBlock(4, i, "RED");
            initBlock(i, 4, "RED");
            initBlock(i, i, "BLUE");
            initBlock(i, 8-i, "BLUE");
        }
        initBlock(6, 3, "YELLOW"); initBlock(6, 5, "YELLOW");
        for(i = 9; i < 12; i++){
            for(j = 0; j < 9; j++){
                if(block[i-8][j].exist)
                    initBlock(i, j, "WHITE");
            }
        }
        break;
}


/* ゲーム本体 */

showObject(image['paddle'], paddle.x, paddle.y);

var timer = setInterval('countup()',1000);
gameID = setInterval('playGame()', 5*speed);

function playGame(){

    ball.reload();

    var ballLeft = ball.x,  ballRight  = ball.x + ball.width,  ballCenter = (ballLeft + ballRight) / 2;
    var ballTop  = ball.y,  ballBottom = ball.y + ball.height, ballMiddle = (ballTop + ballBottom) / 2;

    /* 壁跳ね返り */
    if(ballLeft <= 0 || ballRight >= playField.width){
        if(ball.speedx * ball.speedy > 0)
            ball.speedx = -ball.speedy;
        else
            ball.speedx = ball.speedy;
    }
    else if(ballTop <= 0){
        if(ball.speedx > 0)
            ball.speedy = ball.speedx;
        else
            ball.speedy = -ball.speedx;
    }

    var paddleLeft = paddle.x,  paddleRight  = paddle.x + paddle.width;
    var paddleTop  = paddle.y,  paddleBottom = paddle.y + paddle.height;

    /* パドル跳ね返り・ゲームオーバー */
    if(ballBottom >= paddleTop){
        if(paddleLeft <= ballRight && ballLeft <= paddleRight){
            ball.speedy = -ball.speedy;
            if(ballCenter < paddleLeft + 25){
                if (ball.speedx > 0)
                    ball.speedx = ball.speedy;
            }
            else if(paddleRight - 25 < ballCenter){
                if (ball.speedx < 0)
                    ball.speedx = -ball.speedy;
            }
        }
        else gameOver();
    }

    /* ブロック跳ね返り・消去 */
    LABEL: {

    for(i = 0; i < 12; i++){
        for(j = 0; j < 9; j++){
            if(block[i][j].exist){

                var blockLeft = block[i][j].x, blockRight = block[i][j].x + block[i][j].width;
                var blockTop = block[i][j].y,  blockBottom = block[i][j].y + block[i][j].height;
                
                if(ballCenter >= blockLeft && ballCenter <= blockRight){
                    if(ballTop < blockBottom && ballTop > blockTop
                        || ballBottom > blockTop && ballBottom < blockBottom){
                        block[i][j].exist = false;
                        ball.speedy = -ball.speedy;
                        break LABEL;
                    }
                }

                else if(ballMiddle <= blockBottom && ballMiddle >= blockTop){
                    if(ballLeft < blockRight && ballLeft > blockLeft
                        || ballRight > blockLeft && ballRight < blockRight){
                        block[i][j].exist = false;
                        ball.speedx = -ball.speedx;
                        break LABEL;
                    }
                }

            }
        }
    }

    }

    for(i = 0; i < 12; i++){
        for(j = 0; j < 9; j++){
            if(!block[i][j].exist){
                block[i][j].erase();
            }
        }
    }

    /* ゲームクリア */
    for(i = 0; i < 12; i++){
        for(j = 0; j < 9; j++){
            if(block[i][j].exist) return;
        }
    }
    gameClear();

}

function gameOver(){
    clearInterval(timer);
    clearInterval(gameID);
    alert("GAME OVER");
    localStorage.clear();
    location.href = 'index.html';
}

function gameClear(){
    clearInterval(timer);
    clearInterval(gameID);
    alert("GAME CLEAR!!\n所要時間は" + Math.floor(count / 60) + "分"　+ count % 60 + "秒です");
    localStorage.clear();
    location.href = 'index.html';
}

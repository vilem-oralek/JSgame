// proměnné
var gameStarted = false;
var w = window.innerWidth;
var h = window.innerHeight;
var score = 0;
var isReloading = false;
var reloadTime = 4000;
var setAmmo = 1;
var ammo = 1;
var intervals = {};
var isPaused = false;
var multiplyer = 1;
var time = 200;
var gameOver = false;
var multiplyerPrice = 100;
var ammoPrice = 50;
var reloadPrice = 75;

// proměnné označující elementy
var ally = document.getElementById("ally");
var enemyBlack1 = document.getElementById("enemy-black1");
var enemyGold = document.getElementById("enemy-gold");
var enemyBlack2 = document.getElementById("enemy-black2");
var enemyBlue = document.getElementById("enemy-blue");
var reloadMessage = document.getElementById("reload-message");
var upgradeStats = document.getElementById("upgrade-stats");
var upgradeScore = document.getElementById("upgrade-score");
var element = document.documentElement;

// start hry
function startGame(event){
    event.stopPropagation(); // kliknutí na tlačítko neudělá zvuk - kliknutí se nepřenáší na body
    gameStarted = true;
    document.getElementById("game-container").style.display = "block"; // zobrazení hry
    document.getElementById("start-button").style.display = "none";
    document.getElementById("tutorial").style.display = "none";
    // zobrazení a spuštění pohybu nepřátel
    spawn(ally);
    spawn(enemyBlack1);
    spawn(enemyBlack2);
    spawn(enemyGold);
    spawn(enemyBlue);
    movement(ally);
    movement(enemyBlack1);
    movement(enemyBlack2);
    movement(enemyGold);
    movement(enemyBlue);
    document.getElementById("ammo").innerHTML = "ammo: " + ammo + "/" + setAmmo; // zobrazení počet nábojů
    
    var checkWindowSize = setInterval(function(){ // loop pro kontrolování šířky okna
        w = window.innerWidth;
        h = window.innerHeight;
    },100)  

    var getTime = setInterval(function(){ // loop pro získání a obnovování času
        if(!isPaused) time -= 1;
        document.getElementById("time").innerHTML = "time: " + time/10;
        if (time <= 0){
            // po dojetí času konec hry
            document.getElementById("game-over").style.display = "block";
            for (let ID in intervals) {
                clearInterval(intervals[ID]); // zastavení všech intervalů
            }
            // schování nepotřebných objektů
            document.getElementById("stats").style.display = "none";
            enemyBlack1.style.display = "none";
            enemyBlack2.style.display = "none";
            enemyGold.style.display = "none";
            enemyBlue.style.display = "none";
            ally.style.display = "none";
            isPaused = true;
            gameOver = true;
        }
    }, 100)
}
// Vytvoření elementu crosshair
const crosshair = document.createElement('div');
crosshair.className = 'crosshair';
document.body.appendChild(crosshair);

// po pohybu myši se obnoví pozice crosshairu - crosshair je vždy na myši
document.addEventListener('mousemove', (event) => {
    crosshair.style.left = `${event.clientX - 16}px`; // vycentrování crosshairu na kurzor
    crosshair.style.top = `${event.clientY - 16}px`; 
});

document.addEventListener("click", function(event) { // funkce detekování trefy při kliknutí
    if (!gameStarted || isReloading || isPaused) return;
    //poloha kliknutí
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const objects = document.querySelectorAll(".object"); // sebrání všech objektů
    objects.forEach((obj) => {
        const rect = obj.getBoundingClientRect(); // získání pozice a velikost objektu

        if ( // kontrola zda bylo kliknutí v objektu
            mouseX >= rect.left &&
            mouseX <= rect.right &&
            mouseY >= rect.top &&
            mouseY <= rect.bottom) {
            // body za trefu - různé druhy = různý počet bodů a času
            if (obj.id === "enemy-black1") {
                score += 50 * multiplyer;
                time += 10;
            } else if (obj.id === "enemy-black2") {
                score += 50 * multiplyer;
                time += 10;
            }else if (obj.id === "enemy-blue") {
                score += 25 * multiplyer;
                time += 30;
            }else if (obj.id === "enemy-gold") {
                score += 500 * multiplyer;
                time += 50;
            } else if (obj.id === "ally") {
                score -= 100 * multiplyer;
                time -= 30;
            }
            // obnovení skóre
            document.getElementById("score").innerHTML = "score: " + score;
            spawn(obj);
        }
    });
});

function reload() {
    setTimeout(() => { // spoždění aby se zaznamenala poslední střela jako trefa
        isReloading = true;
    }, 1);
    reloadMessage.style.display = "block"; // nápis přebíjení
    setTimeout(() => { // přebíjení po dobu přebití
        reloadMessage.style.display = "none";
        ammo = setAmmo;
        document.getElementById("ammo").innerHTML = "ammo: " + ammo + "/" + setAmmo; // obnovení počtu nábojů
        isReloading = false;
    }, reloadTime);
}
function shot(){
    if (!isReloading && !isPaused && ammo > 0 && gameStarted === true){
        new Audio("gunshot.mp3").play(); // zvuk výstřelu
        ammo--;
        document.getElementById("ammo").innerHTML = "ammo: " + ammo + "/" + setAmmo; // obnovení počtu nábojů

        if (ammo === 0){ // automatické přebití
            reload();
        }
    }
}

function movement(element) { // funkce pohybu nepřátel
    if (!element.dx) { // získání rychlosti a úhlu pohybu - provedeno pouze jednou
        if (element.id === "enemy-gold") element.dx = 1.8; // jiné hodnoty pro jiné druhy
        else if (element.id === "ally") element.dx = 1.7;
        else element.dx = 1.2;
    }
    if (!element.dy) {
        if (element.id === "enemy-gold") element.dy = 1.8;
        else if (element.id === "ally") element.dy = 3;
        else element.dy = 1.2;
    }

    var elementId = element.id; // unikátní id pro elementy
    intervals[elementId] = setInterval(function () {
        // získání pozice a šířky nepřátel 
        var x = parseFloat(element.style.left);
        var y = parseFloat(element.style.top);
        var elementWidth = element.offsetWidth;
        var elementHeight = element.offsetHeight;

        // obrácení směru pohybu při dotyku stěny - odrazení
        if (x + elementWidth > w || x < 0) element.dx = -element.dx;
        if (y + elementHeight > h || y < 0) element.dy = -element.dy;

        // obnovení pozice nepřátel
        element.style.left = x + element.dx + "px";
        element.style.top = y + element.dy + "px";
    }, 1);
}
// pauznutí hry
function stopAllMovement() {
    for (let ID in intervals) {
        clearInterval(intervals[ID]); // zastavení všech intervalů
    }
    // ukázání paznutého menu
    isPaused = true;
    document.getElementById("upgrade-container").style.display = "flex";
    document.getElementById("stats").style.display = "none";
    upgradeStats.style.display = "flex";
    upgradeScore.style.display = "block";
    upgradeScore.innerHTML = "score: " + score;
    upgradeStats.innerHTML = "multiplyer: " + multiplyer + "X <br> max ammo: " + setAmmo + "<br> reload time: " + reloadTime + "ms";
}
// odpauznutí hry
function resumeAllMovement() {
    if(!gameOver){
        // zapnutí pohybů
        movement(ally);
        movement(enemyBlack1);
        movement(enemyBlack2);
        movement(enemyBlue);
        movement(enemyGold);
        //schování pauznutého menu
        document.getElementById("upgrade-container").style.display = "none";
        upgradeStats.style.display = "none";
        upgradeScore.style.display = "none";
        document.getElementById("stats").style.display = "block";
        isPaused = false
    }
}

function spawn(element){ // funkce přesunutí nepřátel na náhodné místo - při startu hry
    var elementWidth = element.offsetWidth;
    element.style.left = Math.floor(Math.random() * (w - elementWidth)) + "px";
    element.style.top = Math.floor(Math.random() * (h - elementWidth)) + "px";
}

function upgradeMultiplyer() { // vylepšení - více skóre a čaasu za zabití nepřítele
    if (score >= multiplyerPrice) { // pokud má hráč dost skóre
        score -= multiplyerPrice; // odečtení utraceného skóre
        multiplyer += 0.25;
        multiplyerPrice = Math.floor(multiplyerPrice * 1.5); // zdražení ceny
        document.getElementById("multiplyer-price").innerText = multiplyerPrice;
        document.getElementById("score").innerHTML = "score: " + score;
        console.log(multiplyer);
        updateUpgradeStats();
    } else {
        showNotification("Not enough score for this upgrade!");
    }
}

function upgradeAmmo() { // vylepšení - zvíšení počtu nábojů
    if (score >= ammoPrice) {
        score -= ammoPrice;
        setAmmo += 1;
        ammoPrice = Math.floor(ammoPrice * 1.5);
        document.getElementById("ammo-price").innerText = ammoPrice;
        document.getElementById("score").innerHTML = "score: " + score;
        console.log(setAmmo);
        updateUpgradeStats();
    } else {
        showNotification("Not enough score for this upgrade!");
    }
}

function upgradeReload() { // vylepšení - urychlení času na přebití
    if (score >= reloadPrice) {
        score -= reloadPrice;
        reloadTime = Math.floor(reloadTime * 0.85);
        reloadPrice = Math.floor(reloadPrice * 1.5);
        document.getElementById("reload-price").innerText = reloadPrice;
        document.getElementById("score").innerHTML = "score: " + score;
        console.log(reloadTime);
        updateUpgradeStats();
    } else {
        showNotification("Not enough score for this upgrade!"); // nápis nedostatečné skóre
    }
}

function updateUpgradeStats() { // při vylepšní se obnoví stav vylepšení a skóre
    upgradeStats.innerHTML = "multiplyer: " + multiplyer + "X <br> max ammo: " + setAmmo + "<br> reload time: " + reloadTime + "ms";
    upgradeScore.innerHTML = "Score: " + score;
}

function showNotification(message) { // ukázání výstražné zprávy po dobu dvou vteřin
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.style.display = "block";
    
    setTimeout(() => {
        notification.style.display = "none";
    }, 2000);
}

document.addEventListener('keydown', function(event) { 
    if (event.key === 'f' || event.key === 'F') { // režim celé obrazovky po stisknutí F
        if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari a Opera
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
    }
    }
    else if ((event.key === 'p' || event.key === 'P') && gameStarted == true){ // pauznutí hry po stisknutí P
        if (!isPaused) stopAllMovement();
        else resumeAllMovement();
    }
    else if ((event.key === 'r' || event.key === 'R') && !isPaused) reload(); // přebití po stisknutí R
});
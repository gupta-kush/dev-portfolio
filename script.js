const splashTexts = [
    "Hello World!",
    //"Creeper? Aww man.",
    //"Built by Kush!",
    //"A CS student approaches!"
];

const splash = document.getElementById("splash-text");
const pick = splashTexts[Math.floor(Math.random() * splashTexts.length)];
splash.textContent = pick;
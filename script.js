const splashTexts = [
    //"Now in JavaScript!",
    //"Hotter than the sun!",
    "Hello World!",
    //"CTRL + S to save!",
    //"Built by Kush!",
    "Creeper? Aww man.",
    //"A CS student approaches!"
  ];
  
  const splash = document.getElementById("splash-text");
  const pick = splashTexts[Math.floor(Math.random() * splashTexts.length)];
  splash.textContent = pick;
  
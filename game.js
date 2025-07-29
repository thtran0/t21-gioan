// reference to the canvas element from html
const canvas = document.getElementById("gameCanvas");
// 2d drawing context for canvas - where all drawing happens
const ctx = canvas.getContext("2d");

const BASE_WIDTH = 1536;
const BASE_HEIGHT = 695;
// const scale = Math.min(widthRatio, heightRatio);

canvas.width = window.innerWidth; // 1536
canvas.height = window.innerHeight; // 695

window.addEventListener("resize", () => {
  const prevWidth = canvas.width;
  const prevHeight = canvas.height;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const widthRatio = canvas.width / prevWidth;
  const heightRatio = canvas.height / prevHeight;

  player.x *= widthRatio;
  player.y *= heightRatio;
  player.width = (25 / BASE_WIDTH) * canvas.width;
  player.height = (32 / BASE_HEIGHT) * canvas.height;

  for (const member of teamMembers) {
    member.x = canvas.width * member.xRatio;
    member.y = canvas.height * member.yRatio;
    member.width = (25 / BASE_WIDTH) * canvas.width;
    member.height = (32 / BASE_HEIGHT) * canvas.height;
  }

  updateTeamPositions();
});



// load images
const map = new Image();
map.src = "assets/map.png";

const boundaries = new Image();
boundaries.src = "assets/boundaries.png";

// move later
const boundaryCanvas = document.createElement("canvas");
const boundaryCtx = boundaryCanvas.getContext("2d");

boundaries.onload = () => {
  boundaryCanvas.width = boundaries.width;
  boundaryCanvas.height = boundaries.height;
  boundaryCtx.drawImage(boundaries, 0, 0);

  updateTeamPositions();
  updatePlayerPosition();
  scaleSpriteSizes();

  gameLoop();
};

// helper: check if a pixel at (x, y) is non-transparent (blocked)
function isPixelBlocked(x, y) {
  const scaleX = boundaries.width / canvas.width;
  const scaleY = boundaries.height / canvas.height;

  const imageX = Math.floor(x * scaleX);
  const imageY = Math.floor(y * scaleY);

  const imageData = boundaryCtx.getImageData(imageX, imageY, 1, 1).data;
  return imageData[3] > 10; // alpha > 10 = blocked
}

const jesusSprites = {
  up: [new Image(), new Image()],
  down: [new Image(), new Image()],
  left: [new Image(), new Image()],
  right: [new Image(), new Image()],
};

jesusSprites.up[0].src = "assets/jesusBackUp.png";
jesusSprites.up[1].src = "assets/jesusBackDown.png";
jesusSprites.down[0].src = "assets/jesusFrontUp.png";
jesusSprites.down[1].src = "assets/jesusFrontDown.png";
jesusSprites.left[0].src = "assets/jesusLeftUp.png";
jesusSprites.left[1].src = "assets/jesusLeftDown.png";
jesusSprites.right[0].src = "assets/jesusRightUp.png";
jesusSprites.right[1].src = "assets/jesusRightDown.png";

let player = {
  xRatio: 0.295, // 750
  yRatio: 0.91, // 315
  speed: 2,
  width: 25,
  height: 32,
  direction: "down", // up, down, left, right
  step: 0,           // 0 or 1
  frameCount: 0      // for toggling animation
};

function updatePlayerPosition() {
  player.x = canvas.width * player.xRatio;
  player.y = canvas.height * player.yRatio;
}

function scaleSpriteSizes() {
  player.width = (25 / BASE_WIDTH) * canvas.width;
  player.height = (32 / BASE_HEIGHT) * canvas.height;

  for (const member of teamMembers) {
    member.width = (25 / BASE_WIDTH) * canvas.width;
    member.height = (32 / BASE_HEIGHT) * canvas.height;
  }
}

// keeps track of which arrow keys are pressed to move the player
let keys = {};
let showDialogue = false;
let dialogueText = "";

// team
// x / 1536
// y / 695
const teamMembers = [
  {
    name: "Henry",
    xRatio: 0.65, // 1000
    yRatio: 0.17, // 120
    width: 25,
    height: 32,
    bio: "\nHey there! I’m Henry, your soon-to-be Cấp 3 buddy. I’m from đoàn Tôma Thiện located in Toronto, ON. I brought a volleyball, but I forgot my pump. Could you help me find one? \nPope Francis often exclaimed, “Todos, todos, todos!” (Everyone, everyone, everyone!) at World Youth Day in 2023. That resonates with me. \nAre you hungry? Head to the kitchen for some snacks! I’ll be making dinner soon :)",
    img: new Image()
  },
  {
    name: "Gabriel",
    xRatio: 0.48, // 735
    yRatio: 0.16, // 110
    width: 25,
    height: 32,
    bio: "\nHeyo! I’m Gabriel, I hope you’re having fun! I’m in Vancouver, B.C. in đoàn Thánh Giuse with Thanh Mỹ. You know what they say, the West Coast is the best coast! \n“The Cross is the school of love,” says St. Maximilian Kolbe; I’m inclined to agree and live by this each day. \nDid you see a laundry room anywhere? We’ll be camping for 5 days!",
    img: new Image()
  },
  {
    name: "Aaron",
    xRatio: 0.28, // 430
    yRatio: 0.13, // 90
    width: 25,
    height: 32,
    bio: "\nHey! I’m Aaron. I hope you’re doing well! I’m a member of đoàn Emmanuel which is based in Olympia, WA. We’ve got a booming city and breathtaking hikes. What more could you ask for? \nMy favourite Bible verse is: Then Jesus, crying with a loud voice, said, “Father, into your hands I commend my spirit.” Having said this, he breathed his last. (Luke 23:46). \nHave you seen the TNTT logo by the front door? Looks like a good guy.",
    img: new Image()
  },
  {
    name: "Theresa",
    xRatio: 0.72, // 1100
    yRatio: 0.43, // 300
    width: 25,
    height: 32,
    bio: "\nHey there! My name is Theresa, think fast! What’s our đội name?! Good answer. I’m from đoàn Thánh Giuse like Gabriel and Thanh Mỹ, but my đoàn is based in Minneapolis, MN. \nI am deeply inspired by The Little Flower of Jesus, specifically her emphasis on spreading love. “What matters in life is not great deeds, but great love.” - St. Therese of Lisieux.\n I hope there are strawberries in the garden…",
    img: new Image()
  },
  {
    name: "Huong",
    xRatio: 0.735, // 1160
    yRatio: 0.65, // 450
    width: 25,
    height: 32,
    bio: "\nHiya! My name is Hường, pleased to meet you! I’m from đoàn Samuel in Saskatoon, SK. We’ve got beautiful fields and lots of land! \nI like to live by Isaiah 60:22, which reads, “At the right time, I, the Lord, will make it happen.” It keeps me hopeful! \nI’m sleepy. Do you need a sleeping bag? We have extra!",
    img: new Image()
  },
  {
    name: "Thanh My",
    xRatio: 0.55, // 820
    yRatio: 0.55, // 380
    width: 25,
    height: 32,
    bio: "\nHi! My name is Thanh Mỹ. What’s your name? Like Gabriel, I’m from đoàn Thánh Giuse in Vancouver, B.C. You should come visit sometime, we’ve got some beautiful bike trails. \nI like to reflect on 2 Corinthians 5:21, which reads, “For our sake he made him to be sin who did not know sin, so that we might become the righteousness of God in him.” \nTake a seat and grab a book whenever you need a break! Let me know if you need anything.",
    img: new Image()
  },
  {
    name: "Larry",
    xRatio: 0.37, // 565
    yRatio: 0.46, // 320
    width: 25,
    height: 32,
    // INCOMPLETE BIO
    bio: "\nS’up, I’m Larry. How’s the weather over there? I’m a member of đoàn Anrê Dũng Lạc, where we enjoy the weather in sunny Houston, TX. Have you ever had a real Texas BBQ? It’ll change your life. \nI’ll have to Jeremiah 29:11 reads, “For I know the plans I have for you,declares the LORD, “plans to prosper you and not to harm you, plans to give you hope and a future.” This is a beautiful promise, showing that God is in control and that He loves His children. \nI hope there’s WiFi here…",
    img: new Image()
  },
  {
    name: "Kim Thu",
    xRatio: 0.60, // 920
    yRatio: 0.86, // 600
    width: 25,
    height: 32,
    bio: "\nHello! My name is Kim Thư, it’s nice to meet you! I’m from đoàn Anrê Trông in Chantilly, VA. It’s really hot over here right now! \nMy favourite quote is by Mother Teresa, “Not all of us can do great things. But we can do small things with great love.” \nI wonder who’s cooking dinner. Will you be joining us?",
    img: new Image()
  },
  {
    name: "Huy",
    xRatio: 0.5, // 780
    yRatio: 0.91, // 630
    width: 25,
    height: 32,
    bio: "\nHowdy! I’m Huy, I hope you didn’t get lost! I’m a member of đoàn Da Minh Úy. You can find us in San Antonio, TX. We’ve got sunny skies and good vibes. \nAs a Huynh Trưởng, I like to serve with the wisdom of the world’s most popular Bible verse. For God so loved the world that he gave his only Son, so that everyone who believes in him may not perish but may have eternal life (John 3:16). \nIf anyone asks where I am, don’t tell them where I’m hiding!",
    img: new Image()
  },
  {
    name: "Hoang Long",
    xRatio: 0.35, // 530
    yRatio: 0.8, // 550
    width: 25,
    height: 32,
    bio: "\nGood day to you! My name is Long, and I’m excited to meet you in person! I’m from đoàn Anê Thành in beautiful Fountain Valley, CA. Meet me on the tennis courts whenever you’re free! \n When times get tough and challenging, I like to read Philippians 4:13 for a pick-me-up! “I can do all things through Christ who strengthens me.” So simple yet so powerful. \n Now if you’ll excuse me, I’m in a game of hide and seek.",
    img: new Image()
  },
  {
    name: "Veym",
    xRatio: 0.273,
    yRatio: 0.91,
    width: 32,
    height: 32,
    bio: "\n Welcome! \n You finally made it to Đội Gioan’s cabin. We are so excited for you to join us in the desert and journey together in our faith! But before then, be sure to say hi to all of our members and make yourself at home! \n Use the arrow keys to walk around and click on the HTs to meet each of us. Have fun and stay for as long as you like :)",
    img: new Image()
  }
];

teamMembers.forEach(member => {
  const filename = member.name.replace(/\s+/g, "").toLowerCase();
  member.img.src = `assets/${filename}.png`;
});

function updateTeamPositions() {
  for (const member of teamMembers) {
    member.x = canvas.width * member.xRatio;
    member.y = canvas.height * member.yRatio;
  }
}

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

canvas.addEventListener("click", (e) => {
  // calculates mouse position, loops through each member to
  // check whether it was clicked and if it is within distance
  // if so, display dialogue
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  showDialogue = false;

  for (const npc of teamMembers) {
    const clicked =
      mouseX >= npc.x &&
      mouseX <= npc.x + npc.width &&
      mouseY >= npc.y &&
      mouseY <= npc.y + npc.height;

    const dx = player.x - npc.x;
    const dy = player.y - npc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (clicked && distance < 40) {
      showDialogue = true;
      dialogueText = npc.bio;
      currentNPC = npc;
      break;
    }
  }
});

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Close dialogue with ESC or Space
  if (showDialogue && (e.key === "Escape" || e.key === " " || e.key == "Enter")) {
    showDialogue = false;
    dialogueText = "";
    currentNPC = null;
  }
});

function update() {
  let moved = false;
  let nextX = player.x;
  let nextY = player.y;

  if (keys["ArrowUp"]) {
    nextY -= player.speed;
    player.direction = "up";
    moved = true;
  }
  if (keys["ArrowDown"]) {
    nextY += player.speed;
    player.direction = "down";
    moved = true;
  }
  if (keys["ArrowLeft"]) {
    nextX -= player.speed;
    player.direction = "left";
    moved = true;
  }
  if (keys["ArrowRight"]) {
    nextX += player.speed;
    player.direction = "right";
    moved = true;
  }

  // NPC collision check
  let npcBlocked = teamMembers.some(npc =>
    rectsOverlap(nextX, nextY, player.width, player.height, npc.x, npc.y, npc.width, npc.height)
  );

  // Map pixel collision check (bounding box corners)
  let wallBlocked = false;
  for (let dx = 0; dx < player.width; dx += 4) {
    for (let dy = 0; dy < player.height; dy += 4) {
      const pixelX = Math.floor(nextX + dx);
      const pixelY = Math.floor(nextY + dy);
      if (isPixelBlocked(pixelX, pixelY)) {
        wallBlocked = true;
        break;
      }
    }
    if (wallBlocked) break;
  }

  if (!npcBlocked && !wallBlocked) {
    player.x = nextX;
    player.y = nextY;
  }

  // Animate if moved
  if (moved) {
    player.frameCount++;
    if (player.frameCount % 10 === 0) {
      player.step = (player.step + 1) % 2;
    }
  } else {
    player.step = 0;
    player.frameCount = 0;
  }
}


function draw() {
  // draws everything to the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(boundaries, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(map, 0, 0, canvas.width, canvas.height);

  // draw all team members
  for (const npc of teamMembers) {
    ctx.drawImage(npc.img, npc.x, npc.y, npc.width, npc.height);
  }

  // draw Jesus
  const currSprite = jesusSprites[player.direction][player.step];
  ctx.drawImage(currSprite, player.x, player.y, player.width, player.height);

  // draws player at current position, adds text if dialogue is active
  if (showDialogue && currentNPC) {
    const boxWidth = 400;
    const padding = 20;
    const lineHeight = 24;
    const wrappedLines = getWrappedTextLines(ctx, dialogueText, boxWidth - 2 * padding, lineHeight);

    const boxHeight = wrappedLines.length * lineHeight + 2 * padding;
    const boxX = (canvas.width - boxWidth) / 2;
    const boxY = (canvas.height - boxHeight) / 2;

    // background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // text
    ctx.fillStyle = "white";
    ctx.font = "20px 'Press Start 2P', monospace";

    let y = boxY + padding;
    for (const line of wrappedLines) {
      ctx.fillText(line, boxX + padding, y);
      y += lineHeight;
    }
  }
}

// check if two rectangles overlap (collision detection)
function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}

// wraps text to fit on screen
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function getWrappedTextLines(ctx, text, maxWidth, lineHeight) {
  const lines = [];
  const rawLines = text.split("\n"); // Split text by line breaks

  for (const rawLine of rawLines) {
    const words = rawLine.split(" ");
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(currentLine.trim());
        currentLine = words[i] + " ";
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.trim() !== "") {
      lines.push(currentLine.trim());
    }

    // add blank line between manual line breaks
    lines.push("");
  }

  // remove final empty line
  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines;
}

// update - handles game logic
// draw - renders each element
// requestAnimationFrame (external) - schedules next frame
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

// todos
// make dialogue look nicer
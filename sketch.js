// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let gameStarted = false;
let gameEnded = false;
let startButton;
let currentQuestionIndex = 0;
let score = 0;
let startTime;
let resultMessage = "";
let resultTimer = 0;
let showResult = false;

// 題目資料
const questions = [
  {
    text: "教育科技在未來十年最有可能改變哪一項教學元素？",
    options: ["A. 學科內容本身", "B. 教師的角色與教學方式", "C. 教室的地板設計"],
    answer: "B",
  },
  {
    text: "下列哪一項是虛擬實境（VR）與擴增實境（AR）在教育現場應用時常見的挑戰？",
    options: ["A. 學生對科技失去興趣", "B. 教材難以轉換為科技內容", "C. 設備與技術成本高"],
    answer: "C",
  },
  {
    text: "數位落差對學生有什麼主要影響？",
    options: ["A. 提高成績一致性", "B. 強化群體合作能力", "C. 造成學習機會與成果的不平等"],
    answer: "C",
  },
];

function preload() {
  // 初始化 HandPose 模型
  handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
  hands = results;
}

function setup() {
  if (typeof ml5 === "undefined") {
    console.error("ml5.js 未正確加載！");
    noLoop(); // 停止程式執行
    return;
  }

  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 初始化 HandPose 模型
  handPose = ml5.handPose(video, () => console.log("HandPose 模型已加載"));
  handPose.on("predict", gotHands);

  // 建立開始按鈕
  startButton = createButton("開始遊戲");
  startButton.position(width / 2 - 40, height / 2 - 20);
  startButton.size(100, 40);
  startButton.style("background-color", "#A6E1FA");
  startButton.style("color", "#001C55");
  startButton.style("font-size", "18px");
  startButton.style("border", "none");
  startButton.style("cursor", "pointer");

  startButton.mousePressed(() => {
    gameStarted = true;
    startTime = millis();
    startButton.hide();
  });
}

function draw() {
  background(220);
  image(video, 0, 0);

  // 繪製手勢關鍵點
  drawHandKeypoints();

  if (!gameStarted) {
    fill(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("請按下按鈕開始遊戲", width / 2, height / 2 - 50);
    return;
  }

  if (gameEnded) {
    displayGameOver();
    return;
  }

  if (showResult) {
    displayResult();
    return;
  }

  displayQuestion();
  checkAnswerCollision();
}

function drawHandKeypoints() {
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          fill(hand.handedness === "Left" ? "magenta" : "yellow");
          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }
      }
    }
  }
}

function displayQuestion() {
  let question = questions[currentQuestionIndex];
  fill(0);
  textSize(20);
  textAlign(LEFT, TOP);
  text(`題目 ${currentQuestionIndex + 1}: ${question.text}`, 50, 50);

  // 顯示選項
  for (let i = 0; i < question.options.length; i++) {
    let x = 100 + i * 150;
    let y = 300;
    fill(255, 0, 0);
    ellipse(x, y, 50);
    fill(0);
    textAlign(CENTER, CENTER);
    text(question.options[i], x, y + 40);
  }
}

function checkAnswerCollision() {
  if (hands.length > 0) {
    let hand = hands[0];
    let indexFinger = hand.annotations.indexFinger[3]; // 食指尖端座標
    let question = questions[currentQuestionIndex];

    for (let i = 0; i < question.options.length; i++) {
      let x = 100 + i * 150;
      let y = 300;
      let d = dist(indexFinger[0], indexFinger[1], x, y);
      if (d < 25) {
        if (question.options[i][0] === question.answer) {
          resultMessage = "正確！";
          score++;
        } else {
          resultMessage = "錯誤！";
        }
        showResult = true;
        resultTimer = millis();
      }
    }
  }
}

function displayResult() {
  fill(resultMessage === "正確！" ? "green" : "red");
  textSize(32);
  textAlign(CENTER, CENTER);
  text(resultMessage, width / 2, height / 2);

  if (millis() - resultTimer > 2000) {
    showResult = false;
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      gameEnded = true;
    }
  }
}

function displayGameOver() {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  let totalTime = ((millis() - startTime) / 1000).toFixed(2);
  text(`遊戲結束！總分：${score} 分`, width / 2, height / 2 - 20);
  text(`完成時間：${totalTime} 秒`, width / 2, height / 2 + 20);
}

"use strict";

// DevQuest question bank: no JSON file required.
const questions = [
  {
    category: "HTML",
    question: "Which HTML element creates a hyperlink?",
    options: ["<link>", "<a>", "<href>", "<url>"],
    answer: 1,
    hint: "Its name is a single letter."
  },
  {
    category: "CSS",
    question: "Which CSS property changes text color?",
    options: ["font-size", "color", "padding", "margin"],
    answer: 1,
    hint: "The property has the same name as the visual value."
  },
  {
    category: "JavaScript",
    question: "Which keyword declares a variable that can be reassigned?",
    options: ["const", "let", "static", "fixed"],
    answer: 1,
    hint: "It is a three-letter keyword."
  },
  {
    category: "HTML",
    question: "Which HTML element displays an image?",
    options: ["<image>", "<img>", "<src>", "<picture-src>"],
    answer: 1,
    hint: "It is a short, two-letter tag."
  },
  {
    category: "JavaScript",
    question: "Which command writes a message to the browser console?",
    options: [
      "console.log()",
      "print.page()",
      "show.console()",
      "message()"
    ],
    answer: 0,
    hint: "It begins with console."
  },
  {
    category: "CSS",
    question: "Which property creates space inside an element's border?",
    options: ["margin", "padding", "outline", "border"],
    answer: 1,
    hint: "It creates inner spacing."
  },
  {
    category: "JavaScript",
    question: "Which operator checks both value and type equality?",
    options: ["=", "==", "===", "!="],
    answer: 2,
    hint: "It contains three equal signs."
  },
  {
    category: "HTML",
    question: "Which attribute provides alternative text for an image?",
    options: ["title", "alt", "href", "class"],
    answer: 1,
    hint: "It is a three-letter attribute."
  },
  {
    category: "CSS",
    question: "Which CSS layout systems arrange elements into rows and columns?",
    options: [
      "Grid and Flexbox",
      "Font and Color",
      "Border and Outline",
      "Title and Alt"
    ],
    answer: 0,
    hint: "They are two popular modern CSS layout tools."
  },
  {
    category: "JavaScript",
    question: "Which array method adds an item to the end of an array?",
    options: ["pop()", "shift()", "push()", "slice()"],
    answer: 2,
    hint: "Think of pushing an item onto a stack."
  }
];

// Find HTML elements by their IDs.
const $ = (id) => document.getElementById(id);

const setupPanel = $("setup-panel");
const quizPanel = $("quiz-panel");
const resultPanel = $("result-panel");

let currentQuestion = 0;
let score = 0;
let xp = 0;
let streak = 0;
let timeLeft = 20;
let timerId = null;
let answered = false;
let hintUsed = false;
let fiftyUsed = false;
let lockedOptions = new Set();

function show(element) {
  element?.classList.remove("hidden");
}

function hide(element) {
  element?.classList.add("hidden");
}

function updateStats() {
  $("xp").textContent = xp;
  $("score").textContent = score;
  $("streak").textContent = streak;
  $("timer").textContent = `${timeLeft}s`;
}

function startQuiz() {
  clearInterval(timerId);

  currentQuestion = 0;
  score = 0;
  xp = 0;
  streak = 0;

  hide(setupPanel);
  hide(resultPanel);
  show(quizPanel);

  renderQuestion();
}

function renderQuestion() {
  clearInterval(timerId);

  if (currentQuestion >= questions.length) {
    finishQuiz();
    return;
  }

  answered = false;
  hintUsed = false;
  fiftyUsed = false;
  lockedOptions = new Set();
  timeLeft = 20;

  const q = questions[currentQuestion];

  $("question-count").textContent =
    `MISSION ${currentQuestion + 1} / ${questions.length}`;

  $("question-category").textContent = q.category;
  $("question").textContent = q.question;

  $("progress-text").textContent =
    `${currentQuestion + 1} of ${questions.length}`;

  $("progress-bar").style.width =
    `${(currentQuestion / questions.length) * 100}%`;

  $("feedback").textContent = "";
  $("feedback").className = "feedback";

  $("hint-text").textContent = "";
  hide($("hint-text"));

  $("hint-btn").disabled = false;
  $("fifty-btn").disabled = false;

  $("next-btn").disabled = true;
  $("next-btn").textContent =
    currentQuestion === questions.length - 1
      ? "View Results →"
      : "Next Mission →";

  const answersContainer = $("answers");
  answersContainer.replaceChildren();

  q.options.forEach((option, index) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "option-btn";
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;

    button.addEventListener("click", () => chooseAnswer(index));

    answersContainer.appendChild(button);
  });

  updateStats();
  startTimer();
}

function startTimer() {
  clearInterval(timerId);

  timerId = setInterval(() => {
    if (answered) {
      clearInterval(timerId);
      return;
    }

    timeLeft--;
    updateStats();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      finishCurrentQuestion(-1, true);
    }
  }, 1000);
}

function chooseAnswer(index) {
  if (answered || lockedOptions.has(index)) {
    return;
  }

  finishCurrentQuestion(index, false);
}

function finishCurrentQuestion(selectedIndex, timedOut) {
  if (answered) return;

  answered = true;
  clearInterval(timerId);

  const q = questions[currentQuestion];
  const isCorrect = selectedIndex === q.answer;

  const buttons = $("answers").querySelectorAll(".option-btn");

  buttons.forEach((button, index) => {
    button.disabled = true;

    if (index === q.answer) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("incorrect");
    }
  });

  if (timedOut) {
    streak = 0;
    showFeedback("⏰ Time is up! The correct answer is highlighted.", false);
  } else if (isCorrect) {
    score++;
    streak++;

    const bonus = streak > 1 ? 25 : 0;
    xp += 100 + bonus;

    showFeedback(
      bonus
        ? `⚡ Correct! +${100 + bonus} XP — ${streak}× combo!`
        : "✅ Correct answer! +100 XP",
      true
    );
  } else {
    streak = 0;
    showFeedback("❌ Not quite! Learn from it and keep going.", false);
  }

  $("hint-btn").disabled = true;
  $("fifty-btn").disabled = true;
  $("next-btn").disabled = false;

  updateStats();
}

function showFeedback(message, isCorrect) {
  const feedback = $("feedback");

  feedback.textContent = message;
  feedback.className = isCorrect
    ? "feedback correct"
    : "feedback incorrect";
}

function useHint() {
  if (answered || hintUsed) return;

  hintUsed = true;

  $("hint-text").textContent =
    `💡 Hint: ${questions[currentQuestion].hint}`;

  show($("hint-text"));
  $("hint-btn").disabled = true;
}

function useFiftyFifty() {
  if (answered || fiftyUsed) return;

  fiftyUsed = true;

  const correctIndex = questions[currentQuestion].answer;

  const wrongIndices = questions[currentQuestion].options
    .map((_, index) => index)
    .filter(index =>
      index !== correctIndex && !lockedOptions.has(index)
    );

  // Randomly eliminate two incorrect answers.
  for (let i = wrongIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrongIndices[i], wrongIndices[j]] =
      [wrongIndices[j], wrongIndices[i]];
  }

  wrongIndices.slice(0, 2).forEach(index => {
    lockedOptions.add(index);

    const button = $("answers").children[index];
    button.disabled = true;
    button.classList.add("eliminated");
  });

  $("fifty-btn").disabled = true;
}

function nextQuestion() {
  if (!answered) return;

  currentQuestion++;
  renderQuestion();
}

function finishQuiz() {
  clearInterval(timerId);

  hide(quizPanel);
  hide(setupPanel);
  show(resultPanel);

  const accuracy = Math.round((score / questions.length) * 100);

  $("final-score").textContent = `${score}/${questions.length}`;
  $("final-xp").textContent = xp;
  $("accuracy").textContent = `${accuracy}%`;

  let title;
  let badge;

  if (score === 10) {
    title = "Legendary Developer!";
    badge = "👑 LEGENDARY CODER";
  } else if (score >= 7) {
    title = "Mission Accomplished!";
    badge = "🚀 ELITE DEVELOPER";
  } else if (score >= 4) {
    title = "Rising Coder!";
    badge = "⚡ RISING DEVELOPER";
  } else {
    title = "Keep Training!";
    badge = "🌱 ROOKIE DEVELOPER";
  }

  $("result-title").textContent = title;
  $("rank-badge").textContent = badge;

  $("progress-bar").style.width = "100%";
}

function restartQuiz() {
  startQuiz();
}

// Connect every button to its function.
$("start-btn").addEventListener("click", startQuiz);
$("next-btn").addEventListener("click", nextQuestion);
$("hint-btn").addEventListener("click", useHint);
$("fifty-btn").addEventListener("click", useFiftyFifty);
$("restart-btn").addEventListener("click", restartQuiz);
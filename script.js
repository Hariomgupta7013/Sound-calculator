const calculationInput = document.getElementById("calculationInput");
const speakButton = document.getElementById("speakButton");
const calculateButton = document.getElementById("calculateButton");
const clearButton = document.getElementById("clearButton");
const expression = document.getElementById("expression");
const result = document.getElementById("result");
const status = document.getElementById("status");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = function () {
        speakButton.innerHTML = " Listening...";
        speakButton.classList.add("listening");
        status.innerText = "Listening... calculation bolo.";
    };

    recognition.onresult = function (event) {
        const speechText = event.results[0][0].transcript;
        calculationInput.value = speechText;
        status.innerText = "Calculation received.";
        calculate(speechText);
    };

    recognition.onerror = function (event) {
        status.innerText = "Voice input not found. Try again.";
    };

    recognition.onend = function () {
        speakButton.innerHTML = "Speak";
        speakButton.classList.remove("listening");
    };
} else {
    speakButton.disabled = true;
    speakButton.innerText = "Voice Not Supported";
    status.innerText = "Your browser does not support speech recognition.";
}

// SPEAK BUTTON

speakButton.addEventListener("click", function () {
    if (!recognition) {
        alert(
            "Speech recognition is not supported."
        );
        return;
    }
    recognition.start();
}
);

// CALCULATE BUTTON
calculateButton.addEventListener("click", function () {
    const text = calculationInput.value;
    calculate(text);
}
);


// ENTER KEY

calculationInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        calculate(calculationInput.value);
    }
}
);

// MAIN CALCULATOR
function calculate(text) {
    if (!text || text.trim() === "") {
        status.innerText =
            "Say or type the calculation first.";
        return;
    }
    expression.innerText = text;
    let calculation = convertToMath(text);
    try {
        // Security ke liye sirf allowed
        // mathematical characters allow karenge.
        if (!/^[0-9+\-*/().%\s]+$/.test(calculation)) {
            throw new Error(
                "Invalid calculation"
            );
        }

        const answer = Function('"use strict"; return (' + calculation + ')')();

        if (typeof answer !== "number" || !Number.isFinite(answer)) {
            throw new Error("Invalid result");
        }

        result.innerText = formatNumber(answer);
        status.innerText = "Calculation complete.";
        speakResult(answer);
    }

    catch (error) {
        result.innerText = "Error";
        status.innerText = "I didn't understand the calculation.";
    }
}

// VOICE/TEXT TO MATH

function convertToMath(text) {
    let value = text.toLowerCase();
    // Remove unnecessary words 
    value = value
        .replace(/what is/g, "")
        .replace(/calculate/g, "")
        .replace(/tell me/g, "")
        .replace(/equals/g, "")
        .replace(/equal to/g, "");

    // MULTIPLICATION
    value = value
        .replace(/multiplied by/g, "*")
        .replace(/multiply by/g, "*")
        .replace(/multiply/g, "*")
        .replace(/times/g, "*");

    // DIVISION 
    value = value
        .replace(/divided by/g, "/")
        .replace(/divide by/g, "/")
        .replace(/divide/g, "/");

    // ADDITION 
    value = value
        .replace(/plus/g, "+")
        .replace(/add/g, "+")
        .replace(/added to/g, "+");

    // SUBTRACTION 
    value = value
        .replace(/minus/g, "-")
        .replace(/subtract/g, "-")
        .replace(/subtracted from/g, "-");

    // SYMBOLS 
    value = value
        .replace(/×/g, "*")
        .replace(/x/g, "*")
        .replace(/÷/g, "/");

    // NUMBER WORDS 
    value = convertNumberWords(value);

    // Remove everything except math characters 
    value = value.replace(/[^0-9+\-*/().%\s]/g, "");

    // Multiple spaces remove 
    value = value.replace(/\s+/g, " ");
    return value.trim();
}

// NUMBER WORD CONVERTER 
function convertNumberWords(text) {
    const numbers = {
        zero: 0,
        one: 1,
        two: 2,
        three: 3,
        four: 4,
        five: 5,
        six: 6,
        seven: 7,
        eight: 8,
        nine: 9,
        ten: 10,

        eleven: 11,
        twelve: 12,
        thirteen: 13,
        fourteen: 14,
        fifteen: 15,
        sixteen: 16,
        seventeen: 17,
        eighteen: 18,
        nineteen: 19,

        twenty: 20,
        thirty: 30,
        forty: 40,
        fifty: 50,
        sixty: 60,
        seventy: 70,
        eighty: 80,
        ninety: 90
    };


    let words = text.split(/\s+/);
    let output = [];
    let currentNumber = 0;
    for (let word of words) {
        if (numbers.hasOwnProperty(word)) {
            currentNumber += numbers[word];
        }

        else if (word === "hundred") {
            currentNumber *= 100;
        }

        else {
            if (currentNumber !== 0) {
                output.push(currentNumber);
                currentNumber = 0;
            }
            output.push(word);
        }

    }


    if (currentNumber !== 0) {
        output.push(currentNumber);
    }
    return output.join(" ");

}

// FORMAT RESULT
function formatNumber(number) {
    if (Number.isInteger(number)) {
        return number.toString();
    }
    return Number(number.toFixed(10)).toString();

}

// SPEAK RESULT
function speakResult(number) {
    if (!window.speechSynthesis) {
        return;
    }
    window.speechSynthesis.cancel();

    const speech =  new SpeechSynthesisUtterance("The answer is " + number);
    speech.lang = "en-IN";
    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
}


// CLEAR BUTTON
clearButton.addEventListener("click", function () {
        calculationInput.value = "";
        expression.innerText = "Ready...";
        result.innerText =  "0";
        status.innerText = "Ready.";
        window.speechSynthesis.cancel();
    }
);

// EXAMPLE BUTTONS
const exampleButtons = document.querySelectorAll(".example-btn");
exampleButtons.forEach( function (button) {
        button.addEventListener("click", function () {
                const value = button.dataset.calculation;
                calculationInput.value = value;
                calculate(value);
            }
        );

    }
);


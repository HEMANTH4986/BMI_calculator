
"use strict";

// Select elements

const form = document.getElementById("bmi-form");

const result = document.getElementById("result");

const value = document.getElementById("bmi-value");

const category = document.getElementById("bmi-category");

const message = document.getElementById("bmi-message");

const error = document.getElementById("error");

let unit = "metric";


// Unit switching

const buttons = document.querySelectorAll(".unit-btn");

buttons.forEach(button => {

    button.addEventListener("click", () => {

        unit = button.dataset.unit;

        buttons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        document.getElementById("metric-fields")
            .classList.toggle("hidden", unit !== "metric");

        document.getElementById("imperial-fields")
            .classList.toggle("hidden", unit !== "imperial");

        result.classList.add("hidden");

        error.textContent = "";

    });

});


// BMI Calculation

form.addEventListener("submit", function(event) {

    event.preventDefault();

    error.textContent = "";

    let height;
    let weight;

    if (unit === "metric") {

        height = Number(document.getElementById("height-cm").value) / 100;

        weight = Number(document.getElementById("weight-kg").value);

    } else {

        const feet = Number(document.getElementById("height-ft").value);

        const inches = Number(document.getElementById("height-in").value);

        weight = Number(document.getElementById("weight-lb").value) * 0.45359237;

        height = (feet * 12 + inches) * 0.0254;

    }

    if (!Number.isFinite(height) || !Number.isFinite(weight) ||
        height <= 0 || weight <= 0) {

        error.textContent = "Please enter valid height and weight.";

        result.classList.add("hidden");

        return;

    }

    if (height < 0.5 || height > 2.6 || weight < 10 || weight > 500) {

        error.textContent = "Please enter realistic height and weight values.";

        result.classList.add("hidden");

        return;

    }

    const bmi = weight / (height * height);

    value.textContent = bmi.toFixed(1);

    let status;
    let msg;
    let key;

    if (bmi < 18.5) {

        status = "Underweight";
        msg = "Your BMI is below the normal range.";
        key = "Underweight";

    } else if (bmi < 25) {

        status = "Normal weight";
        msg = "Your BMI is within the normal range.";
        key = "Normal weight";

    } else if (bmi < 30) {

        status = "Overweight";
        msg = "Your BMI is above the normal range.";
        key = "Overweight";

    } else {

        status = "Obese";
        msg = "Your BMI is in the obese range.";
        key = "Obese";

    }

    category.textContent = status;

    message.textContent = msg;

    document.getElementById("healthy-range").textContent =
        "Healthy weight range: " +
        (18.5 * height * height).toFixed(1) +
        " kg – " +
        (24.9 * height * height).toFixed(1) + " kg";

    result.classList.remove("hidden");

    saveHistory(bmi, key);

});


// Recent Results

function saveHistory(bmi, status) {
    let history = [];

    try {
        history = JSON.parse(localStorage.getItem("bmi-history") || "[]");
    } catch (e) {
        history = [];
    }

    history.unshift({
        bmi: Number(bmi).toFixed(1),
        status: status,
        time: new Date().toLocaleString()
    });

    history = history.slice(0, 5);

    try {
        localStorage.setItem("bmi-history", JSON.stringify(history));
    } catch (e) {
        // storage unavailable; skip saving silently
    }

    displayHistory();
}

function displayHistory() {

    const list = document.getElementById("history-list");

    const empty = document.getElementById("history-empty");

    const history = JSON.parse(
        localStorage.getItem("bmi-history") || "[]"
    );

    list.innerHTML = "";

    empty.classList.toggle("hidden", history.length > 0);

    history.forEach(item => {

        const li = document.createElement("li");

        li.textContent =
            item.bmi + " - " + item.status + " (" + item.time + ")";

        list.appendChild(li);

    });

}


// Clear History

document.getElementById("clear-history")
    .addEventListener("click", () => {

        localStorage.removeItem("bmi-history");

        displayHistory();

    });


// Height Converter

const cm = document.getElementById("c-cm");

const ft = document.getElementById("c-ft");

const inch = document.getElementById("c-in");


cm.addEventListener("input", () => {

    const value = Number(cm.value);

    if (cm.value === "") {

        ft.value = "";
        inch.value = "";

        return;

    }

    const totalInches = value / 2.54;

    ft.value = Math.floor(totalInches / 12);

    inch.value = (totalInches % 12).toFixed(2);

});


function convertFeetInches() {

    if (ft.value === "" && inch.value === "") {

        cm.value = "";

        return;

    }

    const feet = Number(ft.value) || 0;

    const inches = Number(inch.value) || 0;

    cm.value = ((feet * 12 + inches) * 2.54).toFixed(2);

}

ft.addEventListener("input", convertFeetInches);

inch.addEventListener("input", convertFeetInches);


// Weight Converter

const kg = document.getElementById("c-kg");

const lb = document.getElementById("c-lb");


kg.addEventListener("input", () => {

    lb.value = kg.value === ""
        ? ""
        : (Number(kg.value) * 2.20462).toFixed(2);

});


lb.addEventListener("input", () => {

    kg.value = lb.value === ""
        ? ""
        : (Number(lb.value) / 2.20462).toFixed(2);

});


// Dark Mode

document.getElementById("theme-toggle")
    .addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const dark = document.body.classList.contains("dark");

        document.getElementById("theme-toggle").textContent =
            dark ? "☀️" : "🌙";

});


// Initial History Display

displayHistory();


// Reset

form.addEventListener("reset", () => {

    result.classList.add("hidden");

    error.textContent = "";

});

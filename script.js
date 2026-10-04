/* =========================================================
   MINDPULSE
   Frontend logic for FastAPI Mental Health Prediction API
   ========================================================= */

/*
 * Change ONLY this constant if your FastAPI server
 * runs somewhere else.
 */
const API_URL = "http://127.0.0.1:8000";


// =========================================================
// DOM ELEMENTS
// =========================================================

const form = document.getElementById("assessmentForm");

const steps = document.querySelectorAll(".form-step");

const stepLabel = document.getElementById("stepLabel");
const stepTitle = document.getElementById("stepTitle");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

const backButton = document.getElementById("backButton");
const continueButton = document.getElementById("continueButton");
const analyzeButton = document.getElementById("analyzeButton");

const apiError = document.getElementById("apiError");
const apiErrorText = document.getElementById("apiErrorText");

const analysisScreen = document.getElementById("analysisScreen");
const analysisProgressBar = document.getElementById("analysisProgressBar");
const analysisPercent = document.getElementById("analysisPercent");
const analysisStatus = document.getElementById("analysisStatus");

const resultsSection = document.getElementById("results");

const scoreNumber = document.getElementById("scoreNumber");
const scoreRing = document.getElementById("scoreRing");
const scoreLevel = document.getElementById("scoreLevel");
const scoreDescription = document.getElementById("scoreDescription");
const gaugeMarker = document.getElementById("gaugeMarker");

const retakeButton = document.getElementById("retakeButton");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");


// =========================================================
// APPLICATION STATE
// =========================================================

let currentStep = 1;

const totalSteps = 3;

const stepTitles = [
    "Personal Profile",
    "Digital Habits",
    "Lifestyle"
];

let latestFormData = null;


// =========================================================
// RANGE INPUTS
// =========================================================

const rangeInputs = [
    {
        input: document.getElementById("usageHours"),
        output: document.getElementById("usageHoursValue")
    },
    {
        input: document.getElementById("studyHours"),
        output: document.getElementById("studyHoursValue")
    },
    {
        input: document.getElementById("physicalActivity"),
        output: document.getElementById("physicalActivityValue")
    },
    {
        input: document.getElementById("sleepHours"),
        output: document.getElementById("sleepHoursValue")
    }
];


rangeInputs.forEach(({ input, output }) => {

    input.addEventListener("input", () => {
        output.textContent = `${Number(input.value).toFixed(1)} hrs`;
    });

});


// =========================================================
// STEP NAVIGATION
// =========================================================

function updateStepUI() {

    steps.forEach(step => {
        const stepNumber = Number(step.dataset.step);

        step.classList.toggle(
            "active",
            stepNumber === currentStep
        );
    });

    const percentage = Math.round(
        (currentStep / totalSteps) * 100
    );

    progressFill.style.width = `${percentage}%`;
    progressPercent.textContent = `${percentage}%`;

    stepLabel.textContent =
        `Step ${currentStep} of ${totalSteps}`;

    stepTitle.textContent =
        stepTitles[currentStep - 1];

    backButton.style.display =
        currentStep === 1 ? "none" : "inline-flex";

    if (currentStep === totalSteps) {
        continueButton.style.display = "none";
        analyzeButton.style.display = "inline-flex";
    } else {
        continueButton.style.display = "inline-flex";
        analyzeButton.style.display = "none";
    }

    window.scrollTo({
        top: document.getElementById("assessment").offsetTop - 90,
        behavior: "smooth"
    });
}


function goToNextStep() {

    clearApiError();

    if (!validateCurrentStep()) {
        return;
    }

    if (currentStep < totalSteps) {
        currentStep++;
        updateStepUI();
    }
}


function goToPreviousStep() {

    clearApiError();

    if (currentStep > 1) {
        currentStep--;
        updateStepUI();
    }
}


continueButton.addEventListener(
    "click",
    goToNextStep
);

backButton.addEventListener(
    "click",
    goToPreviousStep
);


// =========================================================
// VALIDATION HELPERS
// =========================================================

function setFieldError(fieldId, message) {

    const errorElement =
        document.getElementById(`${fieldId}Error`);

    const input =
        document.getElementById(fieldId);

    if (errorElement) {
        errorElement.textContent = message;
    }

    const field =
        input?.closest(".field");

    if (field) {
        field.classList.toggle(
            "invalid",
            Boolean(message)
        );
    }
}


function clearFieldError(fieldId) {

    setFieldError(fieldId, "");
}


function validateRequiredSelect(
    elementId,
    message = "Please select an option."
) {

    const element =
        document.getElementById(elementId);

    if (!element.value) {
        setFieldError(elementId, message);
        return false;
    }

    clearFieldError(elementId);
    return true;
}


function validateCurrentStep() {

    let valid = true;

    // -----------------------------------------------------
    // STEP 1
    // -----------------------------------------------------

    if (currentStep === 1) {

        const age =
            Number(document.getElementById("age").value);

        const ageInput =
            document.getElementById("age");

        if (
            !ageInput.value ||
            Number.isNaN(age) ||
            age < 10 ||
            age > 100
        ) {
            setFieldError(
                "age",
                "Age must be between 10 and 100."
            );

            valid = false;
        } else {
            clearFieldError("age");
        }


        if (
            !validateRequiredSelect(
                "gender",
                "Please select your gender."
            )
        ) {
            valid = false;
        }


        const country =
            document.getElementById("country").value.trim();

        if (!country) {

            setFieldError(
                "country",
                "Please enter your country."
            );

            valid = false;

        } else {

            clearFieldError("country");
        }


        if (
            !validateRequiredSelect(
                "academicLevel",
                "Please select your academic level."
            )
        ) {
            valid = false;
        }
    }


    // -----------------------------------------------------
    // STEP 2
    // -----------------------------------------------------

    if (currentStep === 2) {

        if (
            !validateRequiredSelect(
                "platform",
                "Please select your most used platform."
            )
        ) {
            valid = false;
        }


        if (
            !validateRequiredSelect(
                "purpose",
                "Please select your purpose of use."
            )
        ) {
            valid = false;
        }


        const usage =
            Number(document.getElementById("usageHours").value);

        if (
            Number.isNaN(usage) ||
            usage < 0 ||
            usage > 24
        ) {

            setFieldError(
                "usageHours",
                "Usage must be between 0 and 24 hours."
            );

            valid = false;

        } else {

            clearFieldError("usageHours");
        }


        const unlocksInput =
            document.getElementById("dailyUnlocks");

        const unlocks =
            Number(unlocksInput.value);

        if (
            unlocksInput.value === "" ||
            Number.isNaN(unlocks) ||
            unlocks < 0
        ) {

            setFieldError(
                "dailyUnlocks",
                "Daily unlocks must be 0 or greater."
            );

            valid = false;

        } else {

            clearFieldError("dailyUnlocks");
        }
    }


    // -----------------------------------------------------
    // STEP 3
    // -----------------------------------------------------

    if (currentStep === 3) {

        const study =
            Number(document.getElementById("studyHours").value);

        if (
            Number.isNaN(study) ||
            study < 0 ||
            study > 24
        ) {

            setFieldError(
                "studyHours",
                "Study hours must be between 0 and 24."
            );

            valid = false;

        } else {

            clearFieldError("studyHours");
        }


        const activity =
            Number(
                document.getElementById(
                    "physicalActivity"
                ).value
            );

        if (
            Number.isNaN(activity) ||
            activity < 0 ||
            activity > 24
        ) {

            setFieldError(
                "physicalActivity",
                "Activity must be between 0 and 24 hours."
            );

            valid = false;

        } else {

            clearFieldError("physicalActivity");
        }


        const sleep =
            Number(
                document.getElementById("sleepHours").value
            );

        if (
            Number.isNaN(sleep) ||
            sleep < 0 ||
            sleep > 24
        ) {

            setFieldError(
                "sleepHours",
                "Sleep must be between 0 and 24 hours."
            );

            valid = false;

        } else {

            clearFieldError("sleepHours");
        }


        const stress =
            document.querySelector(
                'input[name="Stress_Level"]:checked'
            );

        if (!stress) {

            setFieldError(
                "stressLevel",
                "Please select your stress level."
            );

            valid = false;

        } else {

            clearFieldError("stressLevel");
        }
    }

    return valid;
}


// =========================================================
// FORM VALIDATION BEFORE SUBMISSION
// =========================================================

function validateEntireForm() {

    const originalStep = currentStep;

    for (let step = 1; step <= totalSteps; step++) {

        currentStep = step;

        if (!validateCurrentStep()) {

            currentStep = step;
            updateStepUI();

            return false;
        }
    }

    currentStep = originalStep;
    updateStepUI();

    return true;
}


// =========================================================
// FORM DATA COLLECTION
// =========================================================

function collectFormData() {

    const stressElement =
        document.querySelector(
            'input[name="Stress_Level"]:checked'
        );

    return {
        Age: Number(
            document.getElementById("age").value
        ),

        Gender:
            document.getElementById("gender").value,

        Country:
            document.getElementById("country").value.trim(),

        Academic_Level:
            document.getElementById("academicLevel").value,

        Most_Used_Platform:
            document.getElementById("platform").value,

        Purpose_Of_Use:
            document.getElementById("purpose").value,

        Avg_Daily_Usage_Hours:
            Number(
                document.getElementById("usageHours").value
            ),

        Daily_Unlocks:
            Number(
                document.getElementById("dailyUnlocks").value
            ),

        Study_Hours:
            Number(
                document.getElementById("studyHours").value
            ),

        Physical_Activity_Hours:
            Number(
                document.getElementById("physicalActivity").value
            ),

        Sleep_Hours_Per_Night:
            Number(
                document.getElementById("sleepHours").value
            ),

        Stress_Level:
            stressElement.value
    };
}


// =========================================================
// API ERROR HANDLING
// =========================================================

function showApiError(message) {

    apiErrorText.textContent = message;

    apiError.classList.add("show");

    apiError.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}


function clearApiError() {

    apiError.classList.remove("show");
    apiErrorText.textContent = "";
}


// =========================================================
// ANALYSIS LOADING UI
// =========================================================

function startAnalysisAnimation() {

    let progress = 0;

    const messages = [
        "Preparing signals...",
        "Reading digital habits...",
        "Analyzing lifestyle patterns...",
        "Processing wellbeing indicators...",
        "Finalizing AI prediction..."
    ];

    let messageIndex = 0;

    analysisProgressBar.style.width = "0%";
    analysisPercent.textContent = "0%";
    analysisStatus.textContent = messages[0];

    const interval = setInterval(() => {

        progress += Math.random() * 7 + 2;

        if (progress >= 96) {
            progress = 96;
        }

        analysisProgressBar.style.width =
            `${progress}%`;

        analysisPercent.textContent =
            `${Math.round(progress)}%`;

        const newMessageIndex =
            Math.min(
                Math.floor(progress / 20),
                messages.length - 1
            );

        if (newMessageIndex !== messageIndex) {

            messageIndex = newMessageIndex;

            analysisStatus.textContent =
                messages[messageIndex];
        }

    }, 250);

    return interval;
}


function finishAnalysisAnimation(interval) {

    clearInterval(interval);

    analysisProgressBar.style.width = "100%";
    analysisPercent.textContent = "100%";

    analysisStatus.textContent =
        "Analysis complete.";
}


// =========================================================
// API REQUEST
// =========================================================

async function requestPrediction(payload) {

    const response = await fetch(
        `${API_URL}/predict`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(payload)
        }
    );

    if (!response.ok) {

        let errorData = null;

        try {
            errorData = await response.json();
        } catch {
            // Response was not JSON.
        }

        const error = new Error(
            getApiErrorMessage(
                response.status,
                errorData
            )
        );

        error.status = response.status;

        throw error;
    }

    return await response.json();
}


function getApiErrorMessage(status, errorData) {

    if (status === 422) {

        if (Array.isArray(errorData?.detail)) {

            return errorData.detail
                .map(item => {

                    const location =
                        Array.isArray(item.loc)
                            ? item.loc.join(" → ")
                            : "field";

                    return `${location}: ${item.msg}`;
                })
                .join(" | ");
        }

        return (
            errorData?.detail ||
            "Some submitted values are not accepted by the backend."
        );
    }


    if (status >= 500) {
        return "The prediction server encountered an error. Please try again.";
    }


    if (status === 404) {
        return "Prediction endpoint was not found. Please check your FastAPI route.";
    }


    if (status === 400) {
        return (
            errorData?.detail ||
            "The submitted data could not be processed."
        );
    }


    return (
        errorData?.detail ||
        `The server returned an unexpected error (${status}).`
    );
}


// =========================================================
// SUBMIT ASSESSMENT
// =========================================================

form.addEventListener("submit", async event => {

    event.preventDefault();

    clearApiError();

    if (!validateEntireForm()) {
        return;
    }

    const payload = collectFormData();

    latestFormData = payload;

    analyzeButton.classList.add("loading");

    analysisScreen.classList.add("show");

    document.body.style.overflow = "hidden";

    const animation =
        startAnalysisAnimation();

    try {

        const result =
            await requestPrediction(payload);

        finishAnalysisAnimation(animation);

        await wait(450);

        analysisScreen.classList.remove("show");

        document.body.style.overflow = "";

        analyzeButton.classList.remove("loading");

        displayResults(
            result.predicted_mental_health_score,
            payload
        );

    } catch (error) {

        clearInterval(animation);

        analysisScreen.classList.remove("show");

        document.body.style.overflow = "";

        analyzeButton.classList.remove("loading");

        handleApiError(error);
    }
});


// =========================================================
// API ERROR MESSAGE
// =========================================================

function handleApiError(error) {

    let message =
        "Something went wrong while connecting to the prediction service.";

    if (
        error instanceof TypeError &&
        error.message.includes("fetch")
    ) {

        message =
            "Unable to reach FastAPI. Make sure your backend is running at http://127.0.0.1:8000.";
    }

    else if (error.name === "TypeError") {

        message =
            "The backend could not be reached. Please check that FastAPI is running.";
    }

    else if (error.message) {

        message = error.message;
    }

    showApiError(message);
}


// =========================================================
// DISPLAY RESULTS
// =========================================================

function displayResults(score, data) {

    const numericScore =
        Number(score);

    if (
        !Number.isFinite(numericScore)
    ) {

        showApiError(
            "The backend returned an invalid wellbeing score."
        );

        return;
    }

    const safeScore =
        Math.max(
            0,
            Math.min(
                10,
                numericScore
            )
        );

    updateScoreVisualization(safeScore);

    updateSnapshot(data);

    generateRecommendations(data);

    resultsSection.classList.add("show");

    setTimeout(() => {

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);
}


// =========================================================
// SCORE VISUALIZATION
// =========================================================

function updateScoreVisualization(score) {

    const circumference = 578;

    const percentage = score / 10;

    const offset =
        circumference -
        circumference * percentage;

    scoreRing.style.strokeDashoffset =
        circumference;

    gaugeMarker.style.left =
        `${percentage * 100}%`;

    const level =
        getWellbeingLevel(score);

    scoreLevel.textContent =
        level.title;

    scoreDescription.textContent =
        level.description;

    setTimeout(() => {

        scoreRing.style.strokeDashoffset =
            offset;

        animateNumber(
            scoreNumber,
            0,
            score,
            1400
        );

    }, 100);
}


function animateNumber(
    element,
    start,
    end,
    duration
) {

    const startTime =
        performance.now();

    function update(currentTime) {

        const elapsed =
            currentTime - startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );

        const value =
            start +
            (end - start) * eased;

        element.textContent =
            value.toFixed(2);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}


function getWellbeingLevel(score) {

    if (score < 4) {

        return {
            title: "Needs Attention",

            description:
                "Based on the information provided, your predicted wellbeing score suggests there may be areas of your daily routine worth paying closer attention to."
        };
    }


    if (score < 7) {

        return {
            title: "Moderate",

            description:
                "Based on the information provided, your predicted wellbeing appears to be in a moderate range, with opportunities to improve daily balance."
        };
    }


    return {
        title: "Healthy",

        description:
            "Based on the information provided, your predicted wellbeing score is in a higher range. Maintaining balanced daily habits can help support your routine."
    };
}


// =========================================================
// SNAPSHOT
// =========================================================

function updateSnapshot(data) {

    document.getElementById("resultUsage")
        .textContent =
        `${Number(
            data.Avg_Daily_Usage_Hours
        ).toFixed(1)} hrs`;


    document.getElementById("resultUnlocks")
        .textContent =
        Number(
            data.Daily_Unlocks
        ).toLocaleString();


    document.getElementById("resultSleep")
        .textContent =
        `${Number(
            data.Sleep_Hours_Per_Night
        ).toFixed(1)} hrs`;


    document.getElementById("resultStudy")
        .textContent =
        `${Number(
            data.Study_Hours
        ).toFixed(1)} hrs`;


    document.getElementById("resultActivity")
        .textContent =
        `${Number(
            data.Physical_Activity_Hours
        ).toFixed(1)} hrs`;


    document.getElementById("resultStress")
        .textContent =
        data.Stress_Level;
}


// =========================================================
// LIFESTYLE RECOMMENDATIONS
// =========================================================

function generateRecommendations(data) {

    const grid =
        document.getElementById(
            "recommendationGrid"
        );

    const recommendations = [];

    const usage =
        Number(
            data.Avg_Daily_Usage_Hours
        );

    const sleep =
        Number(
            data.Sleep_Hours_Per_Night
        );

    const activity =
        Number(
            data.Physical_Activity_Hours
        );

    const study =
        Number(
            data.Study_Hours
        );

    const unlocks =
        Number(
            data.Daily_Unlocks
        );


    // Screen usage
    if (usage > 8) {

        recommendations.push({
            icon: "fa-mobile-screen-button",
            title: "Create Screen Breaks",
            text:
                "Your reported screen usage is relatively high. Consider taking short, regular breaks away from your devices throughout the day."
        });

    } else {

        recommendations.push({
            icon: "fa-mobile-screen-button",
            title: "Keep Digital Balance",
            text:
                "Your reported screen usage gives you a useful baseline. Continue being intentional about when and why you use digital platforms."
        });
    }


    // Sleep
    if (sleep < 7) {

        recommendations.push({
            icon: "fa-moon",
            title: "Protect Your Sleep",
            text:
                "You reported fewer than 7 hours of sleep. Consider maintaining a consistent bedtime and creating a calm wind-down routine."
        });

    } else {

        recommendations.push({
            icon: "fa-moon",
            title: "Maintain Your Sleep Routine",
            text:
                "Your reported sleep duration provides a useful foundation. Try to keep your sleep and wake times consistent."
        });
    }


    // Physical activity
    if (activity < 1) {

        recommendations.push({
            icon: "fa-person-running",
            title: "Add More Movement",
            text:
                "You reported limited physical activity. Small movement breaks, walking, stretching, or other enjoyable activity can help add balance to your day."
        });

    } else {

        recommendations.push({
            icon: "fa-person-running",
            title: "Keep Moving",
            text:
                "You already include physical activity in your routine. Keep finding enjoyable ways to stay active throughout the week."
        });
    }


    // Study
    if (study > 8) {

        recommendations.push({
            icon: "fa-book-open",
            title: "Balance Study Sessions",
            text:
                "Long study periods can become demanding. Consider structured breaks between focused sessions to create a more balanced routine."
        });

    } else {

        recommendations.push({
            icon: "fa-book-open",
            title: "Keep Study Sessions Balanced",
            text:
                "Your reported study time can be supported by focused sessions combined with regular breaks and downtime."
        });
    }


    // Unlocks
    if (unlocks > 80) {

        recommendations.push({
            icon: "fa-unlock-keyhole",
            title: "Reduce Habitual Checking",
            text:
                "Your reported unlock frequency is relatively high. Try grouping notifications or creating device-free periods to reduce unnecessary checking."
        });

    } else {

        recommendations.push({
            icon: "fa-unlock-keyhole",
            title: "Stay Intentional",
            text:
                "Continue paying attention to why you reach for your device. Intentional usage can help keep digital habits balanced."
        });
    }


    // Stress
    if (
        data.Stress_Level === "High" ||
        data.Stress_Level === "Very High"
    ) {

        recommendations.push({
            icon: "fa-heart",
            title: "Create Recovery Time",
            text:
                "You reported elevated stress. Consider building regular low-pressure periods into your day for rest, movement, hobbies, or time away from screens."
        });

    } else {

        recommendations.push({
            icon: "fa-heart",
            title: "Protect Your Balance",
            text:
                "Continue making room for activities that help you relax, recharge, and maintain a balanced daily routine."
        });
    }


    grid.innerHTML =
        recommendations
            .slice(0, 6)
            .map(item => {

                return `
                    <article class="recommendation-card">
                        <i class="fa-solid ${item.icon}"></i>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.text)}</p>
                    </article>
                `;

            })
            .join("");
}


// =========================================================
// RETAKE ASSESSMENT
// =========================================================

retakeButton.addEventListener(
    "click",
    resetAssessment
);


function resetAssessment() {

    form.reset();

    currentStep = 1;

    latestFormData = null;

    clearApiError();

    resultsSection.classList.remove("show");

    document.getElementById(
        "usageHoursValue"
    ).textContent = "6.0 hrs";

    document.getElementById(
        "studyHoursValue"
    ).textContent = "5.0 hrs";

    document.getElementById(
        "physicalActivityValue"
    ).textContent = "1.0 hrs";

    document.getElementById(
        "sleepHoursValue"
    ).textContent = "7.0 hrs";

    document.getElementById(
        "usageHours"
    ).value = 6;

    document.getElementById(
        "studyHours"
    ).value = 5;

    document.getElementById(
        "physicalActivity"
    ).value = 1;

    document.getElementById(
        "sleepHours"
    ).value = 7;

    scoreRing.style.strokeDashoffset = 578;

    scoreNumber.textContent = "0.00";

    gaugeMarker.style.left = "0%";

    document.body.style.overflow = "";

    updateStepUI();

    document.getElementById(
        "assessment"
    ).scrollIntoView({
        behavior: "smooth"
    });

    showToast(
        "Assessment reset. Let's start again."
    );
}


// =========================================================
// MOBILE NAVIGATION
// =========================================================

const mobileMenuButton =
    document.querySelector(".mobile-menu-btn");

const navLinks =
    document.querySelector(".nav-links");

mobileMenuButton.addEventListener(
    "click",
    () => {

        const isOpen =
            navLinks.classList.toggle("mobile-open");

        if (isOpen) {

            navLinks.style.display = "flex";

            navLinks.style.position = "absolute";
            navLinks.style.top = "68px";
            navLinks.style.left = "15px";
            navLinks.style.right = "15px";

            navLinks.style.flexDirection = "column";
            navLinks.style.alignItems = "stretch";

            navLinks.style.padding = "15px";

            navLinks.style.background =
                "rgba(255,255,255,.96)";

            navLinks.style.border =
                "1px solid rgba(20,83,45,.08)";

            navLinks.style.borderRadius = "16px";

            navLinks.style.boxShadow =
                "0 20px 50px rgba(22,101,52,.12)";

        } else {

            navLinks.removeAttribute("style");
        }
    }
);


// Close mobile menu after clicking a link.

document
    .querySelectorAll(".nav-links a")
    .forEach(link => {

        link.addEventListener(
            "click",
            () => {

                navLinks.classList.remove(
                    "mobile-open"
                );

                if (
                    window.innerWidth <= 850
                ) {
                    navLinks.removeAttribute("style");
                }
            }
        );
    });


// =========================================================
// UTILITY FUNCTIONS
// =========================================================

function wait(milliseconds) {

    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


function escapeHtml(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;
}


function showToast(message) {

    toastMessage.textContent =
        message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


// =========================================================
// INITIALIZATION
// =========================================================

updateStepUI();


// Clear individual validation errors while typing.

document
    .querySelectorAll(
        "input:not([type='radio']), select"
    )
    .forEach(element => {

        element.addEventListener(
            "input",
            () => {

                const fieldId =
                    element.id;

                if (fieldId) {
                    clearFieldError(fieldId);
                }

                clearApiError();
            }
        );

        element.addEventListener(
            "change",
            () => {

                const fieldId =
                    element.id;

                if (fieldId) {
                    clearFieldError(fieldId);
                }

                clearApiError();
            }
        );
    });


// Clear stress validation when selected.

document
    .querySelectorAll(
        'input[name="Stress_Level"]'
    )
    .forEach(radio => {

        radio.addEventListener(
            "change",
            () => {

                clearFieldError(
                    "stressLevel"
                );

                clearApiError();
            }
        );
    });
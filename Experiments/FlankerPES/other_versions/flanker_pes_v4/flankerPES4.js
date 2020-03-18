﻿/*
 Standard Flanker Task (with flanker -> targe tinterval) with 75% correct
 feedback, 25% false feedback VPs respond to the direction of the central
 arrow whilst ignoring the surrounding arrows using key responses ("C" and "M").
*/

///////////////// Exp Parameters ////////////////////////////////////////////
var numTrlsP = 48;
var numTrlsE = 96;
var numBlks = 13;
var fixDur = 500;
var fbDur = 1000;
var waitDur = 1000;
var fti = 100;
var iti = 500;
var tooFast = 150;
var tooSlow = 1000;
var fbTxt = ["Richtig", "Falsch", "Zu langsam", "Zu schnell"];
var nTrl = 1;
var nBlk = 1;
var respMapping = Math.round(Math.random()) + 1;

var respKeys;
var respDir;
if (respMapping === 1) {
    respKeys = ["C", "M", 27]
    respDir = ["left", "right", 27]
} else {
    respKeys = ["M", "C", 27]
    respDir = ["right", "left", 27]
}

///////////////// Functions //////////////////////////////////////////////////
function recordScreenSize() {
    "use strict";
    jsPsych.data.addProperties({
        screenHeight: screen.height,
        screenWidth: screen.width,
        aspectRatio: screen.width / screen.height
    });
}

var screenInfo = {
    type: "call-function",
    func: recordScreenSize,
    timing_post_trial: 50
};


function generateFlankerLetters() {
    "use strict";
    var vowel = ["A", "E", "O", "U"];
    var consonant = ["B", "H", "T", "S"];
    var letters = vowel.concat(consonant);
    letters = letters.sort(() => Math.random());
    var letterCombs = [];
    var i, j;
    var removed;
    for (i = 0; i < letters.length; i++) {
        removed = false;
        for (j = 0; j < letters.length; j++) {
            if (letters[i] !== letters[j]) { // e.g., no AAAAAA, EEEEEE
                continue;
            }
            if (!removed) {  // need to remove 1 incompatible combination
                if ((vowel.includes(letters[i])) && (consonant.includes(letters[j]))) {
                    removed = true;
                    continue;
                } else if ((vowel.includes(letters[j])) && (consonant.includes(letters[i]))) {
                    removed = true;
                    continue;
                }
            }
            letterCombs.push(letters[i] + letters[i] + letters[j] + letters[i] + letters[i]);
        }
    }
    return letterCombs;
}

//////////////////// Text Instructions ////////////////////////////////////////
var welcome = {
    type: "text",
    text: "<h1>Willkommen. Drücken Sie eine beliebige Taste, um fortzufahren!</h1>",
    on_finish: function () {
        jsPsych.data.addProperties({ date: new Date(), respMapping: respMapping });
    }
};

if (respMapping === 1) {
    respText = "<h2 align='center'>VOWEL = C Taste &nbsp &nbsp&nbsp&nbsp CONSONANT = M Taste</h2><br>";
} else {
    respText = "<h2 align='center'>CONSONANT = C Taste &nbsp &nbsp&nbsp&nbsp VOWEL = M Taste</h2><br>";
}

var instructions = {
    type: "text",
    text: "<h1 align='center'>Aufgabe:</h1>" +
        "<h2 align='center'>Reagieren Sie auf die mittleren Buchstabe:</h2><br>" +
        respText +
        "<h2 align='center'>Bitte reagieren Sie so schnell und korrekt wie möglich</h2><br>" +
        "<h2 align='center'>Drücken Sie eine beliebige Taste, um fortzufahren!</h2>",
    timing_post_trial: waitDur
};

/////////////////////////////// VP Info ///////////////////////////////////////
function genVpNum() {
    "use strict";
    var num = new Date();
    num = num.getTime();
    return num;
}
var vpNum = genVpNum();

function checkVpInfoForm() {
    // get age, gender, handedness and VPs consent
    "use strict";
    var age = document.getElementById("age").value;

    var gender = "";
    if ($("#male").is(":checked")) {
        gender = "male";
    } else if ($("#female").is(":checked")) {
        gender = "female";
    }

    var hand = "";
    if ($("#left").is(":checked")) {
        hand = "left";
    } else if ($("#right").is(":checked")) {
        hand = "right";
    }

    var consent = false;
    if ($("#consent_checkbox").is(":checked")) {
        consent = true;
    }

    if (consent && age !== "" && gender !== "" && hand !== "") {
        jsPsych.data.addProperties({ vpNum: vpNum, age: age, gender: gender, handedness: hand });
        return true;
    } else {
        window.alert("Bitte antworten Sie alle Fragen und klicken Sie auf die Zustimmungs box um weiter zumachen!");
        return false;
    }

}
var vpInfoForm = {
    type: "html",
    url: "vpInfoForm.html",
    cont_btn: "start",
    check_fn: checkVpInfoForm
};

/////////////////////////////// Stimuli ///////////////////////////////////////
var resize = {
    type: 'resize',
    item_width: 3 + 3 / 8,
    item_height: 2 + 1 / 8,
    prompt: "<p>Klicken Sie und ziehen Sie die untere rechte Ecke bis der Kasten die gleiche Größe wie eine Bankkarte oder Ihr Universitätsausweis hat.</p>",
    pixels_per_unit: 150
};

var fix = {
    type: "single-stim",
    stimulus: '<div class="fix">+</div>',
    is_html: true,
    timing_stim: fixDur,
    timing_response: fixDur,
    timing_post_trial: 0,
    response_ends_trial: false,
    data: { stim: "fix" }
};

function generateTargets(letters) {
    var flanker = [];
    var vowels = ["A", "E", "O", "U"];
    for (var i = 0; i < letters.length; i++) {
        var stim = "<div class='flank'>" + letters[i] + "</div>";
        if (vowels.includes(letters[i][2])) {
            var rd = respDir[0];
            var rk = respKeys[0];
        } else {
            rd = respDir[1];
            rk = respKeys[1];
        }
        if (letters[0] === letters[2]) {
            comp = "comp";
        } else {
            comp = "incomp";
        }
        var trial_dict = {
            type: "single-stim",
            stimulus: stim,
            is_html: true,
            timing_response: tooSlow,
            timing_post_trial: true,
            response_ends_trial: true,
            data: {
                stim: "target",
                letterArray: letters[i],
                respDir: rd,
                comp: comp,
                corrResp: rk
            }
        };
        flanker.push(trial_dict);
    }
    return flanker;
}

var trlFb = {
    type: "single-stim",
    stimulus: trialFeedbackTxt,
    is_html: true,
    timing_stim: fbDur,
    timing_response: fbDur,
    timing_post_trial: 0,
    response_ends_trial: false,
    data: { stim: "feedback" }
};

var interTrialInterval = {
    type: "single-stim",
    stimulus: '<div class="feedback">&nbsp;</div>',
    is_html: true,
    timing_stim: iti,
    timing_response: iti,
    timing_post_trial: 0,
    response_ends_trial: false,
    data: { stim: "iti" }
};

function trialFeedbackTxt() {
    var data = jsPsych.data.get().last(1).values()[0];
    return '<div class="feedback">' + fbTxt[data.corrCodeFB - 1] + '</div>';
}

function codeTrial() {
    var data = jsPsych.data.get().last(1).values()[0];
    var corrCode = 0;
    var corrCodeFB = 0;
    var corrKeyNum = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(data.corrResp);
    if (data.stim === "target") {
        if (data.key_press === corrKeyNum && data.rt > tooFast && data.rt < tooSlow) {
            corrCode = 1;
            corrCodeFB = (Math.random() >= 1) ? 2 : 1
        } else if (data.key_press !== corrKeyNum && data.rt > tooFast && data.rt < tooSlow) {
            corrCode = 2;
            corrCodeFB = (Math.random() >= 1) ? 1 : 2
        } else if (data.rt === -1) {
            corrCode = 3;
            corrCodeFB = 3;
        } else if (data.rt <= tooFast) {
            corrCode = 4;
            corrCodeFB = 4;
        }

        jsPsych.data.addDataToLastTrial({
            date: Date(),
            corrCode: corrCode,
            corrCodeFB: corrCodeFB,
            blockNum: nBlk,
            trialNum: nTrl
        })

        nTrl += 1;
    }
    if (data.key_press === 27) {
        jsPsych.endExperiment()
    }
}

function blockFeedbackTxt() {
    "use strict";
    var dat = jsPsych.data.get().filter({ stim: "target", blockNum: nBlk });
    var nTotal = dat.count();
    var nError = dat.select("corrCode").values.filter(function (x) { return x !== 1; }).length;
    dat = jsPsych.data.get().filter({ stim: "target", corrCode: 1 });
    var meanRT = dat.select("rt").mean();
    var fbTxtBlk = "<h1>Block: " + nBlk + " von " + numBlks + "</h1>" +
        "<h1>Mittlere Reaktionszeit: " + Math.round(meanRT) + " ms </h1>" +
        "<h1>Fehlerrate: " + Math.round((nError / nTotal) * 100) + " %</h1>" +
        "<h2>Drücken Sie eine beliebige Taste, um fortzufahren!</h2>";
    nBlk += 1;
    return fbTxtBlk;
}

var blkFb = {
    type: "text",
    timing_post_trial: waitDur,
    text: blockFeedbackTxt
};

var debrief = {
    type: "text",
    timing_post_trial: waitDur,
    text: "<h1>Das Experiment ist beendet.</h1>" +
        "<h2>Drücken Sie eine beliebige Taste, um das Experiment zu beenden!</h2>"
};

/////////////////////////////// Save Data /////////////////////////////////////
var writeDataFile = function () {
    "use strict";
    var fname = "flankerPES3_" + vpNum + ".csv";
    var data = jsPsych.data.get().filter({stim: "target"}).csv();
    $.ajax({
        type: "post",
        cache: false,
        url: "write_data.php",
        data: { filename: fname, filedata: data }
    });
};

var saveData = {
    type: "call-function",
    func: writeDataFile,
    timing_post_trial: 50
};

function clone(obj) {
    "use strict";
    if (null == obj || "object" != typeof obj) {
        return obj;
    }
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
            copy[attr] = obj[attr];
        }
    }
    return copy;
}

//////////////////// Generate experiment sequence /////////////////////////////
function genExpSeq() {
    "use strict";

    var letters = generateFlankerLetters();
    var target = generateTargets(letters);

    var blk;
    var trl;
    var stim;
    var exp = [];
    var targets;
    var block;

    //exp.push(welcome);
    //exp.push(vpInfoForm);
    //exp.push(resize);
    //exp.push(screenInfo);
    //exp.push(instructions);
    for (blk = 0; blk < numBlks; blk++) {

        stim = [];
        if (blk === 0) {
            targets = jsPsych.randomization.repeat(target, numTrlsP / target.length);
        } else {
            targets = jsPsych.randomization.repeat(target, numTrlsE / target.length);
        }

        for (trl = 0; trl < targets.length; trl++) {

            stim.push(fix);

            // add "flanker" without taget X ms before target
            var flankers = clone(targets[trl]);
            flankers["stimulus"] = flankers["stimulus"].slice(0, 21) + " " + flankers["stimulus"].slice(22, 30);
            flankers["timing_response"] = fti;
            stim.push(flankers);

            stim.push(targets[trl]);
            stim.push(trlFb);
            stim.push(interTrialInterval);

        }
        block = {
            type: "single-stim",
            choices: respKeys,
            on_finish: codeTrial,
            timeline: stim
        };
        exp.push(block);
        exp.push(blkFb);
    }
    exp.push(saveData);
    exp.push(debrief);

    return exp;
}
EXP = genExpSeq();

/////////////////////////////// Run Experiment ////////////////////////////////
jsPsych.init({
    timeline: EXP,
    fullscreen: false,
    show_progress_bar: false
});
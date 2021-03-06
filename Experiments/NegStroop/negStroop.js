// Stroop-like task with not/now words in front of colour words 

////////////////////////////////////////////////////////////////////////
//                         Canvas Properties                          //
////////////////////////////////////////////////////////////////////////
const canvas_colour = "rgba(200, 200, 200, 1)";
const canvas_size   = [960, 720];
const canvas_border = "5px solid black";

////////////////////////////////////////////////////////////////////////
//                             Experiment                             //
////////////////////////////////////////////////////////////////////////
const expName = getFileName();
const dirName = getDirName();
const vpNum   = genVpNum();
const nFiles  = getNumberOfFiles("/Common/num_files.php", dirName + "data/");

////////////////////////////////////////////////////////////////////////
//                           Exp Parameters                           //
////////////////////////////////////////////////////////////////////////
const prms = {
    nTrlsP: 48,  // number of trials in practise blocks 
    nTrlsE: 96,  // number of trials in subsequent blocks 
    nBlks: 5,
    fixDur: 500,
    fbDur: 1000,
    iti: 1000,  // feedback shown during iti for incorrect responses only
    tooFast: 150,
    tooSlow: 1500,
    respKeys: ["D", "C", "M", "K", 27],
    fbTxt: ["Richtig", "Falsch", "Zu langsam", "Zu schnell"],
    fixWidth: 3,
    fixSize: 15,
    stimSize: "30px monospace",
    fbSize: "30px monospace",
    cTrl: 1,  // count trials
    cBlk: 1,  // count blocks
};

const respMap = shuffle(["rot", "blau", "grün", "gelb"]);
const respKey = {
    red:    prms.respKeys[respMap.findIndex(x => x === "rot")],
    blue:   prms.respKeys[respMap.findIndex(x => x === "blau")],
    green:  prms.respKeys[respMap.findIndex(x => x === "grün")],
    yellow: prms.respKeys[respMap.findIndex(x => x === "gelb")]
}

////////////////////////////////////////////////////////////////////////
//                      Experiment Instructions                       //
////////////////////////////////////////////////////////////////////////
const task_instructions = {
    type: "html-keyboard-response-canvas",
    canvas_colour: canvas_colour,
    canvas_size: canvas_size,
    canvas_border: canvas_border,
    stimulus: "<H1 style='text-align: center;'>Willkommen:</H1><br>" +
              "<H2 style='text-align: center;'>Aufgabe: Bitte reagieren Sie auf die Farbe der Schrift!</H2><br>" +
              "<H2 style='text-align: center;'>" + respMap[0] + " = D&emsp;&emsp;&emsp;&emsp;" + respMap[3] + " = K </H2>" +
              "<H2 style='text-align: center;'>" + respMap[1] + " = C&emsp;"                   + respMap[2] + " = M </H2>",
};

function drawFixation() {                                     
    "use strict"                                               
    let ctx = document.getElementById('canvas').getContext('2d');
    ctx.lineWidth = prms.fixWidth;                             
    ctx.moveTo(-prms.fixSize, 0);                              
    ctx.lineTo( prms.fixSize, 0);                              
    ctx.stroke();                                              
    ctx.moveTo(0, -prms.fixSize);                              
    ctx.lineTo(0,  prms.fixSize);                              
    ctx.stroke();                                              
}                                                              

function drawStroop(args) {
    "use strict"
    let ctx = document.getElementById('canvas').getContext('2d');
    ctx.font = prms.stimSize;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = args["fontcolour"]; 
    ctx.fillText(args["text"], args["posx"], args["posy"]); 

}

function drawFeedback(args) {
    "use strict"
    let ctx = document.getElementById('canvas').getContext('2d');
    let dat = jsPsych.data.get().last(1).values()[0];
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black"; 
    if (prms.cBlk === 1) {
        ctx.fillText(prms.fbTxt[dat.corrCode - 1], args["posx"], args["posy"]); 
    } else if (prms.cBlk > 1 && dat.corrCode !== 1) {
        ctx.fillText(prms.fbTxt[dat.corrCode - 1], args["posx"], args["posy"]); 
    }
}

const fixation_cross = {                                       
    type: 'static-canvas-keyboard-response',                   
    canvas_colour: canvas_colour,
    canvas_size: canvas_size,
    canvas_border: canvas_border,
    trial_duration: prms.fixDur,
    translate_origin: true,
    response_ends_trial: false,
    func: drawFixation
};

const trial_stimulus = {
    type: 'static-canvas-keyboard-response',
    canvas_colour: canvas_colour,
    canvas_size: canvas_size,
    canvas_border: canvas_border,
    trial_duration: prms.tooSlow,
    translate_origin: true,
    func: drawStroop,
    func_args:[
        {"text": jsPsych.timelineVariable("text"),
         "fontcolour": jsPsych.timelineVariable('fontcolour'),
         "posx": jsPsych.timelineVariable('posx'),
         "posy": jsPsych.timelineVariable('posy')
        }
    ],
    data: {
        stim: "negStroop",
        text: jsPsych.timelineVariable('text'), 
        fontcolour: jsPsych.timelineVariable('fontcolour'), 
        affneg: jsPsych.timelineVariable('affneg'), 
        posx: jsPsych.timelineVariable('posx'), 
        posy: jsPsych.timelineVariable('posy'), 
        corrResp: jsPsych.timelineVariable('corrResp')
    },
    on_finish: function() { codeTrial(); }
};

const trial_feedback = {
    type: 'static-canvas-keyboard-response',
    canvas_colour: canvas_colour,
    canvas_size: canvas_size,
    canvas_border: canvas_border,
    trial_duration: prms.fbDur,
    translate_origin: true,
    func: drawFeedback,
    func_args:[
        { "posx": jsPsych.timelineVariable('posx'), "posy": jsPsych.timelineVariable('posy') }
    ],
    on_start: function(trial) {
        let dat = jsPsych.data.get().last(1).values()[0];
        if (prms.cBlk === 1) {
            trial.trial_duration = prms.fbDur;
        } else {
            trial.trial_duration = dat.corrCode === 1 ? 0 : prms.fbDur; 
        }
    }
};

const iti = {
    type: 'static-canvas-keyboard-response',
    canvas_colour: canvas_colour,
    canvas_size: canvas_size,
    canvas_border: canvas_border,
    trial_duration: prms.iti,
    translate_origin: true,
    func: function() {}
};


const block_feedback = {
    type: 'html-keyboard-response-canvas',
    canvas_colour: canvas_colour,
    canvas_size: canvas_size,
    canvas_border: canvas_border,
    stimulus: '',
    response_ends_trial: true,
    on_start: function(trial) {
        trial.stimulus = blockFeedbackTxt({stim: "stroop"});
    },
};

const trial_timeline = {
    timeline: [
        fixation_cross,
        trial_stimulus,
        trial_feedback,
        iti,
    ],
    timeline_variables:[
        { text: "jetzt rot",  fontcolour: "red",    affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "jetzt rot",  fontcolour: "red",    affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "jetzt rot",  fontcolour: "red",    affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "jetzt rot",  fontcolour: "green",  affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "jetzt rot",  fontcolour: "blue",   affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "jetzt rot",  fontcolour: "yellow", affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "nicht rot",  fontcolour: "red",    affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "nicht rot",  fontcolour: "red",    affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "nicht rot",  fontcolour: "red",    affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "nicht rot",  fontcolour: "green",  affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "nicht rot",  fontcolour: "blue",   affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "nicht rot",  fontcolour: "yellow", affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "jetzt grün", fontcolour: "green",  affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "jetzt grün", fontcolour: "green",  affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "jetzt grün", fontcolour: "green",  affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "jetzt grün", fontcolour: "red",    affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "jetzt grün", fontcolour: "blue",   affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "jetzt grün", fontcolour: "yellow", affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "nicht grün", fontcolour: "green",  affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "nicht grün", fontcolour: "green",  affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "nicht grün", fontcolour: "green",  affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "nicht grün", fontcolour: "red",    affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "nicht grün", fontcolour: "blue",   affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "nicht grün", fontcolour: "yellow", affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "jetzt blau", fontcolour: "blue",   affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "jetzt blau", fontcolour: "blue",   affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "jetzt blau", fontcolour: "blue",   affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "jetzt blau", fontcolour: "red",    affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "jetzt blau", fontcolour: "green",  affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "jetzt blau", fontcolour: "yellow", affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "nicht blau", fontcolour: "blue",   affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "nicht blau", fontcolour: "blue",   affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "nicht blau", fontcolour: "blue",   affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "nicht blau", fontcolour: "red",    affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "nicht blau", fontcolour: "green",  affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "nicht blau", fontcolour: "yellow", affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "jetzt gelb", fontcolour: "yellow", affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "jetzt gelb", fontcolour: "yellow", affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "jetzt gelb", fontcolour: "yellow", affneg: "aff", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "jetzt gelb", fontcolour: "red",    affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "jetzt gelb", fontcolour: "green",  affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "jetzt gelb", fontcolour: "blue",   affneg: "aff", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
        { text: "nicht gelb", fontcolour: "yellow", affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "nicht gelb", fontcolour: "yellow", affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "nicht gelb", fontcolour: "yellow", affneg: "neg", comp: 'comp',   posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["yellow"] },
        { text: "nicht gelb", fontcolour: "red",    affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["red"] },
        { text: "nicht gelb", fontcolour: "green",  affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["green"] },
        { text: "nicht gelb", fontcolour: "blue",   affneg: "neg", comp: 'incomp', posx: getRandomInt(-300, 300), posy: getRandomInt(-300, 300), corrResp: respKey["blue"] },
    ],
};

const randomString = generateRandomString(16);

const alphaNum = {
    type: 'html-keyboard-response-canvas',
    canvas_colour: canvas_colour,
    canvas_size: canvas_size,
    canvas_border: canvas_border,
    response_ends_trial: true,
    choices: [32],
    stimulus: "<h3 style='text-align:left;'>Wenn du eine Versuchspersonenstunde benötigst, </h3>" +
              "<h3 style='text-align:left;'>kopiere den folgenden zufällig generierten Code</h3>" +
              "<h3 style='text-align:left;'>und sende diesen zusammen mit deiner Matrikelnummer per Email an:</h3><br>" +
              "<h2>xxx.xxx@student.uni-tuebingen.de</h2>" +
              "<h1>Code: " + randomString + "</h1><br>" +
              "<h2 align='left'>Drücke die Leertaste, um fortzufahren!</h2>",  
};




////////////////////////////////////////////////////////////////////////
//                    Generate and run experiment                     //
////////////////////////////////////////////////////////////////////////
function genExpSeq() {
    "use strict";

    let exp = [];

    exp.push(fullscreen_on);
    exp.push(welcome_de);
    exp.push(resize_de) 
    exp.push(vpInfoForm_de);
    exp.push(hideMouseCursor);
    exp.push(screenInfo);
    exp.push(task_instructions);

    for (let blk = 0; blk < prms.nBlks; blk += 1) {
        let blk_timeline = {...trial_timeline};
        blk_timeline.sample = {type: "fixed-repetitions", size: (blk === 0) ? (prms.nTrlsP/48) : (prms.nTrlsE/48)}
        exp.push(blk_timeline);    // trials within a block
        exp.push(block_feedback);  // show previous block performance 
        exp.push(iti);
    }
    exp.push(debrief_de);
    exp.push(alphaNum);
    exp.push(fullscreen_off);
    exp.push(showMouseCursor);
    
    return exp;

}
const EXP = genExpSeq();

const data_filename = dirName + "data/" + expName + "_" + genVpNum();
const code_filename = dirName + "code/" + expName;

jsPsych.init({
    timeline: EXP,
    fullscreen_mode: true,
    show_progress_bar: false,
    exclusions: {
        min_width:canvas_size[0],
        min_height:canvas_size[1],
    },
    on_finish: function(){ 
        saveData("/Common/write_data.php", data_filename, {stim: "negStroop"});
        saveRandomCode("/Common/write_code.php", code_filename, randomString);
    }
});


let audio;
let video;
let beat; // BeatDetect
let peakDetect;
let fft;
let eyemem;
let PEM;
let facemem;

window.preload = () => {
    audio = loadSound(rootPath + "driverEOTT.mp3");
    //audio.rate(6) // For debugging

    fft = new p5.FFT();
    peakDetect = new p5.PeakDetect(440, 4700, 0.2, 1);

    beat = {
        detect: function () {
            fft.analyze()
            peakDetect.update(fft)
        },

        isOnset: () => { return peakDetect.isDetected }
    }

    video = {
        __selected: null,
        play: function () {
            this.__selected.play()
        },
        stop: function () {
            this.__selected.stop()
        },
        files: {
            "intro.mov": null,
            "fear.mov": null,
            "yeah.mov": null,
        },
        loadAll: function () {
            for (var file of Object.keys(this.files)) {
                console.log("Loading " + file)
                this.files[file] = createVideo(rootPath + file)
                this.files[file].hide()
            }
        }
    }
    video.loadAll()

    eyemem = new EyeIMG();

    PEM = [loadImage(rootPath + "bigEye/P.png"), loadImage(rootPath + "bigEye/E.png"), loadImage(rootPath + "bigEye/M.png")];

    facemem = new FacesIMG();
}

p5.Graphics.prototype.mask = function (_mask) {
    //convert _content from pg to image
    var contentImg = createImage(this.width, this.height);
    contentImg.copy(this, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
    // create the mask
    contentImg.mask(_mask)
    // return the masked image
    return contentImg;
}

function loadVideo(file) {
    video.__selected = video.files[file]
    video.files[file] = undefined
}

function drawVideo() {
    image(video.__selected, width / 2, height / 2);
}

let pBeat;
let cBeat;
let pSpace;
let cSpace;
let bgCol;
let mouseInterpolate;

let metaballs;
let olhos;
let olho;
let nowISee;
let faces;
window.setup = () => {
    fullscreen(true);
    createCanvas(window.innerWidth, window.innerHeight) // fullScreen();

    metaballs = new MetaBalls();
    olhos = new Olhos();
    olho = new Eye(PEM, width / 2 - PEM[1].width / 2, height / 2 - PEM[1].height / 2);
    PEM = undefined
    nowISee = new NowISee();
    faces = new Faces();

    pBeat = false;
    cBeat = false;
    pSpace = false;
    cSpace = false;
    bgCol = CPallet.pallet(0);
    mouseInterpolate = new p5.Vector(width / 2, height / 2);

    loadVideo("intro.mov");
}

window.draw = () => {
    console.log("INTRO")
    imageMode(CENTER);
    window.draw = () => {
        background(color(76, 95, 117));
        drawVideo();
    }
    addCues();
    video.play();
    audio.play();
}

function addCues() {
    let cid1 = audio.addCue(24.105, () => {
        audio.removeCue(cid1)
        console.log("METABALS")
        video.stop();
        loadVideo("fear.mov");
        imageMode(CORNER);

        window.draw = () => {
            beat.detect();
            cBeat = beat.isOnset();
            if (cBeat && !pBeat) metaballs.randomBg();
            pBeat = cBeat;
            metaballs.draw();
        }
    })

    let cid2 = audio.addCue(44.953, () => {
        audio.removeCue(cid2)
        console.log("THERE IS NOTHING TO FEAR")
        imageMode(CENTER);
        video.play();
        metaballs = undefined;

        window.draw = () => {
            background(color(76, 95, 117));
            drawVideo();
        }
    })

    let cid3 = audio.addCue(48.038, () => {
        audio.removeCue(cid3)
        console.log("EYES")
        video.stop();
        loadVideo("yeah.mov");
        imageMode(CORNER);

        window.draw = () => {
            beat.detect();
            cBeat = beat.isOnset();
            olhos.draw(cBeat && !pBeat);
            pBeat = cBeat;
        }
    })

    let cid4 = audio.addCue(71.222, () => {
        audio.removeCue(cid4)
        console.log("YEAH")
        olhos = undefined;
        imageMode(CENTER);
        eyemem = undefined;
        video.play();

        window.draw = () => {
            background(color(76, 95, 117));
            drawVideo();
        }
    })

    let cid5 = audio.addCue(71.968, () => {
        audio.removeCue(cid5)
        console.log("EYE")
        video.stop();
        video = undefined;
        imageMode(CORNER);

        window.draw = () => {
            background(bgCol);
            beat.detect();
            cBeat = beat.isOnset();
            if (cBeat && !pBeat) bgCol = CPallet.pallet(random(0, 4));
            pBeat = cBeat;
            mouseInterpolate = p5.Vector.lerp(mouseInterpolate, new p5.Vector(mouseX, mouseY), 0.05);
            olho.draw(mouseInterpolate);
        }
    })

    let cid6 = audio.addCue(88.407, () => {
        audio.removeCue(cid6)
        console.log("I SEE WHAT YOU MEAN")
        olho = undefined
        textSize( window.innerHeight / 6 );

        window.draw = () => {
            background(CPallet.pallet(0));
            nowISee.draw();
        }
    })

    let cid7 = audio.addCue(89.649, () => {
        audio.removeCue(cid7)
        console.log("FACES")
        nowISee = undefined;

        window.draw = () => {
            beat.detect();
            cBeat = beat.isOnset();
            if (cBeat && !pBeat) { faces.addFace(); }
            pBeat = cBeat;
            cSpace = keyIsPressed && (key == ' ');
            if (cSpace && !pSpace) faces.randomBg();
            pSpace = cSpace;
            background(faces.backColor);
            faces.draw();
        }
    })

    let cid8 = audio.addCue(137.785, () => {
        audio.removeCue(cid8)
        console.log("OUTRO")
        textAlign(LEFT, BOTTOM);
        textSize( window.innerHeight / 30 );

        window.draw = () => {
            let pos = audio.currentTime()
            background(faces.backColor);
            faces.draw();
            let fade = (pos - 137.785) / ((audio.duration() - 137.785));
            fade = constrain(fade * 2, 0, 1);
            let col = color(0, 0, 0)
            col.setAlpha(floor(255 * (fade)))
            fill(col);
            rect(0, 0, width, height);
            col = color(255, 255, 255)
            col.setAlpha(floor(255 * (fade)))
            fill(col);
            text("Driver | The Eye of Truth\nAndré Botelho & Luísa Lino", 40, height - 40);
        }
    })
}
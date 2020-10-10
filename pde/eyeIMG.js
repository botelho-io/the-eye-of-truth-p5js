

function EyeIMG() {
    this.ps; // Previous selected eye elected

    EyeIMG.prototype.load = () => {
        EyeIMG.prototype.P = []; // Pupil
        EyeIMG.prototype.E = []; // Eye
        EyeIMG.prototype.M = []; // Mask

        console.log("EyeIMG load()")
        // Load pupils
        EyeIMG.prototype.P = new Array(7);
        EyeIMG.prototype.P[0] = loadImage(rootPath+"eye/P0.png");
        EyeIMG.prototype.P[1] = loadImage(rootPath+"eye/P1.png");
        EyeIMG.prototype.P[2] = loadImage(rootPath+"eye/P2.png");
        EyeIMG.prototype.P[3] = loadImage(rootPath+"eye/P4.png");
        EyeIMG.prototype.P[4] = loadImage(rootPath+"eye/P5.png");
        EyeIMG.prototype.P[5] = loadImage(rootPath+"eye/P6.png");
        EyeIMG.prototype.P[6] = loadImage(rootPath+"eye/P7.png");
        // Load masks and eyes and make graphics
        // We can't use G on the P2D because we can't share graphics buffers
        EyeIMG.prototype.M = new Array(7);                          EyeIMG.prototype.E = new Array(7);
        EyeIMG.prototype.M[0] = loadImage(rootPath+"eye/M0.png");   EyeIMG.prototype.E[0] = loadImage(rootPath+"eye/E0.png");
        EyeIMG.prototype.M[1] = loadImage(rootPath+"eye/M1.png");   EyeIMG.prototype.E[1] = loadImage(rootPath+"eye/E1.png");
        EyeIMG.prototype.M[2] = loadImage(rootPath+"eye/M3.png");   EyeIMG.prototype.E[2] = loadImage(rootPath+"eye/E3.png");
        EyeIMG.prototype.M[3] = loadImage(rootPath+"eye/M4.png");   EyeIMG.prototype.E[3] = loadImage(rootPath+"eye/E4.png");
        EyeIMG.prototype.M[4] = loadImage(rootPath+"eye/M5.png");   EyeIMG.prototype.E[4] = loadImage(rootPath+"eye/E5.png");
        EyeIMG.prototype.M[5] = loadImage(rootPath+"eye/M6.png");   EyeIMG.prototype.E[5] = loadImage(rootPath+"eye/E6.png");
        EyeIMG.prototype.M[6] = loadImage(rootPath+"eye/M7.png");   EyeIMG.prototype.E[6] = loadImage(rootPath+"eye/E7.png");
    }

    EyeIMG.prototype.getGroup = function() {
        let group = new Array(3);
        group[0] = EyeIMG.prototype.P[round( random(0, EyeIMG.prototype.P.length-1) )];
        this.ps = round( random(0, EyeIMG.prototype.E.length-1) );
        group[1] = EyeIMG.prototype.E[this.ps];
        group[2] = EyeIMG.prototype.M[this.ps];
        return group;
    }

    if(EyeIMG.prototype.P == null) {
        this.load()
    }
}

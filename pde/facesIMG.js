function FacesIMG() {
    this.randomFaceAtAngle = function (/*PGraphics*/ g, /*color*/ cF, /*color*/ cB) {
        let selectedF = this.faces[round(random(0, this.faces.length - 1))];
        let selectedB = this.backs[round(random(0, this.backs.length - 1))];
        let F = createGraphics(selectedF.width, selectedF.height, P2D);
        let B = createGraphics(selectedB.width, selectedB.height, P2D);

        B.background(cB);
        F.background(cF);

        g.imageMode(CENTER);
        g.translate(random(0, g.width - g.height*.05), random(0, g.height*.95));

        let s = random(0.35, .55);
        g.push()
        g.scale(s, s);
        g.rotate(radians(random(0, 360)));
        g.image(B.mask(selectedB), 0, 0);
        g.pop()

        let v = p5.Vector.random2D();
        v.mult(g.height * 0.1);
        g.translate(v.x, v.y);
        if (random(1) > 0.5) g.scale(1, -1);
        else g.scale(-1, -1);
        s = random(0.4, 0.6);
        g.scale(s, s);
        g.rotate(radians(180 + random(-15, 15)));
        g.image(F.mask(selectedF), 0, 0);

        g.reset()
    }

    FacesIMG.prototype.load = () => {
        console.log("FacesIMG load()")
        FacesIMG.prototype.faces = new Array(10);
        for (let i = 0; i < FacesIMG.prototype.faces.length; i++) {
            FacesIMG.prototype.faces[i] = loadImage( rootPath + "faces/F" + i + ".png");
        }
        FacesIMG.prototype.backs = new Array(8);
        for (let i = 0; i < FacesIMG.prototype.backs.length; i++) {
            FacesIMG.prototype.backs[i] = loadImage(rootPath + "faces/B" + i + ".png");
        }


    }

    if(FacesIMG.prototype.faces == null) {
        this.load()
    }

}

function Faces () {

    this.randomBg = () => {
        this.backColor = CPallet.pallet(random(0,4));
    }

    this.addFace = () => {
        let bg = round(random(0,4));
        let fg = round(random(0,3));
        this.backGroundColor = CPallet.palletLight(bg);
        if(fg >= bg) fg++;
        this.foreground = CPallet.palletDark(fg);
        this.fi.randomFaceAtAngle(this.g, this.foreground, this.backGroundColor );
    }

    this.draw = () => {
        image(this.g,0,0);
    }

    this.g = createGraphics(width,height);
    this.fi = new FacesIMG();
    this.randomBg();
}
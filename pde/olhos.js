function Olhos() {
    this.m = new p5.Vector(width / 2, height / 2);
    this.backGroundColor;

    Olhos.prototype.randomBg = () => {
        backGroundColor = CPallet.pallet(random(0, 4));
    }

    Olhos.prototype.draw = (Beat) => {
        background(backGroundColor);

        this.m = p5.Vector.lerp(this.m, new p5.Vector(mouseX, mouseY), 0.1);
        if (Beat) {
            let scale = random(0.4, 1);
            let ey = new Eye(this.cache.getGroup(), floor(random(0, width)), floor(random(0, height)));
            ey.T.size.x *= scale;
            ey.T.size.y *= scale;
            if (ey.T.position.x + ey.T.size.x > width) ey.T.position.x = random(0, width - ey.T.size.x);
            if (ey.T.position.y + ey.T.size.y > height) ey.T.position.y = random(0, height - ey.T.size.y);
            this.e.push(ey);
            this.randomBg();
        }
        for (let eye of this.e) {
            eye.draw(this.m);
        }
    }

    this.cache = new EyeIMG();
    this.e = []
    this.randomBg();
}

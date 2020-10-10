function Eye(group, x, y) {
    this.P; // Pupil
    this.E; // Eye
    this.M; // Mask
    this.R; //Rad for pupil movement
    this.T; //Rad for pupil movement
    this.G; // Intermidiate
    this.imgCtr; // Centre of eye

    this.P = group[0];
    this.E = group[1];
    this.M = group[2];
    this.G = createGraphics(this.E.width, this.E.height);
    this.imgCtr = createVector(this.E.width / 2, this.E.height / 2);
    this.R = this.E.height * 0.4;
    this.T = new Transform(x, y, this.E.width, this.E.height);

    this.draw = function (m) {
        let offset = m.copy();
        offset.sub(this.T.position);
        offset.x *= this.G.width / this.T.size.x;
        offset.y *= this.G.height / this.T.size.y;
        let dist = p5.Vector.dist(this.imgCtr, offset);
        if (dist > this.R) dist = this.R;
        offset.sub(this.imgCtr).normalize().mult(dist).add(this.imgCtr);

        this.G.background(color(255, 255, 255));
        this.G.image(this.P, offset.x - this.P.width / 2, offset.y - this.P.height / 2);
        this.G.image(this.E, 0, 0, this.G.width, this.G.height);

        image(this.G.mask(this.M), this.T.position.x, this.T.position.y, this.T.size.x, this.T.size.y);
    };
}

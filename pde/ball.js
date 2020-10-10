function Ball(x, y, R) {
    this.p;    // Position
    this.r;    // Radius
    this.rr;   // Radius Squared (useful to cache for certain operations)

    // Draw elipse on specified surfece
    this.draw = (g) => {
        g.ellipse(p.x, p.y, r*2, r*2);
    }

    // Update radius and radius squared
    this.setRadius = (R) => {
        r = R;
        rr = R*R;
    }

    // Constructor
    this.p = new p5.Vector(x,y);
    this.r = R;
    this.rr = R*R;
};

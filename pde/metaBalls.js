function MetaBalls() {

    ////////////////////////////////////
    // Vars
    ////////////////////////////////////
    const ballNum = 20;             // Number of balls
    const borderSize = 0;           // Size of border outside layer

    // Vars relative to window width
    const layerResolution = 1;   // Resolution of layers 1-0 (100% - 0%)

    // Vars relative to layer width
    const dotFreqH = .095;        // Horizontal frequency of dots (1 is every pixel)
    const dotFreqV = .095;        // Vertical frequency of dots (1 is every pixel)
    const minBallR = .015;        // Minimum radius of balls
    const maxBallR = .1;          // Maximum radius of balls
    const mEffect = .25;          // Mouse effect radius
    const mForce = .004;          // Mouse force

    ////////////////////////////////////
    // Vars set on initialization
    ////////////////////////////////////
    this.layer; /*PGraphics*/                    // Layer where the metaballs are drawn
    this.grid; /*Grid*/                          // Grid containing metaball date
    this.origins; /*PVector[]*/                  // Initial position of the balls
    this.displaced; /*PVector[]*/                // Position of the balls after being displaced


    this.m = new p5.Vector(0, 0);
    this.backGroundColor;
    this.foreground;

    MetaBalls.prototype.randomBg = () => {
        let bg = round(random(0, 4));
        let fg = round(random(0, 3));
        backGroundColor = CPallet.pallet(bg);
        if (fg >= bg) fg++;
        foreground = CPallet.pallet(fg);
    }

    MetaBalls.prototype.draw = () => {
        this.m = p5.Vector.lerp(this.m, new p5.Vector(mouseX, mouseY), 0.5);
        ////////////////////////////////////////////////////////////////////////
        // Calculate new position for balls
        ////////////////////////////////////////////////////////////////////////
        // Mouse position must be scaled to fit within the maskLayer surface
        //  NOTE: the ball's positions are relative to the surface they are
        //  being drawn onto
        let mousePos = new p5.Vector(
            (this.m.x - borderSize) * layerResolution,
            (this.m.y - borderSize) * layerResolution
        );

        // Iterate trough balls
        let origin;   // Cache
        let dist;     // Cache
        for (let i = 0; i < ballNum; i++) {
            // Cache the origin
            origin = this.origins[i];
            // Cache de distance from the ball to the mouse position
            dist = p5.Vector.dist(origin, mousePos);
            // If the distance to the mouse is less than its effect radius
            if (dist < mouseEffectRad) {
                // Calculate the new position of the displaced ball
                this.displaced[i].set(p5.Vector.add(
                    origin,
                    p5.Vector.sub(
                        origin,
                        mousePos
                    ).mult((1 - (dist / mouseEffectRad)) * mouseForce)
                ));
            }
            // Otherwise return the balls to their native positions
            else this.displaced[i].set(origin.x, origin.y);
        }
        // Recalculate grid values
        this.grid.clacVals();


        ////////////////////////////////////////////////////////////////////////
        // Draw maskLayer
        ////////////////////////////////////////////////////////////////////////
        this.layer.clear();
        this.layer.noStroke();
        this.layer.fill(foreground);
        this.grid.lerpRaster();

        ////////////////////////////////////////////////////////////////////////
        // Display bgLayer
        ////////////////////////////////////////////////////////////////////////
        background(backGroundColor);
        image(
            this.layer,
            borderSize,
            borderSize,
            width - (borderSize * 2),
            height - (borderSize * 2)
        );
    }

    // Inicialization
    this.layer = createGraphics(
        floor((width - (borderSize * 2)) * layerResolution),
        floor((height - (borderSize * 2)) * layerResolution),
        P2D);

    this.grid = new Grid(
        this.layer,
        floor(this.layer.width * dotFreqH),
        floor(this.layer.height * dotFreqV),
        0
    );
    this.grid.randomBalls(ballNum, this.layer.width * minBallR, this.layer.width * maxBallR);

    // NOTE: All changes to displaced will affect grid.balls[x].p since
    // displaced contains only pointers to the position vectors on the balls
    // of grid.balls -- origins on the other hand, contains brand new
    // vectors.
    this.origins = new Array(ballNum);
    this.displaced = new Array(ballNum);
    for (let i = 0; i < ballNum; i++) {
        this.displaced[i] = this.grid.balls[i].p;
        this.origins[i] =   this.grid.balls[i].p.copy();
    }

    const mouseEffectRad = floor(floor((width - (borderSize * 2)) * layerResolution) * mEffect); /*int*/ // Only balls within this radius will be drawn
    const mouseForce = floor(floor((height - (borderSize * 2)) * layerResolution) * mForce); /*int*/     // Force the mouse has to displace the balls

    this.randomBg();
}

const rootPath = "./pde/data/"

const CPallet = {
    pallet: (i) => {
        return ([color(10, 35, 66), color(255, 219, 112), color(239, 118, 123), color(163, 109, 143), color(247, 240, 234)][round(i)])
    },

    palletLight: (i) => {
        return ([color(77, 95, 117), color(255, 228, 151), color(244, 155, 159), color(188, 148, 174), color(248, 243, 239)][round(i)])
    },

    palletDark: (i) => {
        return ([color(8, 26, 50), color(186, 160, 83), color(175, 86, 90), color(119, 81, 106), color(179, 174, 170)][round(i)])
    }
}

function Ball(x, y, R) {
    this.p;    // Position
    this.r;    // Radius
    this.rr;   // Radius Squared (useful to cache for certain operations)

    // Draw elipse on specified surfece
    this.draw = (g) => {
        g.ellipse(p.x, p.y, r * 2, r * 2);
    }

    // Update radius and radius squared
    this.setRadius = (R) => {
        r = R;
        rr = R * R;
    }

    // Constructor
    this.p = new p5.Vector(x, y);
    this.r = R;
    this.rr = R * R;
};



/***************************************************************************************************
*   Grid:
*
*       Defines a grid with balls that are used to create metaballs.
*       After the class is create you should use the function clacVals to update the grid values
*   every time the balls chage position or radius.
*
*   IMPORTANT NOTE: clacVals USES THE BALLS rr (r squared) CACHED VALUES AND NOT THE r VALUES!!!!!!!
*
*       After the grid is updated use one of the 3 raster functions:
*   - simpleRaster
*   - marchingSquaresRaster
*   - lerpRaster
*
***************************************************************************************************/

function Grid(G, horizontalDots, verticalDots, border) {

    this.dots;                        // The actual dot grid
    this.balls;                       // Balls that interact with the sphere
    this.graphics;                    // Graphics to draw onto
    const vertGroups =                // What to draw for each variation in groups of 4 dots
        [
            [],
            [7, 4, 0],
            [5, 1, 4],
            [7, 5, 1, 0],
            [6, 2, 5],
            [6, 2, 5, 4, 0, 7],
            [6, 2, 1, 4],
            [6, 2, 1, 0, 7],
            [3, 6, 7],
            [3, 6, 4, 0],
            [3, 6, 5, 1, 4, 7],
            [3, 6, 5, 1, 0],
            [3, 2, 5, 7],
            [3, 2, 5, 4, 0],
            [3, 2, 1, 4, 7],
            [3, 2, 1, 0]
        ];

    /***********************************************************************************************
    *   randomBalls:
    *
    *       Populate balls with random balls.
    *
    *   Params:
    *     num : int                     - Number of balls.
    *     minR : float                  - Minimum radius of balls.
    *     maxR : float                  - Maximum radius of balls..
    *
    ***********************************************************************************************/
    Grid.prototype.randomBalls = (num, minR, maxR) => {
        this.balls = new Array(num);
        for (let i = 0; i < num; i++) {
            this.balls[i] = new Ball(
                random(this.graphics.width * .1, this.graphics.width * .9),
                random(this.graphics.height * .1, this.graphics.height * .9),
                random(minR, maxR)
            )
        }
    }

    /***********************************************************************************************
    *   drawDots:
    *       Useful to debug the grid, calls the draw function on all of it's dots.
    ***********************************************************************************************/
    Grid.prototype.drawDots = () => {
        this.graphics.fill(color(125));
        this.graphics.textSize(8);
        for (let dotCol of this.dots) {
            for (let dot of dotCol) {
                dot.draw(graphics);
            }
        }
    }

    /***********************************************************************************************
    *   drawBalls:
    *       Useful to debug the grid, calls the draw function on all of it's balls.
    ***********************************************************************************************/
    Grid.prototype.drawBalls = () => {
        this.graphics.stroke(color(0, 255, 0));
        this.graphics.noFill();
        for (let ball of this.balls) {
            ball.draw(graphics);
        }
    }

    /***********************************************************************************************
    *   clacVals:
    *       Updates the value of all dots in the grid acording to the positions of the balls.
    ***********************************************************************************************/
    Grid.prototype.clacVals = () => {
        // These are caches
        let c1;
        let c2;
        for (let dotRow of this.dots) {
            for (dot of dotRow) {
                dot.value = 0;
                for (let ball of this.balls) {
                    c1 = (dot.x - ball.p.x);
                    c2 = (dot.y - ball.p.y);
                    dot.value += ball.rr / (c1 * c1 + c2 * c2);
                }
            }
        }
    }

    /***********************************************************************************************
    *   simpleRaster:
    *       A verry simple raster that draws a cube between 4 activated dots.
    ***********************************************************************************************/
    Grid.prototype.simpleRaster = () => {
        // Iterate trough dots, ignoring the last ones for each row and column
        // The "square" that is being analysed is the one formed by four dots,
        //      the top-left one is at position (x, y)
        for (let x = 0; x < this.dots.length - 1; x++) {
            for (let y = 0; y < vRes - 1; y++) {
                // If all dots in the "square" are active
                if (this.dots[x][y].value >= 1 && this.dots[x + 1][y].value >= 1 &&
                    this.dots[x][y + 1].value >= 1 && this.dots[x + 1][y + 1].value >= 1) {

                    // Draw a rect
                    this.graphics.rect(dots[x][y].x, dots[x][y].y, dWidth, dHeight);
                }
            }
        }
    }

    /***********************************************************************************************
    *   marchingSquaresRaster:
    *
    *       A simple way to raster the metaballs, respects the shape of the blobs and is faster than
    *   the lerpRaster, although it produces blocky results.
    *       It works by detecting witch one of the 16 diffrent combinations of active points on the
    *   analised square exist. Below are represend the diffrent points on the square, the formula to
    *   draw each point and the points that need to be draw for each combination.
    *       The points that need to be drawn for each combination are written in the array
    *   vertGroups, it's first index is the combination, this makes it easy to draw the points based
    *   on the array returned by vertGroups[X].
    *
    *
    *   3---6---2
    *   |       |
    *   7       5
    *   |       |
    *   0---4---1
    *                                   (1) The diffrent points on the square.
    *
    *   vertex(dots[x][y].p.x, dots[x][y].p.y+rHeight);            // 0
    *   vertex(dots[x][y].p.x+rWidth, dots[x][y].p.y+rHeight);     // 1
    *   vertex(dots[x][y].p.x+rWidth, dots[x][y].p.y);             // 2
    *   vertex(dots[x][y].p.x, dots[x][y].p.y);                    // 3
    *   vertex(dots[x][y].p.x+rMidWidth, dots[x][y].p.y+rHeight);  // 4
    *   vertex(dots[x][y].p.x+rWidth, dots[x][y].p.y+rMidHeight);  // 5
    *   vertex(dots[x][y].p.x+rMidWidth, dots[x][y].p.y);          // 6
    *   vertex(dots[x][y].p.x, dots[x][y].p.y+rMidHeight);         // 7
    *                                   (2) Formula to draw each point.
    *
    *   // 0 -->
    *   // 1 --> 7 4 0
    *   // 2 --> 5 1 4
    *   // 3 --> 7 5 1 0
    *   // 4 --> 6 2 5
    *   // 5 --> 6 2 5 4 0 7
    *   // 6 --> 6 2 1 4
    *   // 7 --> 6 2 1 0 7
    *   // 8 --> 3 6 7
    *   // 9 --> 3 6 4 0
    *   // 10 -> 3 6 5 1 4 7
    *   // 11 -> 3 6 5 1 0
    *   // 12 -> 3 2 5 7
    *   // 13 -> 3 2 5 4 0
    *   // 14 -> 3 2 1 4 7
    *   // 15 -> 3 2 1 0
    *                                   (3) Points that need to be draw for each combination
    *
    ***********************************************************************************************/



    Grid.prototype.marchingSquaresRaster = () => {
        // Iterate trough dots, ignoring the last ones for each row and column
        for (let x = 0; x < this.dots.length - 1; x++) {
            for (let y = 0; y < vRes - 1; y++) {
                // Determine "type" of the square
                // The "square" that is being analysed is the one formed by the
                //      four dots, the top-left one is at position (x, y)
                let type = 0;
                if (this.dots[x][y].value >= 1) type += 8;
                if (this.dots[x + 1][y].value >= 1) type += 4;
                if (this.dots[x][y + 1].value >= 1) type += 1;
                if (this.dots[x + 1][y + 1].value >= 1) type += 2;

                // Begin drawing the shape.
                this.graphics.beginShape();
                // For each pont defined in the vertGroups defined shape
                for (let n of vertGroups[type]) {
                    // Draw the vertex
                    switch (n) {
                        case 0: { this.graphics.vertex(this.dots[x][y].x, this.dots[x][y].y + dHeight); break; }
                        case 1: { this.graphics.vertex(this.dots[x][y].x + dWidth, this.dots[x][y].y + dHeight); break; }
                        case 2: { this.graphics.vertex(this.dots[x][y].x + dWidth, this.dots[x][y].y); break; }
                        case 3: { this.graphics.vertex(this.dots[x][y].x, this.dots[x][y].y); break; }
                        case 4: { this.graphics.vertex(this.dots[x][y].x + mDWidth, this.dots[x][y].y + dHeight); break; }
                        case 5: { this.graphics.vertex(this.dots[x][y].x + dWidth, this.dots[x][y].y + mDHeight); break; }
                        case 6: { this.graphics.vertex(this.dots[x][y].x + mDWidth, this.dots[x][y].y); break; }
                        case 7: { this.graphics.vertex(this.dots[x][y].x, this.dots[x][y].y + mDHeight); break; }
                    }
                }
                // Close the shape
                this.graphics.endShape(CLOSE);
            }
        }
    }

    /***********************************************************************************************
    *   lerpRaster:
    *
    *       The best looking but slowest raster.
    *       Works a lot like the marchingSquaresRaster but instead of drawing the midpoints,
    *   wich are 4, 5, 6 & 7 , in the middle of the major ones (0, 1, 2 & 3), it linearly
    *   interpolates them based on the values of the major dots.
    *       Bellow is an eplanation of the lerp formula where A and B represent major points and q
    *   is the midpoint that is being lerped.
    *       This is a very simple and slow implementation that draws each square individualy.
    *
    *   Formula:
    *       ~~~ A ~~~~~ q ~~~~~ B
    *           |~~ o ~~|
    *           |~~~~ dist ~~~|
    *       q = A+(B−A)( (1−f(A)) / (f(B)−f(A)) ) <=>
    *       o = dist * ( (1-f(A)) / (f(B)-f(A)))
    *
    *    A is either:
    *        - Higher than B:
    *            o is y offset & dist = rHeight.
    *                -> 5 lerps 2(A) and 1(B).
    *                -> 7 lerps 3(A) and 0(B).
    *        - To the left of B:
    *            o is x offset & dist = rWidth.
    *                -> 4 lerps 0(A) and 1(B).
    *                -> 6 lerps 3(A) and 2(B).
    *
    ***********************************************************************************************/

    Grid.prototype.lerpRaster = () => {
        let tmp; // Cache
        // Iterate trough dots, ignoring the last ones for each row and column
        for (let x = 0; x < this.dots.length - 1; x++) {
            for (let y = 0; y < vRes - 1; y++) {
                // Determine "type" of the square
                // The "square" that is being analysed is the one formed by the
                //      four dots, the top-left one is at position (x, y)
                let type = 0;
                if (this.dots[x][y].value >= 1) type += 8;
                if (this.dots[x + 1][y].value >= 1) type += 4;
                if (this.dots[x][y + 1].value >= 1) type += 1;
                if (this.dots[x + 1][y + 1].value >= 1) type += 2;

                // Begin drawing the shape
                this.graphics.beginShape();
                // For each pont defined in the vertGroups defined shape
                for (let n of vertGroups[type]) {
                    // Draw the vertex
                    switch (n) {
                        // The first 4 points are draw in the same way as in marchingSquaresRaster
                        case 0: { this.graphics.vertex(this.dots[x][y].x, this.dots[x][y].y + dHeight); break; }
                        case 1: { this.graphics.vertex(this.dots[x][y].x + dWidth, this.dots[x][y].y + dHeight); break; }
                        case 2: { this.graphics.vertex(this.dots[x][y].x + dWidth, this.dots[x][y].y); break; }
                        case 3: { this.graphics.vertex(this.dots[x][y].x, this.dots[x][y].y); break; }
                        // The last 4 points are the ones that are being lerped
                        case 4: {
                            tmp = this.dots[x][y + 1].value;
                            this.graphics.vertex(
                                this.dots[x][y].x + dWidth * ((1 - tmp) / (this.dots[x + 1][y + 1].value - tmp)),
                                this.dots[x][y].y + dHeight
                            );
                            break;
                        }
                        case 5: {
                            tmp = this.dots[x + 1][y].value;
                            this.graphics.vertex(
                                this.dots[x][y].x + dWidth,
                                this.dots[x][y].y + dHeight * ((1 - tmp) / (this.dots[x + 1][y + 1].value - tmp))
                            );
                            break;
                        }
                        case 6: {
                            tmp = this.dots[x][y].value;
                            this.graphics.vertex(
                                this.dots[x][y].x + dWidth * ((1 - tmp) / (this.dots[x + 1][y].value - tmp)),
                                this.dots[x][y].y
                            );
                            break;
                        }
                        case 7: {
                            tmp = this.dots[x][y].value;
                            this.graphics.vertex(
                                this.dots[x][y].x,
                                this.dots[x][y].y + dHeight * ((1 - tmp) / (this.dots[x][y + 1].value - tmp))
                            );
                            break;
                        }
                    }
                }
                // Close the shape
                this.graphics.endShape(CLOSE);
            }
        }
    }

    /***********************************************************************************************
    *   Constructor:
    *
    *       Simple constructor that initilizes the grid and its dots.
    *
    *   Params:
    *     G : PGraphics                 - Where the grid will draw onto this surface.
    *     horizontalDots : int          - Number of horizontal dots.
    *     verticalDots : int            - Number of vertical dots.
    *     border : int                  - Extends (or shrinks) the drawing area beyond the surface.
    *
    ***********************************************************************************************/
    this.graphics = G;

    const vRes = verticalDots;                     // Vertical resolution
    /*
    *  The +1 helps to compensate for the size lost when rounding but as a
    *      consequense the gridmay extends beyond the surface on it's right
    *      and down sides
    *  These numbers need to be int's otherwise gaps will start showing
    *      when the grid is rasterized
    */
    // Dot Space Width - horizontal space btween dots
    const dWidth = round((this.graphics.width + border * 2.0) / (horizontalDots - 1)) + 1
    // Dot Space Height - vertical space btween dots
    const dHeight = round((this.graphics.height + border * 2.0) / (verticalDots - 1)) + 1
    // Half Dot Space Width useful to cache
    const mDWidth = round(dWidth / 2.0);
    // Half Dot Space Height useful to cache
    const mDHeight = round(dHeight / 2.0);



    // Cache the values for the y positions
    let ymaps = new Array(vRes);
    for (let y = 0; y < vRes; y++) {
        ymaps[y] = y * dHeight;
    }

    // Set the positions for each dot
    this.dots = new Array(horizontalDots);
    for (let x = 0; x < this.dots.length; x++) {
        this.dots[x] = new Array(vRes)
        let xmap = x * dWidth;
        for (let y = 0; y < vRes; y++) {
            this.dots[x][y] = new Dot(xmap, ymaps[y]);
        }
    }
}


function Dot(X, Y) {
    this.value   // Value the dot ocupies on the grid
    this.x       // Position of the dot
    this.y



    // Draw dot on surface
    Dot.prototype.draw = (g) => {
        if (value < 1) g.set(x, y, color(255, 0, 0));
        else g.set(x, y, color(0, 255, 0));
        g.text(value, x + 1, y + 1);
    }

    // Initializer
    this.x = X;
    this.y = Y;
}


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
        this.origins[i] = this.grid.balls[i].p.copy();
    }

    const mouseEffectRad = floor(floor((width - (borderSize * 2)) * layerResolution) * mEffect); /*int*/ // Only balls within this radius will be drawn
    const mouseForce = floor(floor((height - (borderSize * 2)) * layerResolution) * mForce); /*int*/     // Force the mouse has to displace the balls

    this.randomBg();
}




function EyeIMG() {
    this.ps; // Previous selected eye elected

    EyeIMG.prototype.load = () => {
        EyeIMG.prototype.P = []; // Pupil
        EyeIMG.prototype.E = []; // Eye
        EyeIMG.prototype.M = []; // Mask

        console.log("EyeIMG load()")
        // Load pupils
        EyeIMG.prototype.P = new Array(7);
        EyeIMG.prototype.P[0] = loadImage(rootPath + "eye/P0.png");
        EyeIMG.prototype.P[1] = loadImage(rootPath + "eye/P1.png");
        EyeIMG.prototype.P[2] = loadImage(rootPath + "eye/P2.png");
        EyeIMG.prototype.P[3] = loadImage(rootPath + "eye/P4.png");
        EyeIMG.prototype.P[4] = loadImage(rootPath + "eye/P5.png");
        EyeIMG.prototype.P[5] = loadImage(rootPath + "eye/P6.png");
        EyeIMG.prototype.P[6] = loadImage(rootPath + "eye/P7.png");
        // Load masks and eyes and make graphics
        // We can't use G on the P2D because we can't share graphics buffers
        EyeIMG.prototype.M = new Array(7); EyeIMG.prototype.E = new Array(7);
        EyeIMG.prototype.M[0] = loadImage(rootPath + "eye/M0.png"); EyeIMG.prototype.E[0] = loadImage(rootPath + "eye/E0.png");
        EyeIMG.prototype.M[1] = loadImage(rootPath + "eye/M1.png"); EyeIMG.prototype.E[1] = loadImage(rootPath + "eye/E1.png");
        EyeIMG.prototype.M[2] = loadImage(rootPath + "eye/M3.png"); EyeIMG.prototype.E[2] = loadImage(rootPath + "eye/E3.png");
        EyeIMG.prototype.M[3] = loadImage(rootPath + "eye/M4.png"); EyeIMG.prototype.E[3] = loadImage(rootPath + "eye/E4.png");
        EyeIMG.prototype.M[4] = loadImage(rootPath + "eye/M5.png"); EyeIMG.prototype.E[4] = loadImage(rootPath + "eye/E5.png");
        EyeIMG.prototype.M[5] = loadImage(rootPath + "eye/M6.png"); EyeIMG.prototype.E[5] = loadImage(rootPath + "eye/E6.png");
        EyeIMG.prototype.M[6] = loadImage(rootPath + "eye/M7.png"); EyeIMG.prototype.E[6] = loadImage(rootPath + "eye/E7.png");
    }

    EyeIMG.prototype.getGroup = function () {
        let group = new Array(3);
        group[0] = EyeIMG.prototype.P[round(random(0, EyeIMG.prototype.P.length - 1))];
        this.ps = round(random(0, EyeIMG.prototype.E.length - 1));
        group[1] = EyeIMG.prototype.E[this.ps];
        group[2] = EyeIMG.prototype.M[this.ps];
        return group;
    }

    if (EyeIMG.prototype.P == null) {
        this.load()
    }
}

function Transform(X, Y, W, H) {
    this.position = createVector(X, Y);
    this.size = createVector(W, H);

    this.draw = function () {
        noFill();
        stroke(color(255, 0, 0));
        rect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}

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

function NowISee() {
    NowISee.prototype.draw = () => {
        clear();
        textAlign(CENTER, CENTER);
        text("I SEE WHAT\nYOU MEAN", width / 2, height / 2);
    }
}

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
            FacesIMG.prototype.faces[i] = loadImage(rootPath + "faces/F" + i + ".png");
        }
        FacesIMG.prototype.backs = new Array(8);
        for (let i = 0; i < FacesIMG.prototype.backs.length; i++) {
            FacesIMG.prototype.backs[i] = loadImage(rootPath + "faces/B" + i + ".png");
        }


    }

    if (FacesIMG.prototype.faces == null) {
        this.load()
    }

}


function Faces() {

    this.randomBg = () => {
        this.backColor = CPallet.pallet(random(0, 4));
    }

    this.addFace = () => {
        let bg = round(random(0, 4));
        let fg = round(random(0, 3));
        this.backGroundColor = CPallet.palletLight(bg);
        if (fg >= bg) fg++;
        this.foreground = CPallet.palletDark(fg);
        this.fi.randomFaceAtAngle(this.g, this.foreground, this.backGroundColor);
    }

    this.draw = () => {
        image(this.g, 0, 0);
    }

    this.g = createGraphics(width, height);
    this.fi = new FacesIMG();
    this.randomBg();
}

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
    // audio.rate(6) // For debugging

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
        textSize(window.innerHeight / 6);

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
        textSize(window.innerHeight / 30);

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

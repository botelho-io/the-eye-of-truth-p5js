
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

class Grid {
    
    Dot[][] dots;						// The actual dot grid
    Ball[] balls;						// Balls that interact with the sphere
    final int vRes;				        // Vertical resolution 
    final int dWidth;				    // Dot Space Width - horizontal space btween dots
    final int dHeight;                  // Dot Space Height - vertical space btween dots
    final int mDWidth;                  // Half Dot Space Width useful to cache
    final int mDHeight;                 // Half Dot Space Height useful to cache
    PGraphics graphics;                 // Graphics to draw onto
    final int[][] vertGroups =          // What to draw for each variation in groups of 4 dots
    new int[][]{
        new int[] {},
        new int[] {7,4,0},
        new int[] {5,1,4},
        new int[] {7,5,1,0},
        new int[] {6,2,5},
        new int[] {6,2,5,4,0,7},
        new int[] {6,2,1,4},
        new int[] {6,2,1,0,7},
        new int[] {3,6,7},
        new int[] {3,6,4,0},
        new int[] {3,6,5,1,4,7},
        new int[] {3,6,5,1,0},
        new int[] {3,2,5,7},
        new int[] {3,2,5,4,0},
        new int[] {3,2,1,4,7},
        new int[] {3,2,1,0}
    };
    
    
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
    Grid(PGraphics G, int horizontalDots, int verticalDots, int border) {
        vRes = verticalDots;
        graphics = G;
        
        /*  
         *  The +1 helps to compensate for the size lost when rounding but as a
         *      consequense the gridmay extends beyond the surface on it's right
         *      and down sides
         *  These numbers need to be int's otherwise gaps will start showing
         *      when the grid is rasterized
         */
        dWidth =  round((graphics.width+border*2.0) / (horizontalDots-1))+1; 
        dHeight = round((graphics.height+border*2.0) / (verticalDots-1))+1;  
        mDWidth =  round(dWidth/2.0);
        mDHeight = round(dHeight/2.0);
        
        // Cache the values for the y positions
        int[] ymaps = new int[vRes];
        for(int y=0; y<vRes; y++) {
            ymaps[y] = y*dHeight;
        }
        
        // Set the positions for each dot
        dots = new Dot[horizontalDots][vRes];
        for(int x=0; x<dots.length; x++) {
            int xmap = x*dWidth;
            for(int y=0; y<vRes; y++) {
                dots[x][y] = new Dot(xmap, ymaps[y]);
            }
        }
    }

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
    Ball[] randomBalls(int num, float minR, float maxR) {
        balls = new Ball[num];
        for(int i=0; i<num; i++) {
            balls[i] = new Ball(
                random(graphics.width*.1,graphics.width*.9), 
                random(graphics.height*.1,graphics.height*.9), 
                random(minR, maxR)
            );
        }
        return balls;
    }
    
    /***********************************************************************************************
    *   drawDots:
    *       Useful to debug the grid, calls the draw function on all of it's dots.
    ***********************************************************************************************/
    void drawDots(){
        graphics.fill(color(125));
        graphics.textSize(8);
        for(Dot[] dotCol : dots) 
            for(Dot dot : dotCol) 
                dot.draw(graphics);
    }
    
    /***********************************************************************************************
    *   drawBalls:
    *       Useful to debug the grid, calls the draw function on all of it's balls.
    ***********************************************************************************************/
    void drawBalls(){
        graphics.stroke(color(0,255,0));
        graphics.noFill();
        for(Ball ball : balls) 
            ball.draw(graphics);
    }

    /***********************************************************************************************
    *   clacVals:
    *       Updates the value of all dots in the grid acording to the positions of the balls.
    ***********************************************************************************************/
    void clacVals() {
        // These are caches
        float c1;
        float c2;
        for(Dot[] dotRow : dots) for(Dot dot : dotRow) {
            dot.value = 0;
            for(Ball ball : balls) {
                c1 = (dot.x - ball.p.x);
                c2 = (dot.y - ball.p.y);
                dot.value += ball.rr / (c1*c1 + c2*c2);
            } 
        }
    }
    
    /***********************************************************************************************
    *   simpleRaster:
    *       A verry simple raster that draws a cube between 4 activated dots.
    ***********************************************************************************************/
    void simpleRaster() {
        // Iterate trough dots, ignoring the last ones for each row and column
        // The "square" that is being analysed is the one formed by four dots, 
        //      the top-left one is at position (x, y)
        for(int x=0; x<dots.length-1; x++) {
            for(int y=0; y<vRes-1; y++) {
                // If all dots in the "square" are active
                if ( dots[ x ][ y ].value >= 1 && dots[x+1][ y ].value >= 1 &&
                     dots[ x ][y+1].value >= 1 && dots[x+1][y+1].value >= 1 ){

                    // Draw a rect
                    graphics.rect(dots[x][y].x, dots[x][y].y, dWidth, dHeight);
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
                
    
    
    void marchingSquaresRaster() {
        // Iterate trough dots, ignoring the last ones for each row and column
        for(int x=0; x<dots.length-1; x++) {
            for(int y=0; y<vRes-1; y++) {
                // Determine "type" of the square
                // The "square" that is being analysed is the one formed by the
                //      four dots, the top-left one is at position (x, y)
                int type = 0;
                if(dots[ x ][ y ].value >= 1) type += 8;
                if(dots[x+1][ y ].value >= 1) type += 4;
                if(dots[ x ][y+1].value >= 1) type += 1;
                if(dots[x+1][y+1].value >= 1) type += 2;

                // Begin drawing the shape.
                graphics.beginShape();
                // For each pont defined in the vertGroups defined shape
                for(int n : vertGroups[type]) {
                    // Draw the vertex
                    switch(n){
                    case 0:{graphics.vertex(dots[x][y].x        , dots[x][y].y+dHeight  );break;}
                    case 1:{graphics.vertex(dots[x][y].x+dWidth , dots[x][y].y+dHeight  );break;}
                    case 2:{graphics.vertex(dots[x][y].x+dWidth , dots[x][y].y          );break;}
                    case 3:{graphics.vertex(dots[x][y].x        , dots[x][y].y          );break;}
                    case 4:{graphics.vertex(dots[x][y].x+mDWidth, dots[x][y].y+dHeight  );break;}
                    case 5:{graphics.vertex(dots[x][y].x+dWidth , dots[x][y].y+mDHeight );break;}
                    case 6:{graphics.vertex(dots[x][y].x+mDWidth, dots[x][y].y          );break;}
                    case 7:{graphics.vertex(dots[x][y].x        , dots[x][y].y+mDHeight );break;}
                    }
                }
                // Close the shape
                graphics.endShape(CLOSE);
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
    
    void lerpRaster() {
        float tmp; // Cache
        // Iterate trough dots, ignoring the last ones for each row and column
        for(int x=0; x<dots.length-1; x++) {
            for(int y=0; y<vRes-1; y++) {
                // Determine "type" of the square
                // The "square" that is being analysed is the one formed by the
                //      four dots, the top-left one is at position (x, y)
                int type = 0;
                if(dots[ x ][ y ].value >= 1) type += 8;
                if(dots[x+1][ y ].value >= 1) type += 4;
                if(dots[ x ][y+1].value >= 1) type += 1;
                if(dots[x+1][y+1].value >= 1) type += 2;
                
                // Begin drawing the shape
                graphics.beginShape();
                // For each pont defined in the vertGroups defined shape
                for(int n : vertGroups[type]) {
                    // Draw the vertex
                    switch(n){
                    // The first 4 points are draw in the same way as in marchingSquaresRaster
                    case 0:{graphics.vertex(dots[x][y].x        , dots[x][y].y+dHeight  );break;}
                    case 1:{graphics.vertex(dots[x][y].x+dWidth , dots[x][y].y+dHeight  );break;}
                    case 2:{graphics.vertex(dots[x][y].x+dWidth , dots[x][y].y          );break;}
                    case 3:{graphics.vertex(dots[x][y].x        , dots[x][y].y          );break;}
                    // The last 4 points are the ones that are being lerped
                    case 4: {
                        tmp = dots[x][y+1].value;
                        graphics.vertex(
                            dots[x][y].x+dWidth*((1-tmp)/(dots[x+1][y+1].value-tmp)),
                            dots[x][y].y+dHeight
                        );
                    break;}
                    case 5:{
                        tmp = dots[x+1][y].value;
                        graphics.vertex(
                            dots[x][y].x+dWidth,
                            dots[x][y].y+dHeight*((1-tmp)/(dots[x+1][y+1].value-tmp))
                        );
                    break;}
                    case 6:{
                        tmp = dots[x][y].value;
                        graphics.vertex(
                            dots[x][y].x+dWidth*((1-tmp)/(dots[x+1][y].value-tmp)),
                            dots[x][y].y
                        );
                    break;}
                    case 7:{
                        tmp = dots[x][y].value;
                        graphics.vertex(
                            dots[x][y].x,
                            dots[x][y].y+dHeight*((1-tmp)/(dots[x][y+1].value-tmp))
                        );
                    break;}
                    }
                }
                // Close the shape
                graphics.endShape(CLOSE);
            }
        }
    }
};

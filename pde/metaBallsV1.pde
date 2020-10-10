class MetaBallsV1 {
  
  ////////////////////////////////////////
  // Vars
  ////////////////////////////////////////
  final int ballNum = 15;                 // Number of balls
  final int borderSize = 0;              // Size of border outside layer
  
  // Vars relative to window width
  final float layerResolution = .9;       // Resolution of layers 1-0 (100% - 0%)
  
  // Vars relative to layer width
  final float dotFreqH = .09;             // Horizontal frequency of dots (1 is every pixel)
  final float dotFreqV = .08;             // Vertical frequency of dots (1 is every pixel)
  final float minBallR = .03;             // Minimum radius of balls
  final float maxBallR = .1;              // Maximum radius of balls
  final float mEffect = .25;              // Mouse effect radius
  final float mForce = .004;              // Mouse force
  
  ////////////////////////////////////////
  // Vars set on initialization
  ////////////////////////////////////////
  int mouseEffectRad;                     // Only balls within this radius will be drawn
  int mouseForce;                         // Force the mouse has to displace the balls
  PGraphics maskLayer;                    // Layer where the metaballs are drawn
  Grid grid;                              // Grid containing metaball date
  PImage bg;                              // Image to be masked
  PGraphics bgLayer;                      // Layer to be masked and will have the final image
  PVector[] origins;                      // Initial position of the balls
  PVector[] displaced;                    // Position of the balls after being displaced
  
  MetaBallsV1() {
      maskLayer  = createGraphics(
          (int)((width-(borderSize*2))*layerResolution), 
          (int)((height-(borderSize*2))*layerResolution), 
      P2D);
      bgLayer = createGraphics(maskLayer.width, maskLayer.height, P2D);
      
      grid = new Grid(
          maskLayer, 
          (int)(maskLayer.width*dotFreqH), 
          (int)(maskLayer.height*dotFreqV),
          0
      );
      grid.randomBalls( ballNum, maskLayer.width*minBallR, maskLayer.width*maxBallR);
      
      // NOTE: All changes to displaced will affect grid.balls[x].p since 
      // displaced contains only pointers to the position vectors within the balls
      // of grid.balls -- origins on the other hand, contains brand new vectors.
      origins = new PVector[ballNum];
      displaced = new PVector[ballNum];
      for(int i=0;i<ballNum;i++) {
          displaced[i] = grid.balls[i].p;
          origins[i] = grid.balls[i].p.copy();
      }
      
      mouseEffectRad = (int)(maskLayer.width*mEffect);
      mouseForce = (int)(maskLayer.width*mForce);
      
      backs = new PImage[imageNames.length];
      for(int i=0; i<imageNames.length; i++){
        backs[i] = loadImage(imageNames[i]);
      }
      randomBg();
  }
  
  
  PVector m = new PVector(0, 0);
  final String imageNames[] = {"metaballs/BY.jpg", "metaballs/BP.jpg","metaballs/BC.jpg","metaballs/BW.jpg"};
  PImage backs[];
  color backGroundColor;
  
  void randomBg(){
    int i = round(random(0,4));
    backGroundColor = CPallet.palet[i];
    if(i > 0) bg = backs[i-1];
    else bg = backs[round(random(0,3))];
  }
  
  void draw() {
      m = PVector.lerp(m,new PVector(mouseX, mouseY), 0.05);
      ////////////////////////////////////////////////////////////////////////////
      // Calculate new position for balls
      ////////////////////////////////////////////////////////////////////////////
      // Mouse position must be scaled to fit within the maskLayer surface
      //      NOTE: the ball's positions are relative to the surface they are 
      //  being drawn onto
      PVector mousePos = new PVector(
          (m.x-borderSize)*layerResolution, 
          (m.y-borderSize)*layerResolution
      );
      // Iterate trough balls
      PVector origin; // Cache
      float dist;     // Cache
      for(int i=0;i<ballNum;i++){
          // Cache the origin
          origin = origins[i];
          // Cache de distance from the ball to the mouse position
          dist = PVector.dist(origin,mousePos);
          // If the distance to the mouse is less than its effect radius
          if (dist < mouseEffectRad){
              // Calculate the new position of the displaced ball
              displaced[i].set( PVector.add(
                  origin, 
                  PVector.sub(
                      origin,
                      mousePos
                  ).mult((1-(dist/mouseEffectRad))*mouseForce)
              ));
          }
          // Otherwise return the balls to their native positions 
          else displaced[i].set(origin.x, origin.y);
      }
      // Recalculate grid values
      grid.clacVals();
      
  
      ////////////////////////////////////////////////////////////////////////////
      // Draw maskLayer
      ////////////////////////////////////////////////////////////////////////////
      maskLayer.beginDraw();
      maskLayer.clear();
      maskLayer.noStroke();
      grid.lerpRaster();
      //grid.drawBalls();
      maskLayer.endDraw();
      
      ////////////////////////////////////////////////////////////////////////////
      // Draw bgLayer
      ////////////////////////////////////////////////////////////////////////////
      bgLayer.beginDraw();
      bgLayer.image(bg,0,0, bgLayer.width, bgLayer.height);
      bgLayer.mask(maskLayer);
      bgLayer.endDraw();
      
      ////////////////////////////////////////////////////////////////////////////
      // Display bgLayer
      ////////////////////////////////////////////////////////////////////////////
      background(backGroundColor);
      image(
          bgLayer, 
          borderSize, 
          borderSize, 
          width-(borderSize*2), 
          height-(borderSize*2)
      );
  }
}

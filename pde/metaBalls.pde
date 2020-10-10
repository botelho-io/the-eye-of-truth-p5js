class MetaBalls {
	
	////////////////////////////////////
	// Vars
	////////////////////////////////////
	final int ballNum = 20;             // Number of balls
	final int borderSize = 0;           // Size of border outside layer
	
	// Vars relative to window width
	final float layerResolution = 1;   // Resolution of layers 1-0 (100% - 0%)
	
	// Vars relative to layer width
	final float dotFreqH = .095;        // Horizontal frequency of dots (1 is every pixel)
	final float dotFreqV = .095;        // Vertical frequency of dots (1 is every pixel)
	final float minBallR = .015;        // Minimum radius of balls
	final float maxBallR = .1;          // Maximum radius of balls
	final float mEffect = .25;          // Mouse effect radius
	final float mForce = .004;          // Mouse force

	////////////////////////////////////
	// Vars set on initialization
	////////////////////////////////////
	int mouseEffectRad;                 // Only balls within this radius will be drawn
	int mouseForce;                     // Force the mouse has to displace the balls
	PGraphics layer;                    // Layer where the metaballs are drawn
	Grid grid;                          // Grid containing metaball date
	PVector[] origins;                  // Initial position of the balls
	PVector[] displaced;                // Position of the balls after being displaced
	
	MetaBalls() {
		layer  = createGraphics(
			(int)((width-(borderSize*2))*layerResolution), 
			(int)((height-(borderSize*2))*layerResolution), 
		P2D);
		
		grid = new Grid(
			layer, 
			(int)(layer.width*dotFreqH), 
			(int)(layer.height*dotFreqV),
			0
		);
		grid.randomBalls( ballNum, layer.width*minBallR, layer.width*maxBallR);
		
		// NOTE: All changes to displaced will affect grid.balls[x].p since 
		// displaced contains only pointers to the position vectors on the balls
		// of grid.balls -- origins on the other hand, contains brand new 
		// vectors.
		origins = new PVector[ballNum];
		displaced = new PVector[ballNum];
		for(int i=0;i<ballNum;i++) {
			displaced[i] = grid.balls[i].p;
			origins[i] = grid.balls[i].p.copy();
		}
		
		mouseEffectRad = (int)(layer.width*mEffect);
		mouseForce = (int)(layer.width*mForce);
		
		randomBg();
	}
	
	
	PVector m = new PVector(0, 0);
	color backGroundColor;
	color foreground;
	
	void randomBg(){
		int bg = round(random(0,4));
		int fg = round(random(0,3));
		backGroundColor = CPallet.palet[bg];
		if(fg >= bg) fg++;
		foreground = CPallet.palet[fg];
	}
	
	void draw() {
		m = PVector.lerp(m,new PVector(mouseX, mouseY), 0.05);
		////////////////////////////////////////////////////////////////////////
		// Calculate new position for balls
		////////////////////////////////////////////////////////////////////////
		// Mouse position must be scaled to fit within the maskLayer surface
		//  NOTE: the ball's positions are relative to the surface they are 
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
		

		////////////////////////////////////////////////////////////////////////
		// Draw maskLayer
		////////////////////////////////////////////////////////////////////////
		layer.beginDraw();
		layer.clear();
		layer.noStroke();
		layer.fill(foreground);
		grid.lerpRaster();
		layer.endDraw();
		
		////////////////////////////////////////////////////////////////////////
		// Display bgLayer
		////////////////////////////////////////////////////////////////////////
		background(backGroundColor);
		image(
			layer, 
			borderSize, 
			borderSize, 
			width-(borderSize*2), 
			height-(borderSize*2)
		);
	}
}

class Ball {
  PVector p;  // Position
  float r;    // Radius
  float rr;   // Radius Squared (useful to cache for certain operations)
  
  // Constructor
  Ball(float x, float y, float R) {
    p = new PVector(x,y);
    r = R;
    rr = R*R;
  }
  
  // Draw elipse on specified surfece
  void draw(PGraphics g) {
    g.ellipse(p.x, p.y, r*2, r*2);
  }
  
  // Draw elipse on main surfece
  void draw() {
    ellipse(p.x, p.y, r*2, r*2);
  }

  // Update radius and radius squared
  void setRadius(int R){
    r = R;
    rr = R*R;
  }
};

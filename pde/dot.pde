class Dot {
  float value;  // Value the dot ocupies on the grid
  int x,y;      // Position of the dot
  
  // Initializer
  Dot(int X, int Y){
    x = X; y = Y;
  }
  
  // Draw dot on surface
  void draw(PGraphics g){
    if(value < 1) g.set(x, y, color(255,0,0));
    else g.set(x, y, color(0,255,0)); 
    g.text(value, x+1, y+1);
  }
  
  // Draw dot on main surface
  void draw(){
    if(value < 1) set(x, y, color(255,0,0));
    else set(x, y, color(0,255,0)); 
    text(value, x+1, y+1);
  }
};

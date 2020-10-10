class Transform {
  PVector position;
  PVector size;

  Transform(int X, int Y, int W, int H) {
    position = new PVector(X, Y);
    size = new PVector(W, H);
  }



  void draw() {
    noFill();
    stroke(color(255,0,0));
    rect(position.x, position.y, size.x, size.y);
  }
}

class NowISee {
  PFont OpenSansSemiBold;
  NowISee(){
    OpenSansSemiBold = createFont("OpenSansSemibold.ttf", 100);
  }
  
  void draw() {
    textFont(OpenSansSemiBold);
    clear();
    textAlign(CENTER, CENTER);
    text("I SEE WHAT\nYOU MEAN", width/2, height/2);
  }
}

class Olhos {
  
  EyeIMG cach;
  ArrayList<Eye> e;
  Olhos(){
    cach = new EyeIMG();
    e = new ArrayList<Eye>();
    randomBg();
  }
  
  PVector m = new PVector(width/2, height/2);
  color backGroundColor;
  
  void randomBg(){
    backGroundColor = CPallet.col(random(0,4));
  }
  
  void draw(boolean Beat){
    background(backGroundColor);
    
    m = PVector.lerp(m,new PVector(mouseX, mouseY), 0.1);
    if(Beat){
      float scale = random(0.4, 1);
      Eye ey = new Eye(cach.getGroup(), int(random(0, width)), int(random(0,height)));
      ey.T.size.x *= scale;
      ey.T.size.y *= scale;
      if(ey.T.position.x + ey.T.size.x > width) ey.T.position.x = random(0, width - ey.T.size.x);
      if(ey.T.position.y + ey.T.size.y > height) ey.T.position.y = random(0, height - ey.T.size.y);
      e.add(ey);
      randomBg();
    }
    for(Eye eye:e){
      eye.draw(m);
    }
  }
}

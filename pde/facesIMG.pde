class FacesIMG {

  PImage faces[];
  PImage backs[];
  
  FacesIMG(){
    faces = new PImage[10];
    for(int i = 0; i < faces.length; i++){
      faces[i] = loadImage("faces/F" + i + ".jpg");
    }
    backs = new PImage[8];
    for(int i = 0; i < backs.length; i++){
      backs[i] = loadImage("faces/B" + i + ".jpg");
    }
  }
  
  void randomFaceAtAngle(PGraphics g, color cF, color cB){
    PImage selectedF = faces[round(random(0,faces.length-1))];
    PImage selectedB = backs[round(random(0,backs.length-1))];
    PGraphics F = createGraphics(selectedF.width, selectedF.height, P2D);
    PGraphics B = createGraphics(selectedB.width, selectedB.height, P2D);
    
    B.beginDraw();
    B.background(cB);
    B.mask(selectedB);
    B.endDraw();
    
    F.beginDraw();
    F.background(cF);
    F.mask(selectedF);
    F.endDraw();
    
    g.beginDraw();
    g.imageMode(CENTER);
    g.translate(random(0,g.width),random(0,g.height));
    
    g.pushMatrix();
      float s = random(0.35,.55);
      g.scale(s,s);
      g.rotate(radians(random(0,360)));
      g.image(B,0,0);
    g.popMatrix();
    
    PVector v = PVector.random2D();
    v.mult(g.height*0.1);
    g.translate(v.x, v.y);
    if(random(1) > 0.5) g.scale(1,-1);
    else g.scale(-1,-1);
    s = random(0.4,0.6);
    g.scale(s,s);
    g.rotate(radians(random(-15,15)));
    g.image(F,0,0);
    g.endDraw();
  }

}

class Faces {
  FacesIMG fi;
  PGraphics g;
  
  Faces(){
    g = createGraphics(width,height, P2D);
    fi = new FacesIMG();
    randomBg();
  }
  
  
  color backColor;
  
  void randomBg(){
    int bg = round(random(0,4));
    backColor = CPallet.palet[bg];
  }
  
  color backGroundColor;
  color foreground;
  
  void addFace(){
    int bg = round(random(0,4));
    int fg = round(random(0,3));
    backGroundColor = CPallet.paletLight[bg];
    if(fg >= bg) fg++;
    foreground = CPallet.paletDark[fg];
    fi.randomFaceAtAngle(g, foreground, backGroundColor );
  }
  
  void draw(){
    image(g,0,0);
  }
}

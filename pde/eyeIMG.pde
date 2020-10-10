class EyeIMG {
  PImage P[]; // Pupil
  PImage E[]; // Eye
  PImage M[]; // Mask
  //PGraphics G[]; // Intermidiate
  int ps; // Previous selected eye elected
  
  EyeIMG(){
    // Load pupils
    P = new PImage[7];
    P[0] = loadImage("eye/P0.png");
    P[1] = loadImage("eye/P1.png");
    P[2] = loadImage("eye/P2.png");
    P[3] = loadImage("eye/P4.png");
    P[4] = loadImage("eye/P5.png");
    P[5] = loadImage("eye/P6.png");
    P[6] = loadImage("eye/P7.png");
    // Load masks and eyes and make graphics
    // We can't use G on the P2D because we can't share graphics buffers
    M = new PImage[7];                E = new PImage[7];              //G = new PGraphics[1];
    M[0] = loadImage("eye/M0.png");   E[0] = loadImage("eye/E0.png"); //G[0] = createGraphics(E[0].width, E[0].height);
    M[1] = loadImage("eye/M1.png");   E[1] = loadImage("eye/E1.png");
    M[2] = loadImage("eye/M3.png");   E[2] = loadImage("eye/E3.png");
    M[3] = loadImage("eye/M4.png");   E[3] = loadImage("eye/E4.png");
    M[4] = loadImage("eye/M5.png");   E[4] = loadImage("eye/E5.png");
    M[5] = loadImage("eye/M6.png");   E[5] = loadImage("eye/E6.png");
    M[6] = loadImage("eye/M7.png");   E[6] = loadImage("eye/E7.png");
  }
  
  PImage[] getGroup() {
    PImage[] group = new PImage[3];
    group[0] = P[round( random(0, P.length-1) )];
    ps = round( random(0, E.length-1) );
    group[1] = E[ps];
    group[2] = M[ps];
    return group;
  }
  
  /*PGraphics getGraphics() {
    return G[ps];
  }*/
  
  void delete(){
    P = null;
    E = null;
    M = null;
  }
}

class Eye {
  PImage P; // Pupil
  PImage E; // Eye
  PImage M; // Mask
  float R;  //Rad for pupil movement
  Transform T;  //Rad for pupil movement
  PGraphics G; // Intermidiate
  PVector imgCtr; // Centre of eye
  
  Eye(PImage[] group, PGraphics g, int x, int y){
    P = group[0];
    E = group[1];
    M = group[2];
    G = g;
    imgCtr = new PVector( E.width/2, E.height/2);
    R = E.height*.4;
    T = new Transform(x,y,E.width,E.height);
  }
  
  Eye(PImage[] group, int x, int y){
    P = group[0];
    E = group[1];
    M = group[2];
    G = createGraphics(E.width, E.height);
    imgCtr = new PVector( E.width/2, E.height/2);
    R = E.height*.4;
    T = new Transform(x,y,E.width,E.height);
  }
  
  void draw(PVector m){
    PVector offset = m.copy();
    offset.sub(T.position);
    offset.x *= G.width/T.size.x;
    offset.y *= G.height/T.size.y;
    float dist = PVector.dist(imgCtr, offset);
    if(dist>R) dist=R;
    offset.sub(imgCtr).normalize().mult(dist).add(imgCtr);
    
    G.beginDraw();
    G.background(color(255,255,255));
    G.image( P, offset.x - P.width/2, offset.y - P.height/2);
    G.mask(M);
    G.image(E, 0,0, G.width,G.height);
    G.endDraw();
    image(G,T.position.x,T.position.y, T.size.x, T.size.y);
  }
  
}

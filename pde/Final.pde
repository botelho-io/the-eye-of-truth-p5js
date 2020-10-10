import ddf.minim.*;
import ddf.minim.analysis.*;
import processing.video.*;

Minim minim;
AudioPlayer audio;
BeatDetect beat;

void loadVideo(String file){
	video = new Movie(this, file);
	moviePlaying = false;
}

void drawVideo(){
	image(video, width/2, height/2);
}

void movieEvent(Movie Video){
	Video.read();
}

void setup() {
	fullScreen(P2D);
	minim = new Minim(this);
	audio = minim.loadFile("driverEOTT.mp3");
	beat = new BeatDetect();
  OpenSansSemiBoldCredits = createFont("OpenSansSemibold.ttf", 30);

	metaballs = new MetaBalls();
	olhos = new Olhos();
	PImage[]PEM = {loadImage("bigEye/P.png"), loadImage("bigEye/E.png"), loadImage("bigEye/M.png")};
	olho = new Eye(PEM, width/2 - PEM[1].width/2, height/2 - PEM[1].height/2);
	nowISee = new NowISee();
    faces = new Faces();

	loadVideo("intro.mov");
}

Movie video;
boolean moviePlaying = false;
boolean pBeat = false;
boolean cBeat = false;
boolean pSpace = false;
boolean cSpace = false;
color bgCol = CPallet.col(0);
PVector mouseInterpolate = new PVector(width/2, height/2);
PFont OpenSansSemiBoldCredits;

MetaBalls metaballs;
Olhos olhos;
Eye olho;
NowISee nowISee;
Faces faces;


void draw() {
  //noCursor();
	int pos = audio.position();

	if (pos<24105) {

		// 1 - INTRO -----------------------------------------------------------
			// Keep Up
				if(!moviePlaying){
					audio.play();
					video.play();
					imageMode(CENTER);
					moviePlaying = true;
				}
			// Draw
				metaballs.draw(); // No lag when displaying next scene
				background(color(76,95,117));
				drawVideo();
		// ---------------------------------------------------------------------

	} else if (pos<44953) {

		// 2 - BLOBS -----------------------------------------------------------
			// Keep Up
				if(moviePlaying){
					video.stop();
					loadVideo("fear.mov");
					imageMode(CORNER);
				}
			// Draw
				beat.detect(audio.mix);
				cBeat = beat.isOnset();
				if(cBeat && !pBeat) metaballs.randomBg();
				pBeat = cBeat;
				metaballs.draw();
		// ---------------------------------------------------------------------

	}else if (pos<48038) {

		// 3 - Nothing To Fear -------------------------------------------------
			// Keep Up
				if(metaballs != null) {
					metaballs = null;
					imageMode(CENTER);
					video.play();
					moviePlaying = true;
				}
			// Draw
				if(pos < 45885) {video.jump(0);}
				background(color(76,95,117));
				drawVideo();
		// ---------------------------------------------------------------------

	}else if (pos<71222) {

		// 4 - Cursor Follow ---------------------------------------------------
			// Keep Up
				if(moviePlaying){
					video.stop();
					loadVideo("yeah.mov");
					imageMode(CORNER);
				}
			// Draw
				beat.detect(audio.mix);
				cBeat = beat.isOnset();
				olhos.draw(cBeat && !pBeat);
				pBeat = cBeat;
		// ---------------------------------------------------------------------

	}else if (pos<71968) {

		// 5 - YEAH ------------------------------------------------------------
			// Keep Up
				if(olhos != null) {
					olhos = null;
					imageMode(CENTER);
					video.play();
					moviePlaying = true;
				}
			// Draw
		//if(pos < 71354) {video.jump(0);}
				background(color(76,95,117));
				drawVideo();
		// ---------------------------------------------------------------------

	}else if (pos<88407) {

		// 6 - BIG EYE ---------------------------------------------------------
			// Keep Up
				if(moviePlaying){
					video.stop();
					moviePlaying = false;
					//video = null;
					imageMode(CORNER);
				}
			// Draw
				background(bgCol);
				beat.detect(audio.mix);
				cBeat = beat.isOnset();
				if(cBeat && !pBeat) bgCol = CPallet.col(random(0,4));
				pBeat = cBeat;
        mouseInterpolate = PVector.lerp(mouseInterpolate,new PVector(mouseX, mouseY), 0.05);
				olho.draw(mouseInterpolate);
		// ---------------------------------------------------------------------

	}else if (pos<89649) {

		// 7 - I SEE...---------------------------------------------------------
			// Keep Up
				if(olho != null) olho = null;
			// Draw
				background(CPallet.palet[0]);
				nowISee.draw();
		// ---------------------------------------------------------------------

	}else if (pos<137785) {

		// 8 - CARAS -----------------------------------------------------------
			// Keep Up
				if(nowISee != null) nowISee = null;
			// Draw
        beat.detect(audio.mix);
        cBeat = beat.isOnset();
        if(cBeat && !pBeat) {faces.addFace();}
        pBeat = cBeat;
        cSpace = keyPressed && (key == ' ');
        if(cSpace && !pSpace) faces.randomBg();
        pSpace = cSpace;
        background(faces.backColor);
        faces.draw();
		// ---------------------------------------------------------------------

	}else {

		// 9 - FADEOUT ---------------------------------------------------------
			// Keep Up
				// N/A
			// Draw
        background(faces.backColor);
        faces.draw();
        float fade = (pos - 137785)/float((audio.length() - 137785));
        fade = constrain( fade*2 ,0,1);
        fill(color(0,0,0, 255*(fade)));
				rect(0,0, width,height);
        textFont(OpenSansSemiBoldCredits);
				fill(color(255,255,255,225*(fade)));
        textAlign(LEFT,BOTTOM);
				text("Driver | The Eye of Truth\nAndré Ribeiro & Luísa Lino", 40, height-40);
		// ---------------------------------------------------------------------

	}
}

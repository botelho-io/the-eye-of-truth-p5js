function Transform (X, Y, W, H) {
    this.position = createVector(X, Y);
    this.size = createVector(W, H);

    this.draw = function() {
        noFill();
        stroke(color(255,0,0));
        rect(this.position.x, this.position.y, this.size.x, this.size.y);
    }
}
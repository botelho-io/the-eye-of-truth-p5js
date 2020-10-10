function Dot(X, Y) {
    this.value   // Value the dot ocupies on the grid
    this.x       // Position of the dot
    this.y



    // Draw dot on surface
    Dot.prototype.draw = (g) => {
        if(value < 1) g.set(x, y, color(255,0,0));
        else g.set(x, y, color(0,255,0));
        g.text(value, x+1, y+1);
    }

    // Initializer
    this.x = X;
    this.y = Y;
}

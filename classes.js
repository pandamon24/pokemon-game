class Sprite {
    constructor({position, velocity, image, frames = { max: 1, hold: 10 }, sprites, animate }) {
        this.position = position;
        this.velocity = velocity;
        this.image = image;
        this.frames = {...frames, val: 0, elapsed: 0 };
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        };
        this.moving = false;
        this.sprites = sprites;
        this.animate = animate;
    }

    draw() {
        ctx.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        );

        if (!this.animate) {
            return;
        }
        if (this.frames.max > 1) {
            this.frames.elapsed++
        }
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) {
                this.frames.val++;
            } else {
                this.frames.val = 0;
            }
        }
    }
}

class Boundary {
    static width = 48; // background 이미지 - 12픽셀 크기를 400%로 import 했음
    static height = 48;
    constructor({ position }) {
        this.position = position;
        this.width = 48;
        this.height = 48;
    }

    draw() {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(this.position.x, this.position.y, Boundary.width, Boundary.height);
    }
}

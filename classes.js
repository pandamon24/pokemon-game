class Sprite {
    constructor({
        position,
        velocity,
        image,
        frames = {
            max: 1,
            hold: 10
        },
        sprites,
        animate,
        rotation = 0,
    }) {
        this.position = position;
        this.velocity = velocity;
        this.image = new Image();
        this.frames = {...frames, val: 0, elapsed: 0 };

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        };
        this.image.src = image.src;
        this.moving = false;
        this.sprites = sprites;
        this.animate = animate;
        this.opacity = 1;
        this.rotation = rotation;
    }

    draw() {
        ctx.save();
        ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(-(this.position.x + this.width / 2), -(this.position.y + this.height / 2));
        ctx.globalAlpha = this.opacity;
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
        ctx.restore();
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

class Monster extends Sprite {
    constructor({
        position,
        velocity,
        image,
        frames = {
            max: 1,
            hold: 10
        },
        sprites,
        animate,
        rotation = 0,
        isEnemy = false,
        name,
        attacks,
    }) {
        super({
            position,
            velocity,
            image,
            frames,
            sprites,
            animate,
            rotation,
        });
        this.health = 100;
        this.isEnemy = isEnemy;
        this.name = name;
        this.attacks = attacks;
    }
    attack({ attack, recipient, renderedSprites }) {
        document.querySelector('#dialogBox').style.display = "block";
        document.querySelector('#dialogBox').innerHTML = `${this.name} used ${attack.name}`;

        let healthBar = '#enemyHealth .spriteHealth';
        if (this.isEnemy) healthBar = '#playerHealth .spriteHealth';

        let rotation = 1;
        if (this.isEnemy) rotation = -2.2;

        recipient.health -= attack.damage;

        switch (attack.name) {
            case 'Tackle': {
                const tl = gsap.timeline();

                let movementDistance = 20;
                if (this.isEnemy) movementDistance = -20;

                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {
                        // Enemy actually gets hit
                        audio.tackleHit.play();

                        gsap.to(healthBar, {
                            width: recipient.health + '%',
                        })

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        });

                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                });
                break;
            }
            case 'Fireball': {
                audio.initFireball.play();

                const fireballImage = new Image();
                fireballImage.src = './img/fireball.png';
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y,
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 50,
                    },
                    animate: true,
                    rotation,
                });

                // fireball 이미지가 emby(player) 뒤 & draggle(상대편) 앞에 위치하게 하기 위함
                renderedSprites.splice(1, 0, fireball);

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        // Enemy actually gets hit
                        audio.fireballHit.play();

                        gsap.to(healthBar, {
                            width: recipient.health + '%',
                        })

                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        });

                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08,
                        })

                        renderedSprites.splice(1, 1);
                    }
                });

                break;
            }
            default: {
                break;
            }
        }
    }

    faint() {
        document.querySelector('#dialogBox').innerHTML = `${this.name} fainted!`;
        gsap.to(this.position, {
            y: this.position.y + 20
        });
        gsap.to(this, {
            opacity: 0
        })

        audio.battle.stop();
        audio.victory.play();
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
        ctx.fillStyle = 'rgba(255, 0, 0, 0)';
        ctx.fillRect(this.position.x, this.position.y, Boundary.width, Boundary.height);
    }
}

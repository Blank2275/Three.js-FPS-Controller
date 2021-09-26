class FPSController{
    constructor(scene, camera, renderer, x = 0, y = 0, z = 0, sensitivity = 130, movementSpeed = 0.2, raycastLayer = 20, gravity = 0.02, height = 1.5, jumpForce = .5){
        this.x = x;
        this.y = y;
        this.z = z;
        this.xAngle = 0;
        this.yAngle = 0;
        this.camera = camera;
        this.camera.position.set(x, y, z);
        this.sensitivity = sensitivity;
        this.movementSpeed = movementSpeed;
        this.renderer = renderer;
        this.keysDown = {}
        this.scene = scene;
        this.raycastLayer = raycastLayer;
        this.gravity = gravity;
        this.height = height;
        this.jumpForce = jumpForce;

        renderer.domElement.addEventListener("mousemove", (event) => this.mousemove(event));
        renderer.domElement.tabIndex = "1";
        renderer.domElement.addEventListener("keydown", (event) => this.keydown(event));
        renderer.domElement.addEventListener("keyup", (event) => this.keyup(event));
        renderer.domElement.requestPointerLock = renderer.domElement.requestPointerLock || renderer.domElement.mozRequestPointerLock;
        renderer.domElement.addEventListener("click", () => {
            renderer.domElement.requestPointerLock();
        });

        //set raycaster looking down
        this.downRaycaster = new THREE.Raycaster();
        this.downRaycaster.layers.set(this.raycastLayer);

        //falling speed
        this.yVelocity = 0;
    }

    update(){
        var moving = false;
        var angle = 0;
        var keysDown = this.keysDown;

        if(keysDown["A"] || keysDown["W"] || keysDown["S"] || keysDown["D"]){
            moving = true;
        }
        if(keysDown["A"]){
            angle -= Math.PI / 2;
        } else if(keysDown["S"]){
            angle += Math.PI;
        } else if(keysDown["D"]){
            angle += Math.PI / 2;
        }
        var xRotation = this.xAngle + angle;
        var x = Math.cos(xRotation);
        var z = Math.sin(xRotation);
        x *= this.movementSpeed;
        z *= this.movementSpeed;
        
        if(moving){
            this.move(x, 0, z);
        }

        this.yVelocity -= this.gravity;

        var down = new THREE.Vector3(0,-1,0)
        this.downRaycaster.set(this.camera.position, down);
        const intersects = this.downRaycaster.intersectObjects(this.scene.children);
        this.grounded = false;
        for(var intersect of intersects){
            if(intersect.distance < this.height){
                this.yVelocity = 0;
                this.grounded = true;
            }
        }
        this.move(0, this.yVelocity, 0);
        if(this.grounded){
            this.yVelocity = this.gravity;
        }
        if(this.grounded && this.keysDown["Space"]){
            this.yVelocity = this.jumpForce;
            this.move(0, 1, 0);
            console.log("Jump")
        }
    }

    move(x, y, z){
        this.x += x;
        this.z += z;
        this.y += y;
        this.camera.position.x += x;
        this.camera.position.z += z;
        this.camera.position.y += y;
    }

    setPosition(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
        this.camera.position.x = x;
        this.camera.position.y = y;
        this.camera.position.z = z;
    }

    rotate(x, y){
        this.xAngle += x;
        this.yAngle -= y;

        if(this.yAngle > Math.PI){
            this.yAngle = Math.PI;
        } else if(this.yAngle < 0){
            this.yAngle = 0;
        }

        var x = Math.sin(this.yAngle) * Math.cos(this.xAngle);
        var z = Math.sin(this.yAngle) * Math.sin(this.xAngle);
        var y = Math.cos(this.yAngle);
        x += this.x;
        y += this.y;
        z += this.z;

        this.camera.lookAt(new THREE.Vector3(x, y, z))
    }
    mousemove(event){
        if(document.pointerLockElement === renderer.domElement || document.mozPointerLockElement === renderer.domElement){
            var changeX = event.movementX;
            var changeY = -event.movementY;
            this.rotate(changeX / this.sensitivity, changeY / this.sensitivity);
        }
    }
    keydown(event){
        switch (event.code){
            case "KeyW":
                this.keysDown["W"] = true;
                break;
            case "KeyA":
                this.keysDown["A"] = true;
                break;          
            case "KeyS":
                this.keysDown["S"] = true;
                break;
            case "KeyD":
                this.keysDown["D"] = true;
                break;
            case "Space":
                this.keysDown["Space"] = true;
                break;
        }
    }
    keyup(event){
        switch (event.code){
            case "KeyW":
                this.keysDown["W"] = false;
                break;
            case "KeyA":
                this.keysDown["A"] = false; 
                break;           
            case "KeyS":
                this.keysDown["S"] = false;
                break;
            case "KeyD":
                this.keysDown["D"] = false;
                break;
            case "Space":
                this.keysDown["Space"] = false;
                break;
        }
    }
}
class FPSController{
    constructor(info){
        this.x = info.x || 0;
        this.y = info.y || 0;
        this.z = info.z || 0;
        this.xAngle = 0;
        this.yAngle = 0;
        this.camera = info.camera;
        this.camera.position.set(this.x, this.y, this.z);
        this.sensitivity = info.sensitivity || 130;
        this.movementSpeed = info.movementSpeed || .2;
        this.maxSteepness = info.maxSteepness || .7;
        this.renderer = info.renderer;
        this.keysDown = {}
        this.scene = info.scene;
        this.raycastLayer = info.raycastLayer || 20;
        this.gravity = info.gravity || .02;
        this.height = info.height || 1.5;
        this.jumpForce = info.jumpForce || .5;

        this.renderer.domElement.addEventListener("mousemove", (event) => this.mousemove(event));
        this.renderer.domElement.tabIndex = "1";
        this.renderer.domElement.addEventListener("keydown", (event) => this.keydown(event));
        this.renderer.domElement.addEventListener("keyup", (event) => this.keyup(event));
        this.renderer.domElement.requestPointerLock = this.renderer.domElement.requestPointerLock || this.renderer.domElement.mozRequestPointerLock;
        this.renderer.domElement.addEventListener("click", () => {
            this.renderer.domElement.requestPointerLock();
        });

        //set raycaster looking down
        this.downRaycaster = new THREE.Raycaster();
        //this.downRaycaster.layers.set(this.raycastLayer);
        //set top and bottom raycasts
        this.topRaycaster = new THREE.Raycaster();
        //this.topRaycaster.layers.set(this.raycastLayer);
        this.bottomRaycaster = new THREE.Raycaster();
        //this.bottomRaycaster.layers.set(this.raycastLayer);
        this.upRaycaster = new THREE.Raycaster();
        //falling speed
        //for some reason some collisions do not work if y velocity starts at 0 or something
        this.yVelocity = 0.01;
        this.onSlope = false;
        this.movingX = 0;
        this.movingZ = 0;
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
            if(!this.onSlope){
                this.movingX = x;
                this.movingZ = z;
            }
            this.move(x, 0, z);
        }

        this.yVelocity -= this.gravity;

        var down = new THREE.Vector3(0,-1,0)
        this.downRaycaster.set(this.camera.position, down);
        const intersects = this.downRaycaster.intersectObjects(this.getAllObjectsInScene());
        for(var intersect of intersects){
            if(intersect.distance < this.height && !this.onSlope){
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
        }
        if(!this.grounded){
            var up = new THREE.Vector3(0, 1, 0);
            this.upRaycaster.set(this.camera.position, up);
            var upIntersections = this.upRaycaster.intersectObjects(this.getAllObjectsInScene());
            for(var intersection of upIntersections){
                if(intersection.distance < this.yVelocity){
                    this.move(0, -this.yVelocity, 0);
                    this.yVelocity = 0;
                }
            }
        }
        this.grounded = false;

        //check for collision with walls
        var forward = new THREE.Vector3(this.movingX, 0, this.movingZ).normalize();
        var cameraPos = this.camera.position;
        var bottomOffset = this.height - 0.2;
        var bottomPosition = new THREE.Vector3(cameraPos.x, cameraPos.y - bottomOffset, cameraPos.z);
        this.bottomRaycaster.set(bottomPosition, forward);
        var bottomIntersections = this.bottomRaycaster.intersectObjects(this.getAllObjectsInScene());
        console.log(bottomIntersections);
        var bottomIntersection = false;

        for(var intersection of bottomIntersections){
            if(intersection.distance <= 1.5){
                bottomIntersection = intersection;
            }
        }
        if(bottomIntersection && moving){
            this.onSlope = true;
            this.grounded = true;
            var r = bottomIntersection.object.rotation;
            var rotation = new THREE.Vector3(r.x, r.y, r.z);
            var axis = new THREE.Vector3(0, 1, 0);
            var normal = bottomIntersection.face.normal.applyAxisAngle(axis, 0);
            var qRot = new THREE.Quaternion()
            qRot.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
            normal = new THREE.Euler().setFromQuaternion(qRot);
            rotation.x += normal.x;
            rotation.y += normal.y;
            rotation.z += normal.z;
            if(rotation.x > this.maxSteepness || rotation.z > this.maxSteepness || rotation.x < -this.maxSteepness || rotation.z < -this.maxSteepness){
                //this.move(-this.movingX * 2, 0, -this.movingZ * 2)
                var r = bottomIntersection.object.rotation;
                var rotation = new THREE.Vector3(r.x, r.y, r.z);
                var position = bottomIntersection.point;
                var normal = bottomIntersection.face.normal;
                var rotatedNormal = rotation;
                rotatedNormal.x += normal.x;
                rotatedNormal.y += normal.y;
                rotatedNormal.z += normal.z;
                position.x += rotatedNormal.x / 3;
                position.z += rotatedNormal.z / 3;
                
                //if in corner
                var inCorner = false;
                var moving = new THREE.Vector3();
                moving.x = position.x;
                moving.z = position.z;
                moving.x -= this.x - x;
                moving.z -= this.z - z;
                bottomPosition.x -= x;
                bottomPosition.z -= z;
                this.bottomRaycaster.set(bottomPosition, moving)
                var sidewaysIntersections = this.bottomRaycaster.intersectObjects(this.getAllObjectsInScene());
                for(var intersection of sidewaysIntersections){
                    if(intersection.distance < 1){
                        inCorner = true;
                        var normal = intersection.face.normal;
                        normal = new THREE.Vector3(normal.x, normal.y, normal.z);
                        var rotation = intersection.object.rotation;
                        rotation = new THREE.Vector3(rotation.x, rotation.y, rotation.z);
                        normal.x += rotation.x;
                        normal.y += rotation.y;
                        normal.z += rotation.z;
                        this.setPosition(intersection.point.x + normal.x / 3, position.y + bottomOffset, intersection.point.z + normal.z / 3)
                        console.log("corner");
                    }
                }
                if(!inCorner){
                    this.setPosition(position.x, position.y + bottomOffset, position.z);
                }
                

            }
            //if it is not to steep, teleport player up a lot and then teleport them to the ground
            cameraPos.y += 3;
            this.downRaycaster.set(cameraPos, down);
            var downIntersections = this.downRaycaster.intersectObjects(this.getAllObjectsInScene());
            var closest = 10000;
            var closestIntersection;
            for(var intersection of downIntersections){
                if(intersection.distance < closest){
                    closest = intersection.distance;
                    closestIntersection = intersection;
                }
            }
            if(closest != 10000){
                closestIntersection.point.y += this.height + .2;
                this.y = closestIntersection.point.y;
                this.camera.position.y = this.y;
                this.yVelocity = this.gravity;
            }
                
        }else{
            this.onSlope = false;
        }
    }

    getAllObjectsInScene(){
        var result = [];
        this.scene.traverse((child) => {
            if(child instanceof THREE.Mesh){
                result.push(child);
            }
        });
        return result;
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

function lerp(v0, v1, t){
    return (1 - t) * v0 + t * v1;
}
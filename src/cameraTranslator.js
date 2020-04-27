var THREE = require("three")

function translateCamera(posFrom, posTo, targetFrom, targetTo, time, camera){
    
    var elapsed;
    var animationId;
    var currentPos = new THREE.Vector3();
    var currentTargetPos = new THREE.Vector3();
    
    var clock = new THREE.Clock();

    var vectorPos = new THREE.Vector3();
    var posFromClone = new THREE.Vector3();
    // var vectorPos = posTo.clone();
    vectorPos.x = posTo.x;
    vectorPos.y = posTo.y;
    vectorPos.z = posTo.z;

    posFromClone.x = posFrom.x;
    posFromClone.y = posFrom.y;
    posFromClone.z = posFrom.z;

    vectorPos.sub(posFrom);
    
    console.log("vectorPos ")
    console.log(vectorPos)
    var temp;

    animate();

    function animate(){
        animationId = requestAnimationFrame(animate);

        elapsed = clock.getElapsedTime();

        if(elapsed >= time){
            cancelAnimationFrame(animationId);
        }

        var t = elapsed / time;
        

        currentPos.x = (posFrom.x * (1 - t)) + (posTo.x * t);
        currentPos.y = (posFrom.y * (1 - t)) + (posTo.y * t);
        currentPos.z = (posFrom.z * (1 - t)) + (posTo.z * t);

        currentTargetPos.x = (targetFrom.x * (1 - t)) + (targetTo.x * t);
        currentTargetPos.y = (targetFrom.y * (1 - t)) + (targetTo.y * t);
        currentTargetPos.z = (targetFrom.z * (1 - t)) + (targetTo.z * t);

        currentPos = posFrom.clone().add(vectorPos.clone().multiplyScalar(t))
        // console.log(posFrom.clone().add(vectorPos.clone().multiplyScalar(t)))
        // console.log()
        temp = vectorPos.clone().multiplyScalar(t)
        // camera.position.copy(currentPos.clone())
        camera.position.set(temp.x + posFromClone.x, temp.y + posFromClone.y, temp.z + posFromClone.z)
        // console.log(currentPos)
        // camera.lookAt(currentTargetPos)

        // console.log("t " + t)
        // console.log(currentPos)

        camera.updateProjectionMatrix();
        
    }
}

export { translateCamera }

function onWindowResize(camera, renderer) {
  const width   = window.innerWidth;
  const height  = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}



function resetVector(vector) {
  vector.x = 0;
  vector.y = 0;
  vector.z = 0;
}




export {
  onWindowResize,
  resetVector
}


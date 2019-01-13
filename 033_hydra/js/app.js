const Hydra = require('hydra-synth')


window.onload = function () {
  let canvas = document.createElement('canvas');
  canvas.setAttribute("id", "hydra-canvas0-tex");
  canvas.style.width = "1024px"
  canvas.style.height = "1024px"
  canvas.width = 1024;
  canvas.height = 1024;
  document.body.appendChild(canvas)
  canvas.style.display = "none";

  const hydra = new Hydra({canvas: canvas})

  // by default, hydra makes everything global.
  // see options to change parameters
  hydra.osc().color(0.1).pixelate(200,200).kaleid(2).out()
}

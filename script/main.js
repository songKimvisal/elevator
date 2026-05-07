// main.js
import { Elevator } from "./elevator.js";
import { ControlPanelHandler } from "./controlPanel.js";

function initializeElevators() {
  const leftElevator = new Elevator("left");
  const rightElevator = new Elevator("right");

  leftElevator.initialize();
  rightElevator.initialize();

  ControlPanelHandler.init(leftElevator);
  ControlPanelHandler.init(rightElevator);

  // Expose functions globally for HTML onclick
  window.openDoor = (id) =>
    (id === "left" ? leftElevator : rightElevator).openDoor();
  window.closeDoor = (id) =>
    (id === "left" ? leftElevator : rightElevator).closeDoor();
  window.moveElevator = (id, direction) =>
    (id === "left" ? leftElevator : rightElevator).setDirection(direction);

  console.log("Elevators initialized");
}

document.addEventListener("DOMContentLoaded", initializeElevators);

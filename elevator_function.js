let floorQueue = [];
let moving = false;
let currentFloor = 1;

function queueFloor(floor) {
  if (!floorQueue.includes(floor) && floor !== currentFloor) {
    floorQueue.push(floor);
    processQueue();
  }
}

function processQueue() {
  if (moving || floorQueue.length === 0) return;

  let leftDoor = document.getElementById("left-door");
  let rightDoor = document.getElementById("right-door");
  if (
    leftDoor.classList.contains("open") ||
    rightDoor.classList.contains("open")
  ) {
    alert("Close the door before moving the elevator!");
    return;
  }

  moving = true;
  let nextFloor = floorQueue.shift();
  moveElevator(nextFloor);
}

function moveElevator(floor) {
  let elevator = document.getElementById("elevator");
  let position = (floor - 1) * 12.5;
  elevator.style.bottom = position + "%";

  setTimeout(() => {
    currentFloor = floor;
    document.getElementById("current-floor").textContent = floor;
    openDoor();
    setTimeout(() => {
      closeDoor();
      moving = false;
      processQueue();
    }, 2000);
  }, 2000);
}

function openDoor() {
  document.getElementById("left-door").classList.add("open");
  document.getElementById("right-door").classList.add("open");
}

function closeDoor() {
  document.getElementById("left-door").classList.remove("open");
  document.getElementById("right-door").classList.remove("open");
  processQueue();
}
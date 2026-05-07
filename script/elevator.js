import {
  FLOOR_HEIGHT,
  DOOR_ANIMATION_DURATION,
  TRAVEL_TIME_PER_FLOOR,
  UPDATE_INTERVAL,
  TOTAL_FLOORS,
} from "./constants.js";

export class Elevator {
  constructor(id) {
    this.id = id; // "left" or "right"
    this.currentFloor = 1;
    this.targetFloor = 1;
    this.isMoving = false;
    this.doorsOpen = false;
    this.pendingDirection = null;
    this.doorElement = document.querySelector(`.${id}-door`);
    this.controlPanel = document.querySelector(`.${id}-control`);
    this.floorQueue = [];
    this.isProcessingQueue = false;
  }

  openDoor() {
    if (this.doorsOpen || this.isMoving) return;

    const leftPanel = this.doorElement.querySelector(".left-panel");
    const rightPanel = this.doorElement.querySelector(".right-panel");

    leftPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
    rightPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
    leftPanel.style.transform = "translateX(-32px)";
    rightPanel.style.transform = "translateX(32px)";

    this.doorsOpen = true;
    console.log(`${this.id} doors opened`);
  }

  closeDoor() {
    if (!this.doorsOpen || this.isMoving) return;

    const leftPanel = this.doorElement.querySelector(".left-panel");
    const rightPanel = this.doorElement.querySelector(".right-panel");

    leftPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
    rightPanel.style.transition = `transform ${DOOR_ANIMATION_DURATION}ms`;
    leftPanel.style.transform = "translateX(0)";
    rightPanel.style.transform = "translateX(0)";

    this.doorsOpen = false;
    console.log(`${this.id} doors closed`);
    
    if (!this.isMoving && this.floorQueue.length > 0) {
      this.processNextQueueItem();
    }
  }

  moveToFloor() {
    if (this.currentFloor === this.targetFloor || this.isMoving) return;

    this.isMoving = true;
    const floorsToMove = Math.abs(this.targetFloor - this.currentFloor);
    const totalTravelTime = floorsToMove * TRAVEL_TIME_PER_FLOOR;
    const steps = totalTravelTime / UPDATE_INTERVAL;
    const floorStep = (this.targetFloor - this.currentFloor) / steps;
    let currentStep = 0;

    this.doorElement.style.transition = `bottom ${totalTravelTime}ms linear`;
    const newBottomPosition = (this.targetFloor - 1) * FLOOR_HEIGHT;
    this.doorElement.style.bottom = `${newBottomPosition}px`;

    const interval = setInterval(() => {
      currentStep++;
      this.currentFloor += floorStep;
      this.updateDisplay();

      if (currentStep >= steps) {
        clearInterval(interval);
        this.currentFloor = this.targetFloor;
        this.isMoving = false;
        this.pendingDirection = null;
        console.log(`${this.id} reached floor ${this.currentFloor}`);
      }
    }, UPDATE_INTERVAL);

    setTimeout(() => {
      if (Math.round(this.currentFloor) === this.targetFloor) {
        this.openDoor();
        setTimeout(() => {
          this.closeDoor();
          this.isProcessingQueue = false;
          if (this.floorQueue.length > 0) {
            setTimeout(() => this.processNextQueueItem(), DOOR_ANIMATION_DURATION);
          }
        }, DOOR_ANIMATION_DURATION * 2);
      }
    }, totalTravelTime);
  }

  setDirection(direction) {
    if (direction === "up" && this.currentFloor >= TOTAL_FLOORS) return;
    if (direction === "down" && this.currentFloor <= 1) return;

    if (this.isMoving || this.doorsOpen) {
      this.addToQueue({
        type: 'direction',
        direction: direction
      });
      return;
    }

    this.pendingDirection = direction;
    this.openDoor();
    console.log(`${this.id} set to move ${direction}`);
  }

  updateDisplay() {
    if (this.controlPanel) {
      this.controlPanel.querySelector(
        ".display"
      ).textContent = `Floor: ${Math.round(this.currentFloor)}`;
    }
  }

  selectFloor(floor) {
    if (floor < 1 || floor > TOTAL_FLOORS) return;

    if (Math.round(this.currentFloor) === floor && !this.isMoving) {
      console.log(`${this.id} is already at floor ${floor}`);
      return;
    }
    
    if (this.isMoving || this.doorsOpen || !this.pendingDirection) {
      this.addToQueue({
        type: 'floor',
        floor: floor
      });
      return;
    }

    if (
      (this.pendingDirection === "up" && floor <= this.currentFloor) ||
      (this.pendingDirection === "down" && floor >= this.currentFloor)
    ) {
      this.pendingDirection = null;
      console.log(`${this.id}: Invalid floor ${floor} for direction ${this.pendingDirection}`);
      return;
    }

    this.targetFloor = floor;
    this.closeDoor();
    setTimeout(() => {
      this.moveToFloor();
      console.log(`${this.id} moving to floor ${floor}`);
    }, DOOR_ANIMATION_DURATION);
  }

  addToQueue(request) {
    this.floorQueue.push(request);
    console.log(`${this.id} added request to queue:`, request);
    
    if (!this.isProcessingQueue && !this.isMoving && !this.doorsOpen) {
      this.processNextQueueItem();
    }
  }

  processNextQueueItem() {
    if (this.isProcessingQueue || this.floorQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    const request = this.floorQueue.shift();
    
    console.log(`${this.id} processing queue item:`, request);
    
    if (request.type === 'direction') {
      this.pendingDirection = request.direction;
      this.openDoor();
      console.log(`${this.id} set to move ${request.direction} from queue`);
    } else if (request.type === 'floor') {
      if (!this.pendingDirection) {
        this.pendingDirection = request.floor > this.currentFloor ? "up" : "down";
        this.openDoor();
        setTimeout(() => {
          this.targetFloor = request.floor;
          this.closeDoor();
          setTimeout(() => {
            this.moveToFloor();
          }, DOOR_ANIMATION_DURATION);
        }, DOOR_ANIMATION_DURATION);
      } else {
        if (
          (this.pendingDirection === "up" && request.floor > this.currentFloor) ||
          (this.pendingDirection === "down" && request.floor < this.currentFloor)
        ) {
          this.targetFloor = request.floor;
          this.closeDoor();
          setTimeout(() => {
            this.moveToFloor();
          }, DOOR_ANIMATION_DURATION);
        } else {
          console.log(`${this.id}: Requeuing floor ${request.floor} for later`);
          this.floorQueue.push(request);
          this.isProcessingQueue = false;
          this.processNextQueueItem();
        }
      }
    }
  }

  initialize() {
    this.doorElement.style.bottom = "0px";
    this.updateDisplay();
  }
}

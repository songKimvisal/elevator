// controlPanel.js
export const ControlPanelHandler = {
  init(elevator) {
    const panel = document.querySelector(`.${elevator.id}-control`);
    if (!panel) {
      console.error(`.${elevator.id}-control not found`);
      return;
    }

    const floorButtons = panel.querySelectorAll("button[data-floor]");
    floorButtons.forEach((button) => {
      const floor = parseInt(button.getAttribute("data-floor"));
      button.addEventListener("click", () => {
        console.log(`Floor button ${floor} clicked for ${elevator.id}`);
        elevator.selectFloor(floor);
      });
    });
  },
};

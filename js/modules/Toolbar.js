class Toolbar extends Panel {
    constructor() {
        super();
        this.panel.className = "toolbar";
    }
    addTool(tool) {
        this.panel.appendChild(tool.getTool());
    }
}

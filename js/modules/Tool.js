class Tool {
    tool;
    constructor(src, name) {
        this.tool = document.createElement("img");
        this.tool.src = src;
        this.tool.title = name;
        this.tool.className = "tool";
    }
    setName(title) {
        this.tool.title = title;
    }
    getTool() {
        return this.tool;
    }
    set OnClick(func) {
        this.tool.onclick = func;
    }
}

class Panel {
    panel;
    constructor() {
        this.panel = document.createElement("div");
    }
    addPanel(panel) {
        this.panel.appendChild(panel.getPanel());
    }
    setPosition(x, y) {
        this.panel.style.left = x + "px";
        this.panel.style.top = y + "px";
    }
    setWidth(width) {
        this.panel.style.width = width + "px";
    }
    setHeight(height) {
        this.panel.style.height = height + "px";
    }
    getSize() {
        return [this.panel.clientWidth, this.panel.clientHeight];
    }
    getPanel() {
        return this.panel;
    }
    getPosition() {
        return [this.panel.offsetLeft, this.panel.offsetTop];
    }
}
class EditorViewPanel extends Panel {
    mutation_observer;
    node_connector;
    last_change_event;
    OnClose = (panel) => { };
    close() {
        this.mutation_observer.disconnect();
        this.panel.style.scale = "0";
        setTimeout(() => { this.panel.remove(); }, 200);
        this.OnClose(this);
    }
    OnConnect(connector) { }
    OnChangeDetected(change) {
        switch (change.TYPE) {
        }
    }
}
class TitlePanel extends EditorViewPanel {
    title;
    constructor() {
        super();
        this.panel.className = "title_panel";
        let img = document.createElement("img");
        img.src = "./media/globe.png";
        img.className = "globe_img";
        this.panel.appendChild(img);
        this.title = document.createElement("p");
        this.title.textContent = "title";
        this.title.contentEditable = "true";
        this.panel.appendChild(this.title);
        let close_button = document.createElement("img");
        close_button.src = "./media/close-small.png";
        close_button.className = "close";
        close_button.onclick = () => {
            this.node_connector.remove();
            this.close();
        };
        this.panel.appendChild(close_button);
    }
    getData() {
        return this.title.innerText;
    }
    loadData(name) {
        this.title.innerText = name;
    }
}
class ContentViewPanel extends EditorViewPanel {
    toolbar;
    constructor() {
        super();
        this.toolbar = new Toolbar();
        this.addPanel(this.toolbar);
        let connection_status_tool = new Tool("./media/connect-small.png", "Connection Status");
        connection_status_tool.OnClick = () => {
            let connection_status_panel = CreateConnectionStatusPanel(this.node_connector);
            connection_status_panel.style.scale = "0";
            this.panel.appendChild(connection_status_panel);
            setTimeout(() => { connection_status_panel.style.scale = "1"; }, 10);
        };
        let close_tool = new Tool("./media/close-small.png", "Close");
        close_tool.OnClick = () => {
            this.node_connector.remove();
            this.close();
        };
        this.toolbar.addTool(connection_status_tool);
        this.toolbar.addTool(close_tool);
    }
    OnConnect(connector) { }
    OnChangeDetected(change) {
        switch (change.TYPE) {
        }
    }
}
class ImageCollectionPanel extends ContentViewPanel {
    media_container;
    media_objects = [];
    constructor() {
        super();
        this.panel.className = "panel";
        this.media_container = document.createElement("div");
        this.media_container.className = "media_container";
        this.panel.appendChild(this.media_container);
        this.media_container.onscroll = () => {
            let most_visible_media_index = Math.round(this.media_container.scrollTop / this.media_container.clientHeight);
            if (this.node_connector != null) {
                this.node_connector.reflectChange({ TYPE: NODE_CONNECTION_CHANGE.COLLECTION_SCROLL, CHANGE: { index: most_visible_media_index, length: this.media_objects.length, object: this.media_objects[most_visible_media_index] } });
            }
        };
    }
    getData() {
    }
    loadData(data) {
    }
    addMediaObject(media) {
        this.media_objects.push(media);
        this.media_container.appendChild(media.getMediaObject());
    }
    OnConnect(connector) {
        console.log(connector);
    }
    OnChangeDetected(change) {
        switch (change.TYPE) {
            case NODE_CONNECTION_CHANGE.COLLECTION_SCROLL:
                break;
        }
    }
}
class TasksListPanel extends ContentViewPanel {
    constructor() {
        super();
        this.panel.className = "panel";
        this.panel.style.overflowY = "auto";
        this.panel.style.padding = "10px";
        this.panel.style.scrollbarWidth = "none";
        let new_task_tool = new Tool("./media/add-small.png", "Add new task");
        new_task_tool.OnClick = () => {
            this.AddTask("New task!");
        };
        this.toolbar.addTool(new_task_tool);
    }
    getData() {
        let task_list = [];
        for (const task of Array.from(this.panel.children).slice(1)) {
            task_list.push({ "name": task.children[1].innerHTML, "completed": !task.children[0]["pending"] });
        }
        return { "tasks": task_list, "size": this.getSize() };
    }
    loadData(data) {
        const [w, h] = data.size;
        this.setWidth(w);
        this.setHeight(h);
        for (const task of data.tasks) {
            this.AddTask(task.name, task.completed);
        }
    }
    AddTask(name, completed = false) {
        let task = document.createElement("div");
        task.className = "task";
        let img = document.createElement("img");
        img.className = completed ? "completed_img" : "pending_img";
        let title = document.createElement("div");
        title.innerHTML = name;
        title.contentEditable = "true";
        title.className = completed ? "completed" : "";
        img["pending"] = !completed;
        img.onclick = () => {
            if (!img["pending"]) {
                img.className = "pending_img";
                title.className = "";
            }
            else {
                title.className = "completed";
                img.className = "completed_img";
            }
            img["pending"] = !img["pending"];
        };
        task.appendChild(img);
        task.appendChild(title);
        this.panel.appendChild(task);
    }
}

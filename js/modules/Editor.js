class MediaObject {
    media_object;
    constructor(media_object) {
        this.media_object = media_object;
        this.media_object.className = "media_object";
    }
    getMediaObject() {
        return this.media_object;
    }
}
class ImageObject extends MediaObject {
    constructor(image_object) {
        if (typeof image_object === "string") {
            const image = document.createElement("img");
            image.src = image_object;
            super(image);
        }
        else {
            super(image_object);
        }
    }
}
class Editor {
    area;
    panel_list = [];
    constructor(area) {
        this.area = area;
    }
    removePanel(panel) {
        this.panel_list.splice(this.panel_list.indexOf(panel), 1);
    }
    addPanel(panel) {
        if (panel instanceof (EditorViewPanel)) {
            this.panel_list.push(panel);
            panel.OnClose = this.removePanel.bind(this);
        }
        this.area.appendChild(panel.getPanel());
    }
    bindNodeConnector(panel, node_connector) {
        node_connector.getNode().setPosition(panel.getPanel().offsetLeft - 15, panel.getPanel().offsetTop - 15);
        let observer = new MutationObserver((mutations) => {
            for (let mutation of mutations) {
                if (mutation.type == 'attributes') {
                    node_connector.getNode().setPosition(panel.getPanel().offsetLeft - 15, panel.getPanel().offsetTop - 15);
                    // check position of the connected node's direction relative to the panel
                    let connections = node_connector.getConnections();
                    if (connections.length > 0) {
                        let left_count = 0;
                        let right_count = 0;
                        connections.forEach((connection) => {
                            let panel = connection.observer.getConnectionObject();
                            if (panel.getPanel().offsetLeft < node_connector.getNode().getPanel().offsetLeft) {
                                left_count++;
                            }
                            else {
                                right_count++;
                            }
                        });
                        if (left_count > right_count) {
                            node_connector.getNode().setPosition(panel.getPanel().offsetLeft - 15, panel.getPanel().offsetTop - 15);
                        }
                        else {
                            node_connector.getNode().setPosition(panel.getPanel().offsetLeft + panel.getPanel().offsetWidth - 15, panel.getPanel().offsetTop - 15);
                        }
                    }
                }
            }
        });
        observer.observe(panel.getPanel(), { attributes: true });
        panel.mutation_observer = observer;
        this.area.appendChild(node_connector.getNode().getPanel());
    }
    getPanelInstanceName(panel) {
        if (panel instanceof (TitlePanel)) {
            return "TitlePanel";
        }
        else if (panel instanceof (TasksListPanel)) {
            return "TaskListPanel";
        }
    }
    getPanelFromType(type) {
        let panel;
        if (type == "TitlePanel") {
            panel = new TitlePanel();
        }
        else if (type == "TaskListPanel") {
            panel = new TasksListPanel();
        }
        new DraggAble(panel);
        editor.bindNodeConnector(panel, new NodeConnector(panel));
        return panel;
    }
    exportData() {
        let json_data = [];
        for (const element of this.panel_list) {
            let panel_connection = [];
            for (const connection of element.node_connector.getConnections()) {
                let indx = this.panel_list.indexOf(connection.observer.getConnectionObject());
                if (indx != -1) {
                    panel_connection.push(indx);
                }
            }
            let panel_data = {
                "type": this.getPanelInstanceName(element),
                "connections": panel_connection,
                "data": element.getData(),
                "position": element.getPosition()
            };
            json_data.push(panel_data);
        }
        return json_data;
    }
    importData(data) {
        for (const content of data) {
            let panel = this.getPanelFromType(content.type);
            const [x, y] = content.position;
            panel.setPosition(x, y);
            panel.loadData(content.data);
            this.addPanel(panel);
            for (const connection_index of content.connections) {
                if (connection_index < this.panel_list.length) {
                    panel.node_connector.connectWith(this.panel_list[connection_index].node_connector);
                }
            }
        }
    }
}

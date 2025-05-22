var NODE_CONNECTION_CHANGE;
(function (NODE_CONNECTION_CHANGE) {
    NODE_CONNECTION_CHANGE[NODE_CONNECTION_CHANGE["FILE_SELECTION"] = 0] = "FILE_SELECTION";
    NODE_CONNECTION_CHANGE[NODE_CONNECTION_CHANGE["COLLECTION_SCROLL"] = 1] = "COLLECTION_SCROLL";
})(NODE_CONNECTION_CHANGE || (NODE_CONNECTION_CHANGE = {}));
class NodeObject {
    node_connector = null;
    panel = null;
    constructor() {
        this.panel = document.createElement("div");
        this.panel.className = "connector_node";
    }
    getPanel() {
        return this.panel;
    }
    setPosition(x, y) {
        this.panel.style.left = x - 5 + "px";
        this.panel.style.top = y - 5 + "px";
    }
}
class NodeConnector {
    drop_area = null;
    temp_link_line = null;
    temp_node = null;
    node = null;
    connections = new Array();
    connector_object;
    static active_node_object = null;
    constructor(connector) {
        this.connector_object = connector;
        this.node = new NodeObject();
        this.drop_area = new DropArea(this.node.getPanel());
        this.node.getPanel().draggable = true;
        this.node.getPanel().addEventListener("dragstart", this.drag_start_handler.bind(this));
        this.node.getPanel().addEventListener("dragend", this.drag_end_handler.bind(this));
        this.drop_area.DropHandler = this.drop_handler.bind(this);
        this.connector_object.node_connector = this;
    }
    drop_handler(ev) {
        ev.preventDefault();
        let node = NodeConnector.active_node_object;
        if (node != null) {
            ev.preventDefault();
            this.connectWith(node.node_connector);
        }
    }
    drag_start_handler(ev) {
        ev.dataTransfer.setDragImage(new Image(), 0, 0);
        this.temp_node = new NodeObject();
        this.temp_node.node_connector = this;
        this.temp_node.getPanel().style.zIndex = "-1";
        this.temp_node.getPanel().style.left = this.node.getPanel().offsetLeft + "px";
        this.temp_node.getPanel().style.top = this.node.getPanel().offsetTop + "px";
        this.node.getPanel().parentElement.appendChild(this.temp_node.getPanel());
        NodeConnector.active_node_object = this.temp_node;
        this.temp_link_line = new LinkLine(this.node.getPanel(), this.temp_node.getPanel());
    }
    drag_end_handler(ev) {
        NodeConnector.active_node_object = null;
        this.temp_node.getPanel().remove();
        this.temp_node = null;
        this.temp_link_line.remove();
        this.temp_link_line = null;
    }
    static GetActiveNodeObject() {
        return NodeConnector.active_node_object;
    }
    getNode() {
        return this.node;
    }
    getConnectionObject() {
        return this.connector_object;
    }
    connectWith(connector) {
        let link_line = new LinkLine(this.node.getPanel(), connector.node.getPanel());
        this.connections.push({ observer: connector, link_line: link_line });
        connector.connections.push({ observer: this, link_line: link_line });
        this.connector_object.OnConnect(connector.connector_object);
        connector.connector_object.OnConnect(this.connector_object);
    }
    getConnections() {
        return this.connections;
    }
    closeConnection(connection) {
        let indx = this.connections.indexOf(connection);
        this.connections.splice(indx, 1);
        indx = connection.observer.connections.findIndex((con) => {
            return con.observer == this;
        });
        connection.observer.connections.splice(indx, 1);
        connection.link_line.remove();
    }
    remove() {
        while (this.connections.length > 0) {
            this.closeConnection(this.connections[0]);
        }
        this.node.getPanel().remove();
    }
    reflectChange(change) {
        this.connections.forEach((connection) => {
            if (this.connector_object.last_change_event != null) {
                if (this.connector_object.last_change_event.type == change.TYPE
                    &&
                        this.connector_object.last_change_event.by == connection.observer.connector_object) {
                    return;
                }
            }
            connection.observer.connector_object.OnChangeDetected(change);
            connection.observer.connector_object.last_change_event = { type: change.TYPE, by: this.connector_object };
        });
        this.connector_object.last_change_event = null;
    }
}
function CreateConnectionStatusPanel(connection_object) {
    let panel = document.createElement("div");
    panel.className = "connection_status_panel";
    let tool_bar = document.createElement("div");
    tool_bar.className = "tool_bar";
    let close_img = document.createElement("img");
    close_img.src = "media/multiply.png";
    tool_bar.appendChild(close_img);
    let connection_panel = document.createElement("div");
    connection_panel.className = "connection_panel";
    close_img.onclick = () => {
        panel.style.scale = "0";
        setTimeout(() => { panel.remove(); }, 200);
    };
    connection_object.getConnections().forEach((connection, indx) => {
        let link_panel = document.createElement("div");
        link_panel.className = "connection";
        let link_name = document.createElement("i");
        link_name.innerHTML = "Link:" + indx;
        let close_link = document.createElement("img");
        close_link.src = "media/remove.png";
        close_link.onclick = () => {
            connection_object.closeConnection(connection);
            link_panel.remove();
        };
        link_panel.onmouseenter = () => {
            connection.link_line.setColor("red");
        };
        link_panel.onmouseleave = () => {
            connection.link_line.setColor("rgb(2, 250, 233)");
        };
        link_panel.appendChild(link_name);
        link_panel.appendChild(close_link);
        connection_panel.appendChild(link_panel);
    });
    panel.appendChild(tool_bar);
    panel.appendChild(connection_panel);
    return panel;
}

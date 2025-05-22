var editor;
function SetUpEditor(html_area) {
    html_area.appendChild(LinkLine.link_line_svg);
    editor = new Editor(html_area);
    let toolbar = new Toolbar();
    toolbar.setWidth(100);
    toolbar.setHeight(400);
    toolbar.getPanel().classList.add("editor_toolbar");
    let tool_tasks_collections = new Tool("./media/tasks.png", "Create tasks panel");
    tool_tasks_collections.getTool().classList.add("tool_image_collection");
    let tool_add_title = new Tool("./media/title.png", "Create text panel");
    tool_tasks_collections.getTool().classList.add("tool_image_collection");
    let tool_save_data = new Tool("./media/save.png", "Export plan");
    tool_save_data.getTool().classList.add("tool_image_collection");
    let tool_import_data = new Tool("./media/import.png", "Import Plan");
    tool_import_data.getTool().classList.add("tool_image_collection");
    tool_tasks_collections.OnClick = () => {
        let panel = new TasksListPanel();
        new DraggAble(panel);
        editor.addPanel(panel);
        editor.bindNodeConnector(panel, new NodeConnector(panel));
        panel.setPosition(html_area.scrollLeft, html_area.scrollTop);
    };
    tool_add_title.OnClick = () => {
        let panel = new TitlePanel();
        new DraggAble(panel);
        editor.addPanel(panel);
        editor.bindNodeConnector(panel, new NodeConnector(panel));
        panel.setPosition(html_area.scrollLeft, html_area.scrollTop);
    };
    tool_save_data.OnClick = () => {
        let data = editor.exportData();
        data = JSON.stringify(data);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plan.json';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };
    tool_import_data.OnClick = () => {
        let inp = document.createElement("input");
        inp.type = "file";
        inp.accept = ".json";
        //document.body.appendChild(inp);
        inp.onchange = () => {
            let f = inp.files[0];
            let r = new FileReader();
            r.onload = (e) => {
                const res = e.target?.result;
                if (res) {
                    editor.importData(JSON.parse(res));
                }
            };
            r.readAsText(f);
            inp.remove();
        };
        inp.oncancel = () => {
            inp.remove();
        };
        inp.click();
    };
    toolbar.addTool(tool_add_title);
    toolbar.addTool(tool_tasks_collections);
    toolbar.addTool(tool_save_data);
    toolbar.addTool(tool_import_data);
    editor.addPanel(toolbar);
    let toolbar_draggable = new DraggAble(toolbar);
    let drop_area = new DropArea(html_area);
    drop_area.DragOverHandler = (ev) => {
        ev.preventDefault();
        let current_drag_panel = DraggAble.GetCurrentDraggable();
        let current_drag_node = NodeConnector.GetActiveNodeObject();
        if (current_drag_panel != null && current_drag_panel != toolbar_draggable) {
            current_drag_panel.dragTo(html_area.scrollLeft + ev.x, html_area.scrollTop + ev.y);
        }
        else if (current_drag_node != null) {
            current_drag_node.setPosition(html_area.scrollLeft + ev.x, html_area.scrollTop + ev.y);
        }
        else if (current_drag_panel == toolbar_draggable) {
            current_drag_panel.dragTo(ev.x, ev.y);
        }
    };
    drop_area.DropHandler = (ev) => {
        let current_drag_panel = DraggAble.GetCurrentDraggable();
        if (current_drag_panel != null && !(current_drag_panel.getTarget() instanceof Panel)) {
            current_drag_panel.resetPosition();
        }
    };
}

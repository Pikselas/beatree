class LinkLine {
    static link_line_svg = LinkLine.InitializeSVG();
    static InitializeSVG() {
        let link_line_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        link_line_svg.setAttribute("style", "position: absolute;z-index:-1;top:0;left:0;");
        return link_line_svg;
    }
    link_line;
    linkable1;
    linkable2;
    observer;
    constructor(linkable1, linkable2) {
        this.linkable1 = linkable1;
        this.linkable2 = linkable2;
        this.link_line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.link_line.setAttribute("style", "stroke:rgb(2, 250, 233);stroke-width:2");
        LinkLine.link_line_svg.appendChild(this.link_line);
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    this.updateLinkLine();
                }
            });
        });
        this.observer.observe(linkable1, { attributes: true });
        this.observer.observe(linkable2, { attributes: true });
        this.updateLinkLine();
    }
    updateLinkLine() {
        if (LinkLine.link_line_svg.parentElement != null) {
            let html_area = LinkLine.link_line_svg.parentElement;
            LinkLine.link_line_svg.setAttribute("width", html_area.scrollWidth.toString());
            LinkLine.link_line_svg.setAttribute("height", html_area.scrollHeight.toString());
        }
        let parent_element = LinkLine.link_line_svg.parentElement;
        this.link_line.setAttribute("x1", (parent_element.scrollLeft + this.linkable1.getBoundingClientRect().left + this.linkable1.clientWidth / 2).toString());
        this.link_line.setAttribute("y1", (parent_element.scrollTop + this.linkable1.getBoundingClientRect().top + this.linkable1.clientHeight / 2).toString());
        this.link_line.setAttribute("x2", (parent_element.scrollLeft + this.linkable2.getBoundingClientRect().left + this.linkable2.clientWidth / 2).toString());
        this.link_line.setAttribute("y2", (parent_element.scrollTop + this.linkable2.getBoundingClientRect().top + this.linkable2.clientHeight / 2).toString());
    }
    start_observing() {
        this.observer.observe(this.linkable1, { attributes: true });
        this.observer.observe(this.linkable2, { attributes: true });
        this.updateLinkLine();
    }
    setLinkable1(linkable) {
        this.observer.disconnect();
        this.linkable1 = linkable;
        this.start_observing();
    }
    setLinkable2(linkable) {
        this.observer.disconnect();
        this.linkable2 = linkable;
        this.start_observing();
    }
    getLinkable1() {
        return this.linkable1;
    }
    getLinkable2() {
        return this.linkable2;
    }
    remove() {
        this.observer.disconnect();
        this.link_line.remove();
    }
    setColor(color) {
        this.link_line.setAttribute("style", "stroke:" + color + ";stroke-width:2");
    }
}

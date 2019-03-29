class StaticPage {
    constructor(div, page) {
        this.div = div;
        div.setAttribute('style', 'overflow:auto !important');
        this.page = page;
        setURL('page=' + this.page);
    }

    save() {
        return {
            scrollLeft: this.div.scrollLeft,
            scrollTop: this.div.scrollTop
        }
    }

    loadPage() {
		setURL('page=' + this.page);
	}
}
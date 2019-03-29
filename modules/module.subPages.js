class SubPages {
    constructor(div, divMenu, page, counter) {
        this.div = div;
        this.divMenu = divMenu;
        this.subPages = [];
        this.page = page;
        this.counter = counter;
        this.lock = false;

        this.subPages.push(this.page.getClearPage());
        this.activeSubPage = this.subPages[0];
        this.activeSubPage.guid = guid();

        this.div.querySelector('#saveSubPage').onclick = () => {
            document.getElementById('saveSubPageText').value = this.activeSubPage.title;

            document.getElementById('saveSubPageText').onkeypress = () => {
                if(event.which == 13 || event.keyCode == 13) {
                    $('#saveSubPageModal').modal('hide');
                    this.savePage();
                    return false;
                }
            };

            $('#saveSubPageModal').modal({
                closable  : false,
                onApprove : () => {
                    this.savePage();
                }
            }).modal('show');
        }

        this.div.querySelector('#removePage').onclick = () => {
            this.removePage();
        }
    }

    newPage(title) {
        let newPage = this.page.getClearPage();
        newPage.title = title;
        newPage.guid = guid();
        newPage.link = document.createElement("a");
        newPage.link.classList.add("item");
        newPage.link.innerText = title;

        let localSubPage = newPage;
        newPage.link.onclick = () => {
            if(this.lockPage()) {
                this.activeSubPage = localSubPage;
                this.page.loadPage();
            }
        };
        this.divMenu.appendChild(newPage.link);
        this.subPages.push(newPage);
        this.activeSubPage = newPage;

        if(this.counter != undefined && this.counter != null) {
            let value = parseInt(this.counter.innerText);
            this.counter.innerText = (value+1);
            this.counter.style.display = 'block';
        }
    }

    savePage(forcedTitle) {
        let newTitle = document.getElementById('saveSubPageText').value;
        if(forcedTitle != undefined)
            newTitle = forcedTitle;
        if(this.activeSubPage.link == null || this.activeSubPage == undefined) {
            if(newTitle != '') {
                this.activeSubPage.title = newTitle;
                this.activeSubPage.link = document.createElement("a");
                this.activeSubPage.link.classList.add("item");
                this.activeSubPage.link.innerText = newTitle;

                let localSubPage = this.activeSubPage;
                this.activeSubPage.link.onclick = () => {
                    if(this.lockPage()) {
                        this.activeSubPage = localSubPage;
                        this.page.loadPage();
                    }
                };
                this.divMenu.appendChild(this.activeSubPage.link);

                this.subPages.push(this.activeSubPage);
                this.subPages[0] = this.page.getClearPage();
                this.subPages[0].guid = guid();
                
                if(this.counter != undefined && this.counter != null) {
                    let value = parseInt(this.counter.innerText);
                    this.counter.innerText = (value+1);
                    this.counter.style.display = 'block';
                }
            }
        }
        else {
            this.activeSubPage.link.innerText = newTitle;
            this.activeSubPage.title = newTitle;
        }
    }

    removePage() {
        if(this.activeSubPage.link == null) {
            this.page.clearPage();
        }
        else {
            let removedSubPage = this.activeSubPage;
            this.divMenu.removeChild(this.activeSubPage.link);
            this.subPages = this.subPages.remove(this.subPages.indexOf(this.activeSubPage));
            this.activeSubPage = this.subPages[0];
            this.page.loadPage();
            if(this.counter != undefined && this.counter != null) {
                let value = parseInt(this.counter.innerText);
                this.counter.innerText = (value-1);
                if(value == 1)
                this.counter.style.display = 'none';
            }
            
            if(typeof this.page.onRemovePage != 'undefined')
                this.page.onRemovePage(removedSubPage);
        }
    }

    lockPage() {
        if(this.lock)
            return false;
        this.lock = true;
        return true;
    }

    unlockPage() {
        this.lock = false;
    }

    getBasePage() {
        return this.subPages[0];
    }

    lenght() {
        return this.subPages.length;
    }

    find(guid) {
        if(guid == undefined || guid == null)
            return null;
        return this.subPages.find(((value) => {return value == guid;}));
    }

    save() {
        let result = {subPages:[], activeSubPage: this.subPages.findIndex((x) => {return x == this.activeSubPage;})};
        this.subPages.forEach(page => {
            let obj = {};
            for (var field in page) {
                if(!isDOM(page[field])) {
                    obj[field] = page[field];
                }
            }
            result.subPages.push(obj);
        });
        return result;
    }

    clearAll() {
        this.subPages.forEach(subPage => {
            if(subPage.link != undefined && subPage.link != null)
                subPage.link.parentNode.removeChild(subPage.link);
            if(this.page.onRemovePage != undefined)
                page.onRemovePage(subPage);
        });
        
        if(this.counter != undefined && this.counter != null) {
            let value = parseInt(this.counter.innerText);
            value = (value - this.subPages.length + 1);
            this.counter.innerText = value;
            if(value == 0)
                this.counter.style.display = 'none';
        }
        this.subPages = [this.page.getClearPage()];
    }

    setLoadedSession(args) {
        this.subPages = args.subPages;
        this.activeSubPage = this.subPages[args.activeSubPage];

        this.subPages.forEach(subPage => {
            if(subPage.title != '') {
                subPage.link = document.createElement("a");
                subPage.link.classList.add("item");
                subPage.link.innerText = subPage.title;
    
                subPage.link.onclick = () => {
                    if(this.lockPage()) {
                        this.page.div.style.display = 'block';
                        let exec = async () => {
                            this.activeSubPage = subPage;
                            this.page.loadPage();
                        };
                        exec();
                    }
                };
                this.divMenu.appendChild(subPage.link);
            }
        });

        if(this.counter != undefined && this.counter != null) {
            let value = parseInt(this.counter.innerText);
            value = (value + this.subPages.length - 1);
            this.counter.innerText = value;
            if(value == 0)
                this.counter.style.display = 'none';
            else
                this.counter.style.display = 'block';
        }       
        
    }
}
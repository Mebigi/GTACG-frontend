class Session {
    constructor(document) {
        this.document = document;
        this.sidebarIcon = document.getElementById('pageHome');
        this.pageHome = new Home();
        this.pageActive = this.pageHome;
        this.loadedSession = null;
        
        this.pageChangelog = null;
        this.pageFamilyList = null;
        this.pageBlast = null;
        this.pageVenn = null;
        this.pageBestSolution = null;
        this.pageTable = null;
        this.pageFamily = null;
        this.pageHelp = null;

        
        document.getElementById('menuPageHome').onclick = () => {this.changePage('home');};
        document.getElementById('menuPageChangelog').onclick = () => {this.changePage('changelog');};
        document.getElementById('menuPageFamilyList').onclick = () => {this.changePage('familyList');};
        document.getElementById('menuPageBlast').onclick = () => {this.changePage('blast');};
        document.getElementById('menuPageBestSolution').onclick = () => {this.changePage('bestSolution');};
        document.getElementById('menuPageTable').onclick = () => {this.changePage('table');};
        document.getElementById('menuPageHelp').onclick = () => {this.changePage('help');};
        document.getElementById('menuPageSave').onclick = () => {this.save();};
        this.pageList = this.createPageList();
        
        $('#menuPageFindFamilies > i').popup({
			delay: {
			show: 100,
			hide: 1000
			},
			position: "right center",
			exclusive: true,
			hoverable: true,
			preserve: true,
			distanceAway: 10,
        });
        $('#menuPageSuperVenn > i').popup({
			delay: {
			show: 100,
			hide: 1000
			},
			position: "right center",
			exclusive: true,
			hoverable: true,
			preserve: true,
			distanceAway: 10,
        });
        $('#menuPageBestSolution > i').popup({
			delay: {
			show: 100,
			hide: 1000
			},
			position: "right center",
			exclusive: true,
			hoverable: true,
			preserve: true,
			distanceAway: 10,
        });
        $('#menuPageTable > i').popup({
			delay: {
			show: 100,
			hide: 1000
			},
			position: "right center",
			exclusive: true,
			hoverable: true,
			preserve: true,
			distanceAway: 10,
        });
        $('#menuPageFamily > i').popup({
			delay: {
			show: 100,
			hide: 1000
			},
			position: "right center",
			exclusive: true,
			hoverable: true,
			preserve: true,
			distanceAway: 10,
        });

        this.loadedSession = null;
        document.getElementById('sessionFile').onchange = (e) => {
            let file = e.target.files[0];
            if (!file) {
                return;
            }
            let reader = new FileReader();
            reader.onload = (e2) => {
                var contents = e2.target.result;
                this.loadedSession = contents;
            };
            reader.readAsText(file);
        }

        document.getElementById("menuPageLoad").onclick = () => {
            document.getElementById('sessionFile').value = '';
            this.loadedSession = null;

            $('#sessionModal').modal({
                onApprove : () => {
                    this.loadedSession = JSON.parse(this.loadedSession);
                    this.changeSession();
                }
            }).modal('show');
        }

        window.onpopstate = (event) => {
            let guid = undefined;
            if(event.state != null)
                guid = event.state.guid;
            var url = new URL(window.location.href);
            this.changePage(url.searchParams.get('page', undefined, guid));
        };

        let url = new URL(window.location.href);
        let newPage = url.searchParams.get('page');
        if(newPage != null) {
            let args = {};
            url.searchParams.forEach((value, key) => {args[key] = value;});
            this.changePage(newPage, args, undefined);
        }
    }

    createPageList() {
        var pages = {};
        pages['home'] = {
            getPage: () => {return this.pageHome},
            file: 'home.htm',
            className:Home,
            create:(page) => {this.pageHome = page;}};
        pages['changelog'] = {
            getPage: () => {return this.pageChangelog},
            file: 'changelog.htm',
            className:StaticPage,
            create:(page) => {this.pageChangelog = page;}};
        pages['familyList'] = {
            getPage: () => {return this.pageFamilyList},
            file: 'familyList.htm',
            className:FamilyList,
            create:(page) => {this.pageFamilyList = page;}};
        pages['blast'] = {
            getPage: () => {return this.pageBlast},
            file: 'blast.htm',
            className:Blast,
            create:(page) => {this.pageBlast = page;}};
        pages['venn'] = {
            getPage: () => {return this.pageVenn},
            file: 'venn.htm',
            className:Venn,
            create:(page) => {this.pageVenn = page;}};
        pages['bestSolution'] = {
            getPage: () => {return this.pageBestSolution},
            file: 'bestSolution.htm',
            className:BestSolution,
            create:(page) => {this.pageBestSolution = page;}};
        pages['table'] = {
            getPage: () => {return this.pageTable},
            file: 'table.htm',
            className:Table,
            create:(page) => {this.pageTable = page;}};
        pages['family'] = {
            getPage: () => {return this.pageFamily},
            file: 'family.super.htm',
            className:Family,
            create:(page) => {this.pageFamily = page;}};
        pages['help'] = {
            getPage: () => {return this.pageHelp},
            file: 'help.htm',
            className:StaticPage,
            create:(page) => {this.pageHelp = page;}};
        return pages;
    }
    
    leftSide() {
        let el = document.getElementById("leftMenu");
        if(el.classList.contains("expanded")) {
            el.classList.remove("expanded");
            el.classList.add("compacted");
        }
        else {
            el.classList.add("expanded");
            el.classList.remove("compacted");
        }
    }
    
    createPage() {
        var page = document.createElement("div");
        document.body.appendChild(page);
		page.classList.add("scrolling-sections");
        page.classList.add("overflowHidden");
        return page;
    }
    
    changePage(page, args, subPageGuid) {
        let changeTo = this.pageList[page];
        
        this.pageActive.div.style.display = "none";
        if(changeTo.getPage() == null) {
            let newDiv = this.createPage();
            newDiv.innerHTML = '<div class="ui active dimmer"><div class="ui loader"></div></div>';
            $.ajax({
                url: changeTo.file,
                cache: false,
                dataType: "html",
                success: (data) => {
                    newDiv.innerHTML = data;
                    let newPage = new changeTo.className(newDiv, page);
                    changeTo.create(newPage);
                    if(args != undefined) {
                        if(newPage.subPages != undefined) {
                            newPage.subPages.lockPage();
                            newPage.subPages.newPage('New page');
                            if(guid != undefined)
                                newPage.guid = guid;
                        }
                        newPage.loadPage(args);
                        if(newPage.subPages != undefined)
                            newPage.subPages.unlockPage();
                    }
                    this.pageActive = newPage;
                    this.pageActive.div.style.display = "block";
                }
            });
        }
        else {
            this.pageActive = changeTo.getPage();
            this.pageActive.div.style.display = "block";
            let loader = document.createElement("a");
            loader.classList.add('ui');
            loader.classList.add('active');
            loader.classList.add('dimmer');
            loader.innerHTML = '<div class="ui loader"></div>';
            changeTo.getPage().div.appendChild(loader);
            
            console.log('ok');
            if(changeTo.getPage().subPages != undefined) {
                if(changeTo.getPage().subPages.lockPage()) {
                    let exec = async () => {
                        if(args == undefined) {
                            if(subPageGuid != undefined) {
                                let found = changeTo.getPage().subPages.find(subPageGuid);
                                if(found != null)
                                    changeTo.getPage().subPages.activeSubPage = found;
                                else {
                                    changeTo.getPage().subPages.newPage('New page');
                                    changeTo.getPage().guid = guid;
                                }
                            }
                            else {
                                console.log(changeTo);
                                changeTo.getPage().subPages.activeSubPage = changeTo.getPage().subPages.getBasePage();
                            }
                        }
                        else {
                            changeTo.getPage().subPages.newPage('New page');
                            if(guid != undefined) {
                                changeTo.page.subPages.activeSubPage.guid = guid;
                            }
                        }
                        changeTo.getPage().loadPage(args);
                    }
                    exec();
                }
                changeTo.getPage().subPages.unlockPage();
            }
            else if(changeTo.getPage().loadPage != undefined)
                changeTo.getPage().loadPage(args);
            changeTo.getPage().div.removeChild(loader);
            console.log('ok2');
            //},20000);
            
        }

        /*this.pageActive.div.style.display = "none";
        if(changeTo.getPage() == null) {
            let newDiv = this.createPage();
            newDiv.classList.add("overflowHidden");
            $.ajax({
                url: changeTo.file,
                cache: false,
                dataType: "html",
                success: (data) => {
                    newDiv.innerHTML = data;
                    let newPage = new changeTo.className(newDiv, page);
                    changeTo.create(newPage);
                    if(args != undefined) {
                        if(newPage.subPages != undefined) {
                            newPage.subPages.lockPage();
                            newPage.subPages.newPage('New page');
                            if(guid != undefined)
                                newPage.guid = guid;
                        }
                        newPage.loadPage(args);
                        if(newPage.subPages != undefined)
                            newPage.subPages.unlockPage();
                    }
                    this.pageActive = newPage;
                    this.pageActive.div.style.display = "block";
                }
            });
        }
        else {
            if(changeTo.getPage().subPages != undefined) {
                if(changeTo.getPage().subPages.lockPage()) {
                    if(args == undefined) {
                        if(guid != undefined) {
                            let found = changeTo.getPage().subPages.find(guid);
                            if(found != null)
                                changeTo.getPage().subPages.activeSubPage = found;
                            else {
                                changeTo.getPage().subPages.newPage('New page');
                                changeTo.getPage().guid = guid;
                            }
                        }
                        else {
                            changeTo.getPage().subPages.activeSubPage = changeTo.page.subPages.getBasePage();
                        }
                    }
                    else {
                        changeTo.getPage().subPages.newPage('New page');
                        if(guid != undefined) {
                            changeTo.page.subPages.activeSubPage.guid = guid;
                        }
                    }
                    changeTo.getPage().loadPage(args);
                }
                changeTo.getPage().subPages.unlockPage();
            }
            else if(changeTo.getPage().loadPage != undefined)
                changeTo.getPage().loadPage(args);
            this.pageActive = changeTo.getPage();
            this.pageActive.div.style.display = "block";
        }*/
    }
    
    save() {
        let pages = [];
        pages.push({title:'home', page:this.pageHome});
        pages.push({title:'changelog', page:this.pageChangelog});
        pages.push({title:'familyList', page:this.pageFamilyList});
        pages.push({title:'blast', page:this.pageBlast});
        pages.push({title:'venn', page:this.pageVenn});
        pages.push({title:'bestSolution', page:this.pageBestSolution});
        pages.push({title:'table', page:this.pageTable});
        pages.push({title:'family', page:this.pageFamily});
        pages.push({title:'help', page:this.pageHelp});

        let download = [];
        pages.forEach(page => {
            if(page.page != null) {
                let obj = page.page.save();
                obj.page = page.title;
                download.push(obj);
            }
        });

        console.log(download);
        downloadFile('session', JSON.stringify(download));
    }
    
    changeSession() {
        this.pageHome.loadPage(this.loadedSession[0]);
        this.loadedSession = this.loadedSession.remove(0);

        this.changePage('home');

        this.loadedSession.forEach(savedSubPage => {
            let item = this.pageList[savedSubPage.page];
            let page = item.getPage();
            if(page == null) {
                $.ajax({
                    url: item.file,
                    cache: false,
                    dataType: "html",
                    success: (data) => {
                        let newDiv = this.createPage();
                        newDiv.classList.add("overflowHidden");
                        newDiv.innerHTML = data;
                        let page = new item.className(newDiv, savedSubPage.page, false);
                        item.create(page);
                        page.div.style.display = "none";
                        if(page.subPages == undefined)
                            page.loadPage(savedSubPage);
                        else
                            page.subPages.setLoadedSession(savedSubPage);
                    }
                });
            }
            else {
                page.subPages.clearAll();
                page.subPages.setLoadedSession(savedSubPage);
            }
        });



    }
}
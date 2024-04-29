KioskViewModel = function (data, GetMenuURL) {
    var self = this;
    self.availableLanguages = data;
    self.selectedLanguage = ko.observable(null);
    self.languageSelected = ko.observable(false);
    self.url = GetMenuURL;
    self.currentNode = ko.observable({ID:0});
    self.currentOptions = ko.observableArray();
    self.currentPath = ko.observableArray([]);
    self.isLastNode = ko.observable(false);

    self.selectedLanguage.subscribe(function (newVal) {
        if (newVal == null) {
            self.languageSelected(false);
            return;
        }
        self.languageSelected(true);
        $.ajax({
            url: self.url,
            type: "GET",
            dataType: "JSON",
            data: { Language_CD: self.selectedLanguage().language_CD },
            cache: false,
            success: function (data) {
                self.dictionary = data;
                self.currentOptions(self.findChildren(self.currentNode()));
                self.currentPath().push(self.currentNode());
            }
        });
    });
   

    self.findChildren = function (parent) {
        var arr = $.grep(self.dictionary, function (n,i) {
            return (n.Key.ID == parent.ID);
            
        });
        if (arr == null || arr.length == 0) {
            return null;
        }
        return arr[0].Value;
    }

    self.nextPage = function (data) {
        self.currentNode(data);
        self.currentPath().push(data);
        self.currentOptions(self.findChildren(data));
        if (self.currentOptions().length == 1) {
            self.isLastNode(true);
        }
        
    }

    self.startOver = function () {
        self.selectedLanguage(null);
        self.languageSelected(false);
        self.currentPath([]);
        self.currentNode = ko.observable({ ID: 0 });
        self.isLastNode(false);
    }

    self.back = function () {
        if (self.currentPath().length == 1) {
            self.startOver();
        }
        else {
            self.currentPath().pop(); 
            self.currentNode(self.currentPath()[self.currentPath().length - 1]);
            self.currentOptions(self.findChildren(self.currentNode()));         
        }
        self.isLastNode(false);
    }
    
}


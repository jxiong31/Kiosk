AdminViewModel = function (data, GetMenuURL, SaveNodeURL, DeleteNodeURL) {
    var self = this;
    self.availableLanguages = data;
    self.selectedLanguage = ko.observable(null);
    self.languageSelected = ko.observable(false);
    self.url = GetMenuURL;
    self.SaveNodeURL = SaveNodeURL;
    self.DeleteNodeURL = DeleteNodeURL;
    self.currentNode = ko.observable(new Node({ID:0}));
    self.currentOptions = ko.observableArray();
    self.currentPath = ko.observableArray([]);
    self.isLastNode = ko.observable(false);
    self.inEditMode = ko.observable(false);
    
    
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
                var selections = $.map(self.findChildren(self.currentNode()), function (data) {
                    return new Node(data);
                })
                self.currentOptions(selections);
                self.currentPath().push(self.currentNode());
            }
        });
    });


    self.findChildren = function (parent) {
        var arr = $.grep(self.dictionary, function (n, i) {
            return (n.Key.ID == parent.ID);

        });
        if (arr == null || arr.length == 0) {
            return null;
        }
        return arr[0].Value;
    }

    self.refresh = function () {
        var parentNode = self.currentPath()[self.currentPath().length - 1];
        var selections = $.map(self.findChildren(parentNode), function (data) {
            return new Node(data);
        });
        self.currentOptions(selections);
        if (self.currentOptions().length != 1) {
            self.isLastNode(false);
        }
        else {
            self.isLastNode(true);
        }
    }

    self.nextPage = function (data) {
        self.currentNode(data);
        self.currentPath().push(data);
        var selections = $.map(self.findChildren(data), function (d) {
            return new Node(d);
        });
        self.currentOptions(selections);
        if (self.currentOptions().length == 1) {
            self.isLastNode(true);
        }
    }

    self.startOver = function () {
        self.selectedLanguage(null);
        self.languageSelected(false);
        self.currentPath([]);
        self.currentNode = ko.observable(new Node({ ID: 0 }));
        self.isLastNode(false);
    }

    self.back = function () {
        if (self.currentPath().length == 1) {
            self.startOver();
        }
        else {
            self.currentPath().pop();
            self.currentNode(self.currentPath()[self.currentPath().length - 1]);
            var selections = $.map(self.findChildren(self.currentNode()), function (data) {
                return new Node(data);
            });
            self.currentOptions(selections);
        }
        self.isLastNode(false);
    }

    self.editNode = function (data) {
        self.currentNode(data);
        //console.log(self.currentNode());
        self.inEditMode(true);
    }
    self.saveNode = function () {
        $.ajax({
            url: self.SaveNodeURL,
            type: "POST",
            dataType: "JSON",
            data: {SavedNode: self.currentNode(), Language_CD: self.selectedLanguage().language_CD, ParentNode: self.currentPath()[self.currentPath().length-1] },
            cache: false,
            success: function (data) {
                self.dictionary = data;
                self.inEditMode(false);
                self.refresh();
            }
        });
    }
    self.cancelEdit = function () {
        self.currentNode().Text.reset();
        self.inEditMode(false);
        //self.currentNode(null);
    }

    self.deleteNode = function (data) {
        if (confirm("Are you sure?")) {
            $.ajax({
                url: self.DeleteNodeURL,
                type: "POST",
                dataType: "JSON",
                data: { node: data, language: self.selectedLanguage().language_CD },
                cache: false,
                success: function (data) {
                    self.dictionary = data;
                    self.refresh();
                }
            });
        }
        else {
            return;
        }
    }

    self.addNode = function () {
        self.currentNode(new Node({}));
        self.inEditMode(true);
    }

}

function Node(data) {
    var self = this;
    self.ID = data.ID;
    self.Text = ko.observable(data.Text);
    self.Text.extend({ trackChange: true });
}

ko.extenders.trackChange = function (target, track) {
    if (track) {
        target.isDirty = ko.observable(false);
        target.originalValue = target();
        target.subscribe(function (newValue) {
            target.isDirty(newValue != target.originalValue);
        });
        target.resetClean = function () {
            target.originalValue = target();
            target.isDirty(false);
        };
        target.reset = function () {
            target(target.originalValue);
        };
    }
    return target;
};


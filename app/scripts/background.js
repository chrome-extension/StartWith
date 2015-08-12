'use strict';

var StartWithSearch = {

    /**
     * Parses the url and returns the search term
     */
    parseUrl: function(url) {
        var queryString = /^[^#?]*(\?[^#]+|)/.exec(url)[1];
        if (this.getParameterByName(queryString, 'form') == 'WNSGPH') {
            return this.getParameterByName(queryString, 'q');
        } else {
            return;
        }
    },
    /**
     * Gets the paramter value from the query string
     */
    getParameterByName: function(queryString, name) {
        // Escape special RegExp characters
        name = name.replace(/[[^$.|?*+(){}\\]/g, '\\$&');
        // Create Regular expression
        var regex = new RegExp("(?:[?&]|^)" + name + "=([^&#]*)");
        // Attempt to get a match
        var results = regex.exec(queryString);
        return decodeURIComponent(results[1].replace(/\+/g, " ")) || '';
    },
    /**
     * Redirects search to Google
     */
    redirectSearch: function(url) {
        var searchTerm = this.parseUrl(url);
        if (searchTerm) {
            chrome.tabs.update(null, {
                url: "http://www.google.com/search?q=" + searchTerm
            });
            chrome.storage.sync.get('count', function(object) {
                chrome.storage.sync.set({
                    'count': object.count + 1
                }, function() {
                    chrome.browserAction.setBadgeText({
                        text: '' + (object.count + 1)
                    });
                });
            });
        };
    },
    isBing: function(tab) {
        return tab.url.indexOf('www.bing') > -1
    }
};

chrome.runtime.onInstalled.addListener(function(details) {
    console.log('previousVersion', details.previousVersion);
});


chrome.storage.sync.get({
    'count': 0
}, function(object) {
    if (object.count == 0) {
        chrome.storage.sync.set({
            'count': object.count
        });
    }
    chrome.browserAction.setBadgeText({
        text: '' + object.count
    });
});


chrome.tabs.onCreated.addListener(function(tab) {
    redirect(tab);
});

chrome.tabs.onUpdated.addListener(function(id, changeInfo, tab) {
    redirect(tab);
});

function redirect(tab) {
    if (tab.url) {
        if (StartWithSearch.isBing(tab)) {
            StartWithSearch.redirectSearch(tab.url);
        }
    }
}
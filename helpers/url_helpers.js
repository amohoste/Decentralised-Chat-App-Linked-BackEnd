const { URL } = require('url');

module.exports = {

    // Helper function to compare URL's
    urlcompare: function (url1, url2) {
        let result;
        try {
            result = new URL(url1).toString() === new URL(url2).toString();
        } catch (error) {
            return false;
        }
        return result;
    },
    build_url: function(object) {
        let url = new URL(object.base);
        url.searchParams.append('endpoint', object.endpoint);
        if (object.graph) {
            url.searchParams.append('graph', object.graph);
        }
        url.searchParams.append('query', object.query);
        return url['href'];
    },
    get_base_url: function(url) {
        let tmp = new URL(url); 
        return tmp.origin + tmp.pathname;
    }
}


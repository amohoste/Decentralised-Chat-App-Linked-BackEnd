module.exports = {

    // Sorts array based on map of properties
    // Eg. arr.sort(sort_by_property(new Map([["content", "asc"]])))
    sort_by_properties: function sort(properties) {

        return function (x, y) {

            for (let [property, order] of properties.entries()) {
                let asc = 1;
                if (order !== 'asc') {
                    asc = -1;
                }

                if (x[property] > y[property]) {
                    return asc;
                } else if (x[property] < y[property]) {
                    return -asc;
                }
            }
            return 0;
        };
    }
}

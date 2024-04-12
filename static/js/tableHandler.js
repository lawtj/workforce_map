
export function createTableHandler(data, config) {
        return {
                search: "",
                sortColumn: config.initialSortColumn || null,
                sortAsc: true,
                columns: {
                    NAME_LONG: item.properties.NAME_LONG,
                    'Oral, Head & Neck Surgeons per Capita': item.properties['Oral, Head & Neck Surgeons per Capita'],
                    'Oral, Head, & Neck Surgeons': item.properties['Oral, Head, & Neck Surgeons']
                },
                data: data.features.map(item => {

                    for (const key in item.properties) {
                        if (item.properties[key] === 0 || item.properties[key] === 'No data') {
                            item.properties[key] = null;
                        }
                    }
                    return item;
                }),

                sortData() {
                    if (this.sortColumn !== null) {
                        this.data.sort((a, b) => {
                            // Handle null or undefined values
                            if (a.properties[this.sortColumn] == null) return 1; // Push null or undefined to the end
                            if (b.properties[this.sortColumn] == null) return -1;

                            // Normal sorting
                            if (a.properties[this.sortColumn] < b.properties[this.sortColumn]) {
                                return this.sortAsc ? -1 : 1;
                            }
                            if (a.properties[this.sortColumn] > b.properties[this.sortColumn]) {
                                return this.sortAsc ? 1 : -1;
                            }
                            return 0;
                        });
                    }
                },
    
            filteredData() {
                this.sortData(); // Call sort before filtering

                return this.data.filter((item) => {
                    return item.properties[config.search].toLowerCase().includes(this.search.toLowerCase());
                }).map(item => {
                    // Map each item to a new object based on config.columns
                    const mappedItem = {};
                    for (const key in config.columns) {
                        mappedItem[key] = item.properties[config.columns[key]];
                    }
                    return mappedItem;
                });
            },

            sort(column) {
                if (this.sortColumn === column) {
                    this.sortAsc = !this.sortAsc; // Toggle sort direction
                } else {
                    this.sortColumn = column;
                    this.sortAsc = true; // Default to ascending when a new column is sorted
                }
            },
            roundOrNot(value) {

                if (value === 'No data' || value === 0 || value === null || isNaN(value)) {
                    return null;
                } else {
                    var parsed = parseFloat(value);
                    // Check if 'parsed' is a number and is not NaN
                    return parsed.toFixed(2);
                }
            },

            roundInt(value) {
                if (value === 'No data' || value === 0 || value === null || isNaN(value)) {
                    return null;
                } else {
                    var rounded = Math.round(value);
                    // console.log(rounded)
                    return rounded.toLocaleString()
                }
            },

        }
    }

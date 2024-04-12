
export function createTableHandler(data, config, search) {
        console.log('starting table handler')
        return {
                search: search || '',
                searchColumn: config.searchColumn || null,
                sortColumn: config.initialSortColumn || null,
                sortAsc: true,
                // prepare the dataset
                data: data.map(converted_dataset => {
                    for (const key in converted_dataset.properties) {
                        // Check if the value is 0 or 'No data' and convert it to null
                        if (converted_dataset.properties[key] === 0 || converted_dataset.properties[key] === 'No data') {
                            converted_dataset.properties[key] = null;
                        } else if (parseFloat(converted_dataset.properties[key])) { 
                            // Check if value can be parsed as a number. if it cannot, it is likely a country name, so skip it.
                            // if it CAN be parsed, it is a number or NaN.
                            // if the value is NaN, convert it to null
                            if (isNaN(parseFloat(converted_dataset.properties[key]))) {
                                converted_dataset.properties[key] = null;
                            } else {
                                // If the value is a number, convert it to a float. this prepares it for rounding and sorting.
                                converted_dataset.properties[key] = parseFloat(converted_dataset.properties[key]);
                            }
                        } 
                    } 
                    return converted_dataset;
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

                return this.data.filter((converted_dataset) => {
                    try {
                        return converted_dataset.properties[this.searchColumn].toLowerCase().includes(this.search.toLowerCase());
                    } catch (error) {
                        console.log('error on: ', converted_dataset.properties[this.searchColumn], 'with search: ', this.searchColumn)
                        return false;
                    }
                }).map(converted_dataset => {
                    // Map each converted_dataset to a new object based on config.columns
                    // return an array where the key is the column name and the value is the property value
                    const mappedItem = {};
                    for (const key in config.columns) {
                        mappedItem[key] = converted_dataset.properties[config.columns[key]]; // return the value of the property labeled by the column
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

window.createTableHandler = createTableHandler;

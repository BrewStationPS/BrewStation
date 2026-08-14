$(document).ready(function () {
    let allListings = [];

    // Render table rows based on filtered list
    function renderTable(items) {
        const $tbody = $('#listings-body');
        $tbody.empty();

        if (items.length === 0) {
            $tbody.append('<tr><td colspan="8" style="padding: 20px; text-align:center;">No homebrew found.</td></tr>');
            return;
        }

        $.each(items, function (i, item) {
            var tr = $('<tr/>');
            
            // Icon
            tr.append("<td><img src=\"./icons/" + item.titleid + ".png\" width=\"64px\" /></td>");
            
            // Details
            tr.append("<td>" + item.title + "</td>");
            tr.append("<td>" + item.titleid + "</td>");
            tr.append("<td>" + item.version + "</td>");
            tr.append("<td>" + (Array.isArray(item.category) ? item.category.join(", ") : "") + "</td>");
            tr.append("<td>" + item.author + "</td>");
            tr.append("<td>" + item.platform + "</td>");

            // Data Files Logic
            var dfstr = "";
            if (item?.datafiles && item?.externaldf) {
                dfstr = "<br><a href=\"" + item.externaldf + "\">Data Files</a>";
            } else if (item?.datafiles ?? false) {
                dfstr = "<br><a href=\"./datafiles/" + item.titleid + ".zip\">Data Files</a>";
            }

            // Download Logic
            if (item?.externaldl ?? false) {
                tr.append("<td><a href=\"" + item.download + "\">External</a>" + dfstr + "</td>");
            } else {
                tr.append("<td><a href=\"./vpks/" + item.titleid + ".vpk\">Download</a>" + dfstr + "</td>");
            }

            $tbody.append(tr);
        });
    }

    // Automatically build dropdown options from JSON values
    function populateDropdowns(items) {
        const categories = new Set();
        const platforms = new Set();

        items.forEach(item => {
            if (Array.isArray(item.category)) {
                item.category.forEach(cat => categories.add(cat));
            }
            if (item.platform) {
                platforms.add(item.platform);
            }
        });

        // Alphabetically sort options
        Array.from(categories).sort().forEach(cat => {
            $('#category-select').append(`<option value="${cat}">${cat}</option>`);
        });

        Array.from(platforms).sort().forEach(plat => {
            $('#platform-select').append(`<option value="${plat}">${plat}</option>`);
        });
    }

    // Filter array on user input
    function applyFilters() {
        const query = $('#search-input').val().toLowerCase().trim();
        const selectedCat = $('#category-select').val();
        const selectedPlat = $('#platform-select').val();

        const filtered = allListings.filter(item => {
            // Text Search
            const matchesSearch = 
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.author && item.author.toLowerCase().includes(query)) ||
                (item.titleid && item.titleid.toLowerCase().includes(query));

            // Category Filter
            const matchesCategory = 
                selectedCat === 'ALL' || 
                (Array.isArray(item.category) && item.category.includes(selectedCat));

            // Platform Filter
            const matchesPlatform = 
                selectedPlat === 'ALL' || 
                item.platform === selectedPlat;

            return matchesSearch && matchesCategory && matchesPlatform;
        });

        renderTable(filtered);
    }

    // Load JSON & initialize
    $.getJSON('./listings.json', function (json) {
        allListings = json;
        populateDropdowns(allListings);
        renderTable(allListings);

        // Bind events
        $('#search-input').on('input', applyFilters);
        $('#category-select').on('change', applyFilters);
        $('#platform-select').on('change', applyFilters);
    }).fail(function (jqxhr, textStatus, error) {
        console.error('Error loading JSON:', textStatus, error);
    });
});
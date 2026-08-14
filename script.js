$(document).ready(function () {
    $.getJSON('./listings.json', function (json) {
        $.each(json, function (i, item) {
            var tr = $('<tr/>');
            tr.append("<td><img src=\"./icons/" + item.titleid + ".png\" width=\"64px\" /></td>");
            tr.append("<td>" + item.title + "</td>");
            tr.append("<td>" + item.titleid + "</td>");
            tr.append("<td>" + item.version + "</td>");
            tr.append("<td>" + item.category.join(", ") + "</td>");
            tr.append("<td>" + item.author + "</td>");
            tr.append("<td>" + item.platform + "</td>");
            var dfstr = "";
            if(item?.datafiles && item?.externaldf) dfstr = "<br><a href=\"" + item.externaldf + "\">Data Files</a>";
            else if(item.datafiles ?? false) dfstr = "<br><a href=\"./datafiles/" + item.titleid + ".zip\">Data Files</a>";
            if(item.externaldl ?? false) tr.append("<td><a href=\"" + item.download + "\">External</a>" + dfstr + "</td>");
            else tr.append("<td><a href=\"./vpks/" + item.titleid + ".vpk\">Download</a>" + dfstr + "</td>");
            $('table').append(tr);
        });
    }).fail(function (jqxhr, textStatus, error) {
        console.error('Error loading JSON:', textStatus, error);
    });
});

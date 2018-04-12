var currentHost = window.location.host;

// ------------ for EpticaCallbackAPI.html ------------
function initEpticaCallBackAPI() {
    var editor = CodeMirror.fromTextArea(document.getElementById('data'), {
        mode: "xml",
        lineWrapping: true,
        lineNumbers: true,
        matchTags: true,
        autoCloseTags: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        styleActiveLine: true,
        scrollbarStyle: "simple"
    });

    var responseContainer = CodeMirror(function(elt) {
        $('#apill-response').append(elt);
    }, {
        mode: "xml",
        lineWrapping: true,
        lineNumbers: true,
        readOnly: "true",
        height: "600px",
        matchTags: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        styleActiveLine: true,
        scrollbarStyle: "simple"
    });

    editor.setOption("extraKeys", {
        "Ctrl-Enter": function() {
            sendAPILLRequest(editor, responseContainer);
        },
        "Ctrl-F": "findPersistent"
    });

    responseContainer.setOption("extraKeys", {
        "Ctrl-F": "findPersistent"
    });

    $('#send').click(function() { sendAPILLRequest(editor, responseContainer); });

    hideError();
    $("#error").click(function(){ hideError() });

    $('[data-toggle="tooltip"]').tooltip();

    $('.apill-response-loading').hide();
    $('.apill-response-loading > .glyphicon').removeClass("spinning");

    $('#url').val(`http://${currentHost}/esInt`)
}

function sendAPILLRequest(editor, responseContainer) {
    hideError();
    setAPILLResponse(responseContainer, "");

    $('.apill-response-loading').show();
    $('.apill-response-loading > .glyphicon').addClass("spinning");

    var esUrl = $('#url').val();

    var sessionId = "";
    var basicAuth = "Basic " + btoa($('#user').val() + ":" + $('#pwd').val());

    $.ajax({
        type: "POST",
        url: esUrl + "/dispatch/api",
        dataType: "json",
        xhrFields: {
          withCredentials: true
        },
        headers: { "Authorization": basicAuth },
        data: {data: editor.getValue() },
        cache: false,
        crossDomain: true

    }).always(function (response) {
        if (response.status === 200) {
            setAPILLResponse(responseContainer, response.responseText);

        } else if (response.status === 0) {
            showError("Could not contact server, maybe Eptica Server is not running");
            setAPILLResponse(responseContainer, "");

        } else if (response.status === 503) {
            setAPILLResponse(responseContainer, response.statusText);

        } else if (response.status === 401) {
            console.log("Received [401] Unauthorized");
            showError("[401] Unauthorized: Please check your credentials");
            setAPILLResponse(responseContainer, "");

        } else {
            console.log("Error", response);
            showError("An error occurred while contacting Eptica Server: [" + response.status + "] " + response.statusText
                      + "<br/>&nbsp;&nbsp;&nbsp;&nbsp;See browser console for detailed error");
            setAPILLResponse(responseContainer, "");
        }
    });
}

function setAPILLResponse(responseContainer, text) {
    $('.apill-response-loading').hide();
    $('.apill-response-loading > .glyphicon').removeClass("spinning");
    responseContainer.setValue(text);
}

function showError(error) {
    $("#apill-error").html(error);
    $("#error").show();
}

function hideError() {
    $("#error").hide();
}
// ------------ end EpticaCallbackAPI.html ------------

// ------------ for index.html ------------
function initTomcatStatus() {
    $('#tomcat-status-lastupdate').text("Updating...");
    $('#tomcat-status > .glyphicon-refresh').addClass("spinning");
    var ignoredApps = ["manager", "", "docs", "examples", "host-manager"];
    $.ajax({
        url: "/tomcatmgr/text/list",
        headers: {"Authorization": "Basic " + window.btoa("admin:admin")},
        dataType: 'text',
        error: function (xhr, status, error) {
            resetTomcatStatusTable();
            if (xhr.status === 503) {   // service unavailable
                createTomcatStatusLine("Tomcat is not running", "", false);
            } else {
                createTomcatStatusLine(`Cannot get Tomcat status: [${xhr.status}] ${xhr.statusText}`, "", true);
            }
            $('#tomcat-status-lastupdate').text("Updated: " + now());
            $('#tomcat-status > .glyphicon-refresh').removeClass("spinning");
        },
        success: function (data) {
            resetTomcatStatusTable();
            var result = data.split('\n').sort();

            $.each(result, function(index, line){
                // if line is not empty and does not start with "OK"
                if (!line.match(/^$/) && !line.match(/^OK/)) {
                    var statusArray = line.split(':')
                    var name = statusArray[0].substring(1);
                    if (ignoredApps.indexOf(name) === -1) {
                        var status = statusArray[1]
                        createTomcatStatusLine(name, status, status !== 'running');
                    }
                }
            });
            $('#tomcat-status-lastupdate').text("Updated: " + now());
            $('#tomcat-status > .glyphicon-refresh').removeClass("spinning");
        }
    });
}

var versionsCallbacks = {
    esInt: getESVersion,
    es94: getESVersion,
    essm: getESSMVersion,
    essm30: getESSMVersion,
    els: getELSVersion
}

function getESVersion(url, element) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.withCredentials = true;

    xmlHttp.onload = function(event) {
        element.text(this.responseText);

        var xmlHttpLogout = new XMLHttpRequest();
        xmlHttpLogout.withCredentials = true;
        var u = new URL(this.responseURL);
        xmlHttpLogout.open("GET", u.origin + u.pathname + "logout?Screen=version");
        xmlHttpLogout.send(null);
    };

    // synchronous HTTP call
    xmlHttp.open("GET", url + "/dispatch/connection?Screen=version");
    xmlHttp.send(null);
}

function getESSMVersion(url, element) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.withCredentials = true;

    xmlHttp.onload = function(event) {
        element.text(this.responseText.match(/.*Version: (.*)/)[1]);
    }

    xmlHttp.open("GET", url + "/admin/home.do?action=about");
    xmlHttp.setRequestHeader("Authorization", "Basic " + window.btoa("monitor:monitor"));
    xmlHttp.send(null);
}

function getELSVersion(url, element) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.withCredentials = true;

    xmlHttp.onload = function(event) {
        element.text(this.responseText.match(/.*Eptica Linguistic Services (.*) \(build.*/)[1]);
    }

    xmlHttp.open("GET", url + "/api/version");
    xmlHttp.send(null);
}

function createTomcatStatusLine(name, status, error) {
    var rowClass = error ? "danger" : (status === "" ? "warning" : "success");

    var url = `http://${currentHost}:8080/${name}`;

    var versionElement = $('<span style="margin-left:10px;color:#666;"></span>');

    var callback = versionsCallbacks[name];

    if (callback) {
        callback(url, versionElement);
    }
    if (name.match(/els/)) {
        url += "/static/";
    }

    var nameElement = $(rowClass === "success" && '<a href="'+url+'" target="_blank"></a>' || '<span style="font-size:14px;"></span>');
    nameElement.text(name);

    var row = $('<tr></tr>')
        .addClass(rowClass)
        .append($('<td style="font-size:14px;"></td>')
            .append(`<span class="glyphicon" aria-hidden="true" title="${status}"></span>&nbsp;`)
            .append(nameElement)
            .append(versionElement));
    $('#tomcat-apps').append(row);
}

function resetTomcatStatusTable() {
    $('#tomcat-apps > tbody').remove();
}

function initElsrchStatus() {
    $('#elsrch-indices').hide();
    $('#elsrch-status > .glyphicon-refresh').addClass("spinning");

    var failed = false;
    $.get("http://" + currentHost + ":9200/_cluster/health").done(function(response) {
        // green, yellow or red
        var status = response.status === "yellow" ? "warning" : response.status === "green" ? "success" : "danger";
        $('#elsrch-status-status').text(response.cluster_name).removeClass("btn-warning btn-success btn-danger btn-down").addClass("btn-" + status);

    }).fail(function(req, textStatus, errorThrown) {
        if (req.status === 0) {
            $('#elsrch-status-status').text("OFF").removeClass("btn-warning btn-success btn-danger btn-down").addClass("btn-down");
        } else {
            $('#elsrch-status-status').text(`[${req.status}] textStatus`).removeClass("btn-warning btn-success btn-danger btn-down").addClass("btn-danger");
        }
        failed = true;
    });

    $('#elsrch-plugins > tbody > tr').remove();
    $('#elsrch-indices > tbody > tr').remove();
    if (failed) return;

    $.get("http://" + currentHost + ":9200/_nodes/process,plugins").done(function(response) {
        var nodes = response.nodes;
        var nodeProcess = nodes[Object.keys(nodes)[0]].process;

        $('#elsrch-status-status').popover({
            content: buildElsrchProperties(nodeProcess),
            placement: 'left',
            html: true
        });

        var plugins = nodes[Object.keys(nodes)[0]].plugins;
        $('#nb-elsrch-plugins').text(plugins.length);

        plugins.sort(function(a,b) {
            return a.name.toLowerCase() > b.name.toLowerCase();
        });

        $(plugins).each(function(i, plugin){
            var nameElement = $(plugin.url && '<a href="http://' + currentHost + ':9200'+plugin.url+'" target="_blank"></a>' || '<span></span');
            nameElement.text(plugin.name);

            nameElement.tooltip({
                placement: 'right',
                title: plugin.description
            });

            var row = $('<tr></tr>').append($("<td></td>").append(nameElement));
            $('#elsrch-plugins').append(row);
        });

    }).always(function() {
        $.ajax({
            method: "GET",
            url: "http://" + currentHost + ":9200/_cat/indices",
            contentType: "application/json"
        }).done(function(response) {
            var indices = response.slice();
            $('#nb-elsrch-indices').text(indices.length);

            indices.sort(function(a,b){
                return a.index > b.index;
            });

            var totalDocs = 0;
            var totalSize = 0;

            $(indices).each(function(i, indice){
                var status = indice.health === "yellow" ? "warning" : indice.health === "green" ? "success" : "danger";

                var nbDocs = indice["docs.count"]-indice["docs.deleted"];
                totalDocs += nbDocs;

                var size = indice["store.size"].toUpperCase();
                var bSize = sizeToBytes(size);
                totalSize += bSize;

                var row = $('<tr></tr>').append('<td class="'+status+'">'+indice.index+"</td><td>"+formatLargeNumber(nbDocs)+"</td><td>"+size+"</td>");
                $('#elsrch-indices > tbody').append(row);
            });

            $('#elsrch-indices > tfoot').html('<tr>'
                    + '<th class="text-right">Total</th>'
                    + '<th class="text-right">'+formatLargeNumber(totalDocs)+'</th>'
                    + '<th class="text-right">'+bytesToSize(totalSize)+'</th></tr>');

            $('#elsrch-indices').show();
            $('#elsrch-status > .glyphicon-refresh').removeClass("spinning");
        }).fail(function() {
            $('#nb-elsrch-indices,#nb-elsrch-plugins').text("N/A");
            $('#elsrch-status > .glyphicon-refresh').removeClass("spinning");
        })
    });
}

function buildElsrchProperties(nodeProcess) {
    return $('<table class="table table-condensed"></table>')
        .append(createElsrchPropLine("max_file_descriptors", nodeProcess.max_file_descriptors, (nodeProcess.max_file_descriptors >= 32000)))
        .append(createElsrchPropLine("mlockall", nodeProcess.mlockall, nodeProcess.mlockall));
}

function createElsrchPropLine(name, value, valid) {
    var lineClass = valid ? "success" : "danger";
    return `<tr class="elsrch-status-full-line"><td>${name}</td><td><span class="label label-${lineClass}">${value}</span></td></tr>`;
}

// ------------ end index.html ------------

var createCORSRequest = function(method, url, user, pass) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // Most browsers.
        if (user !== null) {
            xhr.withCredentials = true;
        }
        xhr.open(method, url, true, user, pass);
    } else if (typeof XDomainRequest != "undefined") {
        // IE8 & IE9
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
};

var now = function() {
    return new Date().toLocaleString()
}

var sizesUnits = ['B', 'KB', 'MB', 'GB', 'TB'];

function bytesToSize(bytes) {
   if (bytes == 0) return '0B';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + sizesUnits[i];
};

function sizeToBytes(size) {
    var split = /([0-9.]+)(.*)/.exec(size);
    var value = split[1];
    var unit = split[2];

    var pow = sizesUnits.indexOf(unit);
    return pow >= 0 ? value * Math.pow(1024, pow) : Number(value);
}

function formatLargeNumber(number) {
    return number > 9999 ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : number;
}
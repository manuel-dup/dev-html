// ------------ for essm_seamconn.html ------------
var currentHost = window.location.host;

const ESSM_BASE_URL = "http://"+currentHost+":8080/essm/";
const SCDATA_GENERATOR_URL_SUFFIX = ":19703/encrypt";

var payloadEditor;

function resetForm() {
    $('#seamless-connection').attr('disabled', '');
    $('#scdata-input').val('');
    $('#encrypted-scdata').text('Click "Prepare" to generate the Seamless Connection data');
    $('#seamconn-form').attr("action", "");
}

(function() {
    $('#essm-url-addon').text(ESSM_BASE_URL);
    $('#data-gen-url').attr('value', "http://" + currentHost);

    payloadEditor = CodeMirror.fromTextArea(document.getElementById("essm-seamconn-payload"), {
        mode: {name: "javascript", json: true},
        lineNumbers: true,
        matchBrackets: true,
        gutters: ["CodeMirror-linenumbers"]
    });

    payloadEditor.on('change', function() {
        resetForm();
    });

    $('#prepare-seamless-connection').click(function(){
        var scDataGeneratorUrl = $('#data-gen-url').val() + SCDATA_GENERATOR_URL_SUFFIX;
        var essmTargetUrl = ESSM_BASE_URL + $('#essm-url').val();
        var d = JSON.parse(payloadEditor.getValue());

        console.log("Preparing seamless connection", scDataGeneratorUrl, essmTargetUrl, d);

        $.ajax({
            type: "POST",
            url: scDataGeneratorUrl,
            dataType: "json",
            data: JSON.stringify(d),
            contentType: "application/json",
            async: true,
            crossDomain: true

        }).done(function (data, status) {
            console.log("Received response", data);
            if (data.scdata) {
                $('#encrypted-scdata').text(data.scdata);
                $('#scdata-input').val(data.scdata);
                $('#seamconn-form').attr("action", essmTargetUrl);
                $('#seamless-connection').removeAttr("disabled");
            }
        }).fail(function (resp, status, err){
            console.log("Error", arguments);
            $('#encrypted-scdata').text(`Error: [${resp.status}] ${resp.statusText}`);
        });

    });

    resetForm();
})();
// ------------ for speech-recognition.html ------------

var SpeechRecognition = typeof SpeechRecognition !== "undefined" ? SpeechRecognition : typeof webkitSpeechRecognition !== "undefined" ? webkitSpeechRecognition : null;
$('#start,#stop,#read').attr('disabled', 'true');

if (SpeechRecognition === null) {
    $('#not-supported').show();

} else {
    var recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;

    $('#lang').text(recognition.lang).removeClass("label-warning").addClass("label-success");

    $("#start").click(function() {
        recognition.start();
        $('#start').attr('disabled', 'true');
        $('#stop').removeAttr('disabled');
    });

    $('#stop').click(function() {
        stopRecognition();
    });

    $('#read').click(function() {

    });

    var selectLang = function(lang, label) {
        recognition.lang = lang;
        $('#selected-lang > .lbl').text(label);
        $('#selected-lang').removeClass("btn-default").addClass("btn-success");
        $('#stop').attr('disabled', 'true');
        $('#start').removeAttr('disabled');
    };

    $('#select-french').click(function() {
        selectLang('fr-FR', this.text);
    });

    $('#select-english').click(function() {
        selectLang('en-GB', this.text);
    });

    var stopRecognition = function() {
        recognition.stop();
        $('#stop').attr('disabled', 'true');
        $('#start').removeAttr('disabled');
    };

    recognition.onresult = function(event) {
        console.log("Event", event);
        var sentence = "";
        for (var res of event.results) {
            console.log("Res", res[0]);
            sentence += res[0].transcript;
            if (res.isFinal) {
                console.log("==> Final");
                $('#output').addClass("final");

                if (sentence.length > 0) {
                    $('#read').removeAttr('disabled');
                }
            }
        }
        $('#output').text(sentence);
    }

    recognition.onspeechend = function() {
        stopRecognition();
    };

    recognition.onnomatch = function(event) {
        console.log('No match', event);
    };

    recognition.onerror = function(event) {
        console.log('Error', event);
    };
}
// ------------ end speech-recognition.html ------------

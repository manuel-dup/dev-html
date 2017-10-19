// ------------ for speech-recognition.html ------------

var SpeechRecognition = typeof SpeechRecognition !== "undefined" ? SpeechRecognition : typeof webkitSpeechRecognition !== "undefined" ? webkitSpeechRecognition : null;

if (SpeechRecognition === null) {
    $('#not-supported').show();
    $('#start,#stop').attr('disabled', 'true');

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

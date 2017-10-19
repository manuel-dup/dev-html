// ------------ for speech-recognition.html ------------

var SpeechRecognition = typeof SpeechRecognition !== "undefined" ? SpeechRecognition : typeof webkitSpeechRecognition !== "undefined" ? webkitSpeechRecognition : null;
$('#start,#stop').attr('disabled', 'true');

var voices = {};
var noVoices = function() {
    $('#no-voices').show();
    $('#read').attr('disabled', 'true');
}

var speak = function(text, lang) {
    var t = text.trim();
    if (t.length > 0) {
        var utterance = new SpeechSynthesisUtterance(t);
        utterance.lang = lang;
        synth.speak(utterance);
    }
}

var synth = window.speechSynthesis;

if (typeof synth !== "undefined") {
    synth.cancel();
}

synth.onvoiceschanged = function() {
    var synthVoices = synth.getVoices();
    if (synthVoices.length > 0) {
        for (var v of synthVoices) {
            voices[v.lang] = v;
        }
        $('#no-voices').hide();
        $('#read').removeAttr('disabled');
    } else {
        noVoices();
    }
}

if (synth.getVoices().length <= 0) {
    noVoices();
}

if (SpeechRecognition === null) {
    $('#not-supported').show();
    $('#output').text("Exemple pour tester la synthèse vocale. Est-ce que ça marche ?");
    $('#read').click(function() {
        speak($('#output').text(), 'fr-FR');
    });

} else {
    var recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;

    $('#lang').text(recognition.lang).removeClass("label-warning").addClass("label-success");

    $("#start").click(function() {
        recognition.start();
        $('#start').attr('disabled', 'true');
        $('#stop').removeAttr('disabled');
        $('#output').removeClass("final");
    });

    $('#stop').click(function() {
        stopRecognition();
    });

    $('#read').click(function() {
        speak($('#output').text(), recognition.lang);
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

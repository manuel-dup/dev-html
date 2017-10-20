// ------------ for speech-recognition.html ------------

var SpeechRecognition = typeof SpeechRecognition !== "undefined" ? SpeechRecognition : typeof webkitSpeechRecognition !== "undefined" ? webkitSpeechRecognition : null;
$('#start,#stop,#read').attr('disabled', 'true');

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
        synth.cancel();
        synth.speak(utterance);
    }
}

var recognition = null;
var synth = window.speechSynthesis;

if (typeof synth !== "undefined") {
    synth.cancel();
}

var voiceName = function(voice) {
    return voice.name.replace(/Google./, "");
};

var selectLang = function(voice) {
    if (recognition !== null) {
        recognition.lang = voice.lang;
        $('#selected-lang > .lbl').html('<code class="lang-label">'+voice.lang+'</code><div class="lang-name">'+voiceName(voice)+'</div>');
        $('#selected-lang').removeClass("btn-default").addClass("btn-success");
        $('#stop').attr('disabled', 'true');
        $('#start').removeAttr('disabled');
    }
};

var populateLangList = function() {
    var k = Object.keys(voices).sort();
    for (var l of k) {
        if (voices.hasOwnProperty(l)) {
            var v = voices[l];
            $('#lang-list').append('<li>\
                <a class="select-language" locale="'+v.lang+'" href="#">\
                    <code class="lang-label">'+v.lang+'</code>\
                    <div class="lang-name">'+voiceName(v)+'</div>\
                </a>\
            </li>');
        }
    }
    console.log(voices);
    $('.select-language').click(function() {
        selectLang(voices[$(this).attr("locale")]);
    });
}

synth.onvoiceschanged = function() {
    var synthVoices = synth.getVoices();
    if (synthVoices.length > 0) {
        $('#lang-list').empty();
        for (var v of synthVoices) {
            if (!voices[v.lang]) {
                voices[v.lang] = v;
            }
        }
        $('#no-voices').hide();
        populateLangList();
    } else {
        noVoices();
    }
}

if (synth.getVoices().length <= 0) {
    noVoices();
}

if (SpeechRecognition === null) {
    $('#not-supported').show();
    $('#read').click(function() {
        $('#output').text("Exemple pour tester la synthèse vocale. Est-ce que ça marche ?");
        speak($('#output').text(), 'fr-FR');
    });

} else {
    recognition = new SpeechRecognition();
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

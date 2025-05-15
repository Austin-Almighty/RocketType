"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = selectWords;
var sample_word_list = ["apple", "bridge", "curious", "velvet", "harmony", "whisper", "orbit", "lantern", "breeze", "shadow", "thunder", "planet", "galaxy", "pebble", "crystal", "meadow", "ripple", "canyon", "echo", "marble", "volcano", "ember", "compass", "fossil", "tundra", "cactus", "glacier", "saddle", "prism", "feather", "quiver", "nectar", "drift", "swirl", "shimmer", "blaze", "jungle", "maple", "amber", "creek", "rustle", "limestone", "clover", "daisy", "fern", "gust", "haze", "ink", "jade", "kettle", "lagoon", "mist", "nook", "opal", "perch", "quartz", "ravine", "summit", "tide", "umber", "vale", "willow", "yonder", "zenith", "cobble", "dune", "flicker", "glint", "howl", "icicle", "jolt", "knoll", "loam", "moss", "pine", "rift", "spool", "thicket", "uproot", "vapor", "wharf", "xenon", "yawn", "zest", "anchor", "brook", "chime", "dusk", "elm", "frost", "gully", "hearth", "isle", "jingle", "keel", "locket", "marsh", "oasis", "pike", "quill", "ridge", "shore", "thud", "uproar", "wisp", "xylem", "yarn", "aurora", "boulder", "cavern", "dell", "fjord", "grove", "hollow", "inlet", "jute", "kelp", "mire", "nest", "outcrop", "quake", "spire", "tarn", "upland", "verge", "wade", "yawl", "zephyr", "acorn", "birch", "delta", "estuary", "flint", "glade", "hill", "juniper", "ledge", "mesa", "narrows", "orchid", "pylon", "quarry", "underbrush", "warren", "xyst", "yurt", "zinnia", "alloy", "basalt", "cairn", "forge", "geyser", "islet", "jetty"];
function randomNumberList(numOfWords) {
    var _a;
    var pool = Array.from({ length: numOfWords }, function (_, i) { return i; });
    for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [pool[j], pool[i]], pool[i] = _a[0], pool[j] = _a[1];
    }
    return pool.slice(0, numOfWords);
}
selectWords(100, randomNumberList, sample_word_list);
function selectWords(numOfWords, randomNumberGenerator, wordList) {
    var maxWords = Math.min(numOfWords, wordList.length);
    var randomIndices = randomNumberGenerator(wordList.length).slice(0, maxWords);
    return randomIndices.map(function (index) { return wordList[index]; });
}
var words = selectWords(100, randomNumberList, sample_word_list);
function WordsFormatting(wordList) {
    return wordList.map(function (word) { return word.split(""); });
}
var formatted = WordsFormatting(words);
console.log(formatted);

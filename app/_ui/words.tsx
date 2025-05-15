// const sample_word_list:string[] = ["apple", "bridge", "curious", "velvet", "harmony", "whisper", "orbit", "lantern", "breeze", "shadow", "thunder", "planet", "galaxy", "pebble", "crystal", "meadow", "ripple", "canyon", "echo", "marble", "volcano", "ember", "compass", "fossil", "tundra", "cactus", "glacier", "saddle", "prism", "feather", "quiver", "nectar", "drift", "swirl", "shimmer", "blaze", "jungle", "maple", "amber", "creek", "rustle", "limestone", "clover", "daisy", "fern", "gust", "haze", "ink", "jade", "kettle", "lagoon", "mist", "nook", "opal", "perch", "quartz", "ravine", "summit", "tide", "umber", "vale", "willow", "yonder", "zenith", "cobble", "dune", "flicker", "glint", "howl", "icicle", "jolt", "knoll", "loam", "moss", "pine", "rift", "spool", "thicket", "uproot", "vapor", "wharf", "xenon", "yawn", "zest", "anchor", "brook", "chime", "dusk", "elm", "frost", "gully", "hearth", "isle", "jingle", "keel", "locket", "marsh", "oasis", "pike", "quill", "ridge", "shore", "thud", "uproar", "wisp", "xylem", "yarn", "aurora", "boulder", "cavern", "dell", "fjord", "grove", "hollow", "inlet", "jute", "kelp", "mire", "nest", "outcrop", "quake", "spire", "tarn", "upland", "verge", "wade", "yawl", "zephyr", "acorn", "birch", "delta", "estuary", "flint", "glade", "hill", "juniper", "ledge", "mesa", "narrows", "orchid", "pylon", "quarry", "underbrush", "warren", "xyst", "yurt", "zinnia", "alloy", "basalt", "cairn", "forge", "geyser", "islet", "jetty"]

// function randomNumberList(numOfWords: number) {
//   const pool = Array.from({ length: numOfWords }, (_, i) => i);
//   for (let i = pool.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [pool[i], pool[j]] = [pool[j], pool[i]];
//   }

//   return pool.slice(0, numOfWords);
// }


// export default function selectWords(
//   numOfWords: number,
//   randomNumberGenerator: (length: number) => number[],
//   wordList: string[]
// ): string[] {
//   const maxWords = Math.min(numOfWords, wordList.length);
//   const randomIndices = randomNumberGenerator(wordList.length).slice(0, maxWords);
//   return randomIndices.map(index => wordList[index]);
// }

// const words = selectWords(100, randomNumberList, sample_word_list);

// function WordsFormatting(wordList: string[]): string[][] {
//   return wordList.map(word => word.split(""));
// }






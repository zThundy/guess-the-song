

export const isNumber = function (num) {
    if (typeof num === 'number') return num - num === 0;
    if (typeof num === 'string' && num.trim() !== '') return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
    return false;
};

export const convertSnakeToPaskalIcon = function(str) {
    switch(str) {
        case "AddCircle":
            return "add_circle";
        case "LibraryMusic":
            return "library_music";
        case "HourglassBottom":
            return "hourglass_bottom";
        case "Videocam":
            return "videocam";
        case "SportsEsports":
            return "sports_esports";
        case "Movie":
            return "movie";
        case "MusicNote":
            return "music_note";
        default:
            return "music_note";
    }
}
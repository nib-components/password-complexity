var scoreFunctions = [
    scoreLength,
    scoreUppercase,
    scoreLowercase,
    scoreNumbers,
    scoreSymbols,
    scoreMiddleNumbersOrSymbols,
    scoreRequirements,
    scoreLettersOnly,
    scoreNumbersOnly,
    scoreRepeatedCharacters,
    scoreConsecutiveUppercase,
    scoreConsecutiveLowercase,
    scoreConsecutiveNumbers,
    scoreSequentialLetters,
    scoreSequentialNumbers,
    scoreSequentialSymbols
];

module.exports = function(password) {
    if( password.length === 0 ) return false; 

    if(password.length < 8) {
        return -1;
    }

    var score = 0;
    for (var i = 0; i < scoreFunctions.length; i++) {
        score += scoreFunctions[i](password);
    }

    score = Math.max(0, Math.min(100, score)); // cap to 100
    return score;
};

function scoreLength(password) {
    return password.length * 4;
}

function scoreUppercase(password) {
    var uppercase = password.replace(/[^A-Z]+/g, '');
    return uppercase.length > 0 ? 2 * (password.length - uppercase.length) : 0;
}

function scoreLowercase(password) {
    var lowercase = password.replace(/[^a-z]+/g, '');
    return lowercase.length > 0 ? 2 * (password.length - lowercase.length) : 0;
}

function scoreNumbers(password) {
    var numbers = password.replace(/[^0-9]+/g, '');
    return numbers.length * 4;
}

function scoreSymbols(password) {
    var symbols = password.replace(/[A-Za-z0-9]+/g, '');
    return symbols.length * 6;
}

function scoreMiddleNumbersOrSymbols(password) {
    var middleNumbersOrSymbols = password.replace(/^.|.$/g, '').replace(/[A-Za-z]+/g, '');
    return middleNumbersOrSymbols.length * 2;
}

function scoreRequirements(password) {
    var score = 2 * (
        (password.length > 8 ? 1 : 0) +
        Math.min(scoreUppercase(password), 1) +
        Math.min(scoreLowercase(password), 1) +
        Math.min(scoreNumbers(password), 1) +
        Math.min(scoreSymbols(password), 1)
    );
    return score >= 8 ? score : 0;
}

function scoreLettersOnly(password) {
    var letters = password.replace(/[^A-Za-z]+/g, '');
    return letters.length == password.length ? -password.length : 0;
}

function scoreNumbersOnly(password) {
    var numbers = password.replace(/[^0-9]+/g, '');
    return numbers.length == password.length ? -password.length : 0;
}

function scoreRepeatedCharacters(password) {
    var passwordAsArray = password.split(''); // IE <= 7 doesn't support array access to strings, so fudge it.
    var score = 0;
    var previousCharScore = 0;
    var charBucket = {};
    for (var i = 0; i < passwordAsArray.length; i++) {
        var character = passwordAsArray[i];
        var charScore = 0;
        charBucket[character] = charBucket[character] ? charBucket[character] + 1 : 1;
        if (i > 0 && passwordAsArray[i - 1] == character) {
            charScore = previousCharScore + 1;
        }
        score -= charScore;
        previousCharScore = charScore;
    }
    $.each(charBucket, function (item, count) {
        score -= count > 1 ? count : 0;
    });
    return score;
}

function scoreConsecutiveUppercase(password) {
    return scoreConsecutiveChars(password, /[A-Z]/);
}

function scoreConsecutiveLowercase(password) {
    return scoreConsecutiveChars(password, /[a-z]/);
}

function scoreConsecutiveNumbers(password) {
    return scoreConsecutiveChars(password, /[0-9]/);
}

function scoreSequentialLetters(password) {
    password = password.toLowerCase();
    return scoreSequentialChars(password, /[a-z]/);
}

function scoreSequentialNumbers(password) {
    return scoreSequentialChars(password, /[0-9]/);
}

function scoreSequentialSymbols(password) {
    return scoreSequentialChars(password, /[^A-Za-z0-9]/);
}

function scoreConsecutiveChars(password, charMatchRegex) {
    var passwordAsArray = password.split(''); // IE <= 7 doesn't support array access to strings, so fudge it.
    var score = 0;
    for (var i = 0; i < passwordAsArray.length - 1; i++) {
        if (passwordAsArray[i].match(charMatchRegex) && passwordAsArray[i + 1].match(charMatchRegex)) {
            var consecutive = getConsecutiveCharString(password, charMatchRegex, i);
            score -= 2 * Math.max(0, consecutive.length - 1);
            i += consecutive.length - 1;
        }
    }
    return score;
}

function getConsecutiveCharString(password, charMatchRegex, startIndex) {
    var passwordAsArray = password.split(''); // IE <= 7 doesn't support array access to strings, so fudge it.
    var consecutive = passwordAsArray[startIndex];
    var i = startIndex;
    while (i + 1 < passwordAsArray.length && passwordAsArray[i + 1].match(charMatchRegex)) {
        consecutive += passwordAsArray[i + 1];
        i++;
    }
    return consecutive;
}

function scoreSequentialChars(password, charMatchRegex) {
    var passwordAsArray = password.split(''); // IE <= 7 doesn't support array access to strings, so fudge it.
    var score = 0;
    for (var i = 0; i < password.length - 1; i++) {
        if (passwordAsArray[i].match(charMatchRegex) && passwordAsArray[i + 1].match(charMatchRegex) && Math.abs(password.charCodeAt(i) - password.charCodeAt(i + 1)) == 1) {
            var seqString = getSequentialString(password, i);
            i += seqString.length - 1;
            score -= 3 * Math.max(0, seqString.length - 2);
        }
    }
    return score;
}

function getSequentialString(password, startIndex) {
    var passwordAsArray = password.split(''); // IE <= 7 doesn't support array access to strings, so fudge it.
    var increment = password.charCodeAt(startIndex + 1) - password.charCodeAt(startIndex);
    if (Math.abs(increment) != 1) {
        return '';
    }
    var seqString = passwordAsArray[startIndex];
    var i = startIndex;
    while (i + 1 < passwordAsArray.length && password.charCodeAt(i) + increment == password.charCodeAt(i + 1)) {
        seqString += passwordAsArray[i + 1];
        i++;
    }
    return seqString;
}
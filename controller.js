var TDAPI = require('tdapi');
var pos = require('pos');

// Initialize a new TDAPI client
var TD = new TDAPI({
  baseUrl: 'https://td.byui.edu/TDWebApi/api',
  credentials: {
    UserName: process.env.TD_USERNAME,
    Password: process.env.TD_PASSWORD
  }
});

function removeHTML(str) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
          
    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace( /(<([^>]+)>)/ig, '');
}

function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}

function tagWords(text) {
  var words = new pos.Lexer().lex(text);
  var tagger = new pos.Tagger();
  var taggedWords = tagger.tag(words);
  let nouns = [];
  for (i in taggedWords) {
    var taggedWord = taggedWords[i];
    var word = taggedWord[0];
    var tag = taggedWord[1];
    if (tag == 'NN' || tag == 'VBG' || tag == 'NNS') nouns.push(word);
  }
  return nouns;
}

module.exports.getTag = async (req, res, next) => {
    try {
        let data = await TD.getReport(18447, true, null);
        let query = Object.keys(req.query)[0];
        console.log(data.DataRows);
        let ID = data.DataRows.find((tck)=>tck.TicketID == query).TicketID;
        let ticket = await TD.getTicket(48, ID);
        console.log(removeHTML(ticket.Description));
        let description = removeHTML(ticket.Description);
        let tags = tagWords(description);
        res.send(removeDuplicates(tags));
    } catch (err) {
        next(err);
    }
}

module.exports.getTodaysTags = async (req, res, next) => {
    try {
        let sumTags = {}
        console.log('running');
        let data = await TD.getReport(18447, true, null);
        for (let i = 0; i < data.DataRows.length; i++) {
            let tck = await TD.getTicket(48, data.DataRows[i].TicketID);
            let description = removeHTML(tck.Description);
            let tags = removeDuplicates(tagWords(description));
            console.log(tags);
            for (let j = 0; j < tags.length; j++) {
                console.log(tags[j]);
                if (!sumTags[tags[j]]) {
                    sumTags[tags[j]] = 1;
                    
                } else {
                    sumTags[tags[j]]++
                }
            }
            console.log(i);
            if (i > 100) break;
        }
        let sortable = [];
        for (var tag in sumTags) {
            sortable.push([tag, sumTags[tag]]);
        }

        sortable.sort(function(a, b) {
            return a[1] - b[1];
        });
        res.send(sortable);
    } catch (err) {
        next(err);
    }
}

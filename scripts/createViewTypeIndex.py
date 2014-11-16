import json
import sys
import os
import nltk
from nltk.tokenize import word_tokenize

purposeLabel = 'review'
#grammar = '\n  NVP: {<NP><VP>}\n  VP: {<VB><IN><NN>}\n  NP: {<JJ><NN>+ | <JJS><NN>+ | <JJS><NNS> | <JJ><NNS> | <NN><NNS> | <NN><NN> | <NN>+<VBG> | <IN><NN>+ | <IN><TO><VP> | <IN><TO><VB>}\n'
grammar = 'NP: {<NN>+}'

#class Purpose(Enum):
#    Honeymoon = 1
#    Business = 2
#    Traveling = 3
#    Friends = 4
            
def addOrInsert(result, key, value):
    hotel, review = value
    if key in result:
        if hotel in result[key]:
            result[key][hotel].append(review)
        else:
            result[key][hotel] = [review]
    else:
        result[key] = {hotel: [review]}
    return result

def parsePhrases(tree, arglist):
    result = []
    depth = 0
    delim = ' '
    while depth < len(tree):
        arg = tree[depth]
        depth += 1
        if isinstance(arg, tuple):
            # do something.
            if arg[1] == 'NN':
                result.append(arg[0])
            continue
        if isinstance(arg, nltk.tree.Tree):
            # do other things.
            label = arg.label()
            if label == 'NP':
                lengthOfPhrase = len(arg)
                phrase = ""
                for part in arg:
                    phrase += part[0] + delim
                    if part[1] == 'NN':
                        result.append(part[0])
                result.append(phrase)
            continue
    return result
        

if __name__ == "__main__":
    result = {}
    cp = nltk.RegexpParser(grammar)
    # open attribute cloud and read the food line.
    print('starting...')
    viewTypeObj = json.loads(open(sys.argv[1], 'r').read())
    print('loaded view type object')
    # read the directory which contains all the reviews.
    locationDir = sys.argv[2]
    hotelList = os.listdir(locationDir)
    for hotelId in hotelList:
        print ('hotel id: ' + hotelId)
        hotelDir = os.path.join(locationDir, hotelId)
        reviewList = os.listdir(hotelDir)
        for reviewId in reviewList:
            reviewPath = os.path.join(hotelDir, reviewId)
            jsonObj = json.loads(open(reviewPath, 'r').read())
            if (purposeLabel not in jsonObj):
                continue
            reviewText = jsonObj[purposeLabel]
            # split it in lines and find the lines which seem to talk about food.
            lines = reviewText.split('.')
            for line in lines:
                # if lines talks about #food.
                words = word_tokenize(line)
                words_pos = nltk.pos_tag(words)
                parseTree = cp.parse(words_pos)
                # play with nltk Tree here and find patterns and do lookups.
                # expected results are in the form of <NN>+
                phraseList = parsePhrases(parseTree, ['NP', 'NN'])
                print ('length of phrase list: ' + str(len(phraseList)))
                for phr in phraseList:
                    print ('phrase: ' + phr.encode('utf-8'))
                    if phr in viewTypeObj:
                        viewTypeFound = viewTypeObj[phr]
                        print ('YAY: view type found: ' + viewTypeFound)
                        key = viewTypeFound
                        value = (hotelId, reviewId)
                        result = addOrInsert(result, key, value)
    print('opening write file...')
    f = open(sys.argv[3], 'w')
    print('after open!')
    towrite = json.dumps(result)
    print('after dumps!')
    f.write(towrite)
    f.close()
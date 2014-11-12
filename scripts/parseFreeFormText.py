'''

free form text parsing:

1. look for keywords e.g. location, staff, food. And find attributes for them and do a lookup. basically all the words from the attribute cloud

    a. define these set of keywords.
    b. ignore the keyword like hotel.

2. bigrams e.g. city centre, infinity pool, thai food, good location, nice breakfast. Either category or adjective. POS Tagger will tell.

    b. Do the pos tagging of the written sentence.
    c. define what can be a potential noun phrase. e.g.
        'NP: {<JJ><NN> | <JJS><NN> | <JJS><NNS> | <JJ><NNS> | <NN><NNS> | <NN><NN>}'
    d. find NN and NP in the free form text.
    
3. take the filtered NNSet(NN or NNS) and NPSet and do following with these sets:
    3.1. for each element in NNSet: assume each element is an attribute or an amenity.
    3.2. for each element in NPSet (assuming each element is a bigram):
        if the bigram is JJ;NN or NN;NN, treatment is different.
        if JJ;NN, then JJ is adjective or sentiment and NN is the attribute.
        if NN;NN then first NN is the category and second NN is the attribute.
    3.3. 
        
'''

'''
4. output format:
   4.1. attribute e.g. food, location, service
   4.2. category: infinity (for pool), thai (for food)
   4.3. sentiment: awesome, good, okay for any attribute.
   
   output datastructure:
    { att -> (category, sentiment)}
'''

import sys
import nltk
from nltk.tokenize import word_tokenize

grammar = '\n  NVP: {<NP><VP>}\n  VP: {<VB><IN><NN>}\n  NP: {<JJ><NN>+ | <JJS><NN>+ | <JJS><NNS> | <JJ><NNS> | <NN><NNS> | <NN><NN> | <NN>+<VBG> | <IN><NN>+ | <IN><TO><VP> | <IN><TO><VB>}\n'

if __name__ == "__main__":
    sentence = sys.argv[1]
    tokens = word_tokenize(sentence)
    pos = nltk.pos_tag(tokens)
    gram = grammar
    if (len(sys.argv) > 2):
        gram = sys.argv[2]
    cp = nltk.RegexpParser(grammar)
    tree = cp.parse(pos)
    # parse all the NVP, NP, VP, 
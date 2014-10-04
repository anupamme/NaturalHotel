from Data import Hotel
from Data import Review
import os
import random
from textblob import TextBlob
from textblob.sentiments import NaiveBayesAnalyzer

rootDirectoryForData = '/Users/mediratta/Code/NaturalLanguageForm/data'
reviewIdToReviewMap = {}
hotelIdToHotelMap = {}
reviewIdToHotelIdMap = {}
hotelIdToReviewIdSetMap = {}
locationToHotelIdSetMap = {}
attributeToReviewIdMap = {} # stores review for attributes
attributeToKeywordSetMap = {}
keywordToAttributeMap = {}
reviewIdToAttributeToSentimentMap = {}

# assume that search criterion is the list of attributes.
def getReviews(searchCriterion):
    location = searchCriterion['location']
    aspects = searchCriterion['aspects']
    
    hotelList = findHotelsForLocation(location)
    reviewList = filterReviewsByHotelIds(hotelList)
    
    reviewList = filterReviewsByAspects(aspects, reviewList)
    return reviewList
    
    
def getHotel(reviewid):
    return mapOfReviewIdToHotelId.get(reviewId) # construct me.
    
def getReviews(hotelId):
    return mapOfHotelIdToReviewIdSet(hotelId) # construct me
    
def getHotels(searchCriterion):
    hotels = []
    reviewSet = getReviews(searchCriterion)
    for reviewId in reviewSet:
        hotels.append(getHotel(reviewId))
    return set(hotels)

def getNearByKeyWords(keyword):
    attr = findAttribute(keyword)
    attrSet = findAttributesWithCooccuranceProbability(attr, 0.5)
    results = []
    for item in attrSet:
        results.append(findSimilarToAttribute(item))
    return results

#def getSummary(text):
    # use some python library to return summary.
    
def init():
    # build keyword to attribute and reverse map.
    f = open('attribute-cloud.txt', 'r')
    lines = f.read().split('\n')
    for line in lines:
        tokCount = 0
        tokenSet = line.split(',')
        attributeToKeywordSetMap[tokenSet[0]] = tokenSet
        while tokCount < len(tokenSet):
            keywordToAttributeMap[tokenSet[tokCount]] = tokenSet[0]
            
    # read the review directory and construct 3 maps:
    # reviewid to review object.
    # hotelid to hotel object.
    # hotelid to [reviewid]
    # reviewid to hotelid
    # location_key to [hotelIds]
    for dir1 in os.listdir(rootDirectoryForData):
        print "In: " + dir1
        key = dir1
        count = 0
        hotelIdSet = []
        newPath = os.path.join(rootDirectoryForData, dir1) # location
        for dir2 in os.listdir(newPath):
            print "In: " + dir2
            hotelid = dir2
            reviewIdSet = []
            nextNewPath = os.path.join(newPath, dir2)
            for files in os.listdir(nextNewPath):
                print "In: " + files
                fileToOpen = os.path.join(nextNewPath, files)
                f = open(fileToOpen, 'r')
                reviewlist = f.read()
                reviewCount = 0
                for line in reviewlist:
                    #print "In: " + line
                    if line == '':
                        continue
                    if reviewCount >= 2000:
                        break
                    # do sentiment analysis.
                    indLines = line.split('.')
                    for indLine in indLines:
                        blob = TextBlob(indLine, pos_tagger=nltk_tagger, analyzer=NaiveBayesAnalyzer())
                        sentiment = blob.sentiment.classification
                        aspect = ''
                        for tag in blob.pos_tags:
                            if tag.[1] == 'NN':
                                aspect = tag[0]
                        aspect = unifyString(aspect)
                    reviewIdToReviewMap[count] = Review(line)
                    reviewIdToHotelIdMap[count] = hotelid
                    reviewIdSet.append(count)
                    count += 1
                    reviewCount += 1
                print "Parsed #reviews: " + str(reviewCount)
            hotelIdToReviewIdSetMap[hotelid] = reviewIdSet
            hotelIdToHotelMap[hotelid] = Hotel("my name")
            hotelIdSet.append(hotelid)
        locationToHotelIdSetMap[key] = hotelIdSet

def unifyString(val):
    return val.strip().lower()
        
def findHotelsForLocation(location):
    key = createHotelSearchKey(location)
    hotelIdSet = locationToHotelIdSet(key)
    return hotelIdSet

def createHotelSearchKey(location):
    city = location['city']
    state = location['state']
    country = location['country']
    key = ''
    if city != '':
        key += city
    if state != '':
        key += ':' + state
    if country != '':
        key += ':' + country
    return key

def filterReviewsByHotelIds(hotelIds):
    results = []
    for id in hotelIds:
        results.append(getReviews(id))
    return results

def filterReviewsByAspects(aspects, reviewList):
    reviews = []
    for asp in aspects:
        att = findAttribute(asp)
        if att is not None:
            reviews.append(findReviewsForAttribute(att, reviewList))
    return set(reviews)

def findAttribute(keyword):
    return keywordToAttributeMap[keyword] # construct me

def findAttributesWithCooccuranceProbability(keyword, prob):
    # construct the probability graph.
    result = []
    attr = findAttribute(keyword)
    totalAttributes = keywordToAttributeMap.values()
    for destAttr in totalAttributes:
        if destAttr != attr:
            if findProbability(attr, destAttr) >= prob:
                result.append(destAttr)
    return result

''' probability that attr1 and attr2 occur simultaneously in a review. '''
def findProbability(attr1, attr2):
    return random.random()

def findSimilarToAttribute(attr):
    return attributeToKeywordMap[attr] # construct me.

def findReviewsForAttribute(att, reviewList):
    result = []
    aspects = findSimilarToAttribute(att)
    for rev in reviewList:
        review = reviewList[rev]
        for asp in aspects:
            sentences = review.split('.')
            for sent in sentences:
                if review.index(asp) != -1 && random.random() > 0.5: # random for sentiment analysis.
                    result.append(rev)
    return result

def getSentiment(reviewId, aspect):
    attr = findAttribute(aspect)
    return reviewIdToAttributeToSentimentMap[reviewId][attr]
                    
                

"""Hello World API implemented using Google Cloud Endpoints.

Defined here are the ProtoRPC messages needed to define Schemas for methods
as well as those methods defined in an API.
"""


import endpoints
from protorpc import messages
from protorpc import message_types
from protorpc import remote
import json
import gc
import random

from google.appengine.ext import ndb

prefix = ''

locationPath = prefix + 'locationtohotel.json'
#sentimentPath = prefix + 'sentiment.json'
#hotelAttrPath = prefix + 'hotel_sentiment.json'
reviewMapPath = prefix + 'summary.txt'
#hotelMapPath = prefix + 'hotelDetail.json'
#purposeMapPath = prefix + 'purpose.json'
attributePath = prefix + 'attribute-cloud.json'
#foodIndexPath = prefix + 'foodIndex.json'
#viewIndexPath = prefix + 'viewIndex.json'
#locIndexPath = prefix + 'locIndex.json'
#amenityIndexPath = prefix + 'amenityIndex.json'

locationMap = {}
sentimentMap = {}
purposeMap = {}
hotelDetailMap = {}
reviewMap = {}
hotelAttrMap = {}
subAttrIndexMap = {}
attributeMap = {}
excludeList = {'g188098-d619925': True, 'g188098-d550027': True}
isLoaded = False

readMap = lambda x: json.loads(open(x, 'r').read())

rankMap = {} # stores hotelid -> reviewid -> count

def findScoreOfHotel(hotelId):
    return -1

def storeData(listOfFiles):
    # read all the csv file and store them in database.
    # pass the list of pair: filename, model e.g.
    # [(summary.txt, ReviewMap), (sentiment.json, SentimentMap)]
    for entry in listOfFiles:
        filePath, model = entry
        data = readMap(filePath)
        for key in data:
            model.PutInstance(key, data[key])
            
class LocationMap(ndb.Model):
    locationKey = ndb.StringProperty()
    hotelList = ndb.JsonProperty()
    
    @classmethod
    def PutInstance(key, val):
        r = LocationMap(locationKey = key, hotelList = val)
        r.put()

class ReviewMap(ndb.Model):
    locationKey = ndb.StringProperty()
    hotelId = ndb.StringProperty()
    reviewId = ndb.IntegerProperty()
    reviewObj = ndb.JsonProperty()
    
    @classmethod
    def PutInstance(key, value):
        for hotelId in value:
            reviewArr = value[hotelId]
            count = 0
            for revIns in reviewArr:
                r = ReviewMap(locationKey=key, hotelId=hotelId, reviewId=count, reviewObj = revIns)
                r.put()
                count += 1
        

def loadData(locationKey, purpose):
    global isLoaded
    if isLoaded == False:
        global locationMap
        hotelList = readHotelsByLocation(locationKey)
        global sentimentMap
        sentimentMap = loadSentimentMap(locationKey)
        global reviewMap
        reviewMap = loadReviewMap(locationKey)
        global hotelDetailMap
        hotelDetailMap = loadHotelDetails(hotelList)
        global purposeMap 
        purposeMap = loadPurposeMap(locationKey, purpose)
        global hotelAttrMap
        hotelAttrMap = loadHotelAttrMap(hotelList)
        global attributeMap
        attributeMap = loadAttributeMap(attributePath)
        global subAttrIndexMap
        subAttrIndexMap['food'] = loadFoodAttributeMap(locationKey, 'food')
        subAttrIndexMap['view'] = loadViewAttributeMap(locationKey, 'view')
        subAttrIndexMap['loc'] = loadLocationAttributeMap(locationKey, 'loc')
        subAttrIndexMap['amenity'] = loadAmenityAttributeMap(locationKey, 'amenity')
        isLoaded = True

class Review(messages.Message):
    review = messages.StringField(1)
    reviewer = messages.StringField(2)
    location = messages.StringField(3)
    image = messages.StringField(4)
    score = messages.IntegerField(5)
    
class Attribute(messages.Message):
    title = messages.IntegerField(1)
    people = messages.IntegerField(2)
    percentageAttr = messages.IntegerField(3)
    views = messages.StringField(4, repeated=True)

class Hotel(messages.Message):
    name = messages.StringField(1)
    address = messages.StringField(2)
    images = messages.StringField(3, repeated=True)
    reviews = messages.MessageField(Review, 4, repeated=True)
    match = messages.StringField(5)     # high, medium, low
    hotelid = messages.StringField(6)   # 
    attributes = messages.MessageField(Attribute, 7, repeated=True)
    score = messages.IntegerField(8)

class HotelCollection(messages.Message):
    items = messages.MessageField(Hotel, 1, repeated=True)
    
class Group(messages.Message):
    hotelC = messages.MessageField(HotelCollection, 1)
    reviewMap = messages.StringField(2)
    

@endpoints.api(name='helloworld', version='v1')
class HelloWorldApi(remote.Service):
    """Helloworld API v1."""
    
    ''' modifies the dict final and returns in.'''
    def IncrementOrInsert(self, final, hotelId, reviewId):
        if hotelId in final:
            if reviewId in final[hotelId]:
                final[hotelId][reviewId] += 1
            else:
                final[hotelId][reviewId] = 1
        else:
            final[hotelId] = {}
            final[hotelId][reviewId] = 1
        return final
    
    '''find the count against each hotelid, reviewid paid'''
    def findCountFromUnion(self, arrayOfMaps):
        final = {}
        for mapIns in arrayOfMaps:    # key = hotelId
            for hotelId in mapIns: # val = [reviewid]
                for reviewId in mapIns[hotelId]:
                    final = self.IncrementOrInsert(final, hotelId, reviewId)
        return final

    '''combines elements of arguments to produce hotelid -> [reviewid]'''
    def takeUnion(self, arrayOfMaps):
        final = {}
        for mapIns in arrayOfMaps:    # key = hotelId
            for hotelId in mapIns: # val = [reviewid]
                if hotelId in final:    # final = attr -> [hotelid -> [reviewid]]
                    final[hotelId] = list(set(final[hotelId] + mapIns[hotelId]))
                else:
                    final[hotelId] = mapIns[hotelId]
        return final
    
    def findRandomDistribution(self):
        z = [random.random(), random.random(), random.random(), random.random(), random.random()]
        y = reduce(lambda a,b: a+b, z, 0)
        return map(lambda x: (x/y)*100, z)
    
    '''converts the result into the format UI expects.'''
    def convertToDomainResults(self, arg_res, rankingCount):
        final = []
        for hotelid in arg_res:
            if hotelid in excludeList:
                continue
            obj = Hotel()
            if (hotelid not in hotelDetailMap):
                continue
            hotel = hotelDetailMap[hotelid]
            obj.name = hotel['title']
            obj.address = hotel['address']
            obj.images = hotel['images']
            obj.match = 'not defined'
            obj.hotelid = hotelid
            attDetails = self.getAttributeDetails(hotelid)
            attributeArr = []
            random = self.findRandomDistribution()
            count = 0
            for quality in attDetails:
                att = Attribute()
                att.title = int(quality)
                att.people = attDetails[quality][1]
                att.percentageAttr = int(random[count])
                count += 1
                att.views = attDetails[quality][0]
                attributeArr.append(att)
            obj.attributes = attributeArr
            reviewArr = []
            totalReviews = arg_res[hotelid]
            for rev in totalReviews[0:5]:
                reviewTmp = reviewMap[hotelid]
                rev_int = int(rev)
                
                reviewObj = reviewTmp[rev_int]
                reviewIns = Review()
                reviewIns.review = reviewObj.get('review')
                reviewIns.reviewer = reviewObj.get('ReviewerName')
                reviewIns.location = reviewObj.get('Place')
                reviewIns.image = reviewObj.get('ReviewerImage')
                
                reviewIns.score = rankingCount[hotelid][rev]
                reviewArr.append(reviewIns)
            obj.reviews = reviewArr
            final.append(obj)
        return HotelCollection(items = final)
            
        
    '''mutates the order of hotels within hotelCollection as per the score. '''
    def rankResults(self, hotelCollection, rankingResults):
        # calculate score per hotel
        hotelScore = {}
        for hotelId in rankingResults:
            total = 0
            for reviewId in rankingResults[hotelId]:
                total += rankingResults[hotelId][reviewId]
            hotelScore[hotelId] = total
            
        # fill this value in hotelCollection
        for hotel in hotelCollection.items:
            hotelId = hotel.hotelid
            score = hotelScore[hotelId]
            hotel.score = score
            hotel.reviews.sort(key=lambda x: x.score, reverse=True)
            
        # rank the hotels
        hotelCollection.items.sort(key=lambda x: x.score, reverse = True)
            
                
            
    # get AttributeDetails is for the pop up display of infographics.
    def getAttributeDetails(self, hotelid):
#        {'awesome': (['pool', 'food'], 33), 'good': [('service', 22), ('overall', 11)]}
# intermediate results
        #        {'awesome': {'pool': 22, 'food': 33}, 'good': {'service': 22, 'overall': 11}}
        #return {'0': ([], 0), '1': ([], 0), '2': ([], 0), '3': ([], 0), '4': ([], 0)}
        attrArr = hotelAttrMap[hotelid]
        inter = {}
        for val in attrArr:
            attr = val[0]
            senti = val[1]
            current = {}
            if senti in inter: 
                current = inter[senti]
            else:
                current = {}
                inter[senti] = current
            
            if attr in current:
                current[attr] = current[attr] + 1
            else:
                current[attr] = 1
        # find which attributes are in max over all sentiments and assign it to that sentiment.
        maxInter = {} # from attribute to sentiment (where it is max.) 
        for senti in inter:
            attMap = inter[senti]
            for attKey in attMap:
                attNum = attMap[attKey]
                if attKey in maxInter:
                    maxSoFar = maxInter[attKey]
                    maxSentiSoFar = maxSoFar[0]
                    maxValSoFar = maxSoFar[1]
                    if attNum > maxValSoFar:
                        maxInter[attKey] = [senti, attNum]
                else:
                    maxInter[attKey] = [senti, attNum]
                
        # final result: 
        final = {} # contain values like: senti => [[att], num]
        for att in maxInter:
            senti = maxInter[att][0]
            value = maxInter[att][1]
            if senti in final:
                final[senti][0].append(att)
                updatedNum = max(value, final[senti][1])
                final[senti][1] = updatedNum
            else:
                final[senti] = [[att], value]
            
        # normalize results
        i = 0
        while (i < 5):
            if (i not in final):
                final[i] = [[], 0]
            i += 1
        return final
    
    
    STORE_RESOURCE = endpoints.ResourceContainer(
        purpose = messages.StringField(1))
    
    @endpoints.method(STORE_RESOURCE, bool, path='data', http_method='GET', name='data.store')
    def request_store_data(self, request):
        #prepare list of files.
        global locationPath
        global reviewMapPath
        arg = [(locationPath, LocationMap), (reviewMapPath, ReviewMap)]
        storeData(arg)
        return True
        
    
    MULTIPLY_METHOD_RESOURCE = endpoints.ResourceContainer(
            purpose = messages.StringField(1, required=True),
            food = messages.StringField(2, repeated=True),
            destination=messages.StringField(3, required=True),
            view=messages.StringField(4),
            location=messages.StringField(5),
            amenities=messages.StringField(6, repeated=True))
    
    @endpoints.method(MULTIPLY_METHOD_RESOURCE, HotelCollection,
                      path='hellogreeting', http_method='POST',
                      name='greetings.listGreeting')
    def greetings_list(self, request):
        locationKey = request.destination
        loadData(locationKey)
        purpose = request.purpose
        food = request.food
        view = request.view
        
#        locationKey = "ZERMATT:SWITZERLAND"
#        purpose = "honeymoon"
#        food = ["indian", "french"]
#        view = ["mountain"]
        
        print 'start params'
        print locationKey
        print purpose
        print 'end params'
        
        #res_loc = set(locationMap[locationKey])  # [hotelids] - not needed as all other maps will take care of location.
#        resultsAsPerAttr = []                       # [(hotelid, reviewid)]
#        for att in attributes:
#            for x in [2.0, 3.0, 4.0]:
#                if (att, x) in sentimentMap:
#                    resultsAsPerAttr = resultsAsPerAttr + sentimentMap[(att, x)]
        res_purpose = purposeMap[purpose]   # {(hotelid: [review])}
        #food.map
        res_food = []
        try:
            if food != None:
                res_food = map(lambda x: subAttrIndexMap['food'][x], food)  #[{hotelid -> [reviewId]}]
        except NameError:
            pass
        
        res_view = []
        try:
            if view != None:
                res_view = subAttrIndexMap['view'][view]
        except NameError:
            pass
        
        res_loc = []
        try:
            if location != None:
                res_loc = subAttrIndexMap['loc'][view]
        except NameError:
            pass
        
        res_amenities = []
        try:
            if amenities != None:
                res_amenities = map(lambda x: subAttrIndexMap['amenity'][x], amenities)  #[{hotelid -> [reviewId]}]
        except NameError:
            pass
        
        # take union
        res_food.append(res_purpose)
        res_food.append(res_view)
        res_food.append(res_loc)
        res_food.append(res_amenities)
        rankingCount = self.findCountFromUnion(res_food) # rankingcount format: (hotelid -> reviewid) -> count
        
        res_union = self.takeUnion(res_food) # format is {(hotelid: [reviewid])}
        domain_results = self.convertToDomainResults(res_union, rankingCount)
        # do ranking
        # rank the domain_results
        self.rankResults(domain_results, rankingCount)
        free = gc.collect()
        print ('freed memory: ' + str(free))
        
        return domain_results
        #return Group(hotelC = domain_results, reviewMap = json.dumps(reviewMap))

            
APPLICATION = endpoints.api_server([HelloWorldApi])
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
sentimentPath = prefix + 'sentiment.json'
hotelAttrPath = prefix + 'hotel_sentiment.json'
reviewMapPath = prefix + 'summary.txt'
hotelMapPath = prefix + 'hotelDetail.json'
purposeMapPath = prefix + 'purpose.json'
attributePath = prefix + 'attribute-cloud.json'
foodIndexPath = prefix + 'foodIndex.json'
viewIndexPath = prefix + 'viewIndex.json'
locIndexPath = prefix + 'locIndex.json'
amenityIndexPath = prefix + 'amenityIndex.json'

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
globalLocationKey = 'ZERMATT:SWITZERLAND'

readMap = lambda x: json.loads(open(x, 'r').read())
encode = lambda x: x.encode('utf-8')

rankMap = {} # stores hotelid -> reviewid -> count

def findScoreOfHotel(hotelId):
    return -1

def storeData(listOfFiles):
    # read all the csv file and store them in database.
    # pass the list of pair: filename, model e.g.
    # [(summary.txt, ReviewMap), (sentiment.json, SentimentMap)]
    for entry in listOfFiles:
        filePath, model = entry
        print filePath
        print model
        data = readMap(filePath)
        for key in data:
            print key
            model.PutInstance(key, data[key])


    
class LocationMapClass(ndb.Model):
    locationKey = ndb.StringProperty()
    hotelList = ndb.JsonProperty()
    
    @classmethod
    def PutInstance(model, key, val):
        r = LocationMapClass(locationKey = key, hotelList = val)
        r.put()
        
    @classmethod
    def GetJson(self, locationMapIns):
        result = {}
        result[locationMapIns.locationKey] = locationMapIns.hotelList

class ReviewMapClass(ndb.Model):
    locationKey = ndb.StringProperty()
    hotelId = ndb.StringProperty()
    reviewId = ndb.IntegerProperty()
    reviewObj = ndb.JsonProperty()
    
    @classmethod
    def PutInstance(model, hotelId, value):
        count = 0
        global globalLocationKey
        for revIns in value:
            print 'rev instance: ' + str(len(revIns))
            r = ReviewMapClass(locationKey=globalLocationKey, hotelId=hotelId, reviewId=count, reviewObj = revIns)
            r.put()
            count += 1
            
    @classmethod
    def GetJson(self, reviewMapList):
        #print 'Getting json for ReviewMapClass instance list!'
        result = {}
        for reviewMapIns in reviewMapList:
            locKey = reviewMapIns.locationKey
            hotelId = reviewMapIns.hotelId
            reviewId = reviewMapIns.reviewId
            reviewIns = reviewMapIns.reviewObj
#            if locKey not in result:
#                result[locKey] = {}
            if hotelId not in result:
                result[hotelId] = {}
            result[hotelId][reviewId] = reviewIns
        return result

class TupleClass(ndb.Model):
    attribute = ndb.StringProperty()
    rating = ndb.StringProperty()


class SentimentMapClass(ndb.Model):
    locationKey = ndb.StringProperty(indexed=True, required=True)
    selectionTuple = ndb.StructuredProperty(TupleClass, indexed=True)
    hotelId = ndb.StringProperty(required=True, indexed=True)
    reviewId = ndb.StringProperty(repeated=True)
    
    @classmethod
    def PutInstance(model, key, value):
        global globalLocationKey
        for key in value:
            r = SentimentMapClass(locationKey=globalLocationKey, selectionTuple = key, hotelId = key, reviewId = value[key])
            r.put()

class HotelDetailMapClass(ndb.Model):
    hotelId = ndb.StringProperty(indexed=True, required=True)
    hotelDetail = ndb.JsonProperty()
    
    @classmethod
    def PutInstance(model, key, value):
        r = HotelDetailMapClass(hotelId = key, hotelDetail = value)
        r.put()
        
    @classmethod
    def GetJson(self, listOfInstances):
        result = {}
        for instance in listOfInstances:
            result[instance.hotelId] = instance.hotelDetail
        return result

class PurposeMapClass(ndb.Model):
    locationKey = ndb.StringProperty(indexed=True, required=True)
    purpose = ndb.StringProperty(indexed=True, required=True)
    hotelId = ndb.StringProperty(indexed=True)
    reviewId = ndb.StringProperty(repeated=True)
    
    @classmethod
    def getClassInstance(self, locKey, purpose, hotelId, reviewArr):
        return PurposeMapClass(locationKey = locKey, purpose = purpose, hotelId = hotelId, reviewId = reviewArr)
    
    @classmethod
    def PutInstance(model, key, value):
        global globalLocationKey
        for hotelId in value:
            r = model.getClassInstance(globalLocationKey, key, hotelId, value[hotelId])
            r.put()
            
    @classmethod
    def GetJson(self, purposeList):
        result = {}
        for purposeIns in purposeList:
            loc = purposeIns.locationKey
            purpose = purposeIns.purpose
            hotelId = purposeIns.hotelId
            reviewIdArr = purposeIns.reviewId
#            if purpose not in result:
#                result[purpose] = {}
#            if hotelId not in result:
#                result[hotelId] = {}
            result[hotelId] = reviewIdArr
        return result


class FoodIndexMapClass(PurposeMapClass):
    @classmethod
    def getClassInstance(self, locKey, foodType, hotelId, reviewArr):
        return FoodIndexMapClass(locationKey = locKey, purpose = foodType, hotelId = hotelId, reviewId = reviewArr)


class AmenityMapClass(PurposeMapClass):
    @classmethod
    def getClassInstance(self, locKey, amenityType, hotelId, reviewArr):
        return AmenityMapClass(locationKey = locKey, purpose = amenityType, hotelId = hotelId, reviewId = reviewArr)


class ViewIndexMapClass(PurposeMapClass):
    @classmethod
    def getClassInstance(self, locKey, viewType, hotelId, reviewArr):
        return ViewIndexMapClass(locationKey = locKey, purpose = viewType, hotelId = hotelId, reviewId = reviewArr)
    
class LocationIndexMapClass(PurposeMapClass):
    @classmethod
    def getClassInstance(self, locKey, locType, hotelId, reviewArr):
        return LocationIndexMapClass(locationKey = locKey, purpose = locType, hotelId = hotelId, reviewId = reviewArr)
    
class AttributeMapClass(ndb.Model):
    attributeKey = ndb.StringProperty(required=True, indexed=True)
    relatedAttributes = ndb.StringProperty(repeated=True)
    
    @classmethod
    def PutInstance(model, key, value):
        r = AttributeMapClass(attributeKey = key, relatedAttributes = value)
        r.put()

def loadData(locationKey):
#    global isLoaded
#    if isLoaded == False:
#        global locationMap
#        locationMap = readMap(locationPath)
#        global sentimentMap
#        sentimentMap = readMap(sentimentPath)
#        global reviewMap
#        reviewMap = readMap(reviewMapPath)
#        global hotelDetailMap
#        hotelDetailMap = readMap(hotelMapPath)
#        global purposeMap 
#        purposeMap = readMap(purposeMapPath)
        global hotelAttrMap
        hotelAttrMap = readMap(hotelAttrPath)
#        global attributeMap
#        attributeMap = readMap(attributePath)
#        global subAttrIndexMap
#        subAttrIndexMap['food'] = readMap(foodIndexPath)
#        subAttrIndexMap['view'] = readMap(viewIndexPath)
#        subAttrIndexMap['loc'] = readMap(locIndexPath)
#        subAttrIndexMap['amenity'] = readMap(amenityIndexPath)
#        isLoaded = True
        
def loadData_m(locationKey):
    global isLoaded
    if isLoaded == False:
        global locationMap
        locationMap = readMap(locationPath)
        global sentimentMap
        sentimentMap = readMap(sentimentPath)
        global reviewMap
        reviewMap = readMap(reviewMapPath)
        global hotelDetailMap
        hotelDetailMap = readMap(hotelMapPath)
        global purposeMap 
        purposeMap = readMap(purposeMapPath)
        global hotelAttrMap
        hotelAttrMap = readMap(hotelAttrPath)
        global attributeMap
        attributeMap = readMap(attributePath)
        global subAttrIndexMap
        subAttrIndexMap['food'] = readMap(foodIndexPath)
        subAttrIndexMap['view'] = readMap(viewIndexPath)
        subAttrIndexMap['loc'] = readMap(locIndexPath)
        subAttrIndexMap['amenity'] = readMap(amenityIndexPath)
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
    
class Whether(messages.Message):
    val = messages.IntegerField(1)
    

    
    
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
        listOfHotelIds = arg_res.keys()
        newListOfHotels = map(encode, listOfHotelIds)
        query = "Select * from HotelDetailMapClass where hotelId in " + str(tuple(newListOfHotels))
        resultSet = ndb.gql(query)
        #print 'hotel detail map size query: ' + str(len(resultSet))
        hotelDetailMap = HotelDetailMapClass.GetJson(resultSet)
        query = "Select * from ReviewMapClass where hotelId in " + str(tuple(newListOfHotels))
        resultReviewMap = ndb.gql(query)
        #print 'length of review map: ' + str(len(resultReviewMap))
        reviewMap = ReviewMapClass.GetJson(resultReviewMap)
        
        for hotelid in arg_res:
            if hotelid in excludeList:
                continue
            obj = Hotel()
            if hotelid not in hotelDetailMap:
                #print 'hotel not found in detail map: ' + hotelid
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
            for rev in totalReviews:
                if hotelid not in reviewMap:
                    #print 'ERROR: Hotel id not found in review map: ' + str(hotelid)
                    continue
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
    
    def convertToDomainResults_m(self, arg_res, rankingCount):
        final = []
        for hotelid in arg_res:
            if hotelid in excludeList:
                continue
            obj = Hotel()
            if hotelid not in hotelDetailMap:
                #print 'hotel not found in detail map: ' + hotelid
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
        global hotelAttrMap
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
    
    def read_file(self):
        bucket_name = os.environ.get('BUCKET_NAME', 'jobs-dir')

        #self.response.headers['Content-Type'] = 'text/plain'
        #self.response.write('Demo GCS Application running from Version: '
        #                    + os.environ['CURRENT_VERSION_ID'] + '\n')
        #self.response.write('Using bucket name: ' + bucket_name + '\n\n')

        bucket = '/' + bucket_name
        filename = bucket + '/job1-th.py'
        #self.response.write('Abbreviated file content (first line and last 1K):\n')

        gcs_file = gcs.open(filename)
        self.response.write(gcs_file.readline())
        gcs_file.seek(-1024, os.SEEK_END)
        print('cloud file contents: ' + gcs_file.read())
        gcs_file.close()
    
    STORE_RESOURCE = endpoints.ResourceContainer(
        purpose = messages.StringField(1))
    
    @endpoints.method(STORE_RESOURCE, Whether, path='data', http_method='GET', name='data.store')
    def request_store_data(self, request):
        #prepare list of files.
        global locationPath
        global reviewMapPath
        arg = [(hotelMapPath, HotelDetailMapClass)]
        storeData(arg)
        return Whether(val = 1)
    
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
        
        # read cloud bucket: experimental code - delete after testing.
        self.read_file()
        #res_loc = set(locationMap[locationKey])  # [hotelids] - not needed as all other maps will take care of location.
#        resultsAsPerAttr = []                       # [(hotelid, reviewid)]
#        for att in attributes:
#            for x in [2.0, 3.0, 4.0]:
#                if (att, x) in sentimentMap:
#                    resultsAsPerAttr = resultsAsPerAttr + sentimentMap[(att, x)]
        meta_result = []
        query = "Select * from PurposeMapClass where purpose = '" + purpose + "'"
        #print query
        resPurposeIns = ndb.gql(query)
        res_purpose = PurposeMapClass.GetJson(resPurposeIns)
        meta_result.append(res_purpose)
        #print 'size: ' + str(len(res_purpose))
        if len(food) == 1:
            food.append('breakfast')
        newfood = map(encode, food)
        query = "Select * from FoodIndexMapClass where purpose in " + str(tuple(newfood))
        #print query
        resPurposeIns = ndb.gql(query)
        #print resPurposeIns
        res_food = FoodIndexMapClass.GetJson(resPurposeIns)
        meta_result.append(res_food)
        #print 'size: ' + str(len(res_food))
        
        query = "Select * from ViewIndexMapClass where purpose = '" + view + "'"
        resPurposeIns = ndb.gql(query)
        res_view = ViewIndexMapClass.GetJson(resPurposeIns)
        meta_result.append(res_view)
        #print 'size: ' + str(len(res_view))
        
        query = "Select * from AmenityMapClass where purpose = 'amenity'"
        resPurposeIns = ndb.gql(query)
        res_amenities = AmenityMapClass.GetJson(resPurposeIns)
        meta_result.append(res_amenities)
        #print 'size: ' + str(len(res_amenities))
        
        # take union
#        res_food.append(res_purpose)
#        res_food.append(res_view)
#        res_food.append(res_loc)
#        res_food.append(res_amenities)
        rankingCount = self.findCountFromUnion(meta_result) # rankingcount format: (hotelid -> reviewid) -> count
        
        res_union = self.takeUnion(meta_result) # format is {(hotelid: [reviewid])}
        #print 'size semi: ' + str(len(res_union))
        domain_results = self.convertToDomainResults(res_union, rankingCount)
        #print 'size final: ' + str(len(domain_results))
        # do ranking
        # rank the domain_results
        self.rankResults(domain_results, rankingCount)
        free = gc.collect()
        #print ('freed memory: ' + str(free))
        
        return domain_results
    
    MULTIPLY_METHOD_RESOURCE_M = endpoints.ResourceContainer(
            purpose = messages.StringField(1, required=True),
            food = messages.StringField(2, repeated=True),
            destination=messages.StringField(3, required=True),
            view=messages.StringField(4),
            location=messages.StringField(5),
            amenities=messages.StringField(6, repeated=True))
    
    @endpoints.method(MULTIPLY_METHOD_RESOURCE_M, HotelCollection,
                      path='hellogreeting_m', http_method='POST',
                      name='greetings.listGreeting_m')
    def greetings_list(self, request):
        locationKey = request.destination
        loadData_m(locationKey)
        purpose = request.purpose
        food = request.food
        view = request.view
        
        #res_loc = set(locationMap[locationKey])  # [hotelids] - not needed as all other maps will take care of location.
#        resultsAsPerAttr = []                       # [(hotelid, reviewid)]
#        for att in attributes:
#            for x in [2.0, 3.0, 4.0]:
#                if (att, x) in sentimentMap:
#                    resultsAsPerAttr = resultsAsPerAttr + sentimentMap[(att, x)]
        meta_result = []
#        query = "Select * from PurposeMapClass where purpose = '" + purpose + "'"
#        print query
#        resPurposeIns = ndb.gql(query)
#        res_purpose = PurposeMapClass.GetJson(resPurposeIns)
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
        res_food.append(res_purpose)
        res_food.append(res_view)
        res_food.append(res_loc)
        res_food.append(res_amenities)
        rankingCount = self.findCountFromUnion(res_food) # rankingcount format: (hotelid -> reviewid) -> count
        res_union = self.takeUnion(res_food) # format is {(hotelid: [reviewid])
#        meta_result.append(res_purpose)
#        print 'size: ' + str(len(res_purpose))
#        if len(food) == 1:
#            food.append('breakfast')
#        newfood = map(encode, food)
#        query = "Select * from FoodIndexMapClass where purpose in " + str(tuple(newfood))
#        print query
#        resPurposeIns = ndb.gql(query)
#        print resPurposeIns
#        res_food = FoodIndexMapClass.GetJson(resPurposeIns)
#        meta_result.append(res_food)
#        print 'size: ' + str(len(res_food))
#        
#        query = "Select * from ViewIndexMapClass where purpose = '" + view + "'"
#        resPurposeIns = ndb.gql(query)
#        res_view = ViewIndexMapClass.GetJson(resPurposeIns)
#        meta_result.append(res_view)
#        print 'size: ' + str(len(res_view))
#        
#        query = "Select * from AmenityMapClass where purpose = 'amenity'"
#        resPurposeIns = ndb.gql(query)
#        res_amenities = AmenityMapClass.GetJson(resPurposeIns)
#        meta_result.append(res_amenities)
#        print 'size: ' + str(len(res_amenities))
        
        # take union
#        res_food.append(res_purpose)
#        res_food.append(res_view)
#        res_food.append(res_loc)
#        res_food.append(res_amenities)
#        rankingCount = self.findCountFromUnion(meta_result) # rankingcount format: (hotelid -> reviewid) -> count
        
#        res_union = self.takeUnion(meta_result) # format is {(hotelid: [reviewid])}
        domain_results = self.convertToDomainResults_m(res_union, rankingCount)
        self.rankResults(domain_results, rankingCount)
        free = gc.collect()
#        print ('freed memory: ' + str(free))
        
        return domain_results

    ID_RESOURCE = endpoints.ResourceContainer(
            message_types.VoidMessage,
            id=messages.IntegerField(1, variant=messages.Variant.INT32))
            
APPLICATION = endpoints.api_server([HelloWorldApi])
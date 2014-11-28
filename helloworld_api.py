"""Hello World API implemented using Google Cloud Endpoints.

Defined here are the ProtoRPC messages needed to define Schemas for methods
as well as those methods defined in an API.
"""


import endpoints
from protorpc import messages
from protorpc import message_types
from protorpc import remote
import json

package = 'Hello'
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

readMap = lambda x: json.loads(open(x, 'r').read())

rankMap = {} # stores hotelid -> reviewid -> count

def findScoreOfHotel(hotelId):
    return -1



def loadData():
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

class HotelCollection(messages.Message):
    items = messages.MessageField(Hotel, 1, repeated=True)
    
class Greeting(messages.Message):
    """Greeting that stores a message."""
    message = messages.StringField(1)


class GreetingCollection(messages.Message):
    """Collection of Greetings."""
    items = messages.MessageField(Greeting, 1, repeated=True)

@endpoints.api(name='helloworld', version='v1')
class HelloWorldApi(remote.Service):
    """Helloworld API v1."""

    def takeUnion(self, purpose_map, food_map):
        final = purpose_map
        for key in food_map:
            val = food_map[key]
            if key in final:
                for hotelkey in val:
                    if hotelkey in final[key]:
                        final[key][hotelkey] = [set(final[key][hotelkey] + val[hotelkey])]
                    else:
                        final[key][hotelkey] = val[hotelkey]
        return final
    
    def convertToDomainResults(self, arg_res):
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
            for quality in attDetails:
                att = Attribute()
                att.title = int(quality)
                att.people = attDetails[quality][1]
                att.percentageAttr = 33
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
                reviewArr.append(reviewIns)
            obj.reviews = reviewArr
            final.append(obj)
        return HotelCollection(items = final)
             
            
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
            if (i in final):
                print 'ello!'
            else:
                final[i] = [[], 0]
            
            i += 1
        return final
    
    
    
    
    MULTIPLY_METHOD_RESOURCE = endpoints.ResourceContainer(
            purpose = messages.StringField(1),
            food = messages.StringField(2, repeated=True),
            destination=messages.StringField(3),
            view=messages.StringField(4))
    
    @endpoints.method(MULTIPLY_METHOD_RESOURCE, HotelCollection,
                      path='hellogreeting', http_method='GET',
                      name='greetings.listGreeting')
    def greetings_list(self, request):
        loadData()
        locationKey = request.destination
#        purpose = request.purpose
#        food = request.food
#        view = request.view
        
#        locationKey = "ZERMATT:SWITZERLAND"
        purpose = "honeymoon"
        food = ["indian", "french"]
        view = ["mountain"]
        
        print locationKey
#        print purpose
#        print view
#        print food
        
        attributes = ['overall', 'staff', 'night', 'beach', 'roof', 'amenities', 'location', 'food', 'view']
        # can be made parallel
        res_loc = set(locationMap[locationKey])  # [hotelids] - not needed as all other maps will take care of location.
        resultsAsPerAttr = []                       # [(hotelid, reviewid)]
        for att in attributes:
            for x in [2.0, 3.0, 4.0]:
                if (att, x) in sentimentMap:
                    resultsAsPerAttr = resultsAsPerAttr + sentimentMap[(att, x)]
        res_purpose = purposeMap[purpose]   # {(hotelid: [review])}
        #food.map
        res_food = subAttrIndexMap['food']  # {(hotelid: [review])}
        # take union
        res_union = self.takeUnion(res_purpose, res_food) # format is {(hotelid: [reviewid])}
        domain_results = self.convertToDomainResults(res_union)
        return domain_results

    ID_RESOURCE = endpoints.ResourceContainer(
            message_types.VoidMessage,
            id=messages.IntegerField(1, variant=messages.Variant.INT32))
            
APPLICATION = endpoints.api_server([HelloWorldApi])
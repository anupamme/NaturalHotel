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

#locationPath = prefix + 'data/location_hotel_map/locationtohotel.json'
locationPath = prefix + 'locationtohotel.json'
sentimentPath = prefix + 'sentiment.json'
reviewMapPath = prefix + 'summary.txt'
hotelAttrPath = prefix + 'hotelDetail.json'
purposeMapPath = prefix + 'purpose.json'
attributePath = prefix + 'attribute-cloud.json'
foodIndexPath = prefix + 'foodIndex.json'
viewIndexPath = prefix + 'viewIndex.json'
locIndexPath = prefix + 'locIndex.json'
amenityIndexPath = prefix + 'amenityIndex.json'

hotelDetailMap = {}
reviewMap = {}
hotelAttrMap = {}

readMap = lambda x: json.loads(open(x, 'r').read())

class Image(messages.Message):
    url = messages.StringField(1)
    
class Review(messages.Message):
    review = messages.StringField(1)
    reviewer = messages.StringField(2)
    location = messages.StringField(3)
    image = messages.StringField(4)
    
class Attribute(messages.Message):
    title = messages.StringField(1)
    numpeople = messages.IntegerField(2)
    percentageAttr = messages.IntegerField(3)
    views = messages.StringField(4, repeated=True)

class Hotel(messages.Message):
    name = messages.StringField(1)
    address = messages.StringField(2)
    images = messages.MessageField(Image, 3, repeated=True)
    reviews = messages.MessageField(Review, 4, repeated=True)
    match = messages.StringField(5)     # high, medium, low
    hotelid = messages.StringField(6)   # 
    attributes = messages.MessageField(Attribute, 7, repeated=True)

class HotelCollection(messages.Message):
    items = messages.MessageField(Hotel, 1, repeated=True)

STORED_HOTELS = HotelCollection(items=[
    Hotel(name='My Hotel', address='bl-5, shalimar bagh', images=[], reviews=[
                Review(review='Too good!', reviewer='anupam'),
                Review(review='Too bad!', reviewer='gaurang')
            ]),
        Hotel(name='Your Hotel', address='bl-4, shalimar bagh', images=[], reviews=[])
])
    
class Greeting(messages.Message):
    """Greeting that stores a message."""
    message = messages.StringField(1)


class GreetingCollection(messages.Message):
    """Collection of Greetings."""
    items = messages.MessageField(Greeting, 1, repeated=True)


#STORED_GREETINGS = GreetingCollection(items=[
#    Greeting(message='hello world!'),
#    Greeting(message='goodbye world!'),
#])

@endpoints.api(name='helloworld', version='v1')
class HelloWorldApi(remote.Service):
    """Helloworld API v1."""

    def takeUnion(purpose_map, food_map):
        final = purpose_map
        for key in food_map:
            val = food_map[key]
            if key in final:
                final[key] = [set(final[key] + val)]
            else:
                final[key] = val
        return final
    
    def convertToDomainResults(arg_res):
        final = []
        for hotelid in arg_res:
            obj = Hotel()
            hotel = hotelDetailMap[hotelid]
            obj.name = hotel.title
            obj.address = hotel.address
            obj.images = hotel.images
            obj.match = 'not defined'
            obj.hotelid = hotelid
            attDetails = getAttributeDetails(hotelid)
            attributeArr = []
            for quality in attDetails:
                att = Attribute()
                att.title = quality
                att.numpeople = attDetails[quality][1]
                att.percentageAttr = 33
                att.attributes = attDetails[quality][0]
                attributeArr.append(att)
            obj.attributes = attributeArr
            reviewArr = []
            for rev in arg_res[hotelid][0:5]:
                reviewIns = Review()
                reviewIns.review = rev.review
                reviewIns.reviewer = rev.ReviewerName
                reviewIns.location = rev.Place
                reviewIns.image = rev.ReviewerImage
                reviewArr.append(reviewIns)
            obj.reviews = reviewArr
            final.append(obj)
        return HotelCollection(items = final)
             
            
    # get AttributeDetails is for the pop up display of infographics.
    def getAttributeDetails(hotelid):
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
                final[senti][0].push(att)
                updatedNum = Math.max(value, final[senti][1])
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
    
    
    
    @endpoints.method(message_types.VoidMessage, HotelCollection,
                      path='hellogreeting', http_method='GET',
                      name='greetings.listGreeting')
    def greetings_list(self, unused_request):
        locationMap = readMap(locationPath)
        sentimentMap = readMap(sentimentPath)
        reviewMap = readMap(reviewMapPath)
        hotelDetailMap = readMap(hotelMapPath)
        purposeMap = readMap(purposeMapPath)
        hotelAttrMap = readMap(hotelAttrPath)
        attributeMap = readMap(attributePath)
        subAttrIndexMap['food'] = readMap(foodIndexPath)
        subAttrIndexMap['view'] = readMap(viewIndexPath)
        subAttrIndexMap['loc'] = readMap(locIndexPath)
        subAttrIndexMap['amenity'] = readMap(amenityIndexPath)
        
        # algorithm: read the location map, purpose, food type, hotel attr, 
        locationKey = 'ZERMATT:SWITZERLAND'
        purpose = 'honeymoon'
        food = ['french', 'japanese']
        view = ['mountain']
        attributes = ['overall', 'staff', 'night', 'beach', 'roof', 'amenities', 'location', 'food', 'view']
        # can be made parallel
        res_loc = set(locationMap[locationKey])  # [hotelids] - not needed as all other maps will take care of location.
        res_attr = []                       # [(hotelid, reviewid)]
        for att in attributes:
            for x in range(2,5):
                res_attr = res_attr + sentimentMap[(att, x)]
        res_purpose = purposeMap(purpose)   # {(hotelid: [review])}
        res_food = subAttrIndexMap['food']  # {(hotelid: [review])}
        # take union
        res_union = takeUnion(res_purpose, res_food) # format is {(hotelid, [reviewid])}
        domain_results = convertToDomainResults(res_union)
        return domain_results

    ID_RESOURCE = endpoints.ResourceContainer(
            message_types.VoidMessage,
            id=messages.IntegerField(1, variant=messages.Variant.INT32))

#    @endpoints.method(ID_RESOURCE, Hotel,
#                      path='hellogreeting/{location}', http_method='GET',
#                      name='greetings.getGreeting')
#    def greeting_get(self, request):
#        # 1. parse location, purpose, foodtype, desired location, amenities.
#        # 2. load all the maps from the file system.
#        # 3. create JSON object of the json structure.
#        # 4. return the list of that json structure.
#        try:
#            index = -1
#            if request.location == 'paris':
#                index = 0
#            if request.location == 'london':
#                index = 1
#            return STORED_HOTELS.items[index]
#        except (IndexError, TypeError):
#            raise endpoints.NotFoundException('Greeting %s not found.' %
#                                              (request.location,))
    @endpoints.method(ID_RESOURCE, Hotel,
                      path='hellogreeting/{id}', http_method='GET',
                      name='greetings.getGreeting')
    def greeting_get(self, request):
        # 1. parse location, purpose, foodtype, desired location, amenities.
        # 2. load all the maps from the file system.
        # 3. create JSON object of the json structure.
        # 4. return the list of that json structure.
        
        
        
        try:
            return STORED_HOTELS.items[request.id]
        except (IndexError, TypeError):
            raise endpoints.NotFoundException('Greeting %s not found.' %
                                              (request.id,))
            
APPLICATION = endpoints.api_server([HelloWorldApi])
import cgi
import urllib
import json

import webapp2

from google.appengine.ext import ndb

class Hotel(ndb.Model):
    hotelId = ndb.StringProperty()
    name = ndb.StringProperty()
    address = ndb.StringProperty()
    reviews = ndb.JsonProperty()
    
    @classmethod
    def query_book(cls, ancestor_key):
        return cls.query(ancestor=ancestor_key).order(-cls.date)
    
class Review(ndb.Model):
    hotelId = ndb.StringProperty()  #foreign key to Hotel.
    reviewId = ndb.IntegerProperty()
    text = ndb.StringProperty()
    reviewName = ndb.StringProperty()
    attributeSentimentList = ndb.JsonProperty()
    
    @classmethod
    def query_book(cls, ancestor_key):
        return cls.query(ancestor=ancestor_key).order(-cls.date)
    
class LocationMap(ndb.Model):
    locationKey = ndb.StringProperty()  # primary key
    hotelIdList = ndb.JsonProperty()
    
class SentimentMap(ndb.Model):  # attr, sentiment -> {hotel -> [review]}
    locationKey = ndb.StringProperty()  # composite key 1
    attribute = ndb.StringProperty()    # composite key 2
    sentiment = ndb.IntegerProperty()   # composite key 3
    hotelReviewList = ndb.JsonProperty() 
    
class ReviewMap(ndb.Model):
    locationKey = ndb.StringProperty()
    hotelId = ndb.StringProperty()
    reviewId = ndb.IntegerProperty()
    reviewObj = ndb.JsonProperty()
    
class HotelSentiment(ndb.Model):
    locationKey = ndb.StringProperty()
    hotelId = ndb.StringProperty()
    attributeDetail = ndb.JsonProperty()
    
class AttributeMap(ndb.Model):
    attributeKey = ndb.StringProperty()
    relatedKeywords = ndb.JsonProperty()
    
class PurposeMap(ndb.Model):
    locationKey = ndb.StringProperty()
    purpose = ndb.StringProperty()
    hotelReviewList = ndb.JsonProperty()
    
class PreprocessCalls:
    def storeReviewMap(fsLocation):
        reviewMapFS = json.loads(open(fsLocation))
        for entry in reviewMapFS:
            reviewMapObj = ReviewMap()
            reviewMapObj.locationKey = entry
    
    def storeLocationMap(fsLocation):
        locationMapList = []
        locationMapFS = json.loads(open(fsLocation, 'r').read())
        for loc in locationMapFS:
            locKey = LocationMap()
            locKey.locationKey = loc
            locKey.hotelIdList = locationMapFS[loc]
            locKey.put()
        
    def getListOfHotels(locationKey):
        return LocationMap.get(locationKey)
    
    def storeSentimentMap(fsLocation):
        sentimentMapFS = json.loads(open(fsLocation, 'r').read())
        for sentiment in sentimentMapFS:
            sentObj = SentimentMap()
            sentObj.attribute = sentiment[0]
            sentObj.sentiment = sentiment[1]
            sentObj.hotelReviewList = sentimentMapFS[sentiment]
            sentObj.put()
            
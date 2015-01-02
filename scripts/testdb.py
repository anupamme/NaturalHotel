import json
import sys
from google.appengine.ext import ndb

class ReviewMap(ndb.Model):
    locationKey = ndb.StringProperty()
    hotelId = ndb.StringProperty()
    reviewId = ndb.IntegerProperty()
    reviewObj = ndb.JsonProperty()
    
    
if __main__ == "__main__":
    a = json.loads(open(sys.argv[1], 'r').read())
    for hotelid in a:
        reviewArr = a[hotelid]
        revCount = 0
        for review in reviewArr:
            r = ReviewMap(locationKey='ZERMATT:SWITZERLAND', hotelId=hotelid, reviewId=revCount, reviewObj = review)
            r.put()
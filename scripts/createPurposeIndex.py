import json
import sys
import os
from enum import Enum

purposeLabel = 'traveled_as'

#class Purpose(Enum):
#    Honeymoon = 1
#    Business = 2
#    Traveling = 3
#    Friends = 4
            
def addOrInsert(result, key, value):
    if key in result:
        result[key].append(value)
    else:
        result[key] = [value]
    return result

if __name__ == "__main__":
    result = {}
    # read the directory which contains all the reviews.
    locationDir = sys.argv[1]
    hotelList = os.listdir(locationDir)
    for hotelId in hotelList:
        hotelDir = os.path.join(locationDir, hotelId)
        reviewList = os.listdir(hotelDir)
        for reviewId in reviewList:
            reviewPath = os.path.join(hotelDir, reviewId)
            jsonObj = json.loads(open(reviewPath, 'r').read())
            if (purposeLabel not in jsonObj):
                continue
            traveledAs = jsonObj[purposeLabel]
            print('traveled as: ' + traveledAs)
            if ('couple' in traveledAs):
                # put in honeymoon.
                key = 'honeymoon'
                value = (hotelId, reviewId)
                result = addOrInsert(result, key, value)
                continue
            if ('business' in traveledAs):
                # put in business.
                key = 'business'
                value = (hotelId, reviewId)
                result = addOrInsert(result, key, value)
                continue
            if ('family' in traveledAs):
                # put in traveling.
                key = 'traveling'
                value = (hotelId, reviewId)
                result = addOrInsert(result, key, value)
                continue
            if ('friends' in traveledAs):
                # put in friends
                key = 'friends'
                value = (hotelId, reviewId)
                result = addOrInsert(result, key, value)
                continue
            if ('solo' in traveledAs):
                # put in traveling.
                key = 'traveling'
                value = (hotelId, reviewId)
                result = addOrInsert(result, key, value)
                continue
    print('done!')       
    f = open(sys.argv[2], 'w')
    print('after open!')
    towrite = json.dumps(result)
    print('after dumps!')
    f.write(towrite)
    f.close()
import json
import sys
import os

purposeLabel = 'traveled_as'

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

def sp(lt): return lt.split(' ')
def sp2(lt): return lt.replace('\t', '')

def normalize(word): return word.lower().strip()

if __name__ == "__main__":
    result = {}
    # read the directory which contains all the reviews.
    locationDir = sys.argv[1]
    hotelList = os.listdir(locationDir)
    # read the honeymoon keywords
    honeymoonLines = open(sys.argv[2], 'r').read().split('\n')
    temp = map(sp, honeymoonLines)
    honeymoonWords = [item for sublist in temp for item in sublist]
    finalHoneymoon = set(map(sp2, honeymoonWords))
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
                # if it contains any of the keywords.
                review_text = jsonObj['review']
                review_words = review_text.split(' ')
                found = False
                for word in review_words:
                    word = normalize(word)
                    if word in finalHoneymoon:
                        # put in honeymoon.
                        key = 'honeymoon'
                        value = (hotelId, reviewId)
                        result = addOrInsert(result, key, value)
                        found = True
                        break
                
                if found == False:
                    key = 'traveling'
                    value = (hotelId, reviewId)
                    result = addOrInsert(result, key, value)
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
    f = open(sys.argv[3], 'w')
    print('after open!')
    towrite = json.dumps(result)
    print('after dumps!')
    f.write(towrite)
    f.close()
import os
import json
import sys

if __name__ == "__main__":
    # read the path of hotel id in arg.
    locationDir = sys.argv[1]
    # read each the hotels: create a master json
        # for each file create json object and append it to master json.
        # when files are done dump the json.
    dirList = os.listdir(locationDir)
    destination = sys.argv[2]
    masterJson = {}
    for dire in dirList:
        hotelDir = os.path.join(locationDir, dire)
        results = []
        reviewList = os.listdir(hotelDir)
        for review in reviewList:
            reviewPath = os.path.join(hotelDir, review)
            obj = json.loads(open(reviewPath, 'r').read())
            results.append(obj)
        masterJson[dire] = results
    text = json.dumps(masterJson)
    f = open(os.path.join(destination, 'summary.txt'), 'w')
    f.write(text)
    f.close()
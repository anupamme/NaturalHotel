import os
import json
import sys

excludeList = set(['g188098-d619925', 'g188098-d550027'])

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
        if (dire in excludeList):
            print('skipping: ' + dire)
            continue;
        hotelDir = os.path.join(locationDir, dire)
        results = []
        reviewList = os.listdir(hotelDir)
        for review in reviewList:
            reviewPath = os.path.join(hotelDir, review)
            obj = json.loads(open(reviewPath, 'r').read())
            results.append(obj)
        masterJson[dire] = results
    text = json.dumps(masterJson)
    print('location dir: ' + locationDir)
    locationKey = locationDir[locationDir.rfind('/') + 1:]
    print('location key: ' + locationKey)
    outfile = os.path.join(destination, locationKey)
    try:
        os.mkdir(outfile)
    except OSError as exc:
        if os.path.isdir(outfile):
            pass 
        else:
            pass
    f = open(os.path.join(outfile, 'summary.txt'), 'w')
    f.write(text)
    f.close()
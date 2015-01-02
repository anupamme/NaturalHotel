import os
import json
import sys

def findLastEdge(path):
    rIndex = path.rIndex('/')
    return path[rIndex:]

def trimLastSlash(path):
    rIndex = path.rIndex('/')
    if rIndex == len(path) - 1:
        return path[:len(path) - 1]
    return path

if __name__ == "__main__":
    rootDir = trimLastSlash(sys.argv[1])
    
    locationList = os.listdir(rootDir)
    masterArr=[]
    
    for location in locationList:
        locationDir = os.path.join(rootDir, location)
        dirList = os.listdir(locationDir)
        for dire in dirList:
            hotelDir = os.path.join(rootDir, dire)
            results = []
            reviewList = os.listdir(hotelDir)
            for review in reviewList:
                reviewPath = os.path.join(hotelDir, review)
                obj = json.loads(open(reviewPath, 'r').read())
                results.append(obj)
            masterArr.push({"hotelid": dire, "location": location, "reviewList": results})
    final = {"colorsArray": masterArr}
    
    writeFile = open(sys.argv[2], 'w')
    writeFile.write(json.dumps(final))

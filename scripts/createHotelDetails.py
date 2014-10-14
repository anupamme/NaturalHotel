import os
import json
import sys

# 1. read the location from command line.
# 2. build location to list of hotels map.
'''
            
'''
if __name__ == "__main__":
    locationMap = {}
    locationDir = sys.argv[1]
    outputfile = sys.argv[2]
    location = locationDir[locationDir.rfind('/') + 1:] # key is between last and second last slash e.g. /data/DUBLIN:IRELAND/
    dirList = os.listdir(locationDir)
    listOfHotelIds = {}
    for dire in dirList:
        listOfHotelIds[dire] = True
    locationMap[location] = listOfHotelIds
    f = open(outputfile, 'w')
    f.write(json.dumps(locationMap))
    f.close()
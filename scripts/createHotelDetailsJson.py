import os
import json
import sys

# 1. read the location from command line.
# 2. build location to list of hotels map.
'''
            
'''
if __name__ == "__main__":
    locationToHotelMap = sys.argv[1] # location to hotel ids.
    locationkey = sys.argv[2]       # for which location create the json.
    dataLoc = sys.argv[3]           # from where to read the data for this location key.
    # for each directory within find details.txt
    sourcefile = sys.argv[4]        # details.txt
    outputfile = sys.argv[5]        # 
    
    output = {}
    
    locMap = json.loads(open(locationToHotelMap, 'r').read())
    for key in locMap:
        value = locMap[key]
        if key == locationkey:
            for hotelid in value:
                newpath = os.path.join(dataLoc, hotelid)
                if os.path.exists(newpath):
                    sourcepath = os.path.join(newpath, sourcefile)
                    hoteldetails = json.loads(open(sourcepath, 'r').read())
                    output[hotelid] = hoteldetails
                    
    f = open(outputfile, 'w')
    f.write(json.dumps(output))
    f.close()
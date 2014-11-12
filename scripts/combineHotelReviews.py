import json
import sys
import os
import re

if __name__ == "__main__":
    result = ""
    defaultReview = "No Review"
    locationDir = sys.argv[1]
    dirList = os.listdir(locationDir) # e.g. ZERMATT:SWITZERLAND
    for dire in dirList:
        hotelDir = os.path.join(locationDir, dire) # e.g. g188098-d674941
        reviewSummary = os.path.join(hotelDir, 'summary.txt')
        if os.path.exists(reviewSummary):
            reviewObj = json.loads(open(reviewSummary, 'r').read())
            reviewArr = reviewObj[dire]
            for review in reviewArr:
                result += ' '.join(re.split('\W+', review.get("review", defaultReview).lower())[0:-1]) + ' '
    outfile = sys.argv[2]
    f = open(outfile, 'w')
    f.write(result)
    f.close()
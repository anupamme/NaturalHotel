import cgi
import webapp2
from google.appengine.ext import ndb
import json
from helloworld_api import ReviewMapClass, FoodIndexMapClass
import pprint

encode = lambda x: x.encode('utf-8')

class MainPage(webapp2.RequestHandler):

    def get(self):
        html = open('index.html', 'r').read()
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers['Content-Type'] = 'text/html'
    	self.response.write(html)
        
class FormPage(webapp2.RequestHandler):

    def get(self):
        html = open('form.html', 'r').read()
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers['Content-Type'] = 'text/html'
    	self.response.write(html)
        
class RevulizePage(webapp2.RequestHandler):

    def get(self):
        html = open('revulize.html', 'r').read()
        self.response.headers.add_header("Access-Control-Allow-Origin", "*")
        self.response.headers['Content-Type'] = 'text/html'
    	self.response.write(html)

class DataStorePage(webapp2.RequestHandler):
    def get(self):
        print 'current dir: ' + os.getcwd()
        hotelJson = json.loads(open('summary.txt', 'r').read())
        for hotelid in hotelJson:
            reviewArr = hotelJson[hotelid]
            revCount = 0
            for review in reviewArr:
                r = ReviewMap(locationKey='ZERMATT:SWITZERLAND', hotelId=hotelid, reviewId=revCount, reviewObj = review)
                r.put()
                revCount += 1
        print 'data base store is done!'
        
class DataLoadPage(webapp2.RequestHandler):
    def get(self):
        food = [u'french', 'breakfast']
        newfood = map(encode, food)
        query = "Select * from FoodIndexMapClass where purpose in " + str(tuple(newfood))
        print query
        result = ndb.gql(query)
        for e in result:
            pprint.pprint(e)
        print 'data base load is done!'
        
application = webapp2.WSGIApplication([
    ('/', MainPage), ('/form.html', FormPage), ('/revulize.html', RevulizePage), ('/datastore.html', DataStorePage), ('/dataload.html', DataLoadPage)], debug=True)
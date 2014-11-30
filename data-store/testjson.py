import cgi
import urllib

import webapp2

from google.appengine.ext import ndb

class MyEntity(ndb.Model):
    key = ndb.StringProperty()
    data = ndb.JsonProperty()

my_obj = {'key-1': {'a': 1, 'b': 2}, 'key-2': {'z': [3,4], 'y': [5,6]}}
entity = MyEntity(name="my-name", data=my_obj)
entity.put()

entities = MyEntity.all()
entities = entities.fetch(10)
for entity in entities:
    print entity.obj # outputs the dictionary object
import unittest
from google.appengine.api import memcache
from google.appengine.ext import ndb
from google.appengine.ext import testbed
import json

class TestModel(ndb.Model):
    data = ndb.JsonProperty()
    
class TestEntityGroupRoot(ndb.Model):
    pass

def GetEntityViaMemcache(entity_key):
    entity = memcache.get(entity_key)
    if entity is not None:
        return entity
    entity = TestModel.get(entity_key)
    if entity is not None:
        memcache.set(entity_key, entity)
    return entity

class DemoTestCase(unittest.TestCase):
    
    def setUp(self):
        self.testbed = testbed.Testbed()
        self.testbed.activate()
        self.testbed_init_datastore_v3_stub()
        self.testbed.init_memcache_stub()
        
    def teardown(self):
        self.testbed.deactivate()
        
    def testInsertEntity(self):
        a = json.loads(open('attribute-cloud.json', 'r').read())
        entity = TestModel(data=a)
        entity.put()
        
        self.assertEqual(1, len(TestModel.all().fetch(2)))
        
if __name__ == '__main__':
    unittest.main()
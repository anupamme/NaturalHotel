"""Hello World API implemented using Google Cloud Endpoints.

Defined here are the ProtoRPC messages needed to define Schemas for methods
as well as those methods defined in an API.
"""


import endpoints
from protorpc import messages
from protorpc import message_types
from protorpc import remote
import json

package = 'Hello'


class Image(messages.Message):
    url = messages.StringField(1)
    
class Review(messages.Message):
    review = messages.StringField(1)
    reviewer = messages.StringField(2)

class Hotel(messages.Message):
    name = messages.StringField(1)
    address = messages.StringField(2)
    images = messages.MessageField(Image, 3, repeated=True)
    reviews = messages.MessageField(Review, 4, repeated=True)

class HotelCollection(messages.Message):
    items = messages.MessageField(Hotel, 1, repeated=True)

STORED_HOTELS = HotelCollection(items=[
    Hotel(name='My Hotel', address='bl-5, shalimar bagh', images=[], reviews=[
                Review(review='Too good!', reviewer='anupam'),
                Review(review='Too bad!', reviewer='gaurang')
            ]),
        Hotel(name='Your Hotel', address='bl-4, shalimar bagh', images=[], reviews=[])
])
    
class Greeting(messages.Message):
    """Greeting that stores a message."""
    message = messages.StringField(1)


class GreetingCollection(messages.Message):
    """Collection of Greetings."""
    items = messages.MessageField(Greeting, 1, repeated=True)

class MyRequest(messages.Message):
    my_string = messages.StringField(1)
    my_number = messages.IntegerField(2, required=True)

#STORED_GREETINGS = GreetingCollection(items=[
#    Greeting(message='hello world!'),
#    Greeting(message='goodbye world!'),
#])

@endpoints.api(name='helloworld', version='v1')
class HelloWorldApi(remote.Service):
    """Helloworld API v1."""

    @endpoints.method(message_types.VoidMessage, HotelCollection,
                      path='hellogreeting', http_method='GET',
                      name='greetings.listGreeting')
    def greetings_list(self, unused_request):
        return STORED_HOTELS

    ID_RESOURCE = endpoints.ResourceContainer(
            message_types.VoidMessage,
            id=messages.IntegerField(1, variant=messages.Variant.INT32))

    @endpoints.method(ID_RESOURCE, Hotel,
                      path='hellogreeting/{location}', http_method='GET',
                      name='greetings.getGreeting')
    def greeting_get(self, request):
        # 1. parse location, purpose, foodtype, desired location, amenities.
        # 2. load all the maps from the file system.
        # 3. create JSON object of the json structure.
        # 4. return the list of that json structure.
        try:
            index = -1
            if request.location == 'paris':
                index = 0
            if request.location == 'london':
                index = 1
            return STORED_HOTELS.items[index]
        except (IndexError, TypeError):
            raise endpoints.NotFoundException('Greeting %s not found.' %
                                              (request.location,))
#    @endpoints.method(ID_RESOURCE, Hotel,
#                      path='hellogreeting/{id}', http_method='GET',
#                      name='greetings.getGreeting')
#    def greeting_get(self, request):
#        # 1. parse location, purpose, foodtype, desired location, amenities.
#        # 2. load all the maps from the file system.
#        # 3. create JSON object of the json structure.
#        # 4. return the list of that json structure.
#        try:
#            return STORED_HOTELS.items[request.id]
#        except (IndexError, TypeError):
#            raise endpoints.NotFoundException('Greeting %s not found.' %
#                                              (request.id,))
            
APPLICATION = endpoints.api_server([HelloWorldApi])
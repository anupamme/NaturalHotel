import cgi
import webapp2

class MainPage(webapp2.RequestHandler):

    def get(self):
        html = open('index.html', 'r').read()
        self.response.headers['Content-Type'] = 'text/html'
    	self.response.write(html)
        
class FormPage(webapp2.RequestHandler):

    def get(self):
        html = open('form.html', 'r').read()
        self.response.headers['Content-Type'] = 'text/html'
    	self.response.write(html)
        
class RevulizePage(webapp2.RequestHandler):

    def get(self):
        html = open('revulize.html', 'r').read()
        self.response.headers['Content-Type'] = 'text/html'
    	self.response.write(html)
        
application = webapp2.WSGIApplication([
    ('/', MainPage), ('/form.html', FormPage), ('/revulize.html', RevulizePage)], debug=True)
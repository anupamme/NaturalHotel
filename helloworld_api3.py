import logging
import os
import cloudstorage as gcs
import webapp2

from google.appengine.api import app_identity
from google.appengine.ext import ndb

my_default_retry_params = gcs.RetryParams(initial_delay=0.2,
                                          max_delay=5.0,
                                          backoff_factor=2,
                                          max_retry_period=15)

gcs.set_default_retry_params(my_default_retry_params)

def read_file(self, filename):
    bucket_name = os.environ.get('BUCKET_NAME', 'jobs-dir')

    #self.response.headers['Content-Type'] = 'text/plain'
    #self.response.write('Demo GCS Application running from Version: '
    #                    + os.environ['CURRENT_VERSION_ID'] + '\n')
    #self.response.write('Using bucket name: ' + bucket_name + '\n\n')

    bucket = '/' + bucket_name
    filename = bucket + '/job1-th.py'
    #self.response.write('Abbreviated file content (first line and last 1K):\n')

    gcs_file = gcs.open(filename)
    self.response.write(gcs_file.readline())
    gcs_file.seek(-1024, os.SEEK_END)
    print('cloud file contents: ' + gcs_file.read())
    gcs_file.close()
    